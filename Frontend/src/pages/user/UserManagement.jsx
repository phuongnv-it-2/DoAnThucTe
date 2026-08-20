import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  Pencil,
  IdCard,
  Lock,
  Unlock,
  UserCog,
} from "lucide-react";
import { userApi } from "../../services/userApi";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import UserEditModal from "../../components/user/UserEditModal";
import EmployeeProfileModal from "../../components/user/EmployeeProfileModal";
import { ROLE_LABELS } from "../../constants/roles";

export default function UserManagement() {
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [employeeUser, setEmployeeUser] = useState(null);

  async function loadData(filters = {}) {
    setLoading(true);
    try {
      const res = await userApi.getAll(filters);
      setUsers(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải danh sách tài khoản"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyStatusFilter(status) {
    setStatusFilter(status);
    loadData(status ? { status } : {});
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  async function handleSaveUser(payload) {
    setSubmitting(true);
    try {
      await userApi.update(editingUser.id, payload);
      toast.success("Cập nhật tài khoản thành công");
      setEditingUser(null);
      await loadData(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEmployee(payload) {
    setSubmitting(true);
    try {
      await userApi.updateEmployee(employeeUser.id, payload);
      toast.success("Cập nhật hồ sơ nhân viên thành công");
      setEmployeeUser(null);
      await loadData(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleLock(user) {
    const nextStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await userApi.setStatus(user.id, nextStatus);
      toast.success(
        nextStatus === "LOCKED" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản"
      );
      await loadData(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
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
        title="Tài khoản"
        subtitle="Quản lý tài khoản và hồ sơ nhân viên"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đăng nhập, họ tên, email..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => applyStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:w-48"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <UserCog size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">
            Không tìm thấy tài khoản phù hợp
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Tài khoản</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Đăng nhập gần nhất</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{u.fullName}</p>
                      <p className="text-xs text-slate-400">@{u.username}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ROLE_LABELS[u.role?.name || u.role] ||
                        u.role?.name ||
                        u.role}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleString("vi-VN")
                        : "Chưa đăng nhập"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        status={u.status === "ACTIVE" ? "ACTIVE" : "CANCELLED"}
                        label={u.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="text-slate-400 hover:text-emerald-600"
                          title="Chỉnh sửa tài khoản"
                        >
                          <Pencil size={16} />
                        </button>
                        {u.employee && (
                          <button
                            onClick={() => setEmployeeUser(u)}
                            className="text-slate-400 hover:text-blue-600"
                            title="Hồ sơ nhân viên"
                          >
                            <IdCard size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleLock(u)}
                          disabled={isSelf && u.status === "ACTIVE"}
                          title={
                            isSelf && u.status === "ACTIVE"
                              ? "Không thể tự khóa tài khoản của chính mình"
                              : u.status === "ACTIVE"
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                          className={
                            u.status === "ACTIVE"
                              ? "text-slate-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                              : "text-slate-400 hover:text-emerald-600"
                          }
                        >
                          {u.status === "ACTIVE" ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <UserEditModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleSaveUser}
        submitting={submitting}
        user={editingUser}
      />

      <EmployeeProfileModal
        open={!!employeeUser}
        onClose={() => setEmployeeUser(null)}
        onSubmit={handleSaveEmployee}
        submitting={submitting}
        user={employeeUser}
      />
    </div>
  );
}
