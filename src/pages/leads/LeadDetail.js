import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { toast } from "react-toastify";
import moment from "moment/moment";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePatchRequest } from "../../services/PatchTemplate";
import { handlePostRequest } from "../../services/PostTemplate";
import { can } from "../../rbac/permissions";

const STATUS_OPTIONS = [
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "Qualified", value: "qualified" },
    { label: "Converted", value: "converted" },
    { label: "Closed", value: "closed" },
];
const STATUS_SEVERITY = { new: "info", contacted: "warning", qualified: null, converted: "success", closed: "danger" };
const STATUS_LABELS = STATUS_OPTIONS.reduce((m, o) => ({ ...m, [o.value]: o.label }), {});

const ACTIVITY_TYPES = [
    { label: "Call", value: "call", icon: "pi pi-phone" },
    { label: "Note", value: "note", icon: "pi pi-comment" },
    { label: "Email", value: "email", icon: "pi pi-envelope" },
    { label: "WhatsApp", value: "whatsapp", icon: "pi pi-whatsapp" },
    { label: "Meeting", value: "meeting", icon: "pi pi-users" },
];
const ACTIVITY_ICON = {
    note: "pi pi-comment", call: "pi pi-phone", email: "pi pi-envelope",
    whatsapp: "pi pi-whatsapp", meeting: "pi pi-users", status_change: "pi pi-flag", follow_up: "pi pi-clock",
};

// handlePostRequest is a redux thunk; run it with a no-op dispatch.
const postJson = (data, url) => handlePostRequest(data, url, false, false)(() => {});

// 3-state email badge — "unverified" (no real check yet) vs deliverable/risky.
const emailBadge = (lead) => !lead.emailChecked
    ? { label: "Email unverified", style: { background: "#e5e7eb", color: "#6b7280" } }
    : lead.emailVerified
        ? { label: "Email deliverable", style: { background: "#dcfce7", color: "#15803d" } }
        : { label: "Email risky", style: { background: "#fee2e2", color: "#b91c1c" } };

const emptyForm = {
    name: "", email: "", phone: "", company: "", productCategory: "", moq: "",
    message: "", status: "new", assignedTo: "", disposition: "", nextFollowUpAt: null, notes: "",
};

const toForm = (lead) => ({
    name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    company: lead.company || "",
    productCategory: lead.productCategory || "",
    moq: lead.moq || "",
    message: lead.message || "",
    status: lead.status || "new",
    assignedTo: lead.assignedTo || "",
    disposition: lead.disposition || "",
    nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null,
    notes: lead.notes || "",
});

function Field({ label, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".3px" }}>{label}</label>
            {children}
        </div>
    );
}

