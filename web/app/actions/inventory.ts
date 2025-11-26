"use server";

import { removeItemFromInventory, addItemToInventory, createItem } from "@/lib/inventory";
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

export async function seedItemsAction() {
    await createItem({ name: "Wood", description: "A block of wood", stackable: true, maxStack: 64, icon: "🪵" });
    await createItem({ name: "Stone", description: "A piece of stone", stackable: true, maxStack: 64, icon: "🪨" });
    await createItem({ name: "Iron Sword", description: "A sharp sword", stackable: false, maxStack: 1, icon: "⚔️" });
    await createItem({ name: "Health Potion", description: "Restores health", stackable: true, maxStack: 16, icon: "🧪" });
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
