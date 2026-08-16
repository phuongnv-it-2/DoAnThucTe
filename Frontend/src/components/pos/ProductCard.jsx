import { PackagePlus, ImageOff } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductCard({ product, onAdd }) {
  const outOfStock = product.stock <= 0;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => onAdd(product)}
      className={`group flex flex-col rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm`}
    >
      <div className="relative mb-2.5 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageOff size={28} className="text-slate-300" />
        )}

        {!outOfStock && (
          <div className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            <PackagePlus size={15} />
          </div>
        )}

        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-red-500/90 py-1 text-center text-[11px] font-semibold text-white">
            Hết hàng
          </span>
        )}
      </div>

      <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-slate-800">
        {product.name}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{product.sku}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-emerald-600">
          {formatCurrency(product.sellingPrice)}
        </span>
        <span className="text-xs text-slate-400">
          Còn {product.stock} {product.unit}
        </span>
      </div>
    </button>
  );
}
