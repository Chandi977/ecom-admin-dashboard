import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { SelectButton } from "primereact/selectbutton";
import { toast } from "react-toastify";
import moment from "moment/moment";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePatchRequest } from "../../services/PatchTemplate";
import { can } from "../../rbac/permissions";
import LeadsImport from "./LeadsImport";
import LeadCreate from "./LeadCreate";

const STATUS_OPTIONS = [
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "Qualified", value: "qualified" },
    { label: "Converted", value: "converted" },
    { label: "Closed", value: "closed" },
];

const STATUS_SEVERITY = { new: "info", contacted: "warning", qualified: null, converted: "success", closed: "danger" };
const STATUS_COLORS = { new: "#3b82f6", contacted: "#f59e0b", qualified: "#8b5cf6", converted: "#16a34a", closed: "#ef4444" };
const STATUS_LABELS = STATUS_OPTIONS.reduce((map, opt) => ({ ...map, [opt.value]: opt.label }), {});

// 3-state email badge. "Unverified" (grey) means no real deliverability check
// has run yet (e.g. imported leads) — not the same as a failed check ("Risky").
const emailBadge = (lead) => !lead.emailChecked
    ? { label: "Unverified", style: { background: "#e5e7eb", color: "#6b7280" } }
    : lead.emailVerified
        ? { label: "Deliverable", style: { background: "#dcfce7", color: "#15803d" } }
        : { label: "Risky", style: { background: "#fee2e2", color: "#b91c1c" } };

const VIEW_OPTIONS = [
    { label: "Board", value: "board", icon: "pi pi-th-large" },
    { label: "List", value: "list", icon: "pi pi-list" },
];

const CSV_COLUMNS = ["name", "email", "phone", "source", "company", "productCategory", "moq", "message", "status", "assignedTo", "disposition", "emailVerified", "notes", "createdAt"];

const truncate = (text, len) => (text && text.length > len ? `${text.slice(0, len)}…` : text);

const BOARD_CSS = `
.crm-board { display: flex; gap: 16px; overflow-x: auto; padding: 4px 2px 12px; align-items: flex-start; }
.crm-col { flex: 0 0 300px; background: #f7f8fb; border: 1px solid #eceef3; border-radius: 14px; display: flex; flex-direction: column; max-height: 74vh; }
.crm-col-head { display: flex; align-items: center; gap: 8px; padding: 14px 16px; border-bottom: 1px solid #eceef3; }
.crm-col-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.crm-col-title { font-weight: 700; color: #1f2937; font-size: 14px; }
.crm-col-count { margin-left: auto; background: #fff; border: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; font-weight: 700; border-radius: 999px; padding: 1px 9px; }
.crm-col-body { padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; min-height: 90px; }
.crm-card { background: #fff; border: 1px solid #ecedf1; border-left: 3px solid var(--accent, #cbd5e1); border-radius: 12px; padding: 12px 14px; cursor: pointer; transition: box-shadow .15s ease, transform .15s ease; }
.crm-card:hover { box-shadow: 0 8px 20px rgba(17, 24, 39, .10); transform: translateY(-2px); }
.crm-card-name { font-weight: 700; color: #111827; font-size: 14.5px; }
.crm-card-line { font-size: 12.5px; color: #6b7280; margin-top: 3px; word-break: break-word; }
.crm-card-msg { font-size: 12.5px; color: #4b5563; margin-top: 8px; white-space: pre-wrap; }
.crm-card-foot { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; font-size: 11px; color: #9ca3af; }
.crm-chip { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; letter-spacing: .2px; }
.crm-col-empty { text-align: center; color: #b6bcc7; font-size: 12.5px; padding: 18px 6px; }
`;

function StatCard({ label, value, color }) {
    return (
        <div className="col-6 md:col-2">
            <div className="card" style={{ textAlign: "center", padding: "16px", marginBottom: 0, height: "100%" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: color || "#4b5563" }}>{value}</div>
                <div style={{ color: "#888", fontSize: "13px", marginTop: 4 }}>{label}</div>
            </div>
        </div>
    );
}

