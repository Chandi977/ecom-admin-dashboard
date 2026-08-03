import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import { can } from "../../rbac/permissions";

const postJson = (data, url) => handlePostRequest(data, url, false, false)(() => {});

const STATUS_OPTIONS = [
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "Qualified", value: "qualified" },
    { label: "Converted", value: "converted" },
    { label: "Closed", value: "closed" },
];

const SOURCE_OPTIONS = ["phone", "website", "instagram", "whatsapp", "facebook", "email", "referral", "walk-in", "manual", "other"]
    .map((s) => ({ label: s, value: s }));

const EMPTY = {
    name: "", email: "", phone: "", source: "phone", status: "new",
    assignedTo: "", company: "", productCategory: "", moq: "", message: "",
};

export default function LeadCreate({ visible, onHide, onCreated }) {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    // /lead/admin-create is gated on contact:write.
    const canWrite = can("contact:write");
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const close = () => {
        setForm(EMPTY);
        onHide?.();
    };

    const submit = async () => {
        if (!canWrite) {
            toast.info("You do not have permission to create leads.");
            return;
        }
        if (!form.name.trim()) {
            toast.warn("Name is required");
            return;
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            toast.warn("Enter a valid email or leave it blank");
            return;
        }
        // Send only the fields that were actually filled in.
        const payload = { name: form.name.trim(), source: form.source || "manual", status: form.status };
        ["email", "phone", "assignedTo", "company", "productCategory", "moq", "message"].forEach((k) => {
            if (form[k] && form[k].trim()) payload[k] = form[k].trim();
        });

        setSaving(true);
        const res = await postJson(payload, "/lead/admin-create");
        setSaving(false);
        if (res && res !== "error" && res.success) {
            toast.success("Lead created");
            const created = res.data;
            setForm(EMPTY);
            onHide?.();
            onCreated?.(created);
        }
    };

    const footer = (
        <div>
            <Button label="Cancel" className="p-button-text" onClick={close} />
            <Button label="Create lead" icon="pi pi-check" onClick={submit} loading={saving} disabled={!canWrite} />
        </div>
    );

    return (
        <Dialog header="New lead" visible={visible} style={{ width: "620px", maxWidth: "96vw" }} onHide={close} modal footer={footer}>
            <p style={{ color: "#6b7280", marginTop: 0 }}>
                Manually record a lead (phone enquiry, referral, walk-in…). No email is sent — the contact is not
                notified. Add the email if you have it; you can run the deliverability check later.
            </p>
            {!canWrite && (
                <p style={{ color: "#b42318", marginTop: 0 }}>
                    Read-only for your role — creating leads needs the contact permission.
                </p>
            )}
            <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-6">
                    <label>Name *</label>
                    <InputText value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contact name" />
                </div>
                <div className="field col-12 md:col-6">
                    <label>Phone</label>
                    <InputText value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Contact number" />
                </div>
                <div className="field col-12 md:col-6">
                    <label>Email</label>
                    <InputText value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
                </div>
                <div className="field col-12 md:col-6">
                    <label>Source</label>
                    <Dropdown value={form.source} options={SOURCE_OPTIONS} onChange={(e) => set("source", e.value)} editable placeholder="How did they reach us?" />
                </div>
                <div className="field col-12 md:col-6">
                    <label>Status</label>
                    <Dropdown value={form.status} options={STATUS_OPTIONS} onChange={(e) => set("status", e.value)} />
                </div>
                <div className="field col-12 md:col-6">
                    <label>Assigned to</label>
                    <InputText value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} placeholder="e.g. Amit, Tarandeep" />
                </div>
                <div className="field col-12 md:col-6">
                    <label>Company</label>
                    <InputText value={form.company} onChange={(e) => set("company", e.target.value)} />
                </div>
                <div className="field col-12 md:col-3">
                    <label>Product category</label>
                    <InputText value={form.productCategory} onChange={(e) => set("productCategory", e.target.value)} />
                </div>
                <div className="field col-12 md:col-3">
                    <label>MOQ</label>
                    <InputText value={form.moq} onChange={(e) => set("moq", e.target.value)} />
                </div>
                <div className="field col-12">
                    <label>Query / requirement</label>
                    <InputTextarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} autoResize />
                </div>
            </div>
        </Dialog>
    );
}
