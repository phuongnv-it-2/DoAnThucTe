import apiClient from "./apiClient";

export const shiftApi = {
    getAll: (params) => apiClient.get("/shifts", { params }),
    getCurrent: () => apiClient.get("/shifts/current"),
    getById: (id) => apiClient.get(`/shifts/${id}`),
    open: (data) => apiClient.post("/shifts/open", data),
    close: (id, data) => apiClient.post(`/shifts/${id}/close`, data),

    // Nhân viên đang làm việc để chọn vào ca
    getEmployees: () => apiClient.get("/shifts/employees"),

    // Báo cáo lương tháng (ADMIN/MANAGER)
    getPayroll: (month) => apiClient.get("/shifts/payroll", { params: { month } }),
    exportPayroll: (month) =>
        apiClient.get("/shifts/payroll/export", { params: { month }, responseType: "blob" }),
};
