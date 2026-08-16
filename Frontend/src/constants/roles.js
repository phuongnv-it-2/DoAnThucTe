export const ROLES = {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    STAFF: "STAFF",
};

export const ROLE_LABELS = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    STAFF: "Nhân viên",
};

// Where each role lands after login / when hitting "/"
export const ROLE_HOME = {
    ADMIN: "/admin/dashboard",
    MANAGER: "/manager/dashboard",
    STAFF: "/staff/pos",
};