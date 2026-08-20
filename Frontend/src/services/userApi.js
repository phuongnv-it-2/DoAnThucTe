import apiClient from "./apiClient";

export const userApi = {
    getAll: (params) => apiClient.get("/users", { params }),
    getById: (id) => apiClient.get(`/users/${id}`),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    setStatus: (id, status) => apiClient.put(`/users/${id}/status`, { status }),
    updateEmployee: (id, data) => apiClient.put(`/users/${id}/employee`, data),
};