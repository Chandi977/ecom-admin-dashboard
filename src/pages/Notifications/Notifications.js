import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { AutoComplete } from "primereact/autocomplete";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";

import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { handlePostRequest } from "../../services/PostTemplate";
import { productService } from "../../services/productService";
import { can } from "../../rbac/permissions";
import { NotificationRequests } from "../Notify/notify";
import { EmailPreview, PushPreview } from "./NotificationPreview";

const channelSeverity = { email: "info", push: "warning", inapp: "success" };

const AUDIENCE_OPTIONS = [
    { label: "All customers", value: "all" },
    { label: "By role", value: "role" },
    { label: "Specific users", value: "users" },
];

const ROLE_OPTIONS = [
    { label: "Customer", value: "user" },
    { label: "Catalog Manager", value: "catalog-manager" },
    { label: "Admin", value: "admin" },
];

// What tapping the notification opens on the phone. The produced `data` payload
// must match the mobile deep-link resolver (type + productId / orderId).
const LINK_TYPE_OPTIONS = [
    { label: "Nothing (just show it)", value: "none" },
    { label: "Open a product", value: "product" },
    { label: "Open an order", value: "order" },
    { label: "Custom JSON (advanced)", value: "custom" },
];

// Android notification channel — order updates get their own channel so users
// can mute promos without losing transactional alerts.
const CHANNEL_OPTIONS = [
    { label: "Offers & Promotions", value: "promotions" },
    { label: "Order Updates", value: "orders" },
];

const NOTIFICATIONS_PAGE_CSS = `
.notifications-page {
    align-items: stretch !important;
    width: 100%;
}
.notifications-page-title {
    width: 100%;
}
.notifications-grid {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
}
.notifications-grid > .col-12 {
    padding-left: 0;
    padding-right: 0;
}
.notifications-card {
    width: 100%;
    margin-bottom: 0;
}
.notifications-card .p-tabview,
.notifications-card .p-tabview-panels,
.notifications-card .p-tabview-panel,
.notifications-card .p-datatable,
.notifications-card .p-datatable-wrapper {
    width: 100%;
}
.recipient-picker {
    width: 100%;
}
.recipient-picker .p-autocomplete-multiple-container {
    width: 100%;
    min-height: 46px;
    padding: 0.35rem 0.5rem;
    gap: 0.35rem;
}
.recipient-picker .p-autocomplete-token {
    max-width: 100%;
}
.recipient-picker .p-autocomplete-token-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.recipient-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-width: 0;
    padding: 0.2rem 0;
}
.recipient-option-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 0.2rem;
}
.recipient-option-name {
    color: #1f2937;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.recipient-option-meta {
    color: #64748b;
    font-size: 0.78rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.recipient-option-id {
    color: #64748b;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.72rem;
}
.recipient-option-side {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.15rem;
}
.recipient-option-role {
    color: #475569;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}
.recipient-picker-help {
    display: block;
    min-height: 1.15rem;
    margin-top: 0.4rem;
    color: #64748b;
}
.recipient-picker-help.is-error {
    color: #b42318;
}
`;