function LeadCard({ lead, onOpen, onQuickStatus, saving, canWrite }) {
    const followUp = lead.nextFollowUpAt ? moment(lead.nextFollowUpAt) : null;
    const overdue = followUp && followUp.isBefore(moment(), "day");
    return (
        <div className="crm-card" style={{ "--accent": STATUS_COLORS[lead.status] }} onClick={() => onOpen(lead)}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <span className="crm-card-name">{lead.name}</span>
                <span className="crm-chip" style={{ background: "#eef2ff", color: "#4f46e5" }}>{lead.source || "—"}</span>
            </div>
            {lead.company ? <div className="crm-card-line" style={{ fontWeight: 600, color: "#374151" }}>{lead.company}</div> : null}
            {lead.productCategory || lead.moq ? (
                <div className="crm-card-line">
                    {lead.productCategory ? `Category: ${lead.productCategory}` : ""}
                    {lead.productCategory && lead.moq ? " · " : ""}
                    {lead.moq ? `MOQ: ${lead.moq}` : ""}
                </div>
            ) : null}
            <div className="crm-card-line">{lead.email || lead.phone || "—"}</div>
            {lead.message ? <div className="crm-card-msg">{truncate(lead.message, 110)}</div> : null}
            {lead.assignedTo ? <div className="crm-card-line" style={{ color: "#0ea5e9" }}><i className="pi pi-user" style={{ fontSize: 11 }} /> {lead.assignedTo}</div> : null}
            <div className="crm-card-foot">
                <span className="crm-chip" style={emailBadge(lead).style}>{emailBadge(lead).label}</span>
                {followUp ? (
                    <span className="crm-chip" style={overdue ? { background: "#fee2e2", color: "#b91c1c" } : { background: "#dbeafe", color: "#1d4ed8" }}>
                        <i className="pi pi-clock" style={{ fontSize: 10 }} /> {followUp.format("DD MMM")}
                    </span>
                ) : null}
                <span style={{ marginLeft: "auto" }}>{moment(lead.createdAt).format("DD MMM")}</span>
            </div>
            <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 10 }}>
                <Dropdown
                    value={lead.status}
                    options={STATUS_OPTIONS}
                    onChange={(e) => onQuickStatus(lead, e.value)}
                    disabled={saving || !canWrite}
                    style={{ width: "100%" }}
                />
            </div>
        </div>
    );
}

