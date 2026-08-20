import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://enlisted-coke-guide.ngrok-free.dev/api";

const apiClient = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every outgoing request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("shmart_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout + redirect to /login when token is invalid/expired
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("shmart_token");
            localStorage.removeItem("shmart_user");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;