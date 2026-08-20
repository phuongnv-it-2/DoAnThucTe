import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";

export default function EmployeeProfileModal({
  open,
  onClose,
  onSubmit,
  submitting,
  user,
}) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (open && user?.employee) {
      setPhone(user.employee.phone || "");
      setAddress(user.employee.address || "");
      setGender(user.employee.gender || "");
      setDateOfBirth(user.employee.dateOfBirth || "");
      setHireDate(user.employee.hireDate || "");
      setStatus(user.employee.status || "ACTIVE");
    }
  }, [open, user]);

  if (!user?.employee) return null;

  function handleSubmit() {
    onSubmit({
      phone: phone.trim() || null,
      address: address.trim() || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      hireDate: hireDate || null,
      status,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Hồ sơ nhân viên — ${user.fullName}`}
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
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Lưu thay đổi
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Mã nhân viên:{" "}
          <span className="font-medium text-slate-600">
            {user.employee.employeeCode}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Giới tính
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Không xác định</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Địa chỉ
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Ngày sinh
            </label>
            <input
              type="date"
              value={dateOfBirth || ""}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Ngày vào làm
            </label>
            <input
              type="date"
              value={hireDate || ""}
              onChange={(e) => setHireDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Trạng thái làm việc
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["ACTIVE", "INACTIVE"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  status === s
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {s === "ACTIVE" ? "Đang làm việc" : "Ngừng làm việc"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
