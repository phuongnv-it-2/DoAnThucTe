export const SHIFT_TYPES = [
  { key: "MORNING", label: "Ca sáng", start: "06:30", end: "12:00" },
  { key: "AFTERNOON", label: "Ca chiều", start: "12:00", end: "17:00" },
  { key: "EVENING", label: "Ca tối", start: "17:00", end: "23:30" },
];

export const MAX_STAFF_PER_SHIFT = 5;

// Gợi ý ca theo giờ hiện tại
export function suggestShiftType(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < 12 * 60) return "MORNING";
  if (minutes < 17 * 60) return "AFTERNOON";
  return "EVENING";
}
