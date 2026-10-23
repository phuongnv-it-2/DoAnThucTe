import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Receipt,
  Package,
  Printer,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { reportApi } from "../../services/reportApi";
import { invoiceApi } from "../../services/invoiceApi";
import { printOrderApi } from "../../services/printOrderApi";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import RevenueChart from "../../components/report/RevenueChart";
import TopProductsChart from "../../components/dashboard/TopProductsChart";
import { formatCurrency } from "../../utils/formatCurrency";
import { SERVICE_TYPE_LABELS } from "../../constants/printOrder";
import {
  dayStartISO,
  dayEndISO,
  dateKey,
  lastNDayKeys,
  formatDateTime,
} from "../../utils/dayRange";

const REFRESH_MS = 60000;
const RECENT_LIMIT = 6;

function ok(result, fallback) {
  return result.status === "fulfilled" ? result.value.data.data : fallback;
}

function Panel({ title, linkTo, linkLabel = "Xem tất cả", children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyText({ children }) {
  return (
    <div className="py-10 text-center text-sm text-slate-400">{children}</div>
  );
}

export default function Dashboard() {
  const { role } = useAuth();
  const base = `/${String(role || "admin").toLowerCase()}`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    const todayFrom = dayStartISO(0);
    const todayTo = dayEndISO(0);
    const weekFrom = dayStartISO(-6);

    const results = await Promise.allSettled([
      reportApi.getRevenueSummary({ fromDate: todayFrom, toDate: todayTo }),
      reportApi.getRevenueSummary({
        fromDate: weekFrom,
        toDate: todayTo,
        groupBy: "day",
      }),
      reportApi.getTopProducts({
        fromDate: todayFrom,
        toDate: todayTo,
        limit: 1000,
      }),
      reportApi.getTopProducts({
        fromDate: weekFrom,
        toDate: todayTo,
        limit: 5,
      }),
      reportApi.getLowStock(),
      invoiceApi.getAll({ fromDate: weekFrom, toDate: todayTo }),
      printOrderApi.getAll({ status: "PENDING" }),
      printOrderApi.getAll({ status: "PROCESSING" }),
      printOrderApi.getAll({ fromDate: dayStartISO(-29), toDate: todayTo }),
    ]);

    const [
      today,
      week,
      soldToday,
      top,
      lowStock,
      invoices,
      pending,
      processing,
      prints,
    ] = results;

    // Điền đủ 7 ngày (ngày không có doanh thu = 0) để biểu đồ không bị đứt
    const dailyMap = new Map(
      (ok(week, {}).daily || []).map((r) => [dateKey(r.date), r])
    );
    const keys = lastNDayKeys(7);
    const daily = keys.map((k) => {
      const r = dailyMap.get(k);
      return {
        date: k,
        invoiceRevenue: r?.invoiceRevenue || 0,
        printOrderRevenue: r?.printOrderRevenue || 0,
        totalRevenue: r?.totalRevenue || 0,
      };
    });

    setData({
      today: ok(today, { totalRevenue: 0, invoiceCount: 0 }),
      daily,
      soldQuantity: ok(soldToday, []).reduce((s, p) => s + p.totalQuantity, 0),
      soldKinds: ok(soldToday, []).length,
      topProducts: ok(top, []),
      lowStock: ok(lowStock, []),
      invoices: ok(invoices, []).slice(0, RECENT_LIMIT),
      pendingCount: ok(pending, []).length,
      processingCount: ok(processing, []).length,
      printOrders: ok(prints, []).slice(0, RECENT_LIMIT),
    });
    setFailedCount(results.filter((r) => r.status === "rejected").length);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  const todayRevenue = Number(data.today.totalRevenue) || 0;
  const yesterday = data.daily[data.daily.length - 2];
  let revenueHint;
  if (yesterday && yesterday.totalRevenue > 0) {
    const pct =
      ((todayRevenue - yesterday.totalRevenue) / yesterday.totalRevenue) * 100;
    revenueHint = `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% so với hôm qua`;
  } else if (todayRevenue > 0) {
    revenueHint = "Hôm qua chưa có doanh thu";
  }

  const printActive = data.pendingCount + data.processingCount;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Tổng quan hoạt động kinh doanh hôm nay"
        action={
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Làm mới
          </button>
        }
      />

      {failedCount > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
          <span>
            Có {failedCount} mục chưa tải được nên số liệu có thể chưa đầy đủ.
          </span>
          <button
            onClick={() => load(true)}
            className="font-semibold underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Doanh thu hôm nay"
          value={formatCurrency(todayRevenue)}
          icon={DollarSign}
          color="emerald"
          hint={revenueHint}
        />
        <StatCard
          label="Hóa đơn hôm nay"
          value={data.today.invoiceCount || 0}
          icon={Receipt}
          color="blue"
          hint="Đã thanh toán"
        />
        <StatCard
          label="Sản phẩm đã bán"
          value={data.soldQuantity}
          icon={Package}
          color="purple"
          hint={
            data.soldKinds > 0 ? `${data.soldKinds} loại sản phẩm` : undefined
          }
        />
        <StatCard
          label="Đơn in đang xử lý"
          value={printActive}
          icon={Printer}
          color="orange"
          hint={
            printActive > 0
              ? `${data.pendingCount} chờ · ${data.processingCount} đang làm`
              : undefined
          }
        />
        <StatCard
          label="Sản phẩm sắp hết"
          value={data.lowStock.length}
          icon={AlertTriangle}
          color="red"
          hint={data.lowStock.length > 0 ? "Cần nhập thêm" : "Tồn kho ổn định"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Doanh thu 7 ngày gần nhất"
            linkTo={`${base}/reports`}
            linkLabel="Xem báo cáo"
          >
            <RevenueChart data={data.daily} />
          </Panel>
        </div>
        <Panel title="Top sản phẩm bán chạy (7 ngày)">
          <TopProductsChart data={data.topProducts} />
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Giao dịch gần đây" linkTo={`${base}/invoices`}>
          {data.invoices.length === 0 ? (
            <EmptyText>Chưa có giao dịch nào</EmptyText>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3">Mã HĐ</th>
                    <th className="pb-2 pr-3">Thời gian</th>
                    <th className="pb-2 pr-3">Thanh toán</th>
                    <th className="pb-2 pr-3 text-right">Tổng tiền</th>
                    <th className="pb-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-slate-100">
                      <td className="py-2.5 pr-3 font-medium text-slate-800">
                        {inv.invoiceCode}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500">
                        {formatDateTime(inv.createdAt)}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {inv.paymentMethod === "CASH"
                          ? "Tiền mặt"
                          : "Chuyển khoản"}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-medium text-slate-800">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-2.5">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Đơn in gần đây" linkTo={`${base}/print-orders`}>
          {data.printOrders.length === 0 ? (
            <EmptyText>Chưa có đơn in nào</EmptyText>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3">Mã đơn</th>
                    <th className="pb-2 pr-3">Khách hàng</th>
                    <th className="pb-2 pr-3">Dịch vụ</th>
                    <th className="pb-2 pr-3 text-right">Tổng tiền</th>
                    <th className="pb-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.printOrders.map((o) => (
                    <tr key={o.id} className="border-t border-slate-100">
                      <td className="py-2.5 pr-3 font-medium text-slate-800">
                        {o.orderCode}
                        <p className="text-xs font-normal text-slate-400">
                          {formatDateTime(o.createdAt)}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {o.customerName || "Khách lẻ"}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {SERVICE_TYPE_LABELS[o.serviceType] || o.serviceType}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-medium text-slate-800">
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td className="py-2.5">
                        <Badge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {data.lowStock.length > 0 && (
        <div className="mt-6">
          <Panel
            title="Sản phẩm sắp hết hàng"
            linkTo={`${base}/inventory`}
            linkLabel="Đến kho hàng"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.lowStock.slice(0, 9).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">{p.sku}</p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      Number(p.stock) <= 0
                        ? "bg-red-50 text-red-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {Number(p.stock) <= 0 ? "Hết hàng" : `Còn ${p.stock}`}
                  </span>
                </div>
              ))}
            </div>
            {data.lowStock.length > 9 && (
              <p className="mt-3 text-xs text-slate-400">
                và {data.lowStock.length - 9} sản phẩm khác
              </p>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
