import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-slate-700">{label}</p>
      <p className="text-slate-500">
        Hóa đơn:{" "}
        <span className="font-medium text-slate-800">
          {formatCurrency(row.invoiceRevenue)}
        </span>
      </p>
      <p className="text-slate-500">
        Đơn in:{" "}
        <span className="font-medium text-slate-800">
          {formatCurrency(row.printOrderRevenue)}
        </span>
      </p>
      <p className="mt-1 border-t border-slate-100 pt-1 font-semibold text-emerald-600">
        Tổng: {formatCurrency(row.totalRevenue)}
      </p>
    </div>
  );
}

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        Chưa có dữ liệu trong khoảng thời gian này
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="totalRevenue"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
