import React, { useEffect, useState, useCallback } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";

import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { handlePostRequest } from "../../services/PostTemplate";
import { can } from "../../rbac/permissions";
import { EmailPreview, PushPreview } from "./NotificationPreview";

const channelSeverity = { email: "info", push: "warning", inapp: "success" };

const AUDIENCE_OPTIONS = [
    { label: "All customers", value: "all" },
    { label: "By role", value: "role" },
    { label: "Specific user IDs", value: "users" },
];

const ROLE_OPTIONS = [
    { label: "Customer", value: "user" },
    { label: "Catalog Manager", value: "catalog-manager" },
    { label: "Admin", value: "admin" },
];

function Notifications() {
    const dispatch = useDispatch();
    const canWrite = can("notification:write");

    /* ----------------------------- Templates ----------------------------- */
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [editing, setEditing] = useState(null);
    const [savingTemplate, setSavingTemplate] = useState(false);

    const fetchTemplates = useCallback(async () => {
        setLoadingTemplates(true);
        try {
            const res = await handleGetRequest("/notification/templates");
            setTemplates(Array.isArray(res?.data) ? res.data : []);
        } catch (e) {
            console.error("Failed to load templates", e);
        } finally {
            setLoadingTemplates(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const saveTemplate = async () => {
        if (!editing) return;
        setSavingTemplate(true);
        try {
            const body = {
                name: editing.name,
                subject: editing.subject,
                body: editing.body,
                description: editing.description,
                isActive: editing.isActive,
            };
            const res = await handlePutRequest(body, `/notification/templates/${editing.key}`);
            if (res?.success) {
                toast.success("Template updated");
                setEditing(null);
                fetchTemplates();
            }
        } finally {
            setSavingTemplate(false);
        }
    };

    const channelTemplate = (row) => <Tag value={row.channel} severity={channelSeverity[row.channel] || "secondary"} />;
    const activeTemplate = (row) => <Tag value={row.isActive ? "Active" : "Inactive"} severity={row.isActive ? "success" : "danger"} />;
    const editButton = (row) => (
        <Button
            icon="pi pi-pencil"
            className="p-button-text"
            disabled={!canWrite}
            tooltip={canWrite ? "Edit template" : "Read-only"}
            onClick={() => setEditing({ description: "", ...row })}
        />
    );

    /* ----------------------------- Send ----------------------------- */
    const [audience, setAudience] = useState("all");
    const [role, setRole] = useState("user");
    const [userIds, setUserIds] = useState("");
    const [title, setTitle] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [dataJson, setDataJson] = useState("");
    const [alsoEmail, setAlsoEmail] = useState(false);
    const [sending, setSending] = useState(false);

    const sendNotification = async () => {
        if (!title.trim()) {
            toast.warn("Title is required");
            return;
        }
        let data = {};
        if (dataJson.trim()) {
            try {
                data = JSON.parse(dataJson);
            } catch {
                toast.warn("Deep-link data must be valid JSON");
                return;
            }
        }
        const payload = { audience, title: title.trim(), body: bodyText, data, email: alsoEmail };
        if (audience === "role") payload.role = role;
        if (audience === "users") payload.userIds = userIds.split(",").map((s) => s.trim()).filter(Boolean);

        setSending(true);
        try {
            const res = await dispatch(handlePostRequest(payload, "/notification/send", true, false));
            if (res && res !== "error" && res?.success) {
                toast.success(res.message || "Notification sent");
                setTitle("");
                setBodyText("");
                setDataJson("");
                setUserIds("");
                setAlsoEmail(false);
                fetchCampaigns();
            }
        } finally {
            setSending(false);
        }
    };

    /* ----------------------------- History ----------------------------- */
    const [campaigns, setCampaigns] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    const fetchCampaigns = useCallback(async () => {
        setLoadingCampaigns(true);
        try {
            const res = await handleGetRequest("/notification/campaigns");
            setCampaigns(Array.isArray(res?.data) ? res.data : []);
        } catch (e) {
            console.error("Failed to load campaigns", e);
        } finally {
            setLoadingCampaigns(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const dateTemplate = (row) => moment(row.createdAt).format("DD-MM-YY hh:mm a");

    return (
        <div className="Page__Header" style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <h2>Notifications</h2>
                {!canWrite && <p style={{ color: "#94a3b8" }}>You have read-only access to notifications.</p>}
            </div>

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <TabView>
                            {/* ---------- Templates ---------- */}
                            <TabPanel header="Templates">
                                <p style={{ color: "#64748b", marginBottom: 12 }}>
                                    Edit the wording of every email, push and in-app notification. Use the{" "}
                                    <code>{`{{placeholder}}`}</code> variables listed in each template.
                                </p>
                                <DataTable
                                    value={templates}
                                    loading={loadingTemplates}
                                    paginator
                                    rows={10}
                                    responsiveLayout="scroll"
                                    emptyMessage="No templates found."
                                >
                                    <Column field="name" header="Name" sortable />
                                    <Column field="channel" header="Channel" body={channelTemplate} sortable />
                                    <Column field="key" header="Key" />
                                    <Column field="isActive" header="Status" body={activeTemplate} />
                                    <Column header="Actions" body={editButton} style={{ width: 90 }} />
                                </DataTable>
                            </TabPanel>

                            {/* ---------- Send ---------- */}
                            <TabPanel header="Send">
                              <div className="grid">
                                <div className="col-12 md:col-7">
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2">Audience</label>
                                        <Dropdown
                                            value={audience}
                                            options={AUDIENCE_OPTIONS}
                                            onChange={(e) => setAudience(e.value)}
                                            className="w-full"
                                            disabled={!canWrite}
                                        />
                                    </div>
                                    {audience === "role" && (
                                        <div className="col-12 md:col-6">
                                            <label className="block mb-2">Role</label>
                                            <Dropdown value={role} options={ROLE_OPTIONS} onChange={(e) => setRole(e.value)} className="w-full" disabled={!canWrite} />
                                        </div>
                                    )}
                                    {audience === "users" && (
                                        <div className="col-12">
                                            <label className="block mb-2">User IDs (comma separated)</label>
                                            <InputText value={userIds} onChange={(e) => setUserIds(e.target.value)} className="w-full" disabled={!canWrite} />
                                        </div>
                                    )}
                                    <div className="col-12">
                                        <label className="block mb-2">Title</label>
                                        <InputText value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" disabled={!canWrite} />
                                    </div>
                                    <div className="col-12">
                                        <label className="block mb-2">Message</label>
                                        <InputTextarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={4} className="w-full" disabled={!canWrite} />
                                    </div>
                                    <div className="col-12">
                                        <label className="block mb-2">Deep-link data (optional JSON)</label>
                                        <InputTextarea
                                            value={dataJson}
                                            onChange={(e) => setDataJson(e.target.value)}
                                            rows={2}
                                            placeholder='e.g. {"type":"product","slug":"corrugated-box"}'
                                            className="w-full"
                                            disabled={!canWrite}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="block mb-2">Channels</label>
                                        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Checkbox checked disabled />
                                                <span>In-app &amp; push (mobile)</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Checkbox inputId="alsoEmail" checked={alsoEmail} disabled={!canWrite} onChange={(e) => setAlsoEmail(e.checked)} />
                                                <label htmlFor="alsoEmail">Also send via email</label>
                                            </div>
                                        </div>
                                        <small style={{ color: "#94a3b8" }}>
                                            In-app/push is always delivered. Email is sent to each recipient's inbox when enabled.
                                        </small>
                                    </div>
                                    <div className="col-12">
                                        <Button label="Send Notification" icon="pi pi-send" loading={sending} disabled={!canWrite} onClick={sendNotification} />
                                    </div>
                                </div>
                                </div>
                                <div className="col-12 md:col-5">
                                    <label className="block mb-2">Preview</label>
                                    <PushPreview title={title} body={bodyText} />
                                </div>
                              </div>
                            </TabPanel>

                            {/* ---------- History ---------- */}
                            <TabPanel header="History">
                                <div style={{ marginBottom: 10 }}>
                                    <Button label="Refresh" icon="pi pi-refresh" className="p-button-text" onClick={fetchCampaigns} />
                                </div>
                                <DataTable
                                    value={campaigns}
                                    loading={loadingCampaigns}
                                    paginator
                                    rows={10}
                                    responsiveLayout="scroll"
                                    emptyMessage="No notifications sent yet."
                                >
                                    <Column field="title" header="Title" />
                                    <Column field="audience" header="Audience" />
                                    <Column field="recipientCount" header="Recipients" />
                                    <Column field="pushSent" header="Push Sent" />
                                    <Column field="emailSent" header="Email Sent" />
                                    <Column field="createdByName" header="Sent By" />
                                    <Column field="createdAt" header="Sent At" body={dateTemplate} />
                                </DataTable>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>

            {/* ---------- Edit template dialog ---------- */}
            <Dialog
                header={editing ? `Edit: ${editing.name}` : ""}
                visible={!!editing}
                style={{ width: "min(720px, 95vw)" }}
                onHide={() => setEditing(null)}
            >
                {editing && (
                    <div className="grid">
                        <div className="col-12">
                            <label className="block mb-2">Name</label>
                            <InputText value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full" />
                        </div>
                        <div className="col-12">
                            <label className="block mb-2">{editing.channel === "email" ? "Email subject" : "Title"}</label>
                            <InputText value={editing.subject || ""} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="w-full" />
                        </div>
                        <div className="col-12">
                            <label className="block mb-2">{editing.channel === "email" ? "Body (HTML)" : "Body"}</label>
                            <InputTextarea value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={editing.channel === "email" ? 14 : 5} className="w-full" />
                        </div>
                        {Array.isArray(editing.variables) && editing.variables.length > 0 && (
                            <div className="col-12">
                                <label className="block mb-2">Available variables</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {editing.variables.map((v) => (
                                        <Tag key={v} value={`{{${v}}}`} severity="secondary" />
                                    ))}
                                </div>
                            </div>
                        )}
                        {editing.description ? (
                            <div className="col-12">
                                <small style={{ color: "#94a3b8" }}>{editing.description}</small>
                            </div>
                        ) : null}
                        <div className="col-12">
                            <label className="block mb-2">Preview (with sample data)</label>
                            {editing.channel === "email" ? (
                                <EmailPreview subject={editing.subject} body={editing.body} />
                            ) : (
                                <PushPreview title={editing.subject} body={editing.body} />
                            )}
                        </div>
                        <div className="col-12" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <InputSwitch checked={!!editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.value })} />
                            <span>Active (uncheck to revert to the built-in default)</span>
                        </div>
                        <div className="col-12" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <Button label="Cancel" className="p-button-text" onClick={() => setEditing(null)} />
                            <Button label="Save" icon="pi pi-check" loading={savingTemplate} disabled={!canWrite} onClick={saveTemplate} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default Notifications;
