import apiClient from "./apiClient";

export const reportApi = {
    getRevenueSummary: (params) => apiClient.get("/reports/revenue", { params }),
    getTopProducts: (params) => apiClient.get("/reports/top-products", { params }),
    getLowStock: () => apiClient.get("/reports/low-stock"),
    exportTransactions: (params) =>
        apiClient.get("/reports/export-transactions", { params, responseType: "blob" }),
};