import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getInventory(userId: string) {
  return prisma.inventoryItem.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { item: { name: 'asc' } }
  });
}

export async function createItem(data: { name: string; description?: string; stackable?: boolean; maxStack?: number; icon?: string }) {
  // Check if item exists to avoid unique constraint errors during dev/seeding
  const existing = await prisma.item.findUnique({ where: { name: data.name } });
  if (existing) return existing;
  
  return prisma.item.create({ data });
}

export async function addItemToInventory(userId: string, itemId: string, quantity: number = 1, tx: Prisma.TransactionClient = prisma) {
  const item = await tx.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Item not found");

  let remainingQuantity = quantity;

  if (item.stackable) {
    // Find existing stacks that are not full
    const existingStacks = await tx.inventoryItem.findMany({
      where: { userId, itemId, quantity: { lt: item.maxStack } },
      orderBy: { quantity: 'desc' }
    });

    for (const stack of existingStacks) {
      if (remainingQuantity <= 0) break;
      
      const space = item.maxStack - stack.quantity;
      const toAdd = Math.min(remainingQuantity, space);
      
      await tx.inventoryItem.update({
        where: { id: stack.id },
        data: { quantity: stack.quantity + toAdd },
      });
      
      remainingQuantity -= toAdd;
    }
  }

  // Create new stacks for remaining quantity
  // If not stackable, we create 1 item per quantity
  while (remainingQuantity > 0) {
    const toAdd = item.stackable ? Math.min(remainingQuantity, item.maxStack) : 1;
    
    await tx.inventoryItem.create({
      data: {
        userId,
        itemId,
        quantity: toAdd,
      },
    });
    
    remainingQuantity -= toAdd;
  }
}

export async function removeItemFromInventory(userId: string, inventoryItemId: string, quantity: number) {
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
  });
  
  if (!inventoryItem) throw new Error("Item not found in inventory");
  if (inventoryItem.userId !== userId) throw new Error("Unauthorized access to item");
  
  if (inventoryItem.quantity <= quantity) {
    await prisma.inventoryItem.delete({
      where: { id: inventoryItemId },
    });
  } else {
    await prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { quantity: inventoryItem.quantity - quantity },
    });
  }
}