// Best-effort pick of a product's primary image across possible shapes.
const productImage = (p) =>
    p?.image?.[0]?.url || p?.images?.[0]?.url || p?.image?.[0] || p?.images?.[0] || (typeof p?.image === "string" ? p.image : "") || "";

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
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [recipientSuggestions, setRecipientSuggestions] = useState([]);
    const [recipientSearchStatus, setRecipientSearchStatus] = useState("idle");
    const recipientSearchRequestRef = useRef(0);
    const [title, setTitle] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFileName, setImageFileName] = useState("");
    const [imageUploadProgress, setImageUploadProgress] = useState(0);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [channelId, setChannelId] = useState("promotions");
    const [linkType, setLinkType] = useState("none");
    const [linkProduct, setLinkProduct] = useState(null); // { label, value, image }
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [orderId, setOrderId] = useState("");
    const [dataJson, setDataJson] = useState("");
    const [alsoEmail, setAlsoEmail] = useState(false);
    const [sending, setSending] = useState(false);

    const clearNotificationImage = () => {
        setImageUrl("");
        setImageFileName("");
        setImageUploadProgress(0);
    };

    const handleNotificationImageUpload = async (file) => {
        if (!file) return;
        if (!file.type?.startsWith("image/")) {
            toast.warn("Upload an image file");
            return;
        }

        setImageFileName(file.name);
        setImageUploadProgress(0);
        setUploadingImage(true);
        try {
            const result = await productService.uploadImage(file, (percent) => {
                setImageUploadProgress(percent);
            });

            if (!result?.url) {
                throw new Error("Upload response did not include an image URL");
            }

            setImageUrl(result.url);
            setImageUploadProgress(100);
            toast.success("Image uploaded");
        } catch (error) {
            clearNotificationImage();
            toast.error(`Image upload failed: ${error?.message || "Something went wrong"}`);
        } finally {
            setUploadingImage(false);
        }
    };

    // Type-ahead product search for the "open a product" deep link.
    const searchProducts = async (e) => {
        try {
            const res = await productService.searchProducts({ q: e.query });
            const list = Array.isArray(res?.data) ? res.data : [];
            setProductSuggestions(
                list.map((p) => ({
                    label: p.name || p.model || p._id,
                    value: p._id,
                    image: productImage(p),
                })),
            );
        } catch {
            setProductSuggestions([]);
        }
    };

    const searchNotificationRecipients = async (event) => {
        const query = String(event?.query || "").trim();
        const requestId = ++recipientSearchRequestRef.current;
        if (query.length < 2) {
            setRecipientSuggestions([]);
            setRecipientSearchStatus("idle");
            return;
        }

        setRecipientSearchStatus("loading");
        try {
            const res = await handleGetRequest("/notification/recipients", { q: query, limit: 20 });
            if (!res?.success) {
                if (requestId !== recipientSearchRequestRef.current) return;
                setRecipientSuggestions([]);
                setRecipientSearchStatus("error");
                return;
            }
            const users = Array.isArray(res?.data) ? res.data : [];
            const selectedIds = new Set(selectedRecipients.map((recipient) => recipient.value));
            const suggestions = users
                .map((user) => {
                    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
                    const email = String(user?.email_address || "").trim();
                    const mobile = String(user?.mobile_number || "").trim();
                    const value = String(user?._id || "").trim();
                    return {
                        label: fullName || email || value,
                        value,
                        fullName: fullName || "Unnamed user",
                        email,
                        mobile,
                        role: user?.role || "user",
                        customerId: String(user?.user_id || "").trim(),
                    };
                })
                .filter((recipient) => recipient.value && !selectedIds.has(recipient.value));

            if (requestId !== recipientSearchRequestRef.current) return;
            setRecipientSuggestions(suggestions);
            setRecipientSearchStatus(suggestions.length > 0 ? "ready" : "empty");
        } catch (error) {
            if (requestId !== recipientSearchRequestRef.current) return;
            console.error("Failed to search notification recipients", error);
            setRecipientSuggestions([]);
            setRecipientSearchStatus("error");
        }
    };

    const recipientItemTemplate = (recipient) => {
        const contact = [recipient.email, recipient.mobile].filter(Boolean).join(" · ");
        const visibleId = recipient.customerId || recipient.value;
        return (
            <div className="recipient-option">
                <div className="recipient-option-main">
                    <span className="recipient-option-name">{recipient.fullName}</span>
                    <span className="recipient-option-meta">{contact || recipient.role}</span>
                </div>
                <div className="recipient-option-side">
                    <span className="recipient-option-role">{recipient.role === "user" ? "Customer" : recipient.role}</span>
                    <span className="recipient-option-id" title={`User ID: ${recipient.value}`}>
                        {visibleId}
                    </span>
                </div>
            </div>
        );
    };

    const updateSelectedRecipients = (nextRecipients) => {
        const uniqueRecipients = [];
        const ids = new Set();
        (Array.isArray(nextRecipients) ? nextRecipients : []).forEach((recipient) => {
            if (recipient?.value && !ids.has(recipient.value)) {
                ids.add(recipient.value);
                uniqueRecipients.push(recipient);
            }
        });
        setSelectedRecipients(uniqueRecipients);
    };

    // Assemble the `data` payload the mobile app understands (deep link + image
    // + channel). Returns null on a validation error (toast already shown).
    const buildData = () => {
        const data = {};
        if (linkType === "product") {
            if (!linkProduct?.value) {
                toast.warn("Pick a product for the deep link");
                return null;
            }
            data.type = "product";
            data.productId = linkProduct.value;
        } else if (linkType === "order") {
            if (!orderId.trim()) {
                toast.warn("Enter an order ID for the deep link");
                return null;
            }
            data.type = "order";
            data.orderId = orderId.trim();
        } else if (linkType === "custom" && dataJson.trim()) {
            try {
                Object.assign(data, JSON.parse(dataJson));
            } catch {
                toast.warn("Custom deep-link data must be valid JSON");
                return null;
            }
        }
        if (imageUrl.trim()) data.image = imageUrl.trim();
        // Order deep-links always route to the "orders" channel on the device;
        // otherwise honour the chosen channel.
        if (channelId) data.channelId = channelId;
        return data;
    };

    const resetSendForm = () => {
        setTitle("");
        setBodyText("");
        setImageUrl("");
        setImageFileName("");
        setImageUploadProgress(0);
        setChannelId("promotions");
        setLinkType("none");
        setLinkProduct(null);
        setOrderId("");
        setDataJson("");
        recipientSearchRequestRef.current += 1;
        setSelectedRecipients([]);
        setRecipientSuggestions([]);
        setRecipientSearchStatus("idle");
        setAlsoEmail(false);
    };

    const sendNotification = async () => {
        if (!title.trim()) {
            toast.warn("Title is required");
            return;
        }
        if (uploadingImage) {
            toast.warn("Wait for the image upload to finish");
            return;
        }
        if (audience === "users" && selectedRecipients.length === 0) {
            toast.warn("Select at least one user");
            return;
        }
        const data = buildData();
        if (data === null) return;

        const payload = { audience, title: title.trim(), body: bodyText, data, email: alsoEmail };
        if (audience === "role") payload.role = role;
        if (audience === "users") payload.userIds = selectedRecipients.map((recipient) => recipient.value);

        setSending(true);
        try {
            const res = await dispatch(handlePostRequest(payload, "/notification/send", true, false));
            if (res && res !== "error" && res?.success) {
                toast.success(res.message || "Notification sent");
                resetSendForm();
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
        <div className="Page__Header notifications-page" style={{ display: "flex", flexDirection: "column" }}>
            <style>{NOTIFICATIONS_PAGE_CSS}</style>
            <div className="notifications-page-title">
                <h2>Notifications</h2>
                {!canWrite && <p style={{ color: "#94a3b8" }}>You have read-only access to notifications.</p>}
            </div>

            <div className="grid notifications-grid">
                <div className="col-12">
                    <div className="card notifications-card">
                        <TabView>
                            {/* ---------- Notify requests ---------- */}
                            <TabPanel header="Notify Requests">
                                <p style={{ color: "#64748b", marginBottom: 12 }}>
                                    Product notification requests submitted by customers from the storefront.
                                </p>
                                <NotificationRequests embedded />
                            </TabPanel>

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
                                            <label htmlFor="notification-recipients" className="block mb-2">Recipients</label>
                                            <AutoComplete
                                                inputId="notification-recipients"
                                                value={selectedRecipients}
                                                suggestions={recipientSuggestions}
                                                completeMethod={searchNotificationRecipients}
                                                onChange={(e) => updateSelectedRecipients(e.value)}
                                                field="label"
                                                multiple
                                                minLength={2}
                                                delay={300}
                                                placeholder="Search name, email, phone or user ID"
                                                className="recipient-picker"
                                                itemTemplate={recipientItemTemplate}
                                                selectedItemTemplate={(recipient) => recipient?.label}
                                                disabled={!canWrite}
                                            />
                                            <small
                                                className={`recipient-picker-help ${recipientSearchStatus === "error" ? "is-error" : ""}`}
                                                aria-live="polite"
                                            >
                                                {selectedRecipients.length > 0
                                                    ? `${selectedRecipients.length} user${selectedRecipients.length === 1 ? "" : "s"} selected. IDs will be added automatically.`
                                                    : recipientSearchStatus === "loading"
                                                        ? "Searching users..."
                                                        : recipientSearchStatus === "empty"
                                                            ? "No users found. Try a name, email, phone number or ID."
                                                            : recipientSearchStatus === "error"
                                                                ? "User search failed. Please try again."
                                                                : "Type at least 2 characters. You do not need to copy or paste Mongo IDs."}
                                            </small>
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
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2">Image (optional)</label>
                                        <InputText
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                handleNotificationImageUpload(e.target.files?.[0]);
                                                e.target.value = "";
                                            }}
                                            className="w-full"
                                            disabled={!canWrite || uploadingImage}
                                        />
                                        <small style={{ color: "#94a3b8" }}>Shown as a big picture on the phone.</small>
                                        {(uploadingImage || imageFileName || imageUrl) && (
                                            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                                {(imageFileName || imageUrl) && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                                        <i className="pi pi-image" style={{ color: "#64748b" }} />
                                                        <span style={{ color: "#475569", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {imageFileName || "Selected image"}
                                                        </span>
                                                        {imageUrl && !uploadingImage && (
                                                            <Button
                                                                icon="pi pi-times"
                                                                className="p-button-text p-button-sm p-button-danger"
                                                                tooltip="Remove image"
                                                                onClick={clearNotificationImage}
                                                                disabled={!canWrite}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {uploadingImage && <ProgressBar value={imageUploadProgress} style={{ height: 6 }} showValue={false} />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2">Channel</label>
                                        <Dropdown
                                            value={channelId}
                                            options={CHANNEL_OPTIONS}
                                            onChange={(e) => setChannelId(e.value)}
                                            className="w-full"
                                            disabled={!canWrite}
                                        />
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2">On tap, open</label>
                                        <Dropdown
                                            value={linkType}
                                            options={LINK_TYPE_OPTIONS}
                                            onChange={(e) => setLinkType(e.value)}
                                            className="w-full"
                                            disabled={!canWrite}
                                        />
                                    </div>
                                    {linkType === "product" && (
                                        <div className="col-12 md:col-6">
                                            <label className="block mb-2">Product</label>
                                            <AutoComplete
                                                value={linkProduct}
                                                suggestions={productSuggestions}
                                                completeMethod={searchProducts}
                                                field="label"
                                                dropdown
                                                forceSelection
                                                placeholder="Search by name / model / SKU"
                                                onChange={(e) => setLinkProduct(e.value)}
                                                onSelect={(e) => {
                                                    if (!imageUrl && e.value?.image) setImageUrl(e.value.image);
                                                }}
                                                className="w-full"
                                                inputClassName="w-full"
                                                disabled={!canWrite}
                                            />
                                        </div>
                                    )}
                                    {linkType === "order" && (
                                        <div className="col-12 md:col-6">
                                            <label className="block mb-2">Order ID</label>
                                            <InputText
                                                value={orderId}
                                                onChange={(e) => setOrderId(e.target.value)}
                                                placeholder="e.g. 665f0c1a9b3e2f0012a4bc21"
                                                className="w-full"
                                                disabled={!canWrite}
                                            />
                                        </div>
                                    )}
                                    {linkType === "custom" && (
                                        <div className="col-12">
                                            <label className="block mb-2">Custom deep-link data (JSON)</label>
                                            <InputTextarea
                                                value={dataJson}
                                                onChange={(e) => setDataJson(e.target.value)}
                                                rows={2}
                                                placeholder='{"type":"product","productId":"665f...bc21"}'
                                                className="w-full"
                                                disabled={!canWrite}
                                            />
                                        </div>
                                    )}
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
                                        <Button label="Send Notification" icon="pi pi-send" loading={sending} disabled={!canWrite || uploadingImage} onClick={sendNotification} />
                                    </div>
                                </div>
                                </div>
                                <div className="col-12 md:col-5">
                                    <label className="block mb-2">Preview</label>
                                    <PushPreview title={title} body={bodyText} image={imageUrl} />
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
