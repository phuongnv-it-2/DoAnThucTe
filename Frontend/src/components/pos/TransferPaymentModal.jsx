import { useState } from "react";
import { X, Copy, Check, Loader2, CheckCircle2 } from "lucide-react";
import {
  STORE_BANK,
  STATIC_QR_IMAGE,
  buildQrUrl,
} from "../../constants/bankInfo";
import { formatCurrency } from "../../utils/formatCurrency";

function CopyRow({ label, value, strong }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* bỏ qua */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={
            strong ? "font-bold text-blue-700" : "font-medium text-gray-800"
          }
        >
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          className="text-gray-400 hover:text-blue-600"
          title="Sao chép"
        >
          {copied ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function TransferPaymentModal({
  open,
  invoice,
  onClose,
  onConfirm,
  onCancelOrder,
  loading,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  if (!open || !invoice) return null;

  const amount = Number(invoice.total);
  const content = invoice.invoiceCode;
  const qrSrc =
    STATIC_QR_IMAGE && !imgFailed
      ? STATIC_QR_IMAGE
      : buildQrUrl({ amount, content });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">
            Chuyển khoản · {invoice.invoiceCode}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 flex justify-center">
            {imgFailed && !STATIC_QR_IMAGE ? (
              <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                Không tải được mã QR. Hãy chuyển khoản theo thông tin bên dưới.
              </div>
            ) : (
              <img
                src={qrSrc}
                alt="QR chuyển khoản"
                className="h-64 w-64 rounded-lg border object-contain"
                onError={() => setImgFailed(true)}
              />
            )}
          </div>

          {STATIC_QR_IMAGE && (
            <p className="mb-2 text-center text-xs text-amber-600">
              QR tĩnh: khách phải tự nhập đúng số tiền và nội dung bên dưới.
            </p>
          )}

          <div className="rounded-lg bg-gray-50 px-3">
            <CopyRow label="Ngân hàng" value={STORE_BANK.bankName} />
            <CopyRow label="Số tài khoản" value={STORE_BANK.accountNumber} />
            <CopyRow label="Chủ tài khoản" value={STORE_BANK.accountName} />
            <CopyRow label="Số tiền" value={formatCurrency(amount)} strong />
            <CopyRow label="Nội dung" value={content} />
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Kiểm tra app ngân hàng của cửa hàng, chỉ bấm xác nhận khi đã nhận đủ
            tiền.
          </p>
        </div>

        <div className="flex gap-3 border-t px-5 py-3">
          <button
            onClick={onCancelOrder}
            disabled={loading}
            className="flex-1 rounded-lg border border-red-200 py-2.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Hủy đơn
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Đã nhận được tiền
          </button>
        </div>
      </div>
    </div>
  );
}
