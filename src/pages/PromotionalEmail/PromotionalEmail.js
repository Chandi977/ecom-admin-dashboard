import React, { useEffect, useState, useCallback, useRef } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";

import { handleGetRequest } from "../../services/GetTemplate";
import { handlePostRequest } from "../../services/PostTemplate";
import { handlePatchRequest } from "../../services/PatchTemplate";
import { handleDeleteRequest } from "../../services/DeleteTemplate";
import { productService } from "../../services/productService";
import { readTabularFileAsText } from "../../utils/readTabularFile";
import { exportJsonToExcel } from "../../utils/exportToExcel";
import { can } from "../../rbac/permissions";
import PromoEmailPreview from "./PromoEmailPreview";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The four contact pools a promo can target. `key` matches the backend
// MarketingAudience union.
const AUDIENCE_META = [
    { key: "customers", label: "Registered customers", hint: "People with a store account" },
    { key: "subscribers", label: "Newsletter subscribers", hint: "Footer sign-ups + imported emails" },
    { key: "contacts", label: "Contact enquiries", hint: "Submitted the contact form" },
    { key: "leads", label: "CRM leads", hint: "Leads captured in the CRM" },
];

const STATUS_FILTER_OPTIONS = [
    { label: "All statuses", value: "" },
    { label: "Subscribed", value: "subscribed" },
    { label: "Unsubscribed", value: "unsubscribed" },
];

const LAYOUT_OPTIONS = [
    { label: "Branded template", value: "branded" },
    { label: "Full custom HTML", value: "custom" },
];

// Editable full-HTML scaffold for custom mode — a responsive email skeleton with
// its own header/footer the author can redesign top-to-bottom. `{{unsubscribe_url}}`
// is swapped for each recipient's real unsubscribe link at send time.
const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#111827;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">Your Brand</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 28px;">
          <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Big headline goes here</h2>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b5563;">
            Write your promotional message here. You have full control of this HTML — colours, layout, images, everything.
          </p>
          <p style="text-align:center;margin:28px 0;">
            <a href="https://example.com" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:8px;font-weight:bold;display:inline-block;">Call to action</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f4f4f7;padding:22px;text-align:center;font-size:12px;color:#9ca3af;">
          <p style="margin:0 0 6px;">You are receiving this email because you subscribed.</p>
          <p style="margin:0;"><a href="{{unsubscribe_url}}" style="color:#9ca3af;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const PAGE_CSS = `
