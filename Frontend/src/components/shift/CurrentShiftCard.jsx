import { Clock, PlayCircle, StopCircle } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { toHHmm } from "../../utils/time";

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
            Chọn ca (sáng, chiều, tối) và nhân viên làm ca để bắt đầu bán hàng.
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

  const assignments = shift.assignments || [];

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
            {shift.date} · {String(shift.startTime).slice(0, 5)} -{" "}
            {String(shift.endTime).slice(0, 5)}
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

      {assignments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {assignments.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-slate-700"
            >
              <span className="font-medium">
                {a.employee?.user?.fullName || `NV #${a.employeeId}`}
              </span>
              <span className="text-slate-400">
                {toHHmm(a.checkInAt)}-{toHHmm(a.plannedEndAt)}
              </span>
            </span>
          ))}
        </div>
      )}

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
