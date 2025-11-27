"use client";

import { giveItemAction } from "@/app/actions/inventory";

type Item = {
  id: string;
  name: string;
  icon: string | null;
};

export function DebugItemGiver({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between border border-gray-700 p-3 rounded bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">{item.icon || "📦"}</span>
            <span>{item.name}</span>
          </div>
          <button
            onClick={() => giveItemAction(item.id, 1)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Add
          </button>
        </div>
      ))}
      {items.length === 0 && <div className="col-span-full text-gray-500">No items found in database.</div>}
    </div>
  );
}
