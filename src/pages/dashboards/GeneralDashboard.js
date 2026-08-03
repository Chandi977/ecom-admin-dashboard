import React from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { can, canAny, getCurrentRole, ROLE_LABELS } from "../../rbac/permissions";
import { useOpsDashboard } from "../../hooks/useRoleDashboard";

/**
 * Operations dashboard for the `general` role (RBAC spec §8), fed by
 * `GET /ops/dashboard` (§5.3). Visual language deliberately mirrors
 * components/Dashboard.js (.dashboard-cards-grid / .dashboard-card-item).
 */

// `canAny` arrives with the RBAC rewrite (spec §9) — fall back to `can` so this
// page still renders if it is loaded against an older permissions module.
const allowedAny = (permissions = []) => {
    if (typeof canAny === "function") return canAny(permissions);
    return permissions.some((permission) => can(permission));
};

// Only the pages this role actually owns, each gated on the permission the
// target page needs. A link is never rendered for a role that cannot use it.
const QUICK_ACTIONS = [
    { to: "/products", label: "Products", icon: "pi-box", color: "#9966FF", description: "Add, edit and restock catalog items", permissions: ["product:read"] },
    { to: "/orders", label: "Orders", icon: "pi-shopping-cart", color: "#ff6b6b", description: "Track and update order status", permissions: ["order:read", "order:write"] },
    { to: "/leads", label: "Leads", icon: "pi-users", color: "#38bdf8", description: "Work the enquiry pipeline", permissions: ["lead:read"] },
    { to: "/reviews", label: "Reviews", icon: "pi-star", color: "#f59e0b", description: "Moderate customer reviews", permissions: ["review:read", "review:moderate"] },
    { to: "/subcategories", label: "Sub-categories", icon: "pi-sitemap", color: "#4BC0C0", description: "Organise sub-category listings", permissions: ["subcategory:read"] },
    { to: "/categories", label: "Categories", icon: "pi-tags", color: "#FFCE56", description: "Organise category listings", permissions: ["category:read"] },
];

const headingStyle = { fontWeight: 700, fontSize: "1.15rem", color: "#222", margin: "0 0 14px 0" };
const labelStyle = { fontWeight: 600, fontSize: "1.05rem", color: "#222", textAlign: "center" };
const valueStyle = { fontWeight: 700, fontSize: "1.7rem", color: "#222", marginTop: "8px" };
const subStyle = { color: "#b0b3bb", fontSize: "0.9rem", marginTop: "4px", textAlign: "center" };

function KpiCard({ icon, color, label, value, sub }) {
    return (
        <div className="dashboard-card-item center-layout">
            <i className={`pi ${icon}`} style={{ fontSize: "2.2rem", color, marginBottom: "10px" }} />
            <span style={labelStyle}>{label}</span>
            <span style={valueStyle}>{value}</span>
            <span style={subStyle}>{sub}</span>
        </div>
    );
}

function KpiSkeletonCard() {
    return (
        <div className="dashboard-card-item center-layout">
            <Skeleton shape="circle" size="2.2rem" />
            <Skeleton width="8rem" height="1rem" className="mt-3" />
            <Skeleton width="4rem" height="1.6rem" className="mt-2" />
            <Skeleton width="6rem" height="0.75rem" className="mt-2" />
        </div>
    );
}

function AttentionRow({ icon, color, label, count, to }) {
    const body = (
        <>
            <i className={`pi ${icon}`} style={{ color, fontSize: "1.1rem", marginRight: "12px" }} />
            <span style={{ fontWeight: 500, color: "#222" }}>{label}</span>
            <Tag value={count} severity="warning" style={{ marginLeft: "10px" }} />
            {to ? <i className="pi pi-arrow-right" style={{ marginLeft: "auto", color: "#b0b3bb" }} /> : null}
        </>
    );

    const rowStyle = {
        display: "flex",
        alignItems: "center",
        padding: "12px 4px",
        borderBottom: "1px solid #f1f5f9",
        textDecoration: "none",
        color: "#222",
    };

    if (!to) {
        return <div style={rowStyle}>{body}</div>;
    }

    return (
        <Link to={to} style={rowStyle}>
            {body}
        </Link>
    );
}

function ActionTile({ action }) {
    return (
        <div className="col-12 md:col-6 lg:col-4">
            <Link
                to={action.to}
                className="card"
                style={{ display: "flex", alignItems: "center", gap: "14px", height: "100%", marginBottom: 0, padding: "18px", textDecoration: "none", color: "#222" }}
            >
                <i className={`pi ${action.icon}`} style={{ fontSize: "1.6rem", color: action.color }} />
                <span style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>{action.label}</span>
                    <span style={{ color: "#b0b3bb", fontSize: "0.9rem" }}>{action.description}</span>
                </span>
                <i className="pi pi-arrow-right" style={{ marginLeft: "auto", color: "#b0b3bb" }} />
            </Link>
        </div>
    );
}

