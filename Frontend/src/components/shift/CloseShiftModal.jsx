import { useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CloseShiftModal({
  open,
  onClose,
  onSubmit,
  submitting,
  shift,
}) {
  const [actualCash, setActualCash] = useState("");
  const [note, setNote] = useState("");

  const difference = useMemo(() => {
    if (!shift || actualCash === "") return null;
    return Number(actualCash) - Number(shift.cashAmount);
  }, [actualCash, shift]);

  function handleSubmit() {
    if (actualCash === "") return;
    onSubmit({ actualCash: Number(actualCash), note });
  }

  if (!shift) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Chốt ca — ${shift.name} (${shift.shiftCode})`}
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
            disabled={submitting || actualCash === ""}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tiền mặt thực đếm được <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={actualCash}
            onChange={(e) => setActualCash(e.target.value)}
            placeholder="0"
            autoFocus
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
