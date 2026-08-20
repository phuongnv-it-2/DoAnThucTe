import {
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
  ShoppingCart,
  Undo2,
} from "lucide-react";

const TYPE_META = {
  IMPORT: {
    label: "Nhập kho",
    icon: ArrowDownCircle,
    color: "text-emerald-600 bg-emerald-50",
  },
  EXPORT: {
    label: "Xuất kho",
    icon: ArrowUpCircle,
    color: "text-orange-600 bg-orange-50",
  },
  ADJUST: {
    label: "Điều chỉnh",
    icon: RefreshCcw,
    color: "text-blue-600 bg-blue-50",
  },
  SALE: {
    label: "Bán hàng",
    icon: ShoppingCart,
    color: "text-slate-600 bg-slate-100",
  },
  CANCEL_SALE: {
    label: "Hủy bán",
    icon: Undo2,
    color: "text-red-600 bg-red-50",
  },
};

export default function InventoryHistoryTable({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-400">
        Chưa có giao dịch kho nào
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Thời gian</th>
            <th className="px-4 py-3">Sản phẩm</th>
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3 text-right">Trước → Sau</th>
            <th className="px-4 py-3">Ghi chú</th>
            <th className="px-4 py-3">Người thực hiện</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const meta = TYPE_META[t.type] || TYPE_META.ADJUST;
            const Icon = meta.icon;
            return (
              <tr
                key={t.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(t.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">
                    {t.product?.name || "—"}
                  </p>
                  <p className="text-xs text-slate-400">{t.product?.sku}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}
                  >
                    <Icon size={12} /> {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">
                  {t.beforeStock} → {t.afterStock}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-slate-500">
                  {t.note || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {t.user?.fullName || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
