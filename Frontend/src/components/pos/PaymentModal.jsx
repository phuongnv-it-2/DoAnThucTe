import { useEffect, useState } from "react";
import { Loader2, Banknote, CreditCard, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function PaymentModal({
  open,
  onClose,
  onConfirm,
  submitting,
  total,
  invoice,
}) {
  const [method, setMethod] = useState("CASH");
  const [received, setReceived] = useState("");

  useEffect(() => {
    if (open) {
      setMethod("CASH");
      setReceived("");
    }
  }, [open]);

  if (!open) return null;

  const receivedNum = Number(received) || 0;
  const change = method === "CASH" ? Math.max(0, receivedNum - total) : 0;
  const insufficient =
    method === "CASH" && received !== "" && receivedNum < total;
  const canConfirm =
    method === "TRANSFER" || (received !== "" && receivedNum >= total);

  function addQuick(amount) {
    setReceived((prev) => String((Number(prev) || 0) + amount));
  }

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm(method);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Thanh toán</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center">
            <p className="text-xs text-emerald-700">Khách cần trả</p>
            <p className="text-2xl font-bold text-emerald-700">
              {formatCurrency(total)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMethod("CASH")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                method === "CASH"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Banknote size={16} /> Tiền mặt
            </button>
            <button
              onClick={() => setMethod("TRANSFER")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                method === "TRANSFER"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <CreditCard size={16} /> Chuyển khoản
            </button>
          </div>

          {method === "CASH" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Khách đưa
                </label>
                <input
                  type="number"
                  min={0}
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-right text-lg font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => addQuick(amt)}
                    className="rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    +{amt / 1000}k
                  </button>
                ))}
              </div>
              <button
                onClick={() => setReceived(String(total))}
                className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"
              >
                Khách đưa đủ tiền
              </button>

              <div
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
                  insufficient
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-50 text-slate-700"
                }`}
              >
                <span>{insufficient ? "Còn thiếu" : "Tiền thối lại"}</span>
                <span className="text-lg font-bold">
                  {formatCurrency(insufficient ? total - receivedNum : change)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !canConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
