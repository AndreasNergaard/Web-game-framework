"use client";

import { deleteItemAction } from "@/app/actions/inventory";

type InventoryItem = {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
  };
};

export function InventoryList({ inventory }: { inventory: InventoryItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {inventory.map((slot) => (
        <div key={slot.id} className="border border-gray-700 p-4 rounded flex flex-col items-center relative group bg-gray-800 text-white hover:bg-gray-700 transition-colors">
          <div className="text-4xl mb-2">{slot.item.icon || "📦"}</div>
          <div className="font-bold text-center">{slot.item.name}</div>
          <div className="text-sm text-gray-400">x{slot.quantity}</div>
          
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => deleteItemAction(slot.id, 1)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                title="Delete 1"
            >
                ✕
            </button>
          </div>
        </div>
      ))}
      {inventory.length === 0 && <div className="col-span-full text-center text-gray-500 py-8">Inventory is empty</div>}
    </div>
  );
}
