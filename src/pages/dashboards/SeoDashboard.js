import React from "react";
import { Link, useHistory } from "react-router-dom";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import moment from "moment";
import { can, canAny, getCurrentRole, ROLE_LABELS } from "../../rbac/permissions";
import { useSeoDashboard } from "../../hooks/useRoleDashboard";

/**
 * SEO dashboard for the `seo` role (RBAC spec §8), fed by `GET /seo/dashboard`
 * (§5.2). Visual language deliberately mirrors components/Dashboard.js
 * (.dashboard-cards-grid / .dashboard-card-item).
 */

// `canAny` arrives with the RBAC rewrite (spec §9) — fall back to `can` so this
// page still renders if it is loaded against an older permissions module.
const allowedAny = (permissions = []) => {
    if (typeof canAny === "function") return canAny(permissions);
    return permissions.some((permission) => can(permission));
};

// Gated on the permission the target page needs, so a link is never rendered
// for a role that cannot open it.
const QUICK_ACTIONS = [
    { to: "/products", label: "Products", icon: "pi-box", color: "#9966FF", description: "Fix meta titles, descriptions and slugs", permissions: ["product:read"] },
    { to: "/subcategories", label: "Sub-categories", icon: "pi-sitemap", color: "#4BC0C0", description: "Author SEO content and FAQs", permissions: ["subcategory:read"] },
    { to: "/categories", label: "Categories", icon: "pi-tags", color: "#FFCE56", description: "Fix category meta fields", permissions: ["category:read"] },
    { to: "/analytics", label: "Analytics", icon: "pi-chart-line", color: "#38bdf8", description: "Traffic and demand signals", permissions: ["analytics:read"] },
];

// Backend sends raw field keys in `worstOffenders[].missing` — label them.
const MISSING_LABELS = {
    meta_title: "Meta title",
    meta_description: "Meta description",
    slug: "Slug",
    keywords: "Keywords",
    seo_content: "SEO content",
    faqs: "FAQs",
};

const headingStyle = { fontWeight: 700, fontSize: "1.15rem", color: "#222", margin: "0 0 14px 0" };
const labelStyle = { fontWeight: 600, fontSize: "1.05rem", color: "#222", textAlign: "center" };
const valueStyle = { fontWeight: 700, fontSize: "1.7rem", color: "#222", marginTop: "8px" };
const subStyle = { color: "#b0b3bb", fontSize: "0.9rem", marginTop: "4px", textAlign: "center" };

const coverageColor = (percent) => {
    if (percent >= 90) return "#22c55e";
    if (percent >= 60) return "#f59e0b";
    return "#ef4444";
};

const missingLabel = (field) => MISSING_LABELS[field] || String(field).replace(/_/g, " ");

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

function HeroSkeleton() {
    return (
        <div className="card" style={{ padding: "24px", marginTop: "16px" }}>
            <Skeleton width="14rem" height="1.1rem" />
            <Skeleton width="9rem" height="3rem" className="mt-3" />
            <Skeleton width="100%" height="1rem" className="mt-3" />
        </div>
    );
}

function ActionTile({ action }) {
    return (
        <div className="col-12 md:col-6 lg:col-3">
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
            </Link>
        </div>
    );
}

