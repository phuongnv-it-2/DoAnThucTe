const pad = (n) => String(n).padStart(2, "0");

function localKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dayStartISO(offset = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

export function dayEndISO(offset = 0) {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

export function dateKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : localKey(d);
}

export function lastNDayKeys(n) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(localKey(d));
  }
  return keys;
}

export function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(
    d.getMonth() + 1
  )}`;
}