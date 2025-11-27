import { prisma } from "@/lib/prisma";
import { addItemToInventory } from "@/lib/inventory";
import { calculateLevel } from "@/lib/game-mechanics";
import { UserMission, Prisma } from "@prisma/client";

export async function getMissions(userId: string) {
  const missions = await prisma.mission.findMany({
    include: {
      rewards: {
        include: {
          item: true,
        },
      },
    },
  });

  const userMissions = await prisma.userMission.findMany({
    where: { userId },
  });

  return missions.map((mission) => {
    const userMission = userMissions.find((um: UserMission) => um.missionId === mission.id);
    
    let status = "AVAILABLE";
    let nextAvailableAt = null;

    if (userMission?.completedAt) {
        const completedAt = new Date(userMission.completedAt);
        const now = new Date();
        const diffSeconds = (now.getTime() - completedAt.getTime()) / 1000;
        
        if (diffSeconds < mission.cooldown) {
            status = "COOLDOWN";
            nextAvailableAt = new Date(completedAt.getTime() + mission.cooldown * 1000);
        }
    }

    return {
      ...mission,
      status,
      nextAvailableAt,
      completedAt: userMission?.completedAt,
    };
  });
}

export async function completeMission(userId: string, missionId: string) {
  // Transaction to ensure all rewards are applied or none
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const mission = await tx.mission.findUnique({
      where: { id: missionId },
      include: {
        rewards: true,
      },
    });

    if (!mission) throw new Error("Mission not found");

    const existingUserMission = await tx.userMission.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId,
        },
      },
    });

    if (existingUserMission?.completedAt) {
        const completedAt = new Date(existingUserMission.completedAt);
        const now = new Date();
        const diffSeconds = (now.getTime() - completedAt.getTime()) / 1000;
        
        if (diffSeconds < mission.cooldown) {
            throw new Error(`Mission is on cooldown. Wait ${Math.ceil(mission.cooldown - diffSeconds)}s`);
        }

        // Optimistic Concurrency Control: Ensure we are updating the record we checked
        const result = await tx.userMission.updateMany({
            where: {
                id: existingUserMission.id,
                completedAt: existingUserMission.completedAt
            },
            data: { status: "COMPLETED", completedAt: new Date() }
        });

        if (result.count === 0) {
            throw new Error("Mission status changed during processing. Please try again.");
        }
    } else {
        await tx.userMission.create({
            data: {
                userId,
                missionId,
                status: "COMPLETED",
                completedAt: new Date()
            }
        });
    }

    // 1. Update User (XP, Money, Level)
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const newXp = user.experience + mission.xpReward;
    const newLevel = calculateLevel(newXp);

    await tx.user.update({
      where: { id: userId },
      data: {
        experience: newXp,
        level: newLevel,
        money: { increment: mission.moneyReward },
      },
    });

    // 3. Log Activity
    await tx.userActivity.create({
      data: {
        userId,
        type: "MISSION_COMPLETED",
        description: `Completed mission: ${mission.title}`,
        metadata: {
          missionId: mission.id,
          xpReward: mission.xpReward,
          moneyReward: mission.moneyReward,
        },
      },
    });

    // 4. Add items (inside transaction)
    for (const reward of mission.rewards) {
      await addItemToInventory(userId, reward.itemId, reward.quantity, tx);
    }
  });
}

