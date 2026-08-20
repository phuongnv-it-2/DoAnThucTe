import apiClient from "./apiClient";

export const activityLogApi = {
    getAll: (params) => apiClient.get("/activity-logs", { params }),
};