import apiClient from "./apiClient";

export const printOrderApi = {
    getAll: (params) => apiClient.get("/print-orders", { params }),
    getById: (id) => apiClient.get(`/print-orders/${id}`),
    create: (data) => apiClient.post("/print-orders", data),
    updateStatus: (id, status) => apiClient.put(`/print-orders/${id}/status`, { status }),
};