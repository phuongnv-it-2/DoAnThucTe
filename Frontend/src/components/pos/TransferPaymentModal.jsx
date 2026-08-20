import { Loader2, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function TransferPaymentModal({ open, invoice, onClose }) {
  if (!open || !invoice) return null;

  const invoiceCode = invoice.invoiceCode;
  const amount = Number(invoice.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Chờ chuyển khoản
            </h2>

            <p className="text-xs text-slate-500">Hóa đơn {invoiceCode}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-xl bg-emerald-50 p-4 text-center">
            <p className="text-sm text-slate-500">Số tiền cần chuyển</p>

            <p className="mt-1 text-3xl font-bold text-emerald-600">
              {formatCurrency(amount)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-500">Nội dung chuyển khoản</p>

            <div className="rounded-lg border bg-slate-50 p-3 text-center font-bold">
              {invoiceCode}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-6">
            {/* Tạm thời chưa có QR */}
            <div className="flex h-48 w-48 items-center justify-center bg-slate-100">
              <span className="text-sm text-slate-400">QR CODE</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Đang chờ thanh toán...
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Hệ thống sẽ tự động xác nhận khi nhận được tiền.
          </p>

          <button
            onClick={onClose}
            className="w-full rounded-lg border py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
