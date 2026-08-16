import apiClient from "./apiClient";

export const authApi = {
    login: (username, password) =>
        apiClient.post("/auth/login", { username, password }),

    me: () => apiClient.get("/auth/me"),

    changePassword: (currentPassword, newPassword) =>
        apiClient.put("/auth/change-password", { currentPassword, newPassword }),

    forgotPassword: (email) =>
        apiClient.post("/auth/forgot-password", { email }),

    resetPassword: (token, newPassword) =>
        apiClient.post("/auth/reset-password", { token, newPassword }),
};