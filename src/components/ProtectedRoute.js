import React from "react";
import { Route, Redirect } from "react-router-dom";
import { clearAuthSession, getStoredAuthSession, hasValidAuthSession, isTokenExpired } from "../utils/authSession";

/**
 * ProtectedRoute Component
 * Guards routes based on authentication and role requirements
 *
 * @param {Component} component - The component to render
 * @param {Array} allowedRoles - Array of roles allowed to access this route
 * @param {Object} rest - Other Route props
 */
const ProtectedRoute = ({ component: Component, allowedRoles = [], ...rest }) => {
    const { token, role } = getStoredAuthSession();
    const isAuthenticated = !!token && !isTokenExpired(token);
    const hasRequiredRole = hasValidAuthSession(allowedRoles);

    return (
        <Route
            {...rest}
            render={(props) => {
                // Not authenticated - redirect to login
                if (!isAuthenticated) {
                    clearAuthSession();
                    return <Redirect to="/auth" />;
                }

                // Authenticated but wrong role - redirect to orders (default accessible page)
                if (!hasRequiredRole) {
                    console.warn(`Access denied: Role '${role}' not in allowed roles [${allowedRoles.join(", ")}]`);
                    return <Redirect to="/orders" />;
                }

                // All checks passed - render the component
                return <Component {...props} />;
            }}
        />
    );
};

export default ProtectedRoute;
