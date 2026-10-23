import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import { formatCurrency } from "../../utils/formatCurrency";
import { toHHmm, minutesBetweenHHmm, formatDuration } from "../../utils/time";

const inputCls =
  "rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function CloseShiftModal({
  open,
  onClose,
  onSubmit,
  submitting,
  shift,
}) {
  const [actualCash, setActualCash] = useState("");
  const [note, setNote] = useState("");
  // employeeId (string) -> "HH:mm" giờ ra
  const [outTimes, setOutTimes] = useState({});

  const assignments = shift?.assignments || [];

  // Mỗi lần mở modal: giờ ra mặc định = giờ ra dự kiến đã nhập lúc mở ca
  useEffect(() => {
    if (open && shift) {
      setActualCash("");
      setNote("");
      setOutTimes(
        Object.fromEntries(
          (shift.assignments || []).map((a) => [
            String(a.employeeId),
            toHHmm(a.checkOutAt || a.plannedEndAt),
          ])
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shift?.id]);

  const difference = useMemo(() => {
    if (!shift || actualCash === "") return null;
    return Number(actualCash) - Number(shift.cashAmount);
  }, [actualCash, shift]);

  const rows = assignments.map((a) => {
    const key = String(a.employeeId);
    const inTime = toHHmm(a.checkInAt);
    const outTime = outTimes[key] ?? "";
    const minutes = minutesBetweenHHmm(inTime, outTime);
    return {
      a,
      key,
      inTime,
      outTime,
      minutes,
      bad: minutes == null || minutes <= 0,
    };
  });

  const hasBadTime = rows.some((r) => r.bad);
  const canSubmit = !submitting && actualCash !== "" && !hasBadTime;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      actualCash: Number(actualCash),
      note,
      assignments: rows.map((r) => ({
        employeeId: r.a.employeeId,
        checkOutTime: r.outTime,
      })),
    });
  }

  if (!shift) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Chốt ca — ${shift.name} (${shift.shiftCode})`}
      size="xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Xác nhận đóng ca
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div>
            <p className="text-slate-400">Doanh thu ca</p>
            <p className="font-semibold text-slate-800">
              {formatCurrency(shift.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Tiền mặt hệ thống</p>
            <p className="font-semibold text-slate-800">
              {formatCurrency(shift.cashAmount)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Chuyển khoản</p>
            <p className="font-semibold text-slate-800">
              {formatCurrency(shift.transferAmount)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Số hóa đơn</p>
            <p className="font-semibold text-slate-800">{shift.invoiceCount}</p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">
            Giờ làm của nhân viên
          </p>
          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 py-4 text-center text-sm text-slate-400">
              Ca này chưa có nhân viên nào
            </p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {rows.map((r) => (
                <div
                  key={r.a.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5"
                >
                  <span className="min-w-[8rem] flex-1 text-sm font-medium text-slate-800">
                    {r.a.employee?.user?.fullName || `NV #${r.a.employeeId}`}
                  </span>
                  <span className="text-xs text-slate-500">
                    Vào {r.inTime || "—"}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500">
                    Ra
                    <input
                      type="time"
                      value={r.outTime}
                      onChange={(e) =>
                        setOutTimes((prev) => ({
                          ...prev,
                          [r.key]: e.target.value,
                        }))
                      }
                      className={`${inputCls} ${r.bad ? "border-red-400" : ""}`}
                    />
                  </label>
                  <span
                    className={`w-24 text-right text-xs font-medium ${
                      r.bad ? "text-red-500" : "text-emerald-700"
                    }`}
                  >
                    {r.bad ? "Giờ ra sai" : formatDuration(r.minutes)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-1.5 text-xs text-slate-400">
            Giờ ra mặc định là giờ dự kiến. Ai về sớm hoặc về muộn thì sửa lại để
            tính lương đúng.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tiền mặt thực đếm được <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={actualCash}
            onChange={(e) => setActualCash(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {difference !== null && difference !== 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>
              Chênh lệch quỹ:{" "}
              <span className="font-semibold">
                {difference > 0 ? "+" : ""}
                {formatCurrency(difference)}
              </span>{" "}
              so với hệ thống.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Ghi chú
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Lý do chênh lệch (nếu có)..."
            className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>
    </Modal>
  );
}
