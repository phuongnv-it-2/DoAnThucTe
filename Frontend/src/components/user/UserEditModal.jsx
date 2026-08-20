import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";

export default function UserEditModal({
  open,
  onClose,
  onSubmit,
  submitting,
  user,
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (open && user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [open, user]);

  if (!user) return null;

  function handleSubmit() {
    if (!fullName.trim()) return;
    onSubmit({ fullName: fullName.trim(), email: email.trim() || null });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Chỉnh sửa tài khoản — ${user.username}`}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !fullName.trim()}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Lưu thay đổi
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={user.username}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Không bắt buộc"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Vai trò
          </label>
          <input
            type="text"
            value={user.role?.name || user.role || ""}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-400"
          />
          <p className="mt-1 text-xs text-slate-400">
            Đổi vai trò chưa được hỗ trợ trên giao diện — liên hệ kỹ thuật nếu
            cần.
          </p>
        </div>
      </div>
    </Modal>
  );
}
