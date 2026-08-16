import apiClient from "./apiClient";

export const shiftApi = {
    getAll: (params) => apiClient.get("/shifts", { params }),
    getCurrent: () => apiClient.get("/shifts/current"),
    getById: (id) => apiClient.get(`/shifts/${id}`),
    open: (data) => apiClient.post("/shifts/open", data),
    close: (id, data) => apiClient.post(`/shifts/${id}/close`, data),
};