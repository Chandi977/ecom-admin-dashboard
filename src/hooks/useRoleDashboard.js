import axios from "axios";
import { useQuery } from "react-query";
import { DEV } from "../services/constants";
import { handleAuthFailure } from "../utils/authSession";

/**
 * Data hooks for the role-scoped dashboards (RBAC spec §5.2 `GET /seo/dashboard`
 * and §5.3 `GET /ops/dashboard`).
 *
 * react-query is used because that is how the app already wraps server reads
 * (see hooks/useProductQuery.js) and the provider is mounted in index.jsx.
 *
 * The request itself goes through axios directly (same shape as
 * services/productService.js) instead of services/GetTemplate.handleGetRequest,
 * because handleGetRequest toasts on every failure and routes 403 into
 * handleAuthFailure() -> forced logout. Both are wrong for an optional stats
 * widget: these two endpoints may not be deployed yet, and a role that lacks
 * the stats permission must still be able to use the rest of the page.
 * A real 401 (expired token) is still handed to the app-wide handler.
 */

export const roleDashboardKeys = {
    all: ["role-dashboard"],
    seo: ["role-dashboard", "seo"],
    ops: ["role-dashboard", "ops"],
};

const SEO_DASHBOARD_URL = "/seo/dashboard";
const OPS_DASHBOARD_URL = "/ops/dashboard";

// Calm, non-alarming copy — the dashboard stays usable without these numbers.
const REASON_MESSAGES = {
    missing: "Dashboard statistics are not available on this server yet. Everything else on this page still works.",
    forbidden: "Your role does not have access to these statistics.",
    offline: "Could not reach the server to load these statistics.",
    failed: "These statistics could not be loaded right now.",
};

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Never let undefined / null / NaN / negatives reach a KPI card. */
export const safeCount = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
};

/** Clamp to 0..100 so the hero metric and its progress bar can never disagree. */
export const safePercent = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(100, Math.max(0, Math.round(parsed)));
};

const safeList = (value) => (Array.isArray(value) ? value : []);

const failureReason = (status) => {
    if (status === 404) return "missing";
    if (status === 403) return "forbidden";
    if (!status) return "offline";
    return "failed";
};

const dashboardError = (reason, status) =>
    Object.assign(new Error(REASON_MESSAGES[reason] || REASON_MESSAGES.failed), { reason, status: status || 0 });

const requestDashboard = async (url) => {
    let payload;

    try {
        const response = await axios.get(DEV + url, { headers: authHeaders() });
        payload = response?.data;
    } catch (error) {
        const status = error?.response?.status || 0;
        // Genuinely expired session -> same app-wide treatment as GetTemplate.
        if (status === 401) handleAuthFailure();
        throw dashboardError(failureReason(status), status);
    }

    // commonResponse envelope: { message, success, data } — note `success`, not
    // `status`; IApiResponse (backend types/index.ts) has no `status` key.
    if (payload?.success === false || !payload?.data || typeof payload.data !== "object") {
        throw dashboardError("failed", 200);
    }

    return payload.data;
};

/** Shape §5.2 into a fully-populated object so components never guard fields. */
export const normalizeSeoDashboard = (data) => ({
    totals: {
        products: safeCount(data?.totals?.products),
        categories: safeCount(data?.totals?.categories),
        subCategories: safeCount(data?.totals?.subCategories),
    },
    products: {
        missingMetaTitle: safeCount(data?.products?.missingMetaTitle),
        missingMetaDescription: safeCount(data?.products?.missingMetaDescription),
        missingSlug: safeCount(data?.products?.missingSlug),
        missingBoth: safeCount(data?.products?.missingBoth),
        withKeywords: safeCount(data?.products?.withKeywords),
        coveragePercent: safePercent(data?.products?.coveragePercent),
    },
    categories: {
        missingMetaTitle: safeCount(data?.categories?.missingMetaTitle),
        missingMetaDescription: safeCount(data?.categories?.missingMetaDescription),
    },
    subCategories: {
        missingSeoContent: safeCount(data?.subCategories?.missingSeoContent),
        missingFaqs: safeCount(data?.subCategories?.missingFaqs),
    },
    recentlyUpdated: safeList(data?.recentlyUpdated).map((row, index) => ({
        key: row?._id || `recent-${index}`,
        // `_id` may be absent on a malformed row — an empty id disables the deep link.
        _id: row?._id || "",
        name: row?.name || "Untitled product",
        slug: row?.slug || "",
        updatedAt: row?.updatedAt || null,
    })),
    worstOffenders: safeList(data?.worstOffenders).map((row, index) => ({
        key: row?._id || `offender-${index}`,
        _id: row?._id || "",
        name: row?.name || "Untitled product",
        slug: row?.slug || "",
        missing: safeList(row?.missing)
            .filter((field) => !!field)
            .map((field) => String(field)),
    })),
});

/** Shape §5.3 into a fully-populated object so components never guard fields. */
export const normalizeOpsDashboard = (data) => ({
    orders: {
        total: safeCount(data?.orders?.total),
        pending: safeCount(data?.orders?.pending),
        today: safeCount(data?.orders?.today),
    },
    leads: {
        total: safeCount(data?.leads?.total),
        new: safeCount(data?.leads?.new),
        today: safeCount(data?.leads?.today),
    },
    reviews: {
        pending: safeCount(data?.reviews?.pending),
    },
    catalog: {
        products: safeCount(data?.catalog?.products),
        categories: safeCount(data?.catalog?.categories),
        subCategories: safeCount(data?.catalog?.subCategories),
        outOfStock: safeCount(data?.catalog?.outOfStock),
    },
    enquiries: {
        total: safeCount(data?.enquiries?.total),
        open: safeCount(data?.enquiries?.open),
    },
});

const useDashboardQuery = (queryKey, url, normalize) => {
    const query = useQuery(queryKey, () => requestDashboard(url), {
        select: normalize,
        // Fail fast: a route that does not exist will not start existing on retry.
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    const reason = query.isError ? query.error?.reason || "failed" : null;

    return {
        // Contract: on 404 / any error the caller gets `null` data and an error flag.
        data: query.isError ? null : query.data || null,
        loading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.isError ? query.error : null,
        errorMessage: reason ? REASON_MESSAGES[reason] || REASON_MESSAGES.failed : "",
        // True when retrying is pointless (endpoint absent or not permitted).
        isUnavailable: reason === "missing" || reason === "forbidden",
        reason,
        refetch: query.refetch,
    };
};

/** SEO coverage stats for the `seo` role dashboard (spec §5.2). */
export const useSeoDashboard = () => useDashboardQuery(roleDashboardKeys.seo, SEO_DASHBOARD_URL, normalizeSeoDashboard);

/** Operations stats for the `general` role dashboard (spec §5.3). */
export const useOpsDashboard = () => useDashboardQuery(roleDashboardKeys.ops, OPS_DASHBOARD_URL, normalizeOpsDashboard);
