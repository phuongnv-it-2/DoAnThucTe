import { useEffect, useState } from "react";
import { Loader2, History } from "lucide-react";
import { activityLogApi } from "../../services/activityLogApi";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import {
  ACTION_LABELS,
  ACTION_COLORS,
  ENTITY_OPTIONS,
} from "../../constants/activityLog";

export default function ActivityLogs() {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function loadData(filters = {}) {
    setLoading(true);
    try {
      const res = await activityLogApi.getAll(filters);
      setLogs(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải nhật ký hoạt động"
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
    if (entity) filters.entity = entity;
    if (action) filters.action = action;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    loadData(filters);
  }

  function resetFilters() {
    setEntity("");
    setAction("");
    setFromDate("");
    setToDate("");
    loadData();
  }

  return (
    <div>
      <PageHeader
        title="Lịch sử hoạt động"
        subtitle="Nhật ký thao tác của tài khoản trong hệ thống"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tất cả đối tượng</option>
          {ENTITY_OPTIONS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tất cả hành động</option>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
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
        <button
          onClick={resetFilters}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Xóa lọc
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <History size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">Không có nhật ký nào phù hợp</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Người thực hiện</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.user?.fullName || "Hệ thống"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ACTION_COLORS[log.action] || ACTION_COLORS.OTHER
                      }`}
                    >
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.entity}
                    {log.entityId ? ` #${log.entityId}` : ""}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
