export const SERVICE_TYPE_LABELS = {
    PHOTOCOPY: "Photocopy",
    PRINT_BLACK_WHITE: "In đen trắng",
    PRINT_COLOR: "In màu",
    SCAN: "Scan",
    BINDING: "Đóng gáy",
    LAMINATING: "Ép plastic",
};

export const COLOR_MODE_LABELS = {
    BLACK_WHITE: "Đen trắng",
    COLOR: "Màu",
};

export const PAPER_SIZES = ["A3", "A4", "A5", "Khác"];

export const VALID_TRANSITIONS = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["COMPLETED", "CANCELLED"],
    COMPLETED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
};

export const STATUS_ACTION_LABELS = {
    PROCESSING: "Bắt đầu xử lý",
    COMPLETED: "Hoàn thành",
    DELIVERED: "Đã giao khách",
    CANCELLED: "Hủy đơn",
};