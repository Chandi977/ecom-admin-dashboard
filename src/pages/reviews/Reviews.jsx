import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { toast } from "react-toastify";
import moment from "moment/moment";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePatchRequest } from "../../services/PatchTemplate";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleDeleteRequest } from "../../services/DeleteTemplate";
import { can } from "../../rbac/permissions";

const STATUS_TABS = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "All", value: "all" },
];

const STATUS_SEVERITY = { pending: "warning", approved: "success", rejected: "danger" };

const RATING_OPTIONS = [
    { label: "All ratings", value: null },
    { label: "★★★★★ (5)", value: 5 },
    { label: "★★★★ (4)", value: 4 },
    { label: "★★★ (3)", value: 3 },
    { label: "★★ (2)", value: 2 },
    { label: "★ (1)", value: 1 },
];

// Compact star row for the table (filled vs empty out of 5).
function Stars({ value = 0 }) {
    const v = Math.round(Number(value) || 0);
    return (
        <span style={{ color: "#f59e0b", letterSpacing: 1, whiteSpace: "nowrap" }} title={`${v}/5`}>
            {"★".repeat(v)}
            <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - v)}</span>
        </span>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="col-6 md:col-3">
            <div className="card" style={{ textAlign: "center", padding: "16px", marginBottom: 0, height: "100%" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: color || "#4b5563" }}>{value}</div>
                <div style={{ color: "#888", fontSize: "13px", marginTop: 4 }}>{label}</div>
            </div>
        </div>
    );
}

