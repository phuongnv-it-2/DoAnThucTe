import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

function truncate(s, n) {
  const str = String(s || "");
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-slate-700">{row.productName}</p>
      <p className="text-slate-500">
        Đã bán:{" "}
        <span className="font-medium text-slate-800">{row.totalQuantity}</span>
      </p>
      <p className="text-slate-500">
        Doanh thu:{" "}
        <span className="font-medium text-emerald-600">
          {formatCurrency(row.totalRevenue)}
        </span>
      </p>
    </div>
  );
}

export default function TopProductsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="productName"
          width={110}
          tick={{ fontSize: 11, fill: "#475569" }}
          tickFormatter={(v) => truncate(v, 16)}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Bar
          dataKey="totalQuantity"
          fill="#10b981"
          radius={[0, 4, 4, 0]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
