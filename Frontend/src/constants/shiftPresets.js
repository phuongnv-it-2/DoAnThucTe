export const SHIFT_PRESETS = [
    { name: "Ca 1", startTime: "06:30", endTime: "12:00" },
    { name: "Ca 2", startTime: "12:00", endTime: "17:00" },
    { name: "Ca 3", startTime: "17:00", endTime: "23:30" },
];

export function todayISO() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}