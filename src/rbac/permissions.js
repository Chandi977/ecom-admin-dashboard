import { getStoredAuthSession } from "../utils/authSession";

/**
 * Client-side mirror of the backend RBAC config (ecom-backend-optimized/src/config/rbac.ts).
 * Used to hide write/delete controls the current role is not allowed to use.
 * The backend remains the source of truth — this only improves the UX.
 *
 * `GET /permissions/me` (see src/hooks/usePermissions.js) is authoritative at
 * runtime; this mirror seeds the first render and is the fallback when the
 * endpoint is unavailable.
 */

// Roles with unrestricted access (keep in sync with backend FULL_ACCESS_ROLES).
// They bypass every permission check, so they are absent from ROLE_PERMISSIONS.
export const FULL_ACCESS_ROLES = ["admin", "manager"];

// Every role that may enter the admin panel (i.e. everything except the
// storefront "user" role, which adminMiddleware blocks).
export const ADMIN_PANEL_ROLES = ["admin", "manager", "general", "seo", "catalog-manager"];

// The complete permission catalog. `admin`/`manager` resolve to this whole list.
export const ALL_PERMISSIONS = [
    "analytics:read",
    "appversion:write",
    "attribute:write",
    "brand:read",
    "brand:write",
    "category:create",
    "category:read",
    "category:update",
    "category:delete",
    "contact:write",
    "coupon:write",
    // Storefront customers (distinct from user:read = admin/staff accounts).
    "customer:read",
    "deal:write",
    "lead:read",
    "marketing:read",
    "marketing:write",
    "notification:read",
    "notification:write",
    "order:read",
    "order:write",
    "pincode:write",
    "product:create",
    "product:read",
    "product:update",
    "product:delete",
    "review:read",
    "review:moderate",
    "seo:read",
    "seo:write",
    "subcategory:create",
    "subcategory:read",
    "subcategory:update",
    "subcategory:delete",
    "user:read",
    "user:write",
    "variant:create",
    "variant:update",
    "variant:delete",
];

// Restricted roles -> the exact permissions they hold.
export const ROLE_PERMISSIONS = {
    general: [
        // Full CRUD on catalog entities.
        "brand:read", "brand:write",
        "category:create", "category:read", "category:update", "category:delete",
        "subcategory:create", "subcategory:read", "subcategory:update", "subcategory:delete",
        "product:create", "product:read", "product:update", "product:delete",
        "variant:create", "variant:update", "variant:delete",
        "attribute:write",
        // Day-to-day operations: orders, leads/enquiries, reviews.
        "order:read", "order:write",
        "lead:read", "contact:write",
        "customer:read",
        "review:read", "review:moderate",
        // Customer comms + merchandising.
        "notification:read", "notification:write",
        "coupon:write", "deal:write",
        "pincode:write",
        // May also maintain SEO fields on the catalog it owns.
        "seo:read", "seo:write",
        "analytics:read",
    ],
    // SEO is read-only on the catalog; writes are field-scoped to SEO keys by
    // the backend (authorizeScoped), which is why `seo:write` is granted while
    // product/category/subcategory `:update` are not.
    seo: [
        "product:read", "category:read", "subcategory:read", "brand:read",
        "seo:read", "seo:write",
        "analytics:read",
    ],
    // LEGACY — do not add or remove entries; mirrors config/rbac.ts as-is.
    "catalog-manager": [
        // Full CRUD on catalog entities.
        "brand:read", "brand:write",
        "category:create", "category:read", "category:update", "category:delete",
        "subcategory:create", "subcategory:read", "subcategory:update", "subcategory:delete",
        "product:create", "product:read", "product:update", "product:delete",
        // Manage notification templates and send custom notifications.
        "notification:read", "notification:write",
        // Moderate customer product reviews. These two were missing from this
        // mirror while the backend granted them all along — the drift hid the
        // moderation buttons from a role the API accepted writes from.
        "review:read", "review:moderate",
        // View admin/catalog-manager activity observability and audit logs.
        "analytics:read",
        // Read-only grants that keep this legacy role's existing pages working
        // now that the order/lead/customer routes carry authorize() gates.
        "order:read", "lead:read", "customer:read",
    ],
};

// Human-readable labels for role selectors / badges.
export const ROLE_LABELS = {
    admin: "Admin",
    manager: "Manager",
    general: "General",
    seo: "SEO",
    "catalog-manager": "Catalog Manager",
    user: "Customer",
};

// Landing route per role. "/" renders the role-scoped dashboard, so it is the
// correct home for every panel role — a denied route sends the user here.
export const ROLE_HOME = {
    admin: "/",
    manager: "/",
    general: "/",
    seo: "/",
    "catalog-manager": "/",
};

// Roles offered by the create-staff form. Legacy `catalog-manager` is
// deliberately absent — existing accounts keep working, but no new ones.
export const STAFF_ROLE_OPTIONS = [
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "General", value: "general" },
    { label: "SEO", value: "seo" },
];

export const isFullAccessRole = (role) => !!role && FULL_ACCESS_ROLES.includes(role);

export const getCurrentRole = () => getStoredAuthSession().role || "";

/** Permissions held by `role` per the local mirror (full-access roles get everything). */
export const permissionsForRole = (role = getCurrentRole()) => {
    if (!role) return [];
    if (isFullAccessRole(role)) return ALL_PERMISSIONS;
    return ROLE_PERMISSIONS[role] || [];
};

/** True if `role` may perform `permission` (e.g. "product:delete"). */
export const can = (permission, role = getCurrentRole()) => {
    if (!role) return false;
    if (isFullAccessRole(role)) return true;
    const perms = ROLE_PERMISSIONS[role];
    return !!perms && perms.includes(permission);
};

/** True if `role` holds at least one of `permissions` (empty list = allowed). */
export const canAny = (permissions = [], role = getCurrentRole()) => {
    if (!Array.isArray(permissions) || permissions.length === 0) return true;
    return permissions.some((permission) => can(permission, role));
};

/** True if `role` holds every one of `permissions` (empty list = allowed). */
export const canAll = (permissions = [], role = getCurrentRole()) => {
    if (!Array.isArray(permissions) || permissions.length === 0) return true;
    return permissions.every((permission) => can(permission, role));
};

/** Convenience: can the current role create/update any catalog entity. */
export const canEditCatalog = (role = getCurrentRole()) =>
    can("product:update", role) || can("product:create", role);

/**
 * True for roles whose only catalog write access is the SEO field scope
 * (holds seo:write but not product:update) — used to render SEO-only editors.
 */
export const isSeoOnlyRole = (role = getCurrentRole()) =>
    can("seo:write", role) && !can("product:update", role);
