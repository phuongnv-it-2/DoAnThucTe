import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";

export default function CancelInvoiceModal({
  open,
  onClose,
  onSubmit,
  submitting,
  invoice,
}) {
  const [reason, setReason] = useState("");

  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Hủy hóa đơn ${invoice.invoiceCode}`}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Xác nhận hủy
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            Hủy hóa đơn sẽ hoàn lại tồn kho và trừ doanh thu ca làm việc tương
            ứng. Thao tác này không thể hoàn tác.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Lý do hủy
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ví dụ: Khách trả hàng, nhập nhầm sản phẩm..."
            autoFocus
            className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>
    </Modal>
  );
}
