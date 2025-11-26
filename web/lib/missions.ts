import { prisma } from "@/lib/prisma";
import { addItemToInventory } from "@/lib/inventory";
import { calculateLevel } from "@/lib/game-mechanics";
import { Mission, UserMission, Prisma } from "@prisma/client";

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

  return missions.map((mission: Mission) => {
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
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      rewards: true,
    },
  });

  if (!mission) throw new Error("Mission not found");

  const existingUserMission = await prisma.userMission.findUnique({
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
  }

  // Transaction to ensure all rewards are applied or none
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

    // 2. Update UserMission
    if (existingUserMission) {
        await tx.userMission.update({
            where: { id: existingUserMission.id },
            data: { status: "COMPLETED", completedAt: new Date() }
        });
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
  });

  // 4. Add items (outside transaction for now to reuse logic)
  for (const reward of mission.rewards) {
    await addItemToInventory(userId, reward.itemId, reward.quantity);
  }
}

export async function seedMissions() {
    // Create some items if they don't exist (reusing logic or assuming they exist)
    // We'll assume basic items exist or we create them.
    
    // Let's try to find or create a "Rare Gem"
    let rareGem = await prisma.item.findUnique({ where: { name: "Rare Gem" } });
    if (!rareGem) {
        rareGem = await prisma.item.create({
            data: { name: "Rare Gem", description: "A shiny rare gem", stackable: true, maxStack: 10, icon: "💎" }
        });
    }

    const missions = [
        {
            title: "First Steps",
            description: "Welcome to the game! Here is a small gift to get you started.",
            xpReward: 100,
            moneyReward: 50,
            rewards: []
        },
        {
            title: "Goblin Slayer",
            description: "Defeat the goblin menace in the nearby forest.",
            xpReward: 500,
            moneyReward: 200,
            rewards: [{ itemId: rareGem.id, quantity: 1 }]
        },
        {
            title: "The Lost Artifact",
            description: "Find the ancient artifact hidden in the ruins.",
            xpReward: 1000,
            moneyReward: 1000,
            rewards: [{ itemId: rareGem.id, quantity: 5 }]
        }
    ];

    for (const m of missions) {
        const existing = await prisma.mission.findFirst({ where: { title: m.title } });
        if (!existing) {
            await prisma.mission.create({
                data: {
                    title: m.title,
                    description: m.description,
                    xpReward: m.xpReward,
                    moneyReward: m.moneyReward,
                    rewards: {
                        create: m.rewards
                    }
                }
            });
        }
    }
}
