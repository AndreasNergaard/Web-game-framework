"use server";

import { removeItemFromInventory, addItemToInventory } from "@/lib/inventory";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteItemAction(inventoryItemId: string, quantity: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await removeItemFromInventory(session.user.id, inventoryItemId, quantity);
  revalidatePath("/inventory");
}

export async function giveItemAction(itemId: string, quantity: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    if (!session) {
        throw new Error("Unauthorized");
    }
    
    await addItemToInventory(session.user.id, itemId, quantity);
    revalidatePath("/inventory");
}