export default function LeadsCRM() {
    const history = useHistory();
    const home = { icon: "pi pi-home", url: "/" };
    const breadItems = [{ label: "Leads CRM" }];

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("list");
    const [statusFilter, setStatusFilter] = useState(null);
    const [sourceFilter, setSourceFilter] = useState(null);
    const [search, setSearch] = useState("");
    const [savingId, setSavingId] = useState(null);
    const [importOpen, setImportOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    // Creating / importing / re-staging a lead all write to the lead module,
    // which is gated on contact:write. Reading the pipeline is not.
    const canWrite = can("contact:write");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await handleGetRequest("/lead/get");
        if (res?.data) setLeads(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openLead = (lead) => history.push(`/leads/${lead._id}`);

    const sourceOptions = useMemo(() => {
        const set = new Set(leads.map((l) => l.source).filter(Boolean));
        return Array.from(set).map((s) => ({ label: s, value: s }));
    }, [leads]);

    const stats = useMemo(() => {
        const s = { total: leads.length, new: 0, qualified: 0, converted: 0, due: 0 };
        const today = moment().endOf("day");
        leads.forEach((l) => {
            if (s[l.status] !== undefined) s[l.status] += 1;
            if (l.nextFollowUpAt && moment(l.nextFollowUpAt).isSameOrBefore(today)) s.due += 1;
        });
        return s;
    }, [leads]);

    const conversionRate = stats.total ? Math.round((stats.converted / stats.total) * 100) : 0;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return leads.filter((l) => {
            if (statusFilter && l.status !== statusFilter) return false;
            if (sourceFilter && l.source !== sourceFilter) return false;
            if (!q) return true;
            return [l.name, l.email, l.phone, l.message, l.source, l.company, l.productCategory, l.moq, l.assignedTo, l.disposition, l.notes]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q));
        });
    }, [leads, statusFilter, sourceFilter, search]);

    const leadsByStatus = useMemo(() => {
        const groups = STATUS_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: [] }), {});
        filtered.forEach((l) => {
            if (groups[l.status]) groups[l.status].push(l);
            else if (groups.new) groups.new.push(l);
        });
        return groups;
    }, [filtered]);

    const changeStatus = async (lead, status) => {
        if (!canWrite) {
            toast.info("You have read-only access to leads.");
            return;
        }
        if (!status || status === lead.status) return;
        setSavingId(lead._id);
        const res = await handlePatchRequest({ status }, `/lead/${lead._id}`);
        setSavingId(null);
        if (res?.success) {
            setLeads((prev) => prev.map((l) => (l._id === lead._id ? { ...l, status, updatedAt: res.data?.updatedAt || l.updatedAt } : l)));
            toast.success(`Moved to ${STATUS_LABELS[status]}`);
        }
    };

    const exportCSV = () => {
        if (!filtered.length) {
            toast.info("No leads to export");
            return;
        }
        const escape = (v) => `"${(v === undefined || v === null ? "" : String(v)).replace(/"/g, '""')}"`;
        const rows = filtered.map((l) => CSV_COLUMNS.map((c) => escape(c === "createdAt" ? moment(l[c]).format("YYYY-MM-DD HH:mm") : l[c])).join(","));
        const blob = new Blob([[CSV_COLUMNS.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-${moment().format("YYYYMMDD-HHmm")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- list view bodies ---
    const contactBody = (r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600 }}>{r.email || "—"}</span>
            {r.phone ? <span style={{ color: "#666", fontSize: 13 }}>{r.phone}</span> : null}
        </div>
    );
    const enquiryBody = (r) => {
        const hasStructured = r.company || r.productCategory || r.moq;
        return (
            <div style={{ maxWidth: 320 }}>
                {r.company ? <div style={{ fontWeight: 600 }}>{r.company}</div> : null}
                {r.productCategory || r.moq ? (
                    <div style={{ fontSize: 12, color: "#666" }}>
                        {r.productCategory ? `Category: ${r.productCategory}` : ""}
                        {r.productCategory && r.moq ? " · " : ""}
                        {r.moq ? `MOQ: ${r.moq}` : ""}
                    </div>
                ) : null}
                {r.message ? <div style={{ whiteSpace: "pre-wrap", fontSize: 13, marginTop: 4 }}>{truncate(r.message, 140)}</div> : !hasStructured ? "—" : null}
            </div>
        );
    };
    const statusBody = (r) => (
        <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 150 }}>
            <Tag severity={STATUS_SEVERITY[r.status]} value={STATUS_LABELS[r.status] || r.status} />
            <Dropdown value={r.status} options={STATUS_OPTIONS} onChange={(e) => changeStatus(r, e.value)} disabled={savingId === r._id || !canWrite} style={{ width: "100%" }} />
        </div>
    );

    return (
        <>
            <style>{BOARD_CSS}</style>

            <div className="Page__Header">
                <div>
                    <h2>Leads CRM</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="Top__Btn" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <SelectButton value={view} options={VIEW_OPTIONS} onChange={(e) => e.value && setView(e.value)} itemTemplate={(opt) => <i className={opt.icon} title={opt.label} />} />
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..." />
                    </span>
                    <Dropdown value={statusFilter} options={STATUS_OPTIONS} onChange={(e) => setStatusFilter(e.value)} placeholder="All statuses" showClear style={{ minWidth: 150 }} />
                    <Dropdown value={sourceFilter} options={sourceOptions} onChange={(e) => setSourceFilter(e.value)} placeholder="All sources" showClear style={{ minWidth: 150 }} />
                    {canWrite && <Button icon="pi pi-plus" label="New Lead" onClick={() => setCreateOpen(true)} />}
                    {canWrite && <Button icon="pi pi-upload" label="Import CSV" className="p-button-outlined p-button-help" onClick={() => setImportOpen(true)} />}
                    <Button icon="pi pi-download" label="Export" className="p-button-outlined" onClick={exportCSV} />
                    <Button icon="pi pi-refresh" label="Refresh" onClick={load} loading={loading} />
                </div>
            </div>

            <p style={{ color: "#888", marginTop: "12px", marginBottom: "16px" }}>
                Every enquiry from the website contact and custom-packaging forms lands here. Click a lead to open its
                workspace — log calls, add follow-ups and notes. Use the status dropdown to move it through the pipeline.
            </p>
            {!canWrite && (
                <p style={{ color: "#94a3b8", marginTop: "-8px", marginBottom: "16px" }}>
                    You have read-only access to leads — pipeline changes are disabled.
                </p>
            )}

            <div className="grid">
                <StatCard label="Total leads" value={stats.total} color="#6366f1" />
                <StatCard label="New" value={stats.new} color="#3b82f6" />
                <StatCard label="Qualified" value={stats.qualified} color="#8b5cf6" />
                <StatCard label="Converted" value={stats.converted} color="#16a34a" />
                <StatCard label="Conversion" value={`${conversionRate}%`} color="#0ea5e9" />
                <StatCard label="Follow-ups due" value={stats.due} color={stats.due ? "#ef4444" : "#9ca3af"} />
            </div>

            {view === "board" ? (
                <div className="crm-board">
                    {STATUS_OPTIONS.map((col) => (
                        <div key={col.value} className="crm-col">
                            <div className="crm-col-head">
                                <span className="crm-col-dot" style={{ background: STATUS_COLORS[col.value] }} />
                                <span className="crm-col-title">{col.label}</span>
                                <span className="crm-col-count">{leadsByStatus[col.value].length}</span>
                            </div>
                            <div className="crm-col-body">
                                {leadsByStatus[col.value].map((lead) => (
                                    <LeadCard key={lead._id} lead={lead} onOpen={openLead} onQuickStatus={changeStatus} saving={savingId === lead._id} canWrite={canWrite} />
                                ))}
                                {leadsByStatus[col.value].length === 0 ? <div className="crm-col-empty">{loading ? "Loading…" : "No leads"}</div> : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid">
                    <div className="col-12">
                        <div className="card">
                            <DataTable
                                className="datatable-responsive"
                                value={filtered}
                                dataKey="_id"
                                paginator
                                rows={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                responsiveLayout="scroll"
                                loading={loading}
                                emptyMessage="No leads found."
                                onRowClick={(e) => openLead(e.data)}
                                rowClassName={() => "cursor-pointer"}
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} leads"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            >
                                <Column field="name" header="Name" sortable style={{ minWidth: 130 }} />
                                <Column header="Contact" body={contactBody} style={{ minWidth: 180 }} />
                                <Column field="source" header="Source" sortable body={(r) => <Tag severity="info" value={r.source || "—"} />} />
                                <Column field="message" header="Enquiry" body={enquiryBody} style={{ minWidth: 280 }} />
                                <Column field="assignedTo" header="Assigned to" body={(r) => r.assignedTo || "—"} />
                                <Column header="Email" body={(r) => <Tag value={emailBadge(r).label} style={emailBadge(r).style} />} />
                                <Column field="status" header="Status" sortable body={statusBody} style={{ minWidth: 160 }} />
                                <Column
                                    field="createdAt"
                                    header="Received"
                                    sortable
                                    body={(r) => (
                                        <div>
                                            <p style={{ margin: 0 }}>{moment(r.createdAt).format("DD-MM-YY")}</p>
                                            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>{moment(r.createdAt).format("hh:mm a")}</p>
                                        </div>
                                    )}
                                />
                                <Column header="" body={(r) => <Button icon="pi pi-arrow-right" className="p-button-text p-button-rounded" onClick={(e) => { e.stopPropagation(); openLead(r); }} tooltip="Open" tooltipOptions={{ position: "left" }} />} style={{ width: 60 }} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            )}

            <LeadsImport visible={importOpen} onHide={() => setImportOpen(false)} onImported={load} />
            <LeadCreate visible={createOpen} onHide={() => setCreateOpen(false)} onCreated={(lead) => history.push(`/leads/${lead._id}`)} />
        </>
    );
}
