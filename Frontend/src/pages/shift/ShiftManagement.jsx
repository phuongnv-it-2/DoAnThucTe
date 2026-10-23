import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { shiftApi } from "../../services/shiftApi";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import CurrentShiftCard from "../../components/shift/CurrentShiftCard";
import OpenShiftModal from "../../components/shift/OpenShiftModal";
import CloseShiftModal from "../../components/shift/CloseShiftModal";
import ShiftHistoryTable from "../../components/shift/ShiftHistoryTable";
import ShiftDetailModal from "../../components/shift/ShiftDetailModal";
import PayrollReport from "../../components/shift/PayrollReport";

export default function ShiftManagement() {
  const toast = useToast();
  const { role } = useAuth();
  // Báo cáo lương chỉ dành cho chủ quán / quản lý
  const canViewPayroll = role === "ADMIN" || role === "MANAGER";

  const [tab, setTab] = useState("shifts"); // "shifts" | "payroll"
  const [currentShift, setCurrentShift] = useState(null);
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [detailShift, setDetailShift] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.all([
        shiftApi.getCurrent(),
        shiftApi.getAll(),
      ]);
      setCurrentShift(currentRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải dữ liệu ca làm việc"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tải danh sách nhân viên rồi mới mở form mở ca
  async function handleOpenClick() {
    try {
      const res = await shiftApi.getEmployees();
      const list = res.data.data;
      if (!list || list.length === 0) {
        toast.error(
          "Chưa có nhân viên nào đang làm việc. Hãy tạo hồ sơ nhân viên trước."
        );
        return;
      }
      setEmployees(list);
      setOpenModalVisible(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải danh sách nhân viên"
      );
    }
  }

  async function handleOpenShift(payload) {
    setSubmitting(true);
    try {
      await shiftApi.open(payload);
      toast.success("Mở ca thành công");
      setOpenModalVisible(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Mở ca thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseShift(payload) {
    setSubmitting(true);
    try {
      await shiftApi.close(currentShift.id, payload);
      toast.success("Đóng ca thành công");
      setCloseModalVisible(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đóng ca thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewDetail(shift) {
    try {
      const res = await shiftApi.getById(shift.id);
      setDetailShift(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải chi tiết ca");
    }
  }

  const tabs = [
    { key: "shifts", label: "Ca làm việc" },
    ...(canViewPayroll ? [{ key: "payroll", label: "Bảng lương tháng" }] : []),
  ];

  return (
    <div>
      <PageHeader
        title="Ca làm việc"
        subtitle="Mở ca, chọn nhân viên, ghi giờ công và tính lương tháng"
      />

      {tabs.length > 1 && (
        <div className="mb-5 flex gap-1 border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-emerald-500 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === "payroll" && canViewPayroll ? (
        <PayrollReport />
      ) : loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <CurrentShiftCard
              shift={currentShift}
              canManage
              onOpen={handleOpenClick}
              onClose={() => setCloseModalVisible(true)}
            />
          </div>

          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Lịch sử ca làm việc
          </h3>
          <ShiftHistoryTable shifts={history} onView={handleViewDetail} />
        </>
      )}

      <OpenShiftModal
        open={openModalVisible}
        onClose={() => setOpenModalVisible(false)}
        onSubmit={handleOpenShift}
        submitting={submitting}
        employees={employees}
      />

      <CloseShiftModal
        open={closeModalVisible}
        onClose={() => setCloseModalVisible(false)}
        onSubmit={handleCloseShift}
        submitting={submitting}
        shift={currentShift}
      />

      <ShiftDetailModal
        open={!!detailShift}
        onClose={() => setDetailShift(null)}
        shift={detailShift}
      />
    </div>
  );
}
