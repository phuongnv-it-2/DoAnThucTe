import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Eye, Printer } from "lucide-react";
import { printOrderApi } from "../../services/printOrderApi";
import { shiftApi } from "../../services/shiftApi";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import PrintOrderFormModal from "../../components/printOrder/PrintOrderFormModal";
import PrintOrderDetailModal from "../../components/printOrder/PrintOrderDetailModal";
import { formatCurrency } from "../../utils/formatCurrency";
import { SERVICE_TYPE_LABELS } from "../../constants/printOrder";

export default function PrintOrderManagement() {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  async function loadData(filters = {}) {
    setLoading(true);
    try {
      const [ordersRes, shiftRes] = await Promise.all([
        printOrderApi.getAll(filters),
        shiftApi.getCurrent().catch(() => ({ data: { data: null } })),
      ]);
      setOrders(ordersRes.data.data);
      setCurrentShift(shiftRes.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải danh sách đơn dịch vụ"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(status) {
    setStatusFilter(status);
    loadData(status ? { status } : {});
  }

  async function handleCreate(payload) {
    setSubmitting(true);
    try {
      await printOrderApi.create(payload);
      toast.success("Tạo đơn dịch vụ thành công");
      setFormVisible(false);
      await loadData(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo đơn thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewDetail(order) {
    try {
      const res = await printOrderApi.getById(order.id);
      setDetailOrder(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải chi tiết đơn");
    }
  }

  async function handleChangeStatus(order, status) {
    setChangingStatus(true);
    try {
      await printOrderApi.updateStatus(order.id, status);
      toast.success("Cập nhật trạng thái thành công");
      const res = await printOrderApi.getById(order.id);
      setDetailOrder(res.data.data);
      await loadData(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    } finally {
      setChangingStatus(false);
    }
  }

  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "COMPLETED", label: "Đã hoàn thành" },
    { value: "DELIVERED", label: "Đã giao" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Đơn in"
        subtitle="Quản lý đơn dịch vụ photocopy / in ấn"
        action={
          <button
            onClick={() => setFormVisible(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <Plus size={16} /> Tạo đơn
          </button>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Printer size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">Chưa có đơn dịch vụ nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Dịch vụ</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {o.orderCode}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(o.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {SERVICE_TYPE_LABELS[o.serviceType] || o.serviceType}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.customerName || "Khách lẻ"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {formatCurrency(o.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewDetail(o)}
                      className="text-slate-400 hover:text-emerald-600"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PrintOrderFormModal
        open={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
        submitting={submitting}
        currentShift={currentShift}
      />

      <PrintOrderDetailModal
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        order={detailOrder}
        onChangeStatus={handleChangeStatus}
        changingStatus={changingStatus}
        canManage={true}
      />
    </div>
  );
}
