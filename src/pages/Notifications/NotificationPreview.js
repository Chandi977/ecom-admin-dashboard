import React, { useState } from "react";

// Brand app icon shown in the push/in-app preview (same logo used in emails).
const APP_ICON_URL = "https://store.prempackaging.com/pp_logo_1.png";

/**
 * Live previews for notification templates / broadcasts.
 *  - EmailPreview renders the email body HTML inside an iframe with a trimmed copy
 *    of the email layout CSS (the real wrapper lives in the backend email worker),
 *    so the admin sees an accurate, sandboxed preview.
 *  - PushPreview renders a phone-style notification card for push / in-app and for
 *    the broadcast composer.
 */

// Sample values used to fill {{placeholders}} so the preview reads naturally.
const SAMPLE_VARS = {
    token: "482913",
    otp: "591036",
    name: "Charan",
    title: "Flat 20% off this weekend",
    message: "Use code SAVE20 at checkout on all corrugated boxes. Limited time only!",
    productName: "3-Ply Corrugated Box (12x10x8)",
    productLink: "#",
    productModelHtml: '<p style="font-size:14px;color:#64748b;margin:-8px 0 12px;">Model: <strong>CB-3P-12108</strong></p>',
    productDescriptionHtml: '<p style="font-size:15px;color:#475569;line-height:1.5;margin-bottom:15px;">Durable kraft corrugated boxes ideal for e-commerce shipping and bulk storage.</p>',
    subject: "Your Order has been placed",
    orderNumber: "PP1042",
    orderId: "PP1042",
    status: "Placed",
    statusLabel: "Confirmed",
    statusColor: "#16a34a",
    statusBadgeClass: "badge-success",
    statusDetailsHtml: "<br>Payment has been successfully verified. Thank you for your purchase!",
    trackingId: "TRK123456789",
    deliveryPartner: "BlueDart",
    displaySubtotalEx: "₹1,000.00",
    displayShippingEx: "₹80.00",
    totalGstCombined: "₹194.40",
    displayTotalPaid: "₹1,274.40",
    addressHtml: "C-209, Industrial Area<br>Ghaziabad, Uttar Pradesh - 201009",
    phone: "9876543210",
    orderDate: "12 Jun 2026",
    paymentProvider: "Razorpay",
    paymentStatus: "Paid",
    gstinHtml: "",
    utrHtml: "",
    itemsHtml: `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;">
          <div style="font-weight:600;color:#1e293b;">3-Ply Corrugated Box (12x10x8)</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">Pack Size: 25 pcs</div>
        </td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:center;">2</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;">₹500.00</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#64748b;">18%<br><span style="font-size:11px;color:#94a3b8;">(₹180.00)</span></td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:500;">₹1,180.00</td>
      </tr>`,
};

/** Mirror of the backend renderTemplate: replace {{var}} with sample values. */
export const renderSample = (template = "") =>
    String(template).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key) =>
        SAMPLE_VARS[key] !== undefined ? SAMPLE_VARS[key] : `[${key}]`,
    );

// Trimmed subset of the backend email layout styles for an accurate preview.
const EMAIL_PREVIEW_CSS = `
  body{margin:0;background:#f3f6fb;font-family:'Poppins','Segoe UI',Arial,sans-serif;color:#102050;padding:18px;}
  .content{background:#fff;max-width:600px;margin:0 auto;border-radius:14px;border:1px solid #e7edf6;padding:28px 24px;}
  h1{font-size:24px;color:#102050;margin:0 0 16px;font-weight:800;}
  h2{font-size:19px;color:#102050;margin:0 0 14px;font-weight:700;}
  h3{font-size:16px;color:#102050;margin:0 0 10px;font-weight:700;}
  p{font-size:15px;line-height:1.6;color:#506078;margin:0 0 16px;}
  ul{color:#475569;line-height:1.6;}
  .btn{display:inline-block;background:#F02020;color:#fff!important;text-decoration:none;padding:13px 26px;font-weight:800;border-radius:999px;}
  .card{background:#f8fafc;border:1px solid #e4eaf4;border-radius:14px;padding:20px;margin-bottom:20px;}
  .highlight-card{background:linear-gradient(135deg,#fff5f5 0%,#fff 58%,#f6f8ff 100%);border:1px solid #ffd6d6;border-radius:16px;padding:20px;margin:22px 0;}
  .badge{display:inline-block;padding:7px 12px;font-size:11px;font-weight:800;border-radius:999px;text-transform:uppercase;}
  .badge-success{background:#dcfce7;color:#15803d;}.badge-info{background:#dbeafe;color:#1d4ed8;}
  .badge-warning{background:#fef3c7;color:#b45309;}.badge-danger{background:#fee2e2;color:#b91c1c;}.badge-secondary{background:#f1f5f9;color:#475569;}
  .otp-code{font-size:30px;font-weight:700;letter-spacing:6px;color:#F02020;background:#fff5f5;padding:14px 22px;border-radius:12px;border:1px dashed #ff8a8a;display:inline-block;margin:18px 0;font-family:'Courier New',monospace;}
  .order-table-wrap{border:1px solid #e4eaf4;border-radius:12px;margin:16px 0;overflow:auto;}
  .order-table{width:100%;border-collapse:collapse;background:#fff;}
  .order-table th{text-align:left;padding:12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#102050;font-size:12px;text-transform:uppercase;}
  .order-table td{padding:12px;border-bottom:1px solid #edf2f7;color:#334155;font-size:14px;}
  .order-table tr.total-row td{border-top:2px solid #102050;font-weight:800;color:#102050;background:#f8fafc;}
`;

export function EmailPreview({ subject, body }) {
    const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${EMAIL_PREVIEW_CSS}</style></head>
      <body><div class="content">${renderSample(body)}</div></body></html>`;
    return (
        <div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                Subject: <strong style={{ color: "#475569" }}>{renderSample(subject) || "(no subject)"}</strong>
            </div>
            <iframe
                title="email-preview"
                srcDoc={srcDoc}
                style={{ width: "100%", height: 420, border: "1px solid #e4eaf4", borderRadius: 10, background: "#f3f6fb" }}
            />
        </div>
    );
}

export function PushPreview({ title, body }) {
    const [iconFailed, setIconFailed] = useState(false);
    return (
        <div
            style={{
                background: "linear-gradient(160deg,#1f2a44,#0f1830)",
                borderRadius: 22,
                padding: 16,
                maxWidth: 340,
            }}
        >
            <div style={{ color: "#cbd5e1", fontSize: 12, textAlign: "center", marginBottom: 10 }}>9:41 · Lock Screen</div>
            <div
                style={{
                    background: "rgba(255,255,255,0.96)",
                    borderRadius: 16,
                    padding: 12,
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        color: "#14254C",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontWeight: 700,
                        overflow: "hidden",
                    }}
                >
                    {iconFailed ? (
                        "PP"
                    ) : (
                        <img
                            src={APP_ICON_URL}
                            alt="App icon"
                            onError={() => setIconFailed(true)}
                            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }}
                        />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Prem Packaging</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>now</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2, wordBreak: "break-word" }}>
                        {renderSample(title) || "Notification title"}
                    </div>
                    <div style={{ fontSize: 13, color: "#475569", marginTop: 2, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                        {renderSample(body) || "Your message preview will appear here."}
                    </div>
                </div>
            </div>
        </div>
    );
}
