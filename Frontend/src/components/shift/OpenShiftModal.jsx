import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import { SHIFT_PRESETS, todayISO } from "../../constants/shiftPresets";

export default function OpenShiftModal({
  open,
  onClose,
  onSubmit,
  submitting,
}) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState(SHIFT_PRESETS[0].startTime);
  const [endTime, setEndTime] = useState(SHIFT_PRESETS[0].endTime);

  function choosePreset(i) {
    setPresetIndex(i);
    setStartTime(SHIFT_PRESETS[i].startTime);
    setEndTime(SHIFT_PRESETS[i].endTime);
  }

  function handleSubmit() {
    onSubmit({
      name: SHIFT_PRESETS[presetIndex].name,
      date,
      startTime,
      endTime,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mở ca làm việc"
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
            Mở ca
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Chọn ca
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHIFT_PRESETS.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => choosePreset(i)}
                className={`rounded-lg border py-2.5 text-center text-sm font-medium transition-colors ${
                  presetIndex === i
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <p>{p.name}</p>
                <p className="text-xs font-normal opacity-70">
                  {p.startTime}-{p.endTime}
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
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Giờ bắt đầu
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Giờ kết thúc
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
