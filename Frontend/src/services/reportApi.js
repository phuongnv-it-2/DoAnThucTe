import apiClient from "./apiClient";

export const reportApi = {
    getRevenueSummary: (params) => apiClient.get("/reports/revenue", { params }),
    getTopProducts: (params) => apiClient.get("/reports/top-products", { params }),
    getLowStock: () => apiClient.get("/reports/low-stock"),
};