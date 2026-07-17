import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { toast } from "react-toastify";
import moment from "moment/moment";
import { handlePostRequest } from "../../services/PostTemplate";

const postJson = (data, url) => handlePostRequest(data, url, false, false)(() => {});

// --- Robust CSV parser: handles quoted fields, escaped quotes ("") and
// newlines inside quotes. Returns an array of rows (each row an array of cells).
const parseCSV = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inQuotes) {
            if (ch === '"') {
                if (s[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = false;
            } else field += ch;
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ",") {
            row.push(field); field = "";
        } else if (ch === "\n") {
            row.push(field); rows.push(row); row = []; field = "";
        } else field += ch;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
};

const isDateOnly = (s) => /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s.trim());

const parseLeadDate = (raw) => {
    if (!raw) return null;
    let clean = raw.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim();
    const hasYear = /\d{4}/.test(clean) || /\/\d{2}\b/.test(clean);
    if (!hasYear && /[A-Za-z]/.test(clean)) clean += " 2025"; // CSV covers 2025
    const m = moment(clean, ["D MMMM YYYY", "D MMM YYYY", "DD/MM/YYYY", "D/M/YYYY", "DD/MM/YY", "D/M/YY", "D MMMM", "D MMM"], false);
    return m.isValid() ? m.toDate() : null;
};

const normalizeSource = (raw) => {
    const s = (raw || "").toLowerCase();
    if (s.includes("insta")) return "instagram";
    if (s.includes("whats")) return "whatsapp";
    if (s.includes("face")) return "facebook";
    if (s.includes("website") || s.includes("site")) return "website";
    // "Mail box", "GMAIL", "G mail", "E mail", "e-mail" → a single email source.
    if (s.includes("mail")) return "email";
    return (raw || "").trim() || "import";
};

const guessType = (cell) => {
    const s = cell.toLowerCase();
    if (/whats\s*app|whatsapp/.test(s)) return "whatsapp";
    if (/\bcall|dial|phone|rang\b/.test(s)) return "call";
    if (/mail|email/.test(s)) return "email";
    return "note";
};

const guessStatus = (blob) => {
    const s = blob.toLowerCase();
    if (/convert|order placed|confirmed order|deal done|po received/.test(s)) return "converted";
    if (/no req|not req|no requirement|not interested|switch off|closed|no need/.test(s)) return "closed";
    if (/rates given|sample|catalogue|catalouge|quotation|qty|moq|will confirm|interested|link sent|details shared|shared on/.test(s)) return "qualified";
    if (s.trim()) return "contacted";
    return "new";
};

const mapRows = (rows) => {
    if (!rows.length) return [];
    const leads = [];
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i] || [];
        const name = (r[1] || "").trim();
        if (!name) continue;

        const emailRaw = (r[2] || "").trim();
        const email = emailRaw && emailRaw.toUpperCase() !== "NA" && /@/.test(emailRaw) ? emailRaw : "";
        const dateStr = (r[3] || "").trim();
        const phone = (r[4] || "").trim();
        const message = (r[5] || "").trim();
        const source = normalizeSource(r[6]);

        const createdAt = parseLeadDate(dateStr);
        const trailing = r.slice(7).map((c) => (c || "").trim()).filter(Boolean);

        const activities = [];
        let assignedTo = "";
        let contextDate = createdAt;
        trailing.forEach((cell) => {
            if (isDateOnly(cell)) {
                const d = parseLeadDate(cell);
                if (d) contextDate = d;
                return; // a bare date just sets the timestamp for the next note
            }
            const m = cell.match(/transfer\s*to\s*(.+)/i);
            if (m) assignedTo = m[1].replace(/\b(sir|maam|ma'am|madam)\b/gi, "").trim();
            activities.push({
                type: guessType(cell),
                note: cell,
                at: contextDate ? contextDate.toISOString() : undefined,
            });
        });

        const disposition = trailing.length ? trailing[trailing.length - 1] : "";
        const status = guessStatus(trailing.join(" "));
        const importKey = `csv:${i}:${name}:${dateStr}`.slice(0, 190);

        leads.push({
            name, email, phone, message, source, status, disposition, assignedTo,
            createdAt: createdAt ? createdAt.toISOString() : undefined,
            activities,
            importKey,
        });
    }
    return leads;
};

