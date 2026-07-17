import { getStoredAuthSession } from "../utils/authSession";

/**
 * Client-side mirror of the backend RBAC config (ecom-backend-optimized/src/config/rbac.ts).
 * Used to hide write/delete controls the current role is not allowed to use.
 * The backend remains the source of truth — this only improves the UX.
 */

// Roles with unrestricted access (keep in sync with backend FULL_ACCESS_ROLES).
// Supported roles: admin (full), catalog-manager (restricted), user (customer).
export const FULL_ACCESS_ROLES = ["admin"];

// Restricted roles -> the exact write permissions they hold.
export const ROLE_PERMISSIONS = {
    "catalog-manager": [
        // Full CRUD on catalog entities.
        "brand:read", "brand:write",
        "category:create", "category:read", "category:update", "category:delete",
        "subcategory:create", "subcategory:read", "subcategory:update", "subcategory:delete",
        "product:create", "product:read", "product:update", "product:delete",
        // Manage notification templates and send custom notifications.
        "notification:read", "notification:write",
        // View admin/catalog-manager activity observability and audit logs.
        "analytics:read",
    ],
};

// Human-readable labels for role selectors / badges.
export const ROLE_LABELS = {
    admin: "Admin",
    "catalog-manager": "Catalog Manager",
    user: "Customer",
};

export const isFullAccessRole = (role) => !!role && FULL_ACCESS_ROLES.includes(role);

export const getCurrentRole = () => getStoredAuthSession().role || "";

/** True if `role` may perform `permission` (e.g. "product:delete"). */
export const can = (permission, role = getCurrentRole()) => {
    if (!role) return false;
    if (isFullAccessRole(role)) return true;
    const perms = ROLE_PERMISSIONS[role];
    return !!perms && perms.includes(permission);
};

/** Convenience: can the current role create/update any catalog entity. */
export const canEditCatalog = (role = getCurrentRole()) =>
    can("product:update", role) || can("product:create", role);
