export const ACTION_LABELS = {
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa/Vô hiệu hóa",
    LOGIN: "Đăng nhập",
    LOGOUT: "Đăng xuất",
    OTHER: "Khác",
};

export const ACTION_COLORS = {
    CREATE: "text-emerald-600 bg-emerald-50",
    UPDATE: "text-blue-600 bg-blue-50",
    DELETE: "text-red-600 bg-red-50",
    LOGIN: "text-purple-600 bg-purple-50",
    LOGOUT: "text-slate-600 bg-slate-100",
    OTHER: "text-orange-600 bg-orange-50",
};

export const ENTITY_OPTIONS = [
    "User",
    "Employee",
    "Category",
    "Product",
    "InventoryTransaction",
    "Shift",
    "Invoice",
    "PrintOrder",
];