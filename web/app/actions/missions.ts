"use server";

import { completeMission } from "@/lib/missions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function completeMissionAction(missionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await completeMission(session.user.id, missionId);
  revalidatePath("/missions");
}

