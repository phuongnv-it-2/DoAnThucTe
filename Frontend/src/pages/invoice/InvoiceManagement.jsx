import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Eye, Ban, Receipt } from "lucide-react";
import { invoiceApi } from "../../services/invoiceApi";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import InvoiceDetailModal from "../../components/invoice/InvoiceDetailModal";
import CancelInvoiceModal from "../../components/invoice/CancelInvoiceModal";
import { formatCurrency } from "../../utils/formatCurrency";

export default function InvoiceManagement() {
  const toast = useToast();
  const { role } = useAuth();
  const canCancel = role === "ADMIN" || role === "MANAGER";

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [detailInvoice, setDetailInvoice] = useState(null);
  const [cancelInvoice, setCancelInvoice] = useState(null);

  async function loadData(filters = {}) {
    setLoading(true);
    try {
      const res = await invoiceApi.getAll(filters);
      setInvoices(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải danh sách hóa đơn"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters() {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    loadData(filters);
  }

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.invoiceCode.toLowerCase().includes(q) ||
        (inv.customerName || "").toLowerCase().includes(q) ||
        (inv.customerPhone || "").includes(q)
    );
  }, [invoices, search]);

  async function handleViewDetail(invoice) {
    try {
      const res = await invoiceApi.getById(invoice.id);
      setDetailInvoice(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải chi tiết hóa đơn"
      );
    }
  }

  function handleRequestCancel(invoice) {
    setDetailInvoice(null);
    setCancelInvoice(invoice);
  }

  async function handleConfirmCancel(reason) {
    setSubmitting(true);
    try {
      await invoiceApi.cancel(cancelInvoice.id, reason);
      toast.success("Hủy hóa đơn thành công");
      setCancelInvoice(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hủy hóa đơn thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Hóa đơn" subtitle="Danh sách hóa đơn bán hàng" />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã hóa đơn, tên/SĐT khách..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />

        <button
          onClick={applyFilters}
          className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Lọc
        </button>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Receipt size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">
            Không tìm thấy hóa đơn phù hợp
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Mã hóa đơn</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Thu ngân</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {inv.invoiceCode}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(inv.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inv.employee?.fullName || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inv.customerName || "Khách lẻ"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inv.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={inv.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleViewDetail(inv)}
                        className="text-slate-400 hover:text-emerald-600"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {canCancel && inv.status === "COMPLETED" && (
                        <button
                          onClick={() => setCancelInvoice(inv)}
                          className="text-slate-400 hover:text-red-500"
                          title="Hủy hóa đơn"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceDetailModal
        open={!!detailInvoice}
        onClose={() => setDetailInvoice(null)}
        invoice={detailInvoice}
        canCancel={canCancel}
        onRequestCancel={handleRequestCancel}
      />

      <CancelInvoiceModal
        open={!!cancelInvoice}
        onClose={() => setCancelInvoice(null)}
        onSubmit={handleConfirmCancel}
        submitting={submitting}
        invoice={cancelInvoice}
      />
    </div>
  );
}
