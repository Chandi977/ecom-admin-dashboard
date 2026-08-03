import React from "react";
import Dashboard from "../../components/Dashboard";
import GeneralDashboard from "./GeneralDashboard";
import SeoDashboard from "./SeoDashboard";
import { getCurrentRole } from "../../rbac/permissions";

/**
 * `/` dispatches on role (RBAC spec §8).
 *
 * admin / manager / catalog-manager -> the original components/Dashboard.js,
 * general -> GeneralDashboard, seo -> SeoDashboard, anything else -> General.
 *
 * The role can be passed in as a prop (e.g. from usePermissions) but defaults
 * to the stored session role, so this works with a plain `component={...}` route.
 */

// Roles that keep the original full admin dashboard.
const FULL_DASHBOARD_ROLES = ["admin", "manager", "catalog-manager"];

const RoleDashboard = (props) => {
    const role = String(props?.role || getCurrentRole() || "").trim();

    if (FULL_DASHBOARD_ROLES.includes(role)) {
        // Dashboard is React.memo'd with a comparator that reads props.location,
        // so keep a location present even when rendered without route props.
        return <Dashboard {...props} location={props?.location || { pathname: "/" }} />;
    }

    if (role === "seo") {
        return <SeoDashboard />;
    }

    // `general` plus any unrecognised panel role.
    return <GeneralDashboard />;
};

export default RoleDashboard;
