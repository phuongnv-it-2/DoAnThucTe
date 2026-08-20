import apiClient from "./apiClient";

export const inventoryApi = {
    getAll: (params) => apiClient.get("/inventory-transactions", { params }),
    getById: (id) => apiClient.get(`/inventory-transactions/${id}`),
    create: (data) => apiClient.post("/inventory-transactions", data),
};