const GeneralDashboard = () => {
    const { data, loading, isFetching, isError, errorMessage, refetch } = useOpsDashboard();
    const role = getCurrentRole();
    const roleLabel = (ROLE_LABELS && ROLE_LABELS[role]) || "Staff";

    const actions = QUICK_ACTIONS.filter((action) => allowedAny(action.permissions));

    const orders = data?.orders;
    const leads = data?.leads;
    const catalog = data?.catalog;
    const enquiries = data?.enquiries;
    const pendingReviews = data?.reviews?.pending || 0;

    // Every number below is already normalised to a non-negative integer by the
    // hook, so a missing backend field shows as 0 rather than NaN/undefined.
    const attention = data
        ? [
              { key: "orders", icon: "pi-clock", color: "#ff6b6b", label: "Orders waiting to be processed", count: orders.pending, to: allowedAny(["order:read", "order:write"]) ? "/orders" : null },
              { key: "leads", icon: "pi-users", color: "#38bdf8", label: "New leads not yet contacted", count: leads.new, to: allowedAny(["lead:read"]) ? "/leads" : null },
              { key: "reviews", icon: "pi-star", color: "#f59e0b", label: "Reviews awaiting moderation", count: pendingReviews, to: allowedAny(["review:read", "review:moderate"]) ? "/reviews" : null },
              { key: "stock", icon: "pi-exclamation-triangle", color: "#e11d48", label: "Products out of stock", count: catalog.outOfStock, to: allowedAny(["product:read"]) ? "/products" : null },
              { key: "enquiries", icon: "pi-inbox", color: "#7c3aed", label: "Open enquiries", count: enquiries.open, to: null },
          ].filter((item) => item.count > 0)
        : [];

    const hasAnyActivity = data
        ? orders.total + leads.total + pendingReviews + catalog.products + enquiries.total > 0
        : false;

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 700, fontSize: "1.6rem", color: "#222" }}>Operations Dashboard</h2>
                    <div style={{ color: "#b0b3bb", fontSize: "0.95rem", marginTop: "4px" }}>Signed in as {roleLabel} — orders, leads, reviews and catalog health.</div>
                </div>
                <Button label="Refresh" icon="pi pi-refresh" className="p-button-outlined p-button-sm" loading={isFetching} onClick={() => refetch()} />
            </div>

            {isError ? <Message severity="warn" text={errorMessage} style={{ width: "100%", marginTop: "16px", justifyContent: "flex-start" }} /> : null}

            {loading ? (
                <div className="dashboard-cards-grid">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                        <KpiSkeletonCard key={index} />
                    ))}
                </div>
            ) : null}

            {data ? (
                <div className="dashboard-cards-grid">
                    <KpiCard icon="pi-shopping-cart" color="#ff6b6b" label="Total Orders" value={orders.total} sub={`${orders.today} placed today`} />
                    <KpiCard icon="pi-clock" color="#f97316" label="Pending Orders" value={orders.pending} sub={orders.pending > 0 ? "Awaiting processing" : "Nothing pending"} />
                    <KpiCard icon="pi-users" color="#38bdf8" label="Total Leads" value={leads.total} sub={`${leads.today} received today`} />
                    <KpiCard icon="pi-inbox" color="#0ea5e9" label="New Leads" value={leads.new} sub={leads.new > 0 ? "Not yet contacted" : "All leads picked up"} />
                    <KpiCard icon="pi-star" color="#f59e0b" label="Pending Reviews" value={pendingReviews} sub={pendingReviews > 0 ? "Awaiting moderation" : "Queue is clear"} />
                    <KpiCard icon="pi-box" color="#9966FF" label="Listed Products" value={catalog.products} sub={`${catalog.categories} categories · ${catalog.subCategories} sub-categories`} />
                    <KpiCard icon="pi-exclamation-triangle" color="#e11d48" label="Out of Stock" value={catalog.outOfStock} sub={catalog.outOfStock > 0 ? "Needs restocking" : "Everything in stock"} />
                    <KpiCard icon="pi-comment" color="#7c3aed" label="Enquiries" value={enquiries.total} sub={`${enquiries.open} still open`} />
                </div>
            ) : null}

            {data && !hasAnyActivity ? (
                <Message severity="info" text="No orders, leads, reviews or products have been recorded yet. Counters will fill in as the store is used." style={{ width: "100%", marginBottom: "24px", justifyContent: "flex-start" }} />
            ) : null}

            {data ? (
                <div className="card" style={{ padding: "20px 24px" }}>
                    <h3 style={headingStyle}>Needs your attention</h3>
                    {attention.length > 0 ? (
                        attention.map((item) => <AttentionRow key={item.key} icon={item.icon} color={item.color} label={item.label} count={item.count} to={item.to} />)
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", color: "#64748b", padding: "8px 4px" }}>
                            <i className="pi pi-check-circle" style={{ color: "#22c55e", fontSize: "1.2rem", marginRight: "10px" }} />
                            Nothing needs attention right now.
                        </div>
                    )}
                </div>
            ) : null}

            <div className="card" style={{ padding: "20px 24px", marginTop: "16px" }}>
                <h3 style={headingStyle}>Quick actions</h3>
                {actions.length > 0 ? (
                    <div className="grid">
                        {actions.map((action) => (
                            <ActionTile key={action.to} action={action} />
                        ))}
                    </div>
                ) : (
                    <div style={{ color: "#64748b" }}>No shortcuts are available for your role.</div>
                )}
            </div>
        </>
    );
};

export default GeneralDashboard;