const SeoDashboard = () => {
    const { data, loading, isFetching, isError, errorMessage, refetch } = useSeoDashboard();
    const history = useHistory();
    const role = getCurrentRole();
    const roleLabel = (ROLE_LABELS && ROLE_LABELS[role]) || "Staff";

    const actions = QUICK_ACTIONS.filter((action) => allowedAny(action.permissions));
    const canOpenProduct = allowedAny(["product:read"]);

    const totals = data?.totals;
    const products = data?.products;
    const categories = data?.categories;
    const subCategories = data?.subCategories;
    const coverage = products?.coveragePercent || 0;
    const recentlyUpdated = data?.recentlyUpdated || [];
    const worstOffenders = data?.worstOffenders || [];

    // Deep-link a row to its product editor so the gap can be fixed immediately.
    const openProduct = (row) => {
        if (!canOpenProduct || !row?._id) return;
        history.push(`/product/${row._id}`);
    };

    const offenderNameBody = (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, color: "#222" }}>{row.name}</span>
            <span style={{ color: "#b0b3bb", fontSize: "0.85rem" }}>{row.slug ? `/${row.slug}` : "No slug"}</span>
        </div>
    );

    const offenderMissingBody = (row) =>
        row.missing.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {row.missing.map((field) => (
                    <Tag key={field} value={missingLabel(field)} severity="danger" />
                ))}
            </div>
        ) : (
            <span style={{ color: "#b0b3bb" }}>Not specified</span>
        );

    const offenderActionBody = (row) =>
        canOpenProduct && row._id ? (
            <Button label="Fix" icon="pi pi-pencil" className="p-button-sm p-button-text" onClick={() => openProduct(row)} />
        ) : (
            <span style={{ color: "#b0b3bb" }}>-</span>
        );

    const recentNameBody = (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {canOpenProduct && row._id ? (
                <Link to={`/product/${row._id}`} style={{ fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                    {row.name}
                </Link>
            ) : (
                <span style={{ fontWeight: 600, color: "#222" }}>{row.name}</span>
            )}
            <span style={{ color: "#b0b3bb", fontSize: "0.85rem" }}>{row.slug ? `/${row.slug}` : "No slug"}</span>
        </div>
    );

    const recentUpdatedBody = (row) => <span style={{ color: "#64748b" }}>{row.updatedAt && moment(row.updatedAt).isValid() ? moment(row.updatedAt).fromNow() : "Unknown"}</span>;

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 700, fontSize: "1.6rem", color: "#222" }}>SEO Dashboard</h2>
                    <div style={{ color: "#b0b3bb", fontSize: "0.95rem", marginTop: "4px" }}>Signed in as {roleLabel} — metadata coverage across the catalog.</div>
                </div>
                <Button label="Refresh" icon="pi pi-refresh" className="p-button-outlined p-button-sm" loading={isFetching} onClick={() => refetch()} />
            </div>

            {isError ? <Message severity="warn" text={errorMessage} style={{ width: "100%", marginTop: "16px", justifyContent: "flex-start" }} /> : null}

            {loading ? (
                <>
                    <HeroSkeleton />
                    <div className="dashboard-cards-grid">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                            <KpiSkeletonCard key={index} />
                        ))}
                    </div>
                </>
            ) : null}

            {data ? (
                <div className="card" style={{ padding: "24px", marginTop: "16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "#222" }}>SEO coverage</div>
                            <div style={{ fontWeight: 700, fontSize: "3rem", lineHeight: 1.1, color: coverageColor(coverage) }}>{coverage}%</div>
                            <div style={{ color: "#b0b3bb", fontSize: "0.95rem" }}>
                                {totals.products > 0 ? `of ${totals.products} products have both a meta title and a meta description` : "No products in the catalog yet"}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                            <div>
                                <div style={{ color: "#b0b3bb", fontSize: "0.85rem" }}>Products</div>
                                <div style={{ fontWeight: 700, fontSize: "1.4rem", color: "#222" }}>{totals.products}</div>
                            </div>
                            <div>
                                <div style={{ color: "#b0b3bb", fontSize: "0.85rem" }}>Categories</div>
                                <div style={{ fontWeight: 700, fontSize: "1.4rem", color: "#222" }}>{totals.categories}</div>
                            </div>
                            <div>
                                <div style={{ color: "#b0b3bb", fontSize: "0.85rem" }}>Sub-categories</div>
                                <div style={{ fontWeight: 700, fontSize: "1.4rem", color: "#222" }}>{totals.subCategories}</div>
                            </div>
                            <div>
                                <div style={{ color: "#b0b3bb", fontSize: "0.85rem" }}>With keywords</div>
                                <div style={{ fontWeight: 700, fontSize: "1.4rem", color: "#222" }}>{products.withKeywords}</div>
                            </div>
                        </div>
                    </div>
                    <ProgressBar value={coverage} showValue={false} color={coverageColor(coverage)} style={{ height: "10px", marginTop: "18px" }} />
                </div>
            ) : null}

            {data ? (
                <>
                    <h3 style={{ ...headingStyle, marginTop: "24px" }}>Product metadata gaps</h3>
                    <div className="dashboard-cards-grid" style={{ marginTop: 0 }}>
                        <KpiCard icon="pi-tag" color="#ef4444" label="Missing Meta Title" value={products.missingMetaTitle} sub={products.missingMetaTitle > 0 ? "Needs a title" : "All titles present"} />
                        <KpiCard icon="pi-align-left" color="#f97316" label="Missing Meta Description" value={products.missingMetaDescription} sub={products.missingMetaDescription > 0 ? "Needs a description" : "All descriptions present"} />
                        <KpiCard icon="pi-link" color="#0ea5e9" label="Missing Slug" value={products.missingSlug} sub={products.missingSlug > 0 ? "Not indexable" : "All slugs present"} />
                        <KpiCard icon="pi-exclamation-triangle" color="#e11d48" label="Missing Both Meta Fields" value={products.missingBoth} sub={products.missingBoth > 0 ? "Highest priority" : "None fully empty"} />
                    </div>

                    <h3 style={headingStyle}>Category and sub-category gaps</h3>
                    <div className="dashboard-cards-grid" style={{ marginTop: 0 }}>
                        <KpiCard icon="pi-tags" color="#ef4444" label="Categories Missing Meta Title" value={categories.missingMetaTitle} sub={`of ${totals.categories} categories`} />
                        <KpiCard icon="pi-tags" color="#f97316" label="Categories Missing Meta Description" value={categories.missingMetaDescription} sub={`of ${totals.categories} categories`} />
                        <KpiCard icon="pi-file" color="#7c3aed" label="Sub-categories Missing SEO Content" value={subCategories.missingSeoContent} sub={`of ${totals.subCategories} sub-categories`} />
                        <KpiCard icon="pi-question-circle" color="#0891b2" label="Sub-categories Missing FAQs" value={subCategories.missingFaqs} sub={`of ${totals.subCategories} sub-categories`} />
                    </div>
                </>
            ) : null}

            {data ? (
                <div className="grid">
                    <div className="col-12 lg:col-7">
                        <div className="card" style={{ padding: "20px 24px", height: "100%", marginBottom: 0 }}>
                            <h3 style={headingStyle}>Worst offenders</h3>
                            <DataTable
                                value={worstOffenders}
                                dataKey="key"
                                responsiveLayout="scroll"
                                rowClassName={() => (canOpenProduct ? "cursor-pointer" : "")}
                                onRowClick={(event) => openProduct(event?.data)}
                                emptyMessage="No products with missing SEO fields. Nothing to fix."
                            >
                                <Column header="Product" body={offenderNameBody} />
                                <Column header="Missing" body={offenderMissingBody} />
                                <Column header="" body={offenderActionBody} style={{ width: "7rem", textAlign: "right" }} />
                            </DataTable>
                        </div>
                    </div>
                    <div className="col-12 lg:col-5">
                        <div className="card" style={{ padding: "20px 24px", height: "100%", marginBottom: 0 }}>
                            <h3 style={headingStyle}>Recently updated</h3>
                            <DataTable value={recentlyUpdated} dataKey="key" responsiveLayout="scroll" emptyMessage="No product SEO edits recorded yet.">
                                <Column header="Product" body={recentNameBody} />
                                <Column header="Updated" body={recentUpdatedBody} style={{ width: "9rem" }} />
                            </DataTable>
                        </div>
                    </div>
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

export default SeoDashboard;
