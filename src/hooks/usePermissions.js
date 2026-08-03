import { useCallback, useMemo } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { DEV } from "../services/constants";
import { getStoredAuthSession } from "../utils/authSession";
import { ALL_PERMISSIONS, ROLE_LABELS, isFullAccessRole, permissionsForRole } from "../rbac/permissions";

export const permissionKeys = {
    me: (role) => ["permissions", "me", role],
};

/**
 * Snapshot built from the local mirror (src/rbac/permissions.js). Used to seed
 * the very first render so gated controls never flash blank, and as the
 * fallback whenever `GET /permissions/me` is unavailable.
 */
const localSnapshot = (role) => ({
    role: role || "",
    label: ROLE_LABELS[role] || role || "",
    fullAccess: isFullAccessRole(role),
    permissions: permissionsForRole(role),
});

/**
 * Deliberately calls axios directly instead of services/GetTemplate's
 * handleGetRequest: that helper toasts on failure and force-logs-out on 401/403,
 * and this probe must fail silently while the endpoint is being rolled out.
 */
const fetchMyPermissions = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${DEV}/permissions/me`, {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    });
    return response?.data?.data;
};

/**
 * Current user's role + effective permissions.
 * Server-authoritative when `GET /permissions/me` answers, local mirror otherwise.
 */
export const usePermissions = () => {
    const { token, role: sessionRole } = getStoredAuthSession();
    const role = sessionRole || "";

    const seed = useMemo(() => localSnapshot(role), [role]);

    const { data, isLoading } = useQuery(permissionKeys.me(role), fetchMyPermissions, {
        enabled: !!token && !!role,
        retry: false,
        staleTime: 5 * 60 * 1000,
        // Endpoint may not be deployed yet — swallow the error and keep the mirror.
        onError: () => {},
    });

    const server = data && Array.isArray(data.permissions) ? data : null;

    const effectiveRole = server?.role || seed.role;
    const fullAccess = server ? !!server.fullAccess : seed.fullAccess;
    const permissions = useMemo(() => {
        if (!server) return seed.permissions;
        // A full-access role should satisfy a raw list lookup even if the server
        // ever answers with a short list.
        return server.permissions.length ? server.permissions : fullAccess ? ALL_PERMISSIONS : [];
    }, [server, seed.permissions, fullAccess]);

    const can = useCallback((permission) => {
        if (!effectiveRole) return false;
        if (fullAccess) return true;
        return permissions.includes(permission);
    }, [effectiveRole, fullAccess, permissions]);

    const canAny = useCallback((required = []) => {
        if (!Array.isArray(required) || required.length === 0) return true;
        return required.some((permission) => can(permission));
    }, [can]);

    const canAll = useCallback((required = []) => {
        if (!Array.isArray(required) || required.length === 0) return true;
        return required.every((permission) => can(permission));
    }, [can]);

    // SEO-only roles hold the field-scoped seo:write grant but not product:update.
    const isSeoOnly = can("seo:write") && !can("product:update");

    return {
        role: effectiveRole,
        label: server?.label || ROLE_LABELS[effectiveRole] || effectiveRole || "",
        permissions,
        fullAccess,
        can,
        canAny,
        canAll,
        isSeoOnly,
        loading: isLoading,
    };
};

export default usePermissions;