.promo-page{width:100%;}
.promo-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1.5rem;}
@media (max-width:1100px){.promo-grid{grid-template-columns:1fr;}}
.promo-field{margin-bottom:1rem;}
.promo-field label{display:block;font-weight:600;color:#334155;margin-bottom:.35rem;font-size:.9rem;}
.promo-field small{color:#94a3b8;}
.promo-audience{display:flex;flex-direction:column;gap:.55rem;border:1px solid #e5e9f2;border-radius:12px;padding:1rem;}
.promo-audience-row{display:flex;align-items:flex-start;gap:.6rem;}
.promo-audience-row .p-checkbox{margin-top:.15rem;}
.promo-audience-main{display:flex;flex-direction:column;min-width:0;}
.promo-audience-name{font-weight:600;color:#1f2937;}
.promo-audience-hint{color:#94a3b8;font-size:.78rem;}
.promo-audience-count{margin-left:auto;font-weight:700;color:#475569;white-space:nowrap;}
.promo-total{display:flex;align-items:center;justify-content:space-between;margin-top:.4rem;padding:.75rem 1rem;background:#f0f6ff;border:1px solid #d6e4ff;border-radius:12px;font-weight:600;color:#1d4ed8;}
.promo-preview-wrap{position:sticky;top:1rem;}
.promo-toolbar{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;margin-bottom:1rem;}
.promo-toolbar .p-inputtext{min-width:220px;}
.promo-hint-line{color:#64748b;font-size:.85rem;margin:.25rem 0 1rem;}
`;

function PromotionalEmail() {
    const dispatch = useDispatch();
    // Sending / testing a campaign and managing subscribers need marketing:write;
    // even looking at the audience, subscribers and history needs marketing:read.
    const canWrite = can("marketing:write");
    const canRead = can("marketing:read") || canWrite;
    const [activeTab, setActiveTab] = useState(0);

    /* ------------------------------- Compose ------------------------------- */
    const [subject, setSubject] = useState("");
    const [previewText, setPreviewText] = useState("");
    const [layoutMode, setLayoutMode] = useState("branded"); // "branded" | "custom"
    const [customHtml, setCustomHtml] = useState("");
    const [heading, setHeading] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFileName, setImageFileName] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [ctaLabel, setCtaLabel] = useState("Shop Now");
    const [ctaUrl, setCtaUrl] = useState("https://store.prempackaging.com");

    const [audiences, setAudiences] = useState({ customers: true, subscribers: true, contacts: false, leads: false });
    const [counts, setCounts] = useState({ counts: {}, total: 0 });
    const [recipientCount, setRecipientCount] = useState(null);
    const [computing, setComputing] = useState(false);
    const [sending, setSending] = useState(false);

    const [testEmail, setTestEmail] = useState("");
    const [sendingTest, setSendingTest] = useState(false);

    const heroInputRef = useRef(null);

    const selectedAudienceKeys = Object.keys(audiences).filter((k) => audiences[k]);
    // Author wrote HTML tags → we render the body verbatim (matches the backend).
    const bodyIsHtml = /<[a-z][\s\S]*>/i.test(bodyText);

    const fetchCounts = useCallback(async () => {
        if (!canRead) return;
        const res = await handleGetRequest("/marketing/audience");
        if (res?.success) setCounts(res.data || { counts: {}, total: 0 });
    }, [canRead]);

    // Exact de-duplicated recipient count for the current selection (server-side,
    // debounced so toggling checkboxes doesn't spam the API).
    useEffect(() => {
        if (!canRead) return undefined;
        const keys = Object.keys(audiences).filter((k) => audiences[k]);
        if (keys.length === 0) {
            setRecipientCount(0);
            return undefined;
        }
        let cancelled = false;
        setComputing(true);
        const t = setTimeout(async () => {
            const res = await dispatch(
                handlePostRequest({ audiences: keys }, "/marketing/audience/preview", false, false),
            );
            if (cancelled) return;
            setComputing(false);
            if (res?.success) setRecipientCount(res.data?.count ?? 0);
        }, 350);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audiences]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    const toggleAudience = (key) => setAudiences((prev) => ({ ...prev, [key]: !prev[key] }));

    const buildContent = () => ({
        mode: layoutMode,
        html: layoutMode === "custom" ? customHtml : "",
        heading: heading.trim(),
        body: bodyText,
        imageUrl: imageUrl.trim(),
        ctaLabel: ctaLabel.trim(),
        ctaUrl: ctaUrl.trim(),
    });

    const handleHeroUpload = async (file) => {
        if (!file) return;
        if (!canWrite) {
            toast.info("You do not have permission to send promotional emails.");
            return;
        }
        if (!file.type?.startsWith("image/")) {
            toast.warn("Upload an image file");
            return;
        }
        setImageFileName(file.name);
        setUploadProgress(0);
        setUploadingImage(true);
        try {
            const result = await productService.uploadImage(file, (p) => setUploadProgress(p));
            if (!result?.url) throw new Error("Upload response did not include an image URL");
            setImageUrl(result.url);
            setUploadProgress(100);
            toast.success("Image uploaded");
        } catch (error) {
            setImageFileName("");
            toast.error(`Image upload failed: ${error?.message || "Something went wrong"}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const validateCompose = () => {
        if (!subject.trim()) {
            toast.warn("Add a subject line");
            return false;
        }
        if (layoutMode === "custom") {
            if (!customHtml.trim()) {
                toast.warn("Add the email HTML for the custom layout");
                return false;
            }
            return true;
        }
        if (!bodyText.trim() && !heading.trim() && !imageUrl.trim()) {
            toast.warn("Add some content (heading, body or an image)");
            return false;
        }
        return true;
    };

    const handleSendTest = async () => {
        if (!canWrite) {
            toast.info("You do not have permission to send promotional emails.");
            return;
        }
        if (!EMAIL_RE.test(testEmail.trim())) {
            toast.warn("Enter a valid test email address");
            return;
        }
        if (!validateCompose()) return;
        setSendingTest(true);
        try {
            const res = await dispatch(
                handlePostRequest(
                    { email: testEmail.trim(), subject: subject.trim(), previewText: previewText.trim(), content: buildContent() },
                    "/marketing/campaigns/test",
                    false,
                    true,
                ),
            );
            if (res?.success) toast.success(res.message || "Test email sent");
        } finally {
            setSendingTest(false);
        }
    };

    const doSend = async () => {
        setSending(true);
        try {
            const res = await dispatch(
                handlePostRequest(
                    {
                        subject: subject.trim(),
                        previewText: previewText.trim(),
                        content: buildContent(),
                        audiences: selectedAudienceKeys,
                    },
                    "/marketing/campaigns/send",
                    true,
                    true,
                ),
            );
            if (res?.success) {
                toast.success(res.message || "Campaign started");
                fetchCampaigns();
                setActiveTab(2);
            }
        } finally {
            setSending(false);
        }
    };

    const handleSend = () => {
        if (!canWrite) {
            toast.info("You do not have permission to send promotional emails.");
            return;
        }
        if (!validateCompose()) return;
        if (selectedAudienceKeys.length === 0) {
            toast.warn("Select at least one audience");
            return;
        }
        const n = recipientCount ?? 0;
        if (n === 0) {
            toast.warn("No recipients match the selected audience");
            return;
        }
        confirmDialog({
            message: `Send this promotional email to ${n.toLocaleString()} recipient(s)? This cannot be undone.`,
            header: "Confirm send",
            icon: "pi pi-send",
            acceptLabel: "Send now",
            rejectLabel: "Cancel",
            accept: doSend,
        });
    };

    /* ------------------------------ Subscribers ----------------------------- */
    const [subscribers, setSubscribers] = useState([]);
    const [subsTotal, setSubsTotal] = useState(0);
    const [subsLoading, setSubsLoading] = useState(false);
    const [subSearch, setSubSearch] = useState("");
    const [subStatus, setSubStatus] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const fetchSubscribers = useCallback(async () => {
        if (!canRead) return;
        setSubsLoading(true);
        try {
            const res = await handleGetRequest("/marketing/subscribers", {
                limit: 200,
                q: subSearch || undefined,
                status: subStatus || undefined,
            });
            if (res?.success) {
                setSubscribers(Array.isArray(res.data) ? res.data : []);
                setSubsTotal(res.meta?.total ?? (Array.isArray(res.data) ? res.data.length : 0));
            }
        } finally {
            setSubsLoading(false);
        }
    }, [subSearch, subStatus, canRead]);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    const handleAddSubscriber = async () => {
        if (!canWrite) {
            toast.info("You do not have permission to manage subscribers.");
            return;
        }
        if (!EMAIL_RE.test(newEmail.trim())) {
            toast.warn("Enter a valid email address");
            return;
        }
        const res = await dispatch(
            handlePostRequest({ email: newEmail.trim(), name: newName.trim() || undefined }, "/marketing/subscribers", false, true),
        );
        if (res?.success) {
            setNewEmail("");
            setNewName("");
            fetchSubscribers();
            fetchCounts();
        }
    };

    // Parse an uploaded Excel/CSV into { email, name } rows. Detects the email
    // column per row and pairs the first other non-email cell as the name.
    const parseRows = (text) => {
        const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim().length > 0);
        const out = [];
        for (const line of lines) {
            const cells = line.split(/\t|,/).map((c) => c.trim().replace(/^"|"$/g, ""));
            const emailCell = cells.find((c) => EMAIL_RE.test(c));
            if (!emailCell) continue; // header rows / junk have no email
            const nameCell = cells.find((c) => c && c !== emailCell && !EMAIL_RE.test(c));
            out.push({ email: emailCell, name: nameCell || undefined });
        }
        return out;
    };

    const handleImportFile = async (file) => {
        if (!file) return;
        if (!canWrite) {
            toast.info("You do not have permission to manage subscribers.");
            return;
        }
        setImporting(true);
        try {
            const text = await readTabularFileAsText(file);
            const rows = parseRows(text);
            if (rows.length === 0) {
                toast.warn("No email addresses found in that file");
                return;
            }
            const res = await dispatch(handlePostRequest({ subscribers: rows }, "/marketing/subscribers/import", true, true));
            if (res?.success) {
                fetchSubscribers();
                fetchCounts();
            }
        } catch (error) {
            toast.error(error?.message || "Could not read that file");
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const toggleStatus = async (row) => {
        if (!canWrite) {
            toast.info("You do not have permission to manage subscribers.");
            return;
        }
        const next = row.status === "subscribed" ? "unsubscribed" : "subscribed";
        const res = await handlePatchRequest({ status: next }, `/marketing/subscribers/${row._id}`);
        if (res?.success) {
            toast.success(`Marked ${next}`);
            fetchSubscribers();
            fetchCounts();
        }
    };

    const removeSubscriber = (row) => {
        if (!canWrite) {
            toast.info("You do not have permission to manage subscribers.");
            return;
        }
        confirmDialog({
            message: `Delete ${row.email}? They will be removed from the subscriber list.`,
            header: "Delete subscriber",
            icon: "pi pi-trash",
            acceptClassName: "p-button-danger",
            accept: async () => {
                const res = await dispatch(handleDeleteRequest({}, `/marketing/subscribers/${row._id}`));
                if (res?.success) {
                    fetchSubscribers();
                    fetchCounts();
                }
            },
        });
    };

    const exportSubscribers = () => {
        if (subscribers.length === 0) {
            toast.warn("Nothing to export");
            return;
        }
        exportJsonToExcel({
            data: subscribers.map((s) => ({
                email: s.email,
                name: s.name || "",
                status: s.status,
                source: s.source,
                joined: moment(s.createdAt).format("YYYY-MM-DD"),
            })),
            fileName: "prem-subscribers",
            sheetName: "Subscribers",
        });
    };

    /* -------------------------------- History ------------------------------- */
    const [campaigns, setCampaigns] = useState([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);

    const fetchCampaigns = useCallback(async () => {
        if (!canRead) return;
        setCampaignsLoading(true);
        try {
            const res = await handleGetRequest("/marketing/campaigns", { limit: 100 });
            if (res?.success) setCampaigns(Array.isArray(res.data) ? res.data : []);
        } finally {
            setCampaignsLoading(false);
        }
    }, [canRead]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    /* ------------------------------- Renderers ------------------------------ */
    const statusBody = (row) => (
        <Tag value={row.status} severity={row.status === "subscribed" ? "success" : "danger"} />
    );
    const sourceBody = (row) => <Tag value={row.source} severity="info" />;
    const joinedBody = (row) => moment(row.createdAt).format("DD MMM YYYY");
    const subActions = (row) => (
        <div style={{ display: "flex", gap: ".25rem" }}>
            <Button
                icon={row.status === "subscribed" ? "pi pi-ban" : "pi pi-check"}
                className="p-button-text p-button-sm"
                tooltip={row.status === "subscribed" ? "Unsubscribe" : "Re-subscribe"}
                disabled={!canWrite}
                onClick={() => toggleStatus(row)}
            />
            {/* Deleting a subscriber is destructive — hide it outright when unpermitted. */}
            {canWrite && (
                <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger p-button-sm"
                    tooltip="Delete"
                    onClick={() => removeSubscriber(row)}
                />
            )}
        </div>
    );

    const campaignStatusBody = (row) => {
        const sev = row.status === "sent" ? "success" : row.status === "failed" ? "danger" : row.status === "sending" ? "warning" : "secondary";
        return <Tag value={row.status} severity={sev} />;
    };
    const campaignAudienceBody = (row) => (Array.isArray(row.audiences) ? row.audiences.join(", ") : "");
    const campaignResultBody = (row) => (
        <span>
            <strong style={{ color: "#16a34a" }}>{row.sentCount || 0}</strong> sent
            {row.failedCount ? <span style={{ color: "#b91c1c" }}> · {row.failedCount} failed</span> : null}
            <span style={{ color: "#94a3b8" }}> / {row.recipientCount || 0}</span>
        </span>
    );
    const campaignDateBody = (row) => moment(row.createdAt).format("DD MMM YYYY, HH:mm");

    // Even the audience counts, subscriber list and send history are marketing data.
    if (!canRead) {
        return (
            <div className="promo-page">
                <style>{PAGE_CSS}</style>
                <div className="grid">
                    <div className="col-12">
                        <div className="card">
                            <h4 style={{ margin: 0 }}>Promotional Email</h4>
                            <p className="promo-hint-line" style={{ marginBottom: 0 }}>
                                You don&apos;t have access to promotional email. Ask an admin for the marketing permission.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="promo-page">
            <style>{PAGE_CSS}</style>
            <ConfirmDialog />

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
                            <div>
                                <h4 style={{ margin: 0 }}>Promotional Email</h4>
                                <p className="promo-hint-line" style={{ margin: ".25rem 0 0" }}>
                                    Compose a promotional email, preview it live, and send it to your customers and subscribers.
                                </p>
                            </div>
                            <Tag value={`${counts.total?.toLocaleString?.() ?? 0} reachable contacts`} severity="info" icon="pi pi-users" />
                        </div>

                        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                            {/* ------------------------------ COMPOSE ------------------------------ */}
                            <TabPanel header="Compose & Send" leftIcon="pi pi-pencil mr-2">
                                <div className="promo-grid">
                                    {/* Left: editor */}
                                    <div>
                                        <div className="promo-field">
                                            <label>Subject line *</label>
                                            <InputText value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Flat 20% off all corrugated boxes this week" style={{ width: "100%" }} />
                                        </div>
                                        <div className="promo-field">
                                            <label>Inbox preview text</label>
                                            <InputText value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="Short snippet shown after the subject in the inbox" style={{ width: "100%" }} />
                                        </div>

                                        <div className="promo-field">
                                            <label>Email layout</label>
                                            <SelectButton value={layoutMode} options={LAYOUT_OPTIONS} onChange={(e) => e.value && setLayoutMode(e.value)} />
                                            <small>
                                                {layoutMode === "branded"
                                                    ? "Prem Packaging header & footer wrap your content. Fill in the blocks below."
                                                    : "Design the whole email yourself (any brand). Your HTML is sent exactly as written."}
                                            </small>
                                        </div>

                                        {layoutMode === "custom" ? (
                                            <div className="promo-field">
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
                                                    <label style={{ margin: 0 }}>Email HTML *</label>
                                                    <Button label="Load starter template" icon="pi pi-file-edit" className="p-button-text p-button-sm" onClick={() => setCustomHtml(STARTER_HTML)} />
                                                </div>
                                                <InputTextarea
                                                    value={customHtml}
                                                    onChange={(e) => setCustomHtml(e.target.value)}
                                                    rows={16}
                                                    placeholder="Paste or write your full email HTML here…"
                                                    style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: "0.82rem" }}
                                                />
                                                <small>
                                                    Tip: put <code>{"{{unsubscribe_url}}"}</code> in a link&apos;s href for the unsubscribe link. If you omit it, a small unsubscribe footer is added automatically.
                                                </small>
                                            </div>
                                        ) : null}

                                        {layoutMode === "branded" ? (
                                        <>
                                        <div className="promo-field">
                                            <label>Heading</label>
                                            <InputText value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Big headline inside the email" style={{ width: "100%" }} />
                                        </div>
                                        <div className="promo-field">
                                            <label>Body</label>
                                            <InputTextarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={8} autoResize placeholder={"Write your message here.\n\nLeave a blank line between paragraphs — or paste your own HTML for a fully custom design."} style={{ width: "100%", fontFamily: bodyIsHtml ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined }} />
                                            <small>
                                                {bodyIsHtml
                                                    ? "HTML detected — your markup is rendered exactly as written in the preview."
                                                    : "Plain text: blank lines start a new paragraph. You can also paste HTML tags for custom designs."}
                                            </small>
                                        </div>

                                        <div className="promo-field">
                                            <label>Hero image (optional)</label>
                                            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                                <InputText value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste an image URL, or upload →" style={{ flex: 1, minWidth: 200 }} />
                                                <input ref={heroInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleHeroUpload(e.target.files?.[0])} />
                                                <Button label="Upload" icon="pi pi-upload" className="p-button-outlined" onClick={() => heroInputRef.current?.click()} disabled={uploadingImage || !canWrite} />
                                                {imageUrl ? <Button icon="pi pi-times" className="p-button-text p-button-danger" onClick={() => { setImageUrl(""); setImageFileName(""); }} tooltip="Remove image" /> : null}
                                            </div>
                                            {uploadingImage ? <ProgressBar value={uploadProgress} style={{ height: 6, marginTop: 8 }} /> : null}
                                            {imageFileName && !uploadingImage ? <small>{imageFileName}</small> : null}
                                        </div>

                                        <div className="promo-field" style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                                            <div style={{ flex: 1, minWidth: 160 }}>
                                                <label>Button label</label>
                                                <InputText value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Shop Now" style={{ width: "100%" }} />
                                            </div>
                                            <div style={{ flex: 2, minWidth: 200 }}>
                                                <label>Button link</label>
                                                <InputText value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://store.prempackaging.com/BestDeals" style={{ width: "100%" }} />
                                            </div>
                                        </div>
                                        </>
                                        ) : null}

                                        {/* Audience */}
                                        <div className="promo-field">
                                            <label>Send to</label>
                                            <div className="promo-audience">
                                                {AUDIENCE_META.map((a) => (
                                                    <div className="promo-audience-row" key={a.key}>
                                                        <Checkbox inputId={`aud-${a.key}`} checked={!!audiences[a.key]} onChange={() => toggleAudience(a.key)} />
                                                        <div className="promo-audience-main">
                                                            <label htmlFor={`aud-${a.key}`} className="promo-audience-name" style={{ margin: 0, cursor: "pointer" }}>{a.label}</label>
                                                            <span className="promo-audience-hint">{a.hint}</span>
                                                        </div>
                                                        <span className="promo-audience-count">{(counts.counts?.[a.key] ?? 0).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                <div className="promo-total">
                                                    <span>Unique recipients (deduplicated)</span>
                                                    <span>{computing ? "…" : (recipientCount ?? 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Test + Send */}
                                        <div className="promo-field">
                                            <label>Send a test to yourself first</label>
                                            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                                <InputText value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@company.com" style={{ flex: 1, minWidth: 200 }} />
                                                <Button label="Send test" icon="pi pi-send" className="p-button-outlined" loading={sendingTest} disabled={!canWrite} onClick={handleSendTest} />
                                            </div>
                                        </div>

                                        <Button
                                            label={sending ? "Sending…" : `Send campaign${recipientCount ? ` to ${recipientCount.toLocaleString()}` : ""}`}
                                            icon="pi pi-megaphone"
                                            className="p-button-danger"
                                            style={{ width: "100%", marginTop: ".5rem" }}
                                            loading={sending}
                                            disabled={!canWrite}
                                            onClick={handleSend}
                                        />
                                        {!canWrite ? <small style={{ color: "#b42318" }}>You do not have permission to send promotional emails.</small> : null}
                                    </div>

                                    {/* Right: live preview */}
                                    <div>
                                        <div className="promo-preview-wrap">
                                            <label style={{ fontWeight: 600, color: "#334155", marginBottom: ".35rem", display: "block" }}>Live preview</label>
                                            <PromoEmailPreview
                                                subject={subject}
                                                previewText={previewText}
                                                mode={layoutMode}
                                                html={customHtml}
                                                heading={heading}
                                                body={bodyText}
                                                imageUrl={imageUrl}
                                                ctaLabel={ctaLabel}
                                                ctaUrl={ctaUrl}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            {/* ---------------------------- SUBSCRIBERS ---------------------------- */}
                            <TabPanel header="Subscribers" leftIcon="pi pi-users mr-2">
                                <div className="promo-toolbar">
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText value={subSearch} onChange={(e) => setSubSearch(e.target.value)} placeholder="Search email or name" />
                                    </span>
                                    <Dropdown value={subStatus} options={STATUS_FILTER_OPTIONS} onChange={(e) => setSubStatus(e.value)} placeholder="Status" />
                                    <span style={{ color: "#64748b" }}>{subsTotal.toLocaleString()} total</span>
                                    <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                        <input ref={fileInputRef} type="file" accept=".xlsx,.xlsm,.csv,.tsv,.txt" style={{ display: "none" }} onChange={(e) => handleImportFile(e.target.files?.[0])} />
                                        <Button label="Import Excel/CSV" icon="pi pi-file-import" className="p-button-outlined" loading={importing} disabled={!canWrite} onClick={() => fileInputRef.current?.click()} />
                                        <Button label="Export" icon="pi pi-file-excel" className="p-button-outlined p-button-success" onClick={exportSubscribers} />
                                    </div>
                                </div>

                                {canWrite ? (
                                    <div className="promo-toolbar" style={{ background: "#f8fafc", padding: ".75rem", borderRadius: 10 }}>
                                        <InputText value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (optional)" />
                                        <InputText value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" onKeyDown={(e) => e.key === "Enter" && handleAddSubscriber()} />
                                        <Button label="Add subscriber" icon="pi pi-plus" onClick={handleAddSubscriber} />
                                    </div>
                                ) : null}

                                <p className="promo-hint-line">
                                    Import accepts .xlsx / .csv with an email column (a name column is optional). Existing emails are updated, not duplicated.
                                </p>

                                <DataTable value={subscribers} loading={subsLoading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} dataKey="_id" emptyMessage="No subscribers yet" responsiveLayout="scroll">
                                    <Column field="email" header="Email" sortable />
                                    <Column field="name" header="Name" body={(r) => r.name || "—"} sortable />
                                    <Column field="status" header="Status" body={statusBody} sortable />
                                    <Column field="source" header="Source" body={sourceBody} sortable />
                                    <Column field="createdAt" header="Joined" body={joinedBody} sortable />
                                    <Column header="" body={subActions} style={{ width: 100 }} />
                                </DataTable>
                            </TabPanel>

                            {/* ------------------------------ HISTORY ------------------------------ */}
                            <TabPanel header="Sent history" leftIcon="pi pi-history mr-2">
                                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: ".5rem" }}>
                                    <Button label="Refresh" icon="pi pi-refresh" className="p-button-text" onClick={fetchCampaigns} />
                                </div>
                                <DataTable value={campaigns} loading={campaignsLoading} paginator rows={10} dataKey="_id" emptyMessage="No campaigns sent yet" responsiveLayout="scroll">
                                    <Column field="subject" header="Subject" sortable />
                                    <Column header="Audience" body={campaignAudienceBody} />
                                    <Column field="status" header="Status" body={campaignStatusBody} sortable />
                                    <Column header="Result" body={campaignResultBody} />
                                    <Column field="createdByName" header="Sent by" body={(r) => r.createdByName || "—"} />
                                    <Column field="createdAt" header="Date" body={campaignDateBody} sortable />
                                </DataTable>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PromotionalEmail;
