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

export default function ShiftManagement() {
  const toast = useToast();
  const { role } = useAuth();
  const canManage = role === "ADMIN" || role === "MANAGER";

  const [currentShift, setCurrentShift] = useState(null);
  const [history, setHistory] = useState([]);
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ca làm việc"
        subtitle="Quản lý mở ca, đóng ca và theo dõi lịch sử"
      />

      <div className="mb-6">
        <CurrentShiftCard
          shift={currentShift}
          canManage={canManage}
          onOpen={() => setOpenModalVisible(true)}
          onClose={() => setCloseModalVisible(true)}
        />
      </div>

      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        Lịch sử ca làm việc
      </h3>
      <ShiftHistoryTable shifts={history} onView={handleViewDetail} />

      <OpenShiftModal
        open={openModalVisible}
        onClose={() => setOpenModalVisible(false)}
        onSubmit={handleOpenShift}
        submitting={submitting}
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
