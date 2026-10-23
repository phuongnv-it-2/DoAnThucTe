import { useEffect, useMemo, useState } from "react";
import { Loader2, Users } from "lucide-react";
import Modal from "../ui/Modal";
import {
  SHIFT_TYPES,
  MAX_STAFF_PER_SHIFT,
  suggestShiftType,
} from "../../constants/shiftTypes";
import {
  todayISO,
  minutesBetweenHHmm,
  formatDuration,
} from "../../utils/time";

const inputCls =
  "rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function OpenShiftModal({
  open,
  onClose,
  onSubmit,
  submitting,
  employees = [],
}) {
  const [type, setType] = useState("MORNING");
  const [date, setDate] = useState(todayISO());
  // employeeId (string) -> { startTime, endTime }
  const [selected, setSelected] = useState({});

  const preset = SHIFT_TYPES.find((t) => t.key === type) || SHIFT_TYPES[0];

  useEffect(() => {
    if (open) {
      setType(suggestShiftType());
      setDate(todayISO());
      setSelected({});
    }
  }, [open]);

  const selectedCount = Object.keys(selected).length;

  function chooseType(key) {
    const p = SHIFT_TYPES.find((t) => t.key === key);
    setType(key);
    // Đổi ca: đặt lại giờ vào/ra mặc định cho những người đã chọn
    setSelected((prev) =>
      Object.fromEntries(
        Object.keys(prev).map((id) => [id, { startTime: p.start, endTime: p.end }])
      )
    );
  }

  function toggleEmployee(emp) {
    const key = String(emp.id);
    setSelected((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      if (Object.keys(prev).length >= MAX_STAFF_PER_SHIFT) return prev;
      return { ...prev, [key]: { startTime: preset.start, endTime: preset.end } };
    });
  }

  function setTime(id, field, value) {
    setSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  const invalidIds = useMemo(() => {
    const bad = new Set();
    for (const [id, t] of Object.entries(selected)) {
      const minutes = minutesBetweenHHmm(t.startTime, t.endTime);
      if (minutes == null || minutes <= 0) bad.add(id);
    }
    return bad;
  }, [selected]);

  const canSubmit =
    !submitting && selectedCount >= 1 && invalidIds.size === 0 && !!date;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      type,
      date,
      employees: employees
        .filter((e) => selected[String(e.id)])
        .map((e) => ({
          employeeId: e.id,
          startTime: selected[String(e.id)].startTime,
          endTime: selected[String(e.id)].endTime,
        })),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mở ca làm việc"
      size="xl"
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
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Mở ca
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Chọn ca
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHIFT_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => chooseType(t.key)}
                className={`rounded-lg border py-2.5 text-center text-sm font-medium transition-colors ${
                  type === t.key
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <p>{t.label}</p>
                <p className="text-xs font-normal opacity-70">
                  {t.start} - {t.end}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Ngày làm việc
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputCls} w-full py-2.5`}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Users size={15} /> Nhân viên làm ca này
            </label>
            <span
              className={`text-xs font-medium ${
                selectedCount === 0 ? "text-orange-600" : "text-slate-500"
              }`}
            >
              Đã chọn {selectedCount}/{MAX_STAFF_PER_SHIFT}
            </span>
          </div>

          {employees.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
              Chưa có nhân viên nào đang làm việc để chọn
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {employees.map((emp) => {
                const key = String(emp.id);
                const t = selected[key];
                const isOn = !!t;
                const disabled = !isOn && selectedCount >= MAX_STAFF_PER_SHIFT;
                const minutes = isOn
                  ? minutesBetweenHHmm(t.startTime, t.endTime)
                  : null;
                const bad = invalidIds.has(key);

                return (
                  <div
                    key={emp.id}
                    className={`rounded-lg border px-3 py-2.5 transition-colors ${
                      isOn
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-200"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    <label
                      className={`flex items-center gap-3 ${
                        disabled ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isOn}
                        disabled={disabled}
                        onChange={() => toggleEmployee(emp)}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <span className="flex-1 text-sm font-medium text-slate-800">
                        {emp.fullName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {emp.employeeCode}
                      </span>
                    </label>

                    {isOn && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-7">
                        <span className="text-xs text-slate-500">Vào</span>
                        <input
                          type="time"
                          value={t.startTime}
                          onChange={(e) =>
                            setTime(key, "startTime", e.target.value)
                          }
                          className={`${inputCls} ${bad ? "border-red-400" : ""}`}
                        />
                        <span className="text-xs text-slate-500">Ra</span>
                        <input
                          type="time"
                          value={t.endTime}
                          onChange={(e) =>
                            setTime(key, "endTime", e.target.value)
                          }
                          className={`${inputCls} ${bad ? "border-red-400" : ""}`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            bad ? "text-red-500" : "text-emerald-700"
                          }`}
                        >
                          {bad ? "Giờ ra phải sau giờ vào" : formatDuration(minutes)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Chọn từ 1 đến {MAX_STAFF_PER_SHIFT} người. Ai vào trễ hoặc về sớm thì
            sửa giờ ngay ở đây; giờ ra có thể chỉnh lại khi đóng ca.
          </p>
        </div>
      </div>
    </Modal>
  );
}
