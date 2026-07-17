const normalizeApiBaseUrl = (url) => String(url || "").replace(/\/+$/, "");

export const DEV = normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL || "https://307h8lvv-5000.inc1.devtunnels.ms/premind/api",
);