export default function Reviews() {
    const dispatch = useDispatch();
    const home = { icon: "pi pi-home", url: "/" };
    const breadItems = [{ label: "Reviews" }];

    const [reviews, setReviews] = useState([]);
    const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("pending");
    const [rating, setRating] = useState(null);
    const [savingId, setSavingId] = useState(null);

    const [replyOpen, setReplyOpen] = useState(false);
    const [replyTarget, setReplyTarget] = useState(null);
    const [replyText, setReplyText] = useState("");
    // Approve / reject / reply / delete all hit /review/admin/*, gated on
    // review:moderate. Listing reviews only needs review:read.
    const canModerate = can("review:moderate");

    const load = useCallback(async () => {
        setLoading(true);
        const params = { limit: 200 };
        if (status !== "all") params.status = status;
        if (rating) params.rating = rating;
        const res = await handleGetRequest("/review/admin/list", params);
        if (res?.data) {
            setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
            if (res.data.statusCounts) setStatusCounts(res.data.statusCounts);
        }
        setLoading(false);
    }, [status, rating]);

    useEffect(() => { load(); }, [load]);

    const setReviewStatus = async (review, next) => {
        if (!canModerate) {
            toast.info("You have read-only access to reviews.");
            return;
        }
        setSavingId(review._id);
        const res = await handlePatchRequest({ status: next }, `/review/admin/${review._id}/status`);
        setSavingId(null);
        if (res?.success) {
            toast.success(`Review ${next}`);
            load();
        }
    };

    const openReply = (review) => {
        setReplyTarget(review);
        setReplyText(review.adminReply?.message || "");
        setReplyOpen(true);
    };

    const submitReply = async () => {
        if (!canModerate) {
            toast.info("You have read-only access to reviews.");
            return;
        }
        if (!replyText.trim() || !replyTarget) return;
        setSavingId(replyTarget._id);
        const res = await dispatch(handlePostRequest({ message: replyText.trim() }, `/review/admin/${replyTarget._id}/reply`, true, true));
        setSavingId(null);
        if (res && res !== "error") {
            toast.success("Reply saved");
            setReplyOpen(false);
            setReplyTarget(null);
            setReplyText("");
            load();
        }
    };

    const removeReview = (review) => {
        if (!canModerate) {
            toast.info("You have read-only access to reviews.");
            return;
        }
        confirmDialog({
            message: "Delete this review permanently? This cannot be undone.",
            header: "Delete review",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: async () => {
                setSavingId(review._id);
                const res = await dispatch(handleDeleteRequest({}, `/review/admin/${review._id}`, true, true));
                setSavingId(null);
                if (res?.data?.success || res?.success) {
                    load();
                }
            },
        });
    };

    const productName = (r) => (r.product && typeof r.product === "object" ? r.product.name : "") || "—";

    const filtered = useMemo(() => reviews, [reviews]);

    const productBody = (r) => (
        <div style={{ maxWidth: 180 }}>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{productName(r)}</div>
            {r.product?.slug ? <div style={{ color: "#9ca3af", fontSize: 11 }}>/{r.product.slug}</div> : null}
        </div>
    );

    const reviewBody = (r) => (
        <div style={{ maxWidth: 380 }}>
            {r.title ? <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 13 }}>{r.title}</div> : null}
            <div style={{ color: "#4b5563", fontSize: 13, whiteSpace: "pre-wrap" }}>{r.comment}</div>
            {r.adminReply?.message ? (
                <div style={{ marginTop: 6, padding: "6px 10px", background: "#f0f9ff", borderLeft: "3px solid #0ea5e9", borderRadius: 6, fontSize: 12, color: "#0c4a6e" }}>
                    <b>Store reply:</b> {r.adminReply.message}
                </div>
            ) : null}
        </div>
    );

    const reviewerBody = (r) => (
        <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.reviewerName || "Customer"}</div>
            {r.verifiedPurchase ? (
                <span style={{ fontSize: 11, color: "#15803d" }}><i className="pi pi-verified" style={{ fontSize: 11 }} /> Verified</span>
            ) : null}
        </div>
    );

    const statusBody = (r) => <Tag value={r.status} severity={STATUS_SEVERITY[r.status] || null} />;

    const actionsBody = (r) => (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {r.status !== "approved" && (
                <Button icon="pi pi-check" className="p-button-sm p-button-success" tooltip={canModerate ? "Approve" : "Read-only"} disabled={savingId === r._id || !canModerate} onClick={() => setReviewStatus(r, "approved")} />
            )}
            {r.status !== "rejected" && (
                <Button icon="pi pi-times" className="p-button-sm p-button-warning" tooltip={canModerate ? "Reject" : "Read-only"} disabled={savingId === r._id || !canModerate} onClick={() => setReviewStatus(r, "rejected")} />
            )}
            <Button icon="pi pi-reply" className="p-button-sm p-button-info" tooltip={canModerate ? "Reply" : "Read-only"} disabled={savingId === r._id || !canModerate} onClick={() => openReply(r)} />
            {/* Deleting a review is irreversible — hide it outright when unpermitted. */}
            {canModerate && (
                <Button icon="pi pi-trash" className="p-button-sm p-button-danger" tooltip="Delete" disabled={savingId === r._id} onClick={() => removeReview(r)} />
            )}
        </div>
    );

    return (
        <div className="grid">
            <ConfirmDialog />
            <div className="col-12">
                <BreadCrumb model={breadItems} home={home} />
            </div>

            <StatCard label="Pending" value={statusCounts.pending || 0} color="#f59e0b" />
            <StatCard label="Approved" value={statusCounts.approved || 0} color="#16a34a" />
            <StatCard label="Rejected" value={statusCounts.rejected || 0} color="#ef4444" />
            <StatCard label="Total" value={(statusCounts.pending || 0) + (statusCounts.approved || 0) + (statusCounts.rejected || 0)} color="#4b5563" />

            <div className="col-12">
                <div className="card">
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div>
                            <h5 style={{ margin: 0 }}>Customer Reviews</h5>
                            {!canModerate && <small style={{ color: "#94a3b8" }}>You have read-only access to reviews.</small>}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                            <SelectButton value={status} options={STATUS_TABS} onChange={(e) => e.value && setStatus(e.value)} />
                            <Dropdown value={rating} options={RATING_OPTIONS} onChange={(e) => setRating(e.value)} placeholder="All ratings" style={{ minWidth: 150 }} />
                            <Button icon="pi pi-refresh" className="p-button-outlined p-button-sm" onClick={load} tooltip="Refresh" />
                        </div>
                    </div>

                    <DataTable value={filtered} loading={loading} paginator rows={20} rowsPerPageOptions={[20, 50, 100]} dataKey="_id" emptyMessage="No reviews found" responsiveLayout="scroll">
                        <Column header="Product" body={productBody} />
                        <Column header="Rating" body={(r) => <Stars value={r.rating} />} style={{ width: 120 }} />
                        <Column header="Review" body={reviewBody} />
                        <Column header="Reviewer" body={reviewerBody} />
                        <Column header="Status" body={statusBody} style={{ width: 110 }} />
                        <Column header="Date" body={(r) => moment(r.createdAt).format("DD MMM YYYY")} style={{ width: 120 }} />
                        <Column header="Actions" body={actionsBody} style={{ width: 190 }} />
                    </DataTable>
                </div>
            </div>

            <Dialog header="Reply to review" visible={replyOpen} style={{ width: "480px" }} modal onHide={() => setReplyOpen(false)}>
                {replyTarget ? (
                    <div>
                        <div style={{ marginBottom: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>
                            <Stars value={replyTarget.rating} />
                            <div style={{ fontSize: 13, color: "#4b5563", marginTop: 4 }}>{replyTarget.comment}</div>
                        </div>
                        <InputTextarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} disabled={!canModerate} style={{ width: "100%" }} placeholder="Write a public reply from the store…" autoResize />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                            <Button label="Cancel" className="p-button-text" onClick={() => setReplyOpen(false)} />
                            <Button label="Save reply" icon="pi pi-check" disabled={!canModerate || !replyText.trim() || savingId === replyTarget._id} onClick={submitReply} />
                        </div>
                    </div>
                ) : null}
            </Dialog>
        </div>
    );
}