export default function LeadDetail() {
    const { id } = useParams();
    const history = useHistory();

    const [lead, setLead] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [logging, setLogging] = useState(false);
    const [activity, setActivity] = useState({ type: "call", note: "", status: null, nextFollowUpAt: null });
    // Saving the lead, logging activity and the deliverability check all write to
    // the lead module (contact:write). Viewing the workspace does not.
    const canWrite = can("contact:write");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await handleGetRequest(`/lead/${id}`);
        if (res?.data) {
            setLead(res.data);
            setForm(toForm(res.data));
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const timeline = useMemo(() => {
        const acts = (lead?.activities || []).slice();
        acts.sort((a, b) => new Date(b.at) - new Date(a.at));
        return acts;
    }, [lead]);

    const followUpState = useMemo(() => {
        if (!lead?.nextFollowUpAt) return null;
        const due = moment(lead.nextFollowUpAt);
        return { text: due.format("DD MMM YYYY"), overdue: due.isBefore(moment(), "day") };
    }, [lead]);

    const saveLead = async () => {
        if (!canWrite) {
            toast.info("You have read-only access to leads.");
            return;
        }
        setSaving(true);
        const payload = {
            name: form.name,
            email: form.email || undefined,
            phone: form.phone,
            company: form.company,
            productCategory: form.productCategory,
            moq: form.moq,
            message: form.message,
            status: form.status,
            assignedTo: form.assignedTo,
            disposition: form.disposition,
            notes: form.notes,
            nextFollowUpAt: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : "",
        };
        const res = await handlePatchRequest(payload, `/lead/${id}`);
        setSaving(false);
        if (res?.success) {
            setLead(res.data);
            setForm(toForm(res.data));
            toast.success("Lead saved");
        }
    };

    const verifyEmail = async () => {
        if (!canWrite) {
            toast.info("You have read-only access to leads.");
            return;
        }
        if (!form.email) {
            toast.warn("Add an email address first, then verify");
            return;
        }
        setVerifying(true);
        const res = await postJson({}, `/lead/${id}/verify-email`);
        setVerifying(false);
        if (res && res !== "error" && res.success) {
            setLead(res.data);
            (res.data.emailVerified ? toast.success : toast.warn)(res.message || "Email checked");
        }
    };

    const logActivity = async () => {
        if (!canWrite) {
            toast.info("You have read-only access to leads.");
            return;
        }
        if (!activity.note.trim()) {
            toast.warn("Add a note describing the interaction");
            return;
        }
        setLogging(true);
        const payload = {
            type: activity.type,
            note: activity.note.trim(),
            ...(activity.status ? { status: activity.status } : {}),
            ...(activity.nextFollowUpAt ? { nextFollowUpAt: new Date(activity.nextFollowUpAt).toISOString() } : {}),
        };
        const res = await postJson(payload, `/lead/${id}/activity`);
        setLogging(false);
        if (res && res !== "error" && res.success) {
            setLead(res.data);
            setForm(toForm(res.data));
            setActivity({ type: activity.type, note: "", status: null, nextFollowUpAt: null });
            toast.success("Activity logged");
        }
    };

    const breadItems = [{ label: "Leads CRM", command: () => history.push("/leads") }, { label: lead?.name || "Lead" }];

    if (loading) {
        return (
            <div className="Page__Header">
                <h2>Lead</h2>
                <p style={{ color: "#888" }}>Loading…</p>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="Page__Header">
                <h2>Lead not found</h2>
                <Button label="Back to CRM" icon="pi pi-arrow-left" className="p-button-text" onClick={() => history.push("/leads")} />
            </div>
        );
    }

    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={() => history.push("/leads")} />
                        {lead.name}
                        <Tag severity={STATUS_SEVERITY[lead.status]} value={STATUS_LABELS[lead.status] || lead.status} />
                    </h2>
                    <BreadCrumb model={breadItems} home={{ icon: "pi pi-home", url: "/" }} />
                </div>
                <div className="Top__Btn" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {lead.phone ? <a href={`tel:${lead.phone}`}><Button icon="pi pi-phone" label="Call" className="p-button-outlined" /></a> : null}
                    {lead.phone ? <a href={`https://wa.me/${String(lead.phone).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"><Button icon="pi pi-whatsapp" label="WhatsApp" className="p-button-outlined p-button-success" /></a> : null}
                    {lead.email ? <a href={`mailto:${lead.email}`}><Button icon="pi pi-envelope" label="Email" className="p-button-outlined" /></a> : null}
                    <Button icon="pi pi-check" label="Save" onClick={saveLead} loading={saving} disabled={!canWrite} />
                </div>
            </div>

            {!canWrite && (
                <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>
                    Read-only for your role — lead details and activity logging are disabled.
                </p>
            )}

            <div className="grid" style={{ marginTop: 8 }}>
                {/* LEFT: management + contact */}
                <div className="col-12 lg:col-5">
                    <div className="card">
                        <h5 style={{ marginTop: 0 }}>Pipeline</h5>
                        <Field label="Status">
                            <Dropdown value={form.status} options={STATUS_OPTIONS} onChange={(e) => setField("status", e.value)} disabled={!canWrite} style={{ width: "100%" }} />
                        </Field>
                        <Field label="Assigned to">
                            <InputText value={form.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)} placeholder="e.g. Amit, Tarandeep" disabled={!canWrite} style={{ width: "100%" }} />
                        </Field>
                        <Field label="Latest disposition / outcome">
                            <InputText value={form.disposition} onChange={(e) => setField("disposition", e.target.value)} placeholder="e.g. rates given, no requirement" disabled={!canWrite} style={{ width: "100%" }} />
                        </Field>
                        <Field label="Next follow-up">
                            <Calendar value={form.nextFollowUpAt} onChange={(e) => setField("nextFollowUpAt", e.value)} dateFormat="dd M yy" showButtonBar showIcon disabled={!canWrite} style={{ width: "100%" }} />
                            {followUpState ? (
                                <div style={{ marginTop: 6 }}>
                                    <Tag severity={followUpState.overdue ? "danger" : "info"} value={`${followUpState.overdue ? "Overdue" : "Due"}: ${followUpState.text}`} />
                                </div>
                            ) : null}
                        </Field>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                            <Tag severity="info" value={lead.source || "—"} />
                            <Tag value={emailBadge(lead).label} style={emailBadge(lead).style} />
                            <Tag severity={lead.autoResponseSent ? "success" : "warning"} value={lead.autoResponseSent ? "Auto-mail sent" : "No auto-mail"} />
                            <Button label="Verify email" icon="pi pi-verified" className="p-button-text" style={{ padding: "4px 8px" }} onClick={verifyEmail} loading={verifying} disabled={!canWrite} />
                        </div>
                    </div>

                    <div className="card">
                        <h5 style={{ marginTop: 0 }}>Contact & enquiry</h5>
                        <Field label="Name"><InputText value={form.name} onChange={(e) => setField("name", e.target.value)} disabled={!canWrite} style={{ width: "100%" }} /></Field>
                        <Field label="Email"><InputText value={form.email} onChange={(e) => setField("email", e.target.value)} disabled={!canWrite} style={{ width: "100%" }} /></Field>
                        <Field label="Phone"><InputText value={form.phone} onChange={(e) => setField("phone", e.target.value)} disabled={!canWrite} style={{ width: "100%" }} /></Field>
                        <Field label="Company"><InputText value={form.company} onChange={(e) => setField("company", e.target.value)} disabled={!canWrite} style={{ width: "100%" }} /></Field>
                        <Field label="Product category"><InputText value={form.productCategory} onChange={(e) => setField("productCategory", e.target.value)} disabled={!canWrite} style={{ width: "100%" }} /></Field>
                        <Field label="MOQ"><InputText value={form.moq} onChange={(e) => setField("moq", e.target.value)} disabled={!canWrite} style={{ width: "100%" }} /></Field>
                        <Field label="Original query / message"><InputTextarea value={form.message} onChange={(e) => setField("message", e.target.value)} rows={4} autoResize disabled={!canWrite} style={{ width: "100%" }} /></Field>
                        <Field label="Internal notes"><InputTextarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={3} autoResize disabled={!canWrite} style={{ width: "100%" }} placeholder="Team-only notes…" /></Field>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>Received {moment(lead.createdAt).format("DD MMM YYYY, hh:mm a")}</div>
                    </div>
                </div>

                {/* RIGHT: activity timeline */}
                <div className="col-12 lg:col-7">
                    <div className="card">
                        <h5 style={{ marginTop: 0 }}>Log an interaction</h5>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                            <Dropdown value={activity.type} options={ACTIVITY_TYPES} onChange={(e) => setActivity((a) => ({ ...a, type: e.value }))} disabled={!canWrite} style={{ minWidth: 150 }} />
                            <Dropdown value={activity.status} options={STATUS_OPTIONS} onChange={(e) => setActivity((a) => ({ ...a, status: e.value }))} placeholder="Move to…" showClear disabled={!canWrite} style={{ minWidth: 150 }} />
                            <Calendar value={activity.nextFollowUpAt} onChange={(e) => setActivity((a) => ({ ...a, nextFollowUpAt: e.value }))} placeholder="Next follow-up" dateFormat="dd M yy" showIcon disabled={!canWrite} style={{ minWidth: 180 }} />
                        </div>
                        <InputTextarea
                            value={activity.note}
                            onChange={(e) => setActivity((a) => ({ ...a, note: e.target.value }))}
                            rows={3}
                            autoResize
                            disabled={!canWrite}
                            style={{ width: "100%" }}
                            placeholder="What happened on this call / message? Add the outcome…"
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                            <Button icon="pi pi-send" label="Log activity" onClick={logActivity} loading={logging} disabled={!canWrite} />
                        </div>
                    </div>

                    <div className="card">
                        <h5 style={{ marginTop: 0 }}>Activity timeline <span style={{ color: "#9ca3af", fontWeight: 400 }}>({timeline.length})</span></h5>
                        {timeline.length === 0 ? (
                            <p style={{ color: "#9ca3af" }}>No activity logged yet. Record your first call or note above.</p>
                        ) : (
                            <div style={{ position: "relative" }}>
                                {timeline.map((a, i) => (
                                    <div key={a._id || i} style={{ display: "flex", gap: 12, paddingBottom: 18, position: "relative" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <i className={ACTIVITY_ICON[a.type] || "pi pi-comment"} style={{ fontSize: 14 }} />
                                            </span>
                                            {i < timeline.length - 1 ? <span style={{ flex: 1, width: 2, background: "#eceef3", marginTop: 4 }} /> : null}
                                        </div>
                                        <div style={{ flex: 1, paddingTop: 3 }}>
                                            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>
                                                <span style={{ textTransform: "capitalize", fontWeight: 700, color: "#6b7280" }}>{a.type}</span>
                                                {" · "}{moment(a.at).format("DD MMM YYYY, hh:mm a")}
                                                {a.by ? ` · ${a.by}` : ""}
                                            </div>
                                            <div style={{ whiteSpace: "pre-wrap", color: "#374151" }}>{a.note}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
