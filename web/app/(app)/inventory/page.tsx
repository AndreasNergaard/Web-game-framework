import { getInventory } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { InventoryList } from "@/components/InventoryList";
import { DebugItemGiver } from "@/components/DebugItemGiver";
import { seedItemsAction } from "@/app/actions/inventory";

export default async function InventoryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className="p-8 text-center">Please log in to view inventory</div>;
  }

  const inventory = await getInventory(session.user.id);
  const allItems = await prisma.item.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your items and equipment.
        </p>
      </div>

      <InventoryList inventory={inventory} />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Debug: Item Spawner</h2>
            <form action={seedItemsAction}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                    Seed Default Items
                </button>
            </form>
        </div>
        <DebugItemGiver items={allItems} />
      </div>
    </div>
  );
}
