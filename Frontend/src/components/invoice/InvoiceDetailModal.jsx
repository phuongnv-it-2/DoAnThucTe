import { X, Ban } from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { formatCurrency } from "../../utils/formatCurrency";

export default function InvoiceDetailModal({
  open,
  onClose,
  invoice,
  canCancel,
  onRequestCancel,
}) {
  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Hóa đơn ${invoice.invoiceCode}`}
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
          {canCancel && invoice.status === "COMPLETED" && (
            <button
              onClick={() => onRequestCancel(invoice)}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              <Ban size={15} /> Hủy hóa đơn
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {new Date(invoice.createdAt).toLocaleString("vi-VN")}
            </p>
            <p className="text-xs text-slate-400">
              Thu ngân: {invoice.employee?.fullName || "—"}
            </p>
          </div>
          <Badge status={invoice.status} />
        </div>

        {invoice.customerName && (
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Khách hàng: </span>
            {invoice.customerName}
            {invoice.customerPhone && ` — ${invoice.customerPhone}`}
          </div>
        )}

        <div className="space-y-1.5 rounded-lg border border-slate-200 p-3">
          {invoice.details?.map((d) => (
            <div key={d.id} className="flex justify-between gap-2 text-sm">
              <span className="flex-1 text-slate-700">
                {d.productName} x{d.quantity}
              </span>
              <span className="shrink-0 font-medium text-slate-800">
                {formatCurrency(d.total)}
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

        {invoice.note && (
          <div className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Ghi chú: </span>
            {invoice.note}
          </div>
        )}

        {invoice.status === "CANCELLED" && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <X size={16} className="mt-0.5 shrink-0" />
            <div>
              <p>
                Đã hủy lúc{" "}
                {invoice.cancelledAt &&
                  new Date(invoice.cancelledAt).toLocaleString("vi-VN")}
                {invoice.cancelledByUser &&
                  ` bởi ${invoice.cancelledByUser.fullName}`}
              </p>
              {invoice.cancelReason && (
                <p className="mt-0.5">Lý do: {invoice.cancelReason}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
