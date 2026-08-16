import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { formatCurrency } from "../../utils/formatCurrency";

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
            {shift.date} · {shift.startTime} - {shift.endTime}
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
            Nhân viên phân công
          </p>
          {shift.assignments?.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {shift.assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-slate-700">
                    {a.employee?.user?.fullName || `NV #${a.employeeId}`}
                  </span>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Chưa có nhân viên nào được phân công
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
