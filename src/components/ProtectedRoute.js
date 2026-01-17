import React from "react";
import { Route, Redirect } from "react-router-dom";

/**
 * ProtectedRoute Component
 * Guards routes based on authentication and role requirements
 *
 * @param {Component} component - The component to render
 * @param {Array} allowedRoles - Array of roles allowed to access this route
 * @param {Object} rest - Other Route props
 */
const ProtectedRoute = ({ component: Component, allowedRoles = [], ...rest }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Check if user is authenticated
    const isAuthenticated = !!token;

    // Check if user has required role (empty allowedRoles means all authenticated users)
    const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(role);

    return (
        <Route
            {...rest}
            render={(props) => {
                // Not authenticated - redirect to login
                if (!isAuthenticated) {
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
