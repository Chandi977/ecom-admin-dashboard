import React from "react";
import { Route, Redirect } from "react-router-dom";
import { Card } from "primereact/card";
import { clearAuthSession, getStoredAuthSession, hasValidAuthSession, isTokenExpired } from "../utils/authSession";
import { ROLE_HOME, ROLE_LABELS } from "../rbac/permissions";
import { usePermissions } from "../hooks/usePermissions";

/** Shown instead of a redirect when the denied route is already the role's home. */
const AccessDeniedPanel = ({ role }) => (
    <Card style={{ maxWidth: "560px", margin: "48px auto", textAlign: "center", borderRadius: "16px" }}>
        <i className="pi pi-lock" style={{ fontSize: "2.2rem", color: "#E92227" }} />
        <h2 style={{ fontWeight: 700, fontSize: "1.5rem", margin: "14px 0 8px", color: "#222" }}>You don't have access to this page</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "1rem" }}>
            Your role (<b style={{ color: "#E92227" }}>{ROLE_LABELS[role] || role || "unknown"}</b>) is not permitted to view this section. Ask an administrator if you need access.
        </p>
    </Card>
);

/**
 * ProtectedRoute Component
 * Guards routes based on authentication, role and permission requirements
 *
 * @param {Component} component - The component to render
 * @param {Array} allowedRoles - Array of roles allowed to access this route
 * @param {Array} requiredPermissions - Permissions the role must ALL hold (optional)
 * @param {Object} rest - Other Route props
 */
const ProtectedRoute = ({ component: Component, allowedRoles = [], requiredPermissions = [], ...rest }) => {
    const { token, role } = getStoredAuthSession();
    const { canAll } = usePermissions();
    const isAuthenticated = !!token && !isTokenExpired(token);
    const hasRequiredRole = hasValidAuthSession(allowedRoles);
    const hasRequiredPermissions = canAll(requiredPermissions);
    const home = ROLE_HOME[role] || "/";

    return (
        <Route
            {...rest}
            render={(props) => {
                // Not authenticated - redirect to login
                if (!isAuthenticated) {
                    clearAuthSession();
                    return <Redirect to="/auth" />;
                }

                // Authenticated but not allowed here - send the user to their own home.
                if (!hasRequiredRole || !hasRequiredPermissions) {
                    console.warn(`Access denied: Role '${role}' not allowed on ${props.location.pathname} (roles [${allowedRoles.join(", ")}], permissions [${requiredPermissions.join(", ")}])`);

                    // Already at the role's home page - redirecting again would loop.
                    if (props.location.pathname === home) {
                        return <AccessDeniedPanel role={role} />;
                    }

                    return <Redirect to={home} />;
                }

                // All checks passed - render the component
                return <Component {...props} />;
            }}
        />
    );
};

export default ProtectedRoute;
