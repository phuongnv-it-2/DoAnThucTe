import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CartLine({ item, onQtyChange, onRemove }) {
  const lineTotal = item.quantity * item.unitPrice;

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {item.name}
        </p>
        <p className="text-xs text-slate-400">
          {formatCurrency(item.unitPrice)} / {item.unit}
        </p>
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200">
        <button
          onClick={() => onQtyChange(item.productId, item.quantity - 1)}
          className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-800"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() => onQtyChange(item.productId, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>

      <span className="w-24 shrink-0 text-right text-sm font-semibold text-slate-800">
        {formatCurrency(lineTotal)}
      </span>

      <button
        onClick={() => onRemove(item.productId)}
        className="shrink-0 text-slate-300 hover:text-red-500"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
