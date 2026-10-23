import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { formatCurrency } from "../../utils/formatCurrency";
import { toHHmm, formatDuration } from "../../utils/time";

export default function ShiftDetailModal({ open, onClose, shift }) {
  if (!shift) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${shift.name} — ${shift.shiftCode}`}
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Đóng
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {shift.date} · {String(shift.startTime).slice(0, 5)} -{" "}
            {String(shift.endTime).slice(0, 5)}
          </p>
          <Badge status={shift.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Doanh thu</p>
            <p className="font-semibold text-slate-800">
              {formatCurrency(shift.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Tiền mặt hệ thống</p>
            <p className="font-semibold text-slate-800">
              {formatCurrency(shift.cashAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Chuyển khoản</p>
            <p className="font-semibold text-slate-800">
              {formatCurrency(shift.transferAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Số hóa đơn</p>
            <p className="font-semibold text-slate-800">{shift.invoiceCount}</p>
          </div>
          {shift.actualCash != null && (
            <div>
              <p className="text-xs text-slate-400">Tiền mặt thực đếm</p>
              <p className="font-semibold text-slate-800">
                {formatCurrency(shift.actualCash)}
              </p>
            </div>
          )}
          {shift.difference != null && (
            <div>
              <p className="text-xs text-slate-400">Chênh lệch</p>
              <p
                className={`font-semibold ${
                  Number(shift.difference) === 0
                    ? "text-slate-800"
                    : "text-orange-600"
                }`}
              >
                {formatCurrency(shift.difference)}
              </p>
            </div>
          )}
        </div>

        {shift.note && (
          <div className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Ghi chú: </span>
            {shift.note}
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Nhân viên và giờ làm
          </p>
          {shift.assignments?.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2">Nhân viên</th>
                    <th className="px-4 py-2">Vào</th>
                    <th className="px-4 py-2">Ra</th>
                    <th className="px-4 py-2 text-right">Số giờ</th>
                  </tr>
                </thead>
                <tbody>
                  {shift.assignments.map((a) => {
                    const closed = !!a.checkOutAt;
                    return (
                      <tr
                        key={a.id}
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-4 py-2.5 font-medium">
                          {a.employee?.user?.fullName || `NV #${a.employeeId}`}
                        </td>
                        <td className="px-4 py-2.5">
                          {toHHmm(a.checkInAt || a.plannedStartAt) || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          {toHHmm(a.checkOutAt || a.plannedEndAt) || "—"}
                          {!closed && (
                            <span className="ml-1 text-xs text-slate-400">
                              (dự kiến)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {closed ? formatDuration(a.workedMinutes) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Chưa có nhân viên nào trong ca này
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
