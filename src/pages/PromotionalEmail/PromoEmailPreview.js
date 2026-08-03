import React from "react";

/**
 * Faithful preview of a promotional email. Mirrors the backend layout
 * (ecom-backend-optimized/src/workers/email-worker.ts — buildEmailLayout +
 * buildPromotionalHtml) so the admin sees the real header, trust strip, hero,
 * heading, body, CTA button, unsubscribe footer and dark site footer inside a
 * sandboxed iframe. Keep this in sync with the worker if the layout changes.
 */

const LOGO_URL = "https://store.prempackaging.com/pp_logo_1.png";

const escapeHtml = (value = "") =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const escapeAttr = (value = "") =>
    String(value ?? "").replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E").trim();

// Mirror of the backend renderPromotionalBody: hand-written HTML is rendered
// verbatim; plain text is auto-formatted into paragraphs.
const looksLikeHtml = (value = "") => /<[a-z][\s\S]*>/i.test(value);

const renderBody = (body = "") => {
    const raw = String(body || "");
    if (!raw.trim()) return "";
    if (looksLikeHtml(raw)) return raw;
    return raw
        .split(/\n{2,}/)
        .filter((p) => p.trim().length > 0)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
        .join("");
};

// Trimmed copy of the backend email layout styles — enough for an accurate look.
const PREVIEW_CSS = `
  *{box-sizing:border-box;}
  body{margin:0;background:#f3f6fb;font-family:'Poppins','Segoe UI',Arial,sans-serif;color:#102050;}
  .email-bg{width:100%;background:linear-gradient(180deg,#eef3fb 0%,#f8fafc 45%,#f3f6fb 100%);padding:24px 10px;}
  .container{width:100%;max-width:600px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e7edf6;box-shadow:0 14px 36px rgba(16,32,80,.10);}
  .topbar{background:#102050;color:#fff;font-size:11px;line-height:16px;padding:9px 20px;text-align:center;}
  .header{background:#fff;padding:22px 24px 16px;text-align:center;}
  .logo{max-height:44px;width:auto;margin:0 auto;display:block;}
  .brand-text{color:#102050;font-size:20px;font-weight:800;letter-spacing:1px;margin-top:8px;}
  .brand-text span{color:#F02020;}
  .hero-line{height:5px;background:linear-gradient(90deg,#102050 0%,#F02020 42%,#ff7a1a 100%);font-size:0;line-height:5px;}
  .trust-strip{width:100%;background:#fff7f7;border-bottom:1px solid #ffe0e0;display:flex;}
  .trust-strip .cell{flex:1;padding:11px 8px;font-size:11px;color:#5b6475;text-align:center;font-weight:600;}
  .trust-dot{color:#F02020;font-weight:800;padding-right:5px;}
  .content{padding:30px 26px 26px;}
  h1{font-size:24px;line-height:1.25;color:#102050;margin:0 0 16px;font-weight:800;letter-spacing:-.3px;}
  p{font-size:15px;line-height:1.65;color:#506078;margin:0 0 16px;}
  .btn{display:inline-block;background:#F02020;color:#fff!important;text-decoration:none;padding:14px 30px;font-size:15px;font-weight:800;border-radius:999px;box-shadow:0 10px 18px rgba(240,32,32,.24);}
  .hero-img{width:100%;max-width:100%;border-radius:14px;margin:0 0 26px;display:block;}
  .footer{background:#0f1f4d;padding:24px 26px;text-align:center;font-size:12px;color:#c8d2e6;line-height:1.6;}
  .footer a{color:#fff;text-decoration:none;font-weight:600;}
`;

export const buildPreviewHtml = ({
    subject = "",
    previewText = "",
    mode = "branded",
    html = "",
    heading = "",
    body = "",
    imageUrl = "",
    ctaLabel = "",
    ctaUrl = "",
} = {}) => {
    // Full-custom mode: render the author's document as-is (unsubscribe token
    // resolved to a dummy anchor for the preview).
    if (mode === "custom") {
        const resolved = String(html || "").replace(/\{\{\s*unsubscribe(?:_url)?\s*\}\}/gi, "#");
        return resolved.trim()
            ? resolved
            : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#94a3b8;text-align:center;padding:60px 20px;background:#f3f6fb;">Your custom HTML preview will appear here as you type…</body></html>`;
    }

    const heroHtml = imageUrl
        ? `<img src="${escapeAttr(imageUrl)}" alt="" class="hero-img">`
        : "";
    const headingHtml = heading ? `<h1>${escapeHtml(heading)}</h1>` : "";
    const paragraphs = renderBody(body);
    const ctaHtml =
        ctaLabel && ctaUrl
            ? `<div style="text-align:center;margin-top:28px;"><a href="#" class="btn">${escapeHtml(ctaLabel)}</a></div>`
            : "";
    const bodyEmpty = !heading && !paragraphs && !heroHtml;
    const placeholder = bodyEmpty
        ? `<p style="color:#94a3b8;text-align:center;">Your email content preview will appear here as you type…</p>`
        : "";
    const unsubscribeHtml = `
      <div style="text-align:center;margin-top:34px;border-top:1px solid #e2e8f0;padding-top:18px;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">
          You are receiving this email because you subscribed or shopped with Prem Packaging.<br>
          <a href="#" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a> from promotional emails.
        </p>
      </div>`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PREVIEW_CSS}</style></head>
    <body>
      ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>` : ""}
      <div class="email-bg">
        <div class="container">
          <div class="topbar">Premium packaging solutions for ecommerce, shipping and bulk business orders</div>
          <div class="header">
            <img src="${LOGO_URL}" alt="Prem Packaging" class="logo" onerror="this.style.display='none'">
            <div class="brand-text">PREM <span>PACKAGING</span></div>
          </div>
          <div class="hero-line">&nbsp;</div>
          <div class="trust-strip">
            <div class="cell"><span class="trust-dot">&bull;</span>Secure checkout</div>
            <div class="cell"><span class="trust-dot">&bull;</span>GST billing</div>
            <div class="cell"><span class="trust-dot">&bull;</span>Bulk order support</div>
          </div>
          <div class="content">
            ${heroHtml}${headingHtml}${paragraphs}${placeholder}${ctaHtml}${unsubscribeHtml}
          </div>
          <div class="footer">
            <div style="margin-bottom:14px;"><a href="#">Shop Online</a> &bull; <a href="#">Track Orders</a> &bull; <a href="#">Contact Us</a></div>
            <p style="font-size:12px;color:#c8d2e6;margin:0 0 8px;">&copy; ${new Date().getFullYear()} Prem Industries India Limited. All rights reserved.<br>C-209, Bulandshahar Road, Industrial Area, Ghaziabad, Uttar Pradesh - 201009</p>
          </div>
        </div>
      </div>
    </body></html>`;
};

export default function PromoEmailPreview({ subject, previewText, mode, html, heading, body, imageUrl, ctaLabel, ctaUrl, height = 560 }) {
    const srcDoc = buildPreviewHtml({ subject, previewText, mode, html, heading, body, imageUrl, ctaLabel, ctaUrl });
    return (
        <div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                Inbox subject:{" "}
                <strong style={{ color: "#475569" }}>{subject || "(no subject)"}</strong>
            </div>
            {previewText ? (
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                    Preview text: <span style={{ color: "#64748b" }}>{previewText}</span>
                </div>
            ) : null}
            <iframe
                title="promo-email-preview"
                srcDoc={srcDoc}
                style={{ width: "100%", height, border: "1px solid #e4eaf4", borderRadius: 12, background: "#f3f6fb" }}
            />
        </div>
    );
}
