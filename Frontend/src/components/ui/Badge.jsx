const STATUS_STYLES = {
  // Generic
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-500",

  // Shift
  SCHEDULED: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",

  // Invoice
  CANCELLED: "bg-red-50 text-red-700",

  // PrintOrder
  PENDING: "bg-orange-50 text-orange-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-purple-50 text-purple-700",
};

const STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Ngừng",
  SCHEDULED: "Đã lên lịch",
  IN_PROGRESS: "Đang mở",
  COMPLETED: "Đã đóng",
  CANCELLED: "Đã hủy",
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  DELIVERED: "Đã giao",
};

export default function Badge({ status, label }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label || STATUS_LABELS[status] || status}
    </span>
  );
}