const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
};

export default function LeadsImport({ visible, onHide, onImported }) {
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [mapped, setMapped] = useState([]);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);

    const reset = () => {
        setFileName("");
        setMapped([]);
        if (fileRef.current) fileRef.current.value = "";
    };

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setParsing(true);
        setFileName(file.name);
        try {
            const text = await file.text();
            const rows = parseCSV(text);
            const leads = mapRows(rows);
            setMapped(leads);
            if (!leads.length) toast.warn("No lead rows found in this file");
        } catch (err) {
            toast.error("Could not read this file");
            setMapped([]);
        } finally {
            setParsing(false);
        }
    };

    const runImport = async () => {
        if (!mapped.length) return;
        setImporting(true);
        let inserted = 0;
        let skipped = 0;
        try {
            // Small batches keep each request well under body-size limits
            // (works even before the server's raised limit is deployed).
            for (const batch of chunk(mapped, 25)) {
                const res = await postJson({ leads: batch }, "/lead/import");
                if (res && res !== "error" && res.success) {
                    inserted += res.data?.inserted || 0;
                    skipped += res.data?.skipped || 0;
                } else {
                    throw new Error("import batch failed");
                }
            }
            toast.success(`Imported ${inserted} lead(s)${skipped ? `, ${skipped} skipped (already present)` : ""}`);
            reset();
            onImported?.();
            onHide?.();
        } catch (err) {
            toast.error("Import failed partway. Fix the file and retry — already-imported rows are skipped.");
        } finally {
            setImporting(false);
        }
    };

    const preview = mapped.slice(0, 6);

    return (
        <Dialog header="Import leads from CSV" visible={visible} style={{ width: "760px", maxWidth: "96vw" }} onHide={() => { reset(); onHide?.(); }} modal>
            <p style={{ color: "#6b7280", marginTop: 0 }}>
                Upload your contact-forms CSV (columns: Name, Email, Date, Contact no, Query, Source, then follow-up
                notes). Each row becomes a lead with its follow-ups as an activity timeline. Re-importing is safe —
                rows already imported are skipped.
            </p>

            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ marginBottom: 14 }} />
            {parsing ? <p>Reading file…</p> : null}

            {mapped.length > 0 ? (
                <>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                        <Tag severity="success" value={`${mapped.length} leads ready`} />
                        {fileName ? <span style={{ color: "#9ca3af", fontSize: 13 }}>{fileName}</span> : null}
                    </div>
                    <div style={{ overflowX: "auto", border: "1px solid #eceef3", borderRadius: 10 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#f7f8fb", textAlign: "left" }}>
                                    <th style={{ padding: "8px 10px" }}>Name</th>
                                    <th style={{ padding: "8px 10px" }}>Email</th>
                                    <th style={{ padding: "8px 10px" }}>Source</th>
                                    <th style={{ padding: "8px 10px" }}>Status</th>
                                    <th style={{ padding: "8px 10px" }}>Owner</th>
                                    <th style={{ padding: "8px 10px" }}>Activities</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((l, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid #f1f1f4" }}>
                                        <td style={{ padding: "8px 10px" }}>{l.name}</td>
                                        <td style={{ padding: "8px 10px", color: "#6b7280" }}>{l.email || "—"}</td>
                                        <td style={{ padding: "8px 10px" }}>{l.source}</td>
                                        <td style={{ padding: "8px 10px" }}>{l.status}</td>
                                        <td style={{ padding: "8px 10px" }}>{l.assignedTo || "—"}</td>
                                        <td style={{ padding: "8px 10px" }}>{l.activities.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {mapped.length > preview.length ? <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>+ {mapped.length - preview.length} more…</p> : null}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
                        <Button label="Cancel" className="p-button-text" onClick={() => { reset(); onHide?.(); }} />
                        <Button label={`Import ${mapped.length} leads`} icon="pi pi-upload" onClick={runImport} loading={importing} />
                    </div>
                </>
            ) : null}
        </Dialog>
    );
}
