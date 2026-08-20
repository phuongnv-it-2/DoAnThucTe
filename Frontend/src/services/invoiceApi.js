import apiClient from "./apiClient";

export const invoiceApi = {
    getAll: (params) => apiClient.get("/invoices", { params }),
    getById: (id) => apiClient.get(`/invoices/${id}`),
    create: (data) => apiClient.post("/invoices", data),
    cancel: (id, reason) => apiClient.post(`/invoices/${id}/cancel`, { reason }),

};