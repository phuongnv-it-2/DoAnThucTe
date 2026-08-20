import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  SERVICE_TYPE_LABELS,
  VALID_TRANSITIONS,
  STATUS_ACTION_LABELS,
} from "../../constants/printOrder";

export default function PrintOrderDetailModal({
  open,
  onClose,
  order,
  onChangeStatus,
  changingStatus,
  canManage,
}) {
  if (!order) return null;

  const nextStatuses = VALID_TRANSITIONS[order.status] || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Đơn dịch vụ ${order.orderCode}`}
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
          {canManage &&
            nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => onChangeStatus(order, s)}
                disabled={changingStatus}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                  s === "CANCELLED"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {changingStatus && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {STATUS_ACTION_LABELS[s] || s}
              </button>
            ))}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
          <Badge status={order.status} />
        </div>

        {(order.customerName || order.customerPhone) && (
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Khách hàng: </span>
            {order.customerName || "—"}
            {order.customerPhone && ` — ${order.customerPhone}`}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Dịch vụ chính</p>
            <p className="font-medium text-slate-800">
              {SERVICE_TYPE_LABELS[order.serviceType] || order.serviceType}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Khổ giấy / Màu</p>
            <p className="font-medium text-slate-800">
              {order.paperSize || "—"} ·{" "}
              {order.colorMode === "COLOR" ? "Màu" : "Đen trắng"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Số trang x Số bản</p>
            <p className="font-medium text-slate-800">
              {order.numberOfPages} x {order.numberOfCopies}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 rounded-lg border border-slate-200 p-3">
          {order.details?.map((d) => (
            <div key={d.id} className="flex justify-between gap-2 text-sm">
              <span className="flex-1 text-slate-700">{d.description}</span>
              <span className="shrink-0 font-medium text-slate-800">
                {formatCurrency(d.total)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
          <span>Tổng cộng</span>
          <span className="text-emerald-600">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        {order.note && (
          <div className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Ghi chú: </span>
            {order.note}
          </div>
        )}

        <p className="text-xs text-slate-400">
          Người tạo: {order.creator?.fullName || "—"}
        </p>
      </div>
    </Modal>
  );
}
