import { ShoppingBag, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function HeldOrdersBar({ heldOrders, onResume, onDiscard }) {
  if (heldOrders.length === 0) return null;

  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
      {heldOrders.map((order) => {
        const total = order.cart.reduce(
          (sum, i) => sum + i.quantity * i.unitPrice,
          0
        );
        return (
          <div
            key={order.id}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs"
          >
            <button
              onClick={() => onResume(order.id)}
              className="flex items-center gap-1.5 font-medium text-amber-700 hover:text-amber-900"
            >
              <ShoppingBag size={13} />
              {order.label} · {formatCurrency(total)}
            </button>
            <button
              onClick={() => onDiscard(order.id)}
              className="text-amber-400 hover:text-red-500"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
