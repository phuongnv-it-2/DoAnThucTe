import { Fragment, useEffect, useState } from "react";
import {
  Loader2,
  Download,
  ChevronDown,
  ChevronRight,
  Clock,
  Wallet,
  Users,
  AlertTriangle,
} from "lucide-react";
import { shiftApi } from "../../services/shiftApi";
import { useToast } from "../../contexts/ToastContext";
import StatCard from "../ui/StatCard";
import { formatCurrency } from "../../utils/formatCurrency";
import { currentMonthISO, toHHmm, formatDuration } from "../../utils/time";

export default function PayrollReport() {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonthISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!month) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await shiftApi.getPayroll(month);
        if (!cancelled) {
          setData(res.data.data);
          setExpanded({});
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          toast.error(
            err.response?.data?.message || "Không thể tải báo cáo lương"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await shiftApi.exportPayroll(month);
      const url = URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `luong-${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Không thể xuất file Excel");
    } finally {
      setExporting(false);
    }
  }

  const employees = data?.employees || [];
  const missingRate = employees.some((e) =>
    e.details.some((d) => Number(d.hourlyRate) === 0)
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tháng
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || loading || employees.length === 0}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}
          Xuất Excel
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : !data ? (
        <div className="rounded-xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-400">
          Không có dữ liệu
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Nhân viên có công"
              value={employees.length}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Tổng giờ công"
              value={`${data.totalHours} giờ`}
              icon={Clock}
              color="purple"
            />
            <StatCard
              label="Tổng tiền lương"
              value={formatCurrency(data.totalPay)}
              icon={Wallet}
              color="emerald"
            />
          </div>

          {missingRate && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>
                Có ca được ghi với lương/giờ bằng 0. Hãy khai báo lương/giờ trong
                hồ sơ nhân viên (mục Tài khoản). Lương chỉ áp dụng cho các ca mở
                sau khi khai báo.
              </p>
            </div>
          )}

          {employees.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-400">
              Tháng này chưa có ca nào đã đóng
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="w-8 px-4 py-3"></th>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3 text-right">Số ca</th>
                    <th className="px-4 py-3 text-right">Tổng giờ</th>
                    <th className="px-4 py-3 text-right">Tiền lương</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => {
                    const isOpen = !!expanded[e.employeeId];
                    return (
                      <Fragment key={e.employeeId}>
                        <tr
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [e.employeeId]: !prev[e.employeeId],
                            }))
                          }
                          className="cursor-pointer border-b border-slate-50 hover:bg-slate-50/60"
                        >
                          <td className="px-4 py-3 text-slate-400">
                            {isOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {e.fullName}
                            <p className="text-xs font-normal text-slate-400">
                              {e.employeeCode}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {e.shiftCount}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {e.totalHours} giờ
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                            {formatCurrency(e.totalPay)}
                          </td>
                        </tr>

                        {isOpen && (
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <td></td>
                            <td colSpan={4} className="px-4 py-3">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-left text-slate-400">
                                    <th className="py-1.5 pr-3 font-medium">Ngày</th>
                                    <th className="py-1.5 pr-3 font-medium">Ca</th>
                                    <th className="py-1.5 pr-3 font-medium">Vào - Ra</th>
                                    <th className="py-1.5 pr-3 text-right font-medium">Số giờ</th>
                                    <th className="py-1.5 pr-3 text-right font-medium">Lương/giờ</th>
                                    <th className="py-1.5 text-right font-medium">Thành tiền</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {e.details.map((d, i) => (
                                    <tr
                                      key={`${d.shiftCode}-${i}`}
                                      className="border-t border-slate-100 text-slate-600"
                                    >
                                      <td className="py-1.5 pr-3">{d.date}</td>
                                      <td className="py-1.5 pr-3">{d.shiftName}</td>
                                      <td className="py-1.5 pr-3">
                                        {toHHmm(d.checkInAt)} - {toHHmm(d.checkOutAt)}
                                      </td>
                                      <td className="py-1.5 pr-3 text-right">
                                        {formatDuration(d.minutes)}
                                      </td>
                                      <td className="py-1.5 pr-3 text-right">
                                        {Number(d.hourlyRate) === 0
                                          ? "—"
                                          : formatCurrency(d.hourlyRate)}
                                      </td>
                                      <td className="py-1.5 text-right font-medium">
                                        {formatCurrency(d.pay)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 text-sm font-semibold text-slate-800">
                    <td></td>
                    <td className="px-4 py-3">Tổng cộng</td>
                    <td className="px-4 py-3 text-right">
                      {employees.reduce((s, e) => s + e.shiftCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-right">{data.totalHours} giờ</td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {formatCurrency(data.totalPay)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
