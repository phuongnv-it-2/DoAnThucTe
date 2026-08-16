import {
  DollarSign,
  Receipt,
  Package,
  Printer,
  AlertTriangle,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

const currency = (n) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Tổng quan hoạt động kinh doanh hôm nay"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Doanh thu hôm nay"
          value={currency(0)}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          label="Hóa đơn hôm nay"
          value="0"
          icon={Receipt}
          color="blue"
        />
        <StatCard
          label="Sản phẩm đã bán"
          value="0"
          icon={Package}
          color="purple"
        />
        <StatCard
          label="Đơn in đang xử lý"
          value="0"
          icon={Printer}
          color="orange"
        />
        <StatCard
          label="Sản phẩm sắp hết"
          value="0"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Doanh thu 7 ngày gần nhất
          </h3>
          <div className="flex h-56 items-center justify-center text-sm text-slate-400">
            Biểu đồ Recharts sẽ hiển thị ở đây (Phase 8)
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Top sản phẩm bán chạy
          </h3>
          <div className="flex h-56 items-center justify-center text-sm text-slate-400">
            Chưa có dữ liệu
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Giao dịch gần đây
          </h3>
          <div className="py-10 text-center text-sm text-slate-400">
            Chưa có giao dịch nào
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Đơn in gần đây
          </h3>
          <div className="py-10 text-center text-sm text-slate-400">
            Chưa có đơn in nào
          </div>
        </div>
      </div>
    </div>
  );
}
