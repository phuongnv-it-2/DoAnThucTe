import { useEffect, useState } from "react";
import {
  Loader2,
  DollarSign,
  Receipt,
  Printer,
  TrendingUp,
  AlertTriangle,
  Download,
} from "lucide-react";
import { reportApi } from "../../services/reportApi";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import RevenueChart from "../../components/report/RevenueChart";
import { formatCurrency } from "../../utils/formatCurrency";
import { todayISO, daysAgoISO } from "../../utils/dateRange";

export default function Reports() {
  const toast = useToast();

  const [fromDate, setFromDate] = useState(daysAgoISO(6));
  const [toDate, setToDate] = useState(todayISO());

  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function loadData(from, to) {
    setLoading(true);
    try {
      const [summaryRes, topRes, lowStockRes] = await Promise.all([
        reportApi.getRevenueSummary({
          fromDate: from,
          toDate: to,
          groupBy: "day",
        }),
        reportApi.getTopProducts({ fromDate: from, toDate: to, limit: 5 }),
        reportApi.getLowStock(),
      ]);
      setSummary(summaryRes.data.data);
      setTopProducts(topRes.data.data);
      setLowStock(lowStockRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyRange() {
    if (!fromDate || !toDate) {
      toast.error("Vui lòng chọn đầy đủ khoảng thời gian");
      return;
    }
    loadData(fromDate, toDate);
  }
  async function handleExport() {
    if (!fromDate || !toDate) {
      toast.error("Vui lòng chọn đầy đủ khoảng thời gian");
      return;
    }
    setExporting(true);
    try {
      const res = await reportApi.exportTransactions({ fromDate, toDate });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `giao-dich-${fromDate}-den-${toDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Xuất file thành công");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xuất file thất bại");
    } finally {
      setExporting(false);
    }
  }

  function applyPreset(days) {
    const from = daysAgoISO(days);
    const to = todayISO();
    setFromDate(from);
    setToDate(to);
    loadData(from, to);
  }

  return (
    <div>
      <PageHeader
        title="Báo cáo"
        subtitle="Doanh thu, sản phẩm bán chạy và cảnh báo tồn kho"
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { label: "7 ngày", days: 6 },
          { label: "30 ngày", days: 29 },
          { label: "90 ngày", days: 89 },
        ].map((p) => (
          <button
            key={p.days}
            onClick={() => applyPreset(p.days)}
            className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            {p.label}
          </button>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-slate-400">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            onClick={applyRange}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Lọc
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            Xuất Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Tổng doanh thu"
              value={formatCurrency(summary?.totalRevenue || 0)}
              icon={DollarSign}
              color="emerald"
            />
            <StatCard
              label="Doanh thu bán hàng"
              value={formatCurrency(summary?.invoiceRevenue || 0)}
              icon={Receipt}
              color="blue"
              hint={`${summary?.invoiceCount || 0} hóa đơn`}
            />
            <StatCard
              label="Doanh thu đơn in"
              value={formatCurrency(summary?.printOrderRevenue || 0)}
              icon={Printer}
              color="purple"
              hint={`${summary?.printOrderCount || 0} đơn`}
            />
            <StatCard
              label="Sản phẩm sắp hết"
              value={String(lowStock.length)}
              icon={AlertTriangle}
              color="red"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <TrendingUp size={16} /> Doanh thu theo ngày
              </h3>
              <RevenueChart data={summary?.daily} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                Top sản phẩm bán chạy
              </h3>
              {topProducts.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-sm text-slate-400">
                  Chưa có dữ liệu
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div key={p.productId} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {p.productName}
                        </p>
                        <p className="text-xs text-slate-400">
                          Đã bán: {p.totalQuantity}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-slate-700">
                        {formatCurrency(p.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlertTriangle size={16} className="text-orange-500" /> Sản phẩm
              sắp hết hàng
            </h3>
            {lowStock.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Không có sản phẩm nào dưới ngưỡng cảnh báo
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Sản phẩm</th>
                      <th className="px-3 py-2">Danh mục</th>
                      <th className="px-3 py-2 text-right">Tồn kho</th>
                      <th className="px-3 py-2 text-right">Ngưỡng cảnh báo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-3 py-2.5 font-medium text-slate-800">
                          {p.name}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500">
                          {p.category?.name || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-orange-600">
                          {p.stock} {p.unit}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-500">
                          {p.minStock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
