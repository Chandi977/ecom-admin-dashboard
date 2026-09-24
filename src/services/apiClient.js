import axios from "axios";
import { toast } from "react-toastify";
import { clearAuthSession, handleAuthFailure, isTokenExpired } from "../utils/authSession";

const AUTH_FAILURE_MESSAGE = "Session expired. Please log in again.";

const isLoginRequest = (config) => {
    const url = String(config?.url || "");
    return url.includes("/signin") || config?.authBypass === true;
};

const apiClient = axios.create();

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        // A token that already expired locally must never reach the backend:
        // clear it, bounce to the login screen and do not send the request.
        if (token && !isLoginRequest(config) && isTokenExpired(token)) {
            toast.warn(AUTH_FAILURE_MESSAGE);
            clearAuthSession();
            handleAuthFailure();
            return Promise.reject({ __authFailure: true, expiredLocally: true });
        }

        // Attach the bearer token automatically so every admin call is
        // authenticated (nothing leaks out unauthenticated or leaks 401s due
        // to a missing header).
        if (token && !config.headers?.Authorization) {
            config.headers = {
                ...(config.headers || {}),
                Authorization: `Bearer ${token}`,
            };
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.__authFailure) return Promise.reject(error);

        const status = error?.response?.status;
        const skipAuthRedirect = error?.config?.skipAuthRedirect === true;

        // Expired / revoked / invalid token — the backend returned no data.
        // Drop the response, clear the session and redirect to the login screen
        // so nothing from the admin panel is rendered for a dead session.
        if ((status === 401 || status === 403) && !isLoginRequest(error?.config) && !skipAuthRedirect) {
            toast.warn(error?.response?.data?.messages || error?.response?.data?.message || AUTH_FAILURE_MESSAGE);
            clearAuthSession();
            handleAuthFailure();
        }

        return Promise.reject(error);
    }
);

export default apiClient;