import { Printer, X, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ReceiptModal({ invoice, onClose }) {
  if (!invoice) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-white print:p-0">
      <div className="flex max-h-[90vh] w-full max-w-sm flex-col rounded-xl bg-white shadow-xl print:max-h-none print:w-full print:max-w-none print:rounded-none print:shadow-none">
        {/* Header - hidden when printing */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={20} />
            <h3 className="text-sm font-semibold">Thanh toán thành công</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable receipt body */}
        <div id="receipt-print-area" className="overflow-y-auto px-6 py-5">
          <div className="mb-4 text-center">
            <p className="text-base font-bold text-slate-900">SH MART</p>
            <p className="text-xs text-slate-500">
              Hóa đơn bán hàng #{invoice.invoiceCode}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(invoice.createdAt || Date.now()).toLocaleString(
                "vi-VN"
              )}
            </p>
          </div>

          <div className="mb-3 space-y-1 border-y border-dashed border-slate-300 py-3 text-sm">
            {invoice.details?.map((d) => (
              <div
                key={d.id || d.productId}
                className="flex justify-between gap-2"
              >
                <span className="flex-1 text-slate-700">
                  {d.productName || d.name} x{d.quantity}
                </span>
                <span className="shrink-0 font-medium text-slate-800">
                  {formatCurrency(d.total ?? d.quantity * d.unitPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Tạm tính</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Giảm giá</span>
              <span>-{formatCurrency(invoice.discount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900">
              <span>Tổng cộng</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between pt-1 text-xs text-slate-400">
              <span>Phương thức</span>
              <span>
                {invoice.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
              </span>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            Cảm ơn quý khách!
          </p>
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-5 py-4 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <Printer size={16} /> In bill
          </button>
        </div>
      </div>
    </div>
  );
}
