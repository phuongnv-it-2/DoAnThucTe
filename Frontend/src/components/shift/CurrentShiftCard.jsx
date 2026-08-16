import { Clock, PlayCircle, StopCircle } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CurrentShiftCard({
  shift,
  canManage,
  onOpen,
  onClose,
}) {
  if (!shift) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Clock size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">
            Chưa có ca làm việc nào đang mở
          </p>
          <p className="text-sm text-slate-400">
            {canManage
              ? "Mở ca để bắt đầu bán hàng."
              : "Vui lòng chờ quản lý mở ca."}
          </p>
        </div>
        {canManage && (
          <button
            onClick={onOpen}
            className="mt-1 flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <PlayCircle size={16} /> Mở ca
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">
              Đang mở — {shift.name} ({shift.shiftCode})
            </p>
          </div>
          <p className="text-xs text-slate-500">
            {shift.date} · {shift.startTime} - {shift.endTime}
          </p>
        </div>

        {canManage && (
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            <StopCircle size={16} /> Đóng ca
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs text-slate-400">Doanh thu</p>
          <p className="text-sm font-bold text-slate-800">
            {formatCurrency(shift.totalRevenue)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs text-slate-400">Tiền mặt</p>
          <p className="text-sm font-bold text-slate-800">
            {formatCurrency(shift.cashAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs text-slate-400">Chuyển khoản</p>
          <p className="text-sm font-bold text-slate-800">
            {formatCurrency(shift.transferAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs text-slate-400">Số hóa đơn</p>
          <p className="text-sm font-bold text-slate-800">
            {shift.invoiceCount}
          </p>
        </div>
      </div>
    </div>
  );
}
