import apiClient from "./apiClient";

export const categoryApi = {
    getAll: (params) => apiClient.get("/categories", { params }),
    getById: (id) => apiClient.get(`/categories/${id}`),
    create: (data) => apiClient.post("/categories", data),
    update: (id, data) => apiClient.put(`/categories/${id}`, data),
    remove: (id) => apiClient.delete(`/categories/${id}`),
};