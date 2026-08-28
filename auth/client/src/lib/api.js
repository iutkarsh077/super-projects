import axios from "axios"
const api = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Ask backend for a new access token
                await api.post("/refresh");

                // Retry original request
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh token also invalid/expired
                console.log("Session expired");

                // Optional
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;