export function pad(n) {
  return String(n).padStart(2, "0");
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentMonthISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// ISO datetime -> "HH:mm" theo giờ máy
export function toHHmm(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function hhmmToMinutes(s) {
  if (!/^\d{2}:\d{2}$/.test(s || "")) return null;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

// số phút từ a đến b (HH:mm); null nếu nhập thiếu/sai
export function minutesBetweenHHmm(a, b) {
  const x = hhmmToMinutes(a);
  const y = hhmmToMinutes(b);
  if (x == null || y == null) return null;
  return y - x;
}

export function formatDuration(totalMinutes) {
  if (totalMinutes == null || totalMinutes < 0) return "—";
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}
