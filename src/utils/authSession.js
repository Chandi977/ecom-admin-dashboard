const AUTH_STORAGE_KEYS = ["user", "token", "refreshToken", "role", "id"];

const decodeBase64Url = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return atob(padded);
};

export const decodeJwtPayload = (token) => {
    if (!token || typeof token !== "string") return null;

    const [, payload] = token.split(".");
    if (!payload) return null;

    try {
        return JSON.parse(decodeBase64Url(payload));
    } catch {
        return null;
    }
};

export const isTokenExpired = (token) => {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") return true;

    return payload.exp * 1000 <= Date.now();
};

export const clearAuthSession = () => {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const getStoredAuthSession = () => {
    const token = localStorage.getItem("token");
    const payload = decodeJwtPayload(token);
    const role = payload?.role || localStorage.getItem("role") || "";

    return {
        token,
        payload,
        role,
        user: localStorage.getItem("user"),
        id: localStorage.getItem("id"),
    };
};

export const hasValidAuthSession = (allowedRoles = []) => {
    const { token, role } = getStoredAuthSession();
    if (!token || isTokenExpired(token)) return false;
    if (!role) return false;

    return allowedRoles.length === 0 || allowedRoles.includes(role);
};

export const isAuthFailureStatus = (status) => status === 401 || status === 403;

export const handleAuthFailure = () => {
    clearAuthSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
        window.location.replace("/auth");
    }
};
