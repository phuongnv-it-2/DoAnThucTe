import { Eye } from "lucide-react";
import Badge from "../ui/Badge";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ShiftHistoryTable({ shifts, onView }) {
  if (shifts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-400">
        Chưa có lịch sử ca làm việc
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Ca</th>
            <th className="px-4 py-3">Ngày</th>
            <th className="px-4 py-3">Thời gian</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Doanh thu</th>
            <th className="px-4 py-3 text-right">Hóa đơn</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((s) => (
            <tr
              key={s.id}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
            >
              <td className="px-4 py-3 font-medium text-slate-800">
                {s.name}
                <p className="text-xs font-normal text-slate-400">
                  {s.shiftCode}
                </p>
              </td>
              <td className="px-4 py-3 text-slate-600">{s.date}</td>
              <td className="px-4 py-3 text-slate-600">
                {s.startTime} - {s.endTime}
              </td>
              <td className="px-4 py-3">
                <Badge status={s.status} />
              </td>
              <td className="px-4 py-3 text-right font-medium text-slate-800">
                {formatCurrency(s.totalRevenue)}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                {s.invoiceCount}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onView(s)}
                  className="text-slate-400 hover:text-emerald-600"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
