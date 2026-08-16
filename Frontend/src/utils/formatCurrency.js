export function formatCurrency(value) {
    const n = Number(value) || 0;
    return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}