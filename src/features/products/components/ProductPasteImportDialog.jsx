import React, { useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { toast } from "react-toastify";
import { productService } from "../../../services/productService";
import {
    parsePastedTable,
    groupRowsToProducts,
    buildImportPayload,
    getEntityId,
} from "../../../utils/productGrid";

const SAMPLE_HINT = "product id\tbrand\tproduct title\tL inch\tB inch\tH inch\tHSN code\tgst\tpack size\tMRP\tlocal SP\tweight\tstock";

// Bulk create/update products by pasting rows copied from Excel (TSV) or a CSV.
// Rows sharing a product id collapse into one product with a pack-size tier each.
export const ProductPasteImportDialog = ({
    visible,
    onHide,
    brands = [],
    existingProducts = [],
    context = {},
    categories = [],
    subCategories = [],
    requireTarget = false,
    onImported,
}) => {
    const [text, setText] = useState("");
    const [targetCategoryId, setTargetCategoryId] = useState(context.categoryId || "");
    const [targetSubCategoryId, setTargetSubCategoryId] = useState(context.subCategoryId || "");
    const [committing, setCommitting] = useState(false);
    const [progress, setProgress] = useState(null);
    const fileRef = useRef(null);

    const brandLookup = useMemo(
        () => brands.reduce((acc, b) => { if (b?.name) acc[String(b.name).toLowerCase()] = b._id; return acc; }, {}),
        [brands],
    );

    const existingByProductId = useMemo(
        () => existingProducts.reduce((acc, p) => { if (p?.product_id) acc[String(p.product_id)] = p; return acc; }, {}),
        [existingProducts],
    );

    const effectiveContext = useMemo(
        () => ({
            categoryId: context.categoryId || targetCategoryId,
            subCategoryId: context.subCategoryId || targetSubCategoryId,
        }),
        [context, targetCategoryId, targetSubCategoryId],
    );

    const parsed = useMemo(() => {
        if (!text.trim()) return { unmappedHeaders: [], items: [] };
        const { rows, unmappedHeaders } = parsePastedTable(text);
        const groups = groupRowsToProducts(rows);
        const items = groups.map((group) =>
            buildImportPayload(group, { brandLookup, existingByProductId, context: effectiveContext }),
        );
        return { unmappedHeaders, items };
    }, [text, brandLookup, existingByProductId, effectiveContext]);

    const validItems = parsed.items.filter((i) => i.errors.length === 0);
    const invalidCount = parsed.items.length - validItems.length;
    const targetSubs = useMemo(
        () => subCategories.filter((s) => !targetCategoryId || String(getEntityId(s.category)) === String(targetCategoryId)),
        [subCategories, targetCategoryId],
    );

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const content = await file.text();
        setText(content);
    };

    const handleCommit = async () => {
        if (!validItems.length) { toast.warn("Nothing valid to import."); return; }
        setCommitting(true);
        let created = 0, updated = 0, failed = 0;
        for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i];
            setProgress({ done: i, total: validItems.length });
            try {
                const res = item.action === "update"
                    ? await productService.updateProduct(item.existingId, item.payload)
                    : await productService.createProduct(item.payload);
                if (res?.success) { item.action === "update" ? updated++ : created++; }
                else { failed++; }
            } catch (err) {
                failed++;
            }
        }
        setProgress(null);
        setCommitting(false);
        toast.success(`Import done — ${created} created, ${updated} updated${failed ? `, ${failed} failed` : ""}.`);
        if (onImported) await onImported();
        if (!failed) { setText(""); onHide(); }
    };

    const actionBody = (row) => (
        <span style={{ fontWeight: 600, color: row.action === "update" ? "#2563eb" : "#16a34a", textTransform: "capitalize" }}>
            {row.action}
        </span>
    );
    const errorBody = (row) =>
        row.errors.length
            ? <span style={{ color: "#dc2626", fontSize: 12 }}>{row.errors.join("; ")}</span>
            : <span style={{ color: "#16a34a" }}><i className="pi pi-check" /></span>;

    const footer = (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>
                {parsed.items.length > 0 && `${validItems.length} ready${invalidCount ? `, ${invalidCount} with errors (skipped)` : ""}`}
                {progress && ` — importing ${progress.done}/${progress.total}…`}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
                <Button label="Cancel" className="p-button-text" onClick={onHide} disabled={committing} />
                <Button
                    label={committing ? "Importing…" : `Import ${validItems.length || ""}`}
                    icon={committing ? "pi pi-spin pi-spinner" : "pi pi-upload"}
                    onClick={handleCommit}
                    disabled={committing || !validItems.length}
                />
            </div>
        </div>
    );

    const needsTarget = requireTarget && !effectiveContext.subCategoryId;

    return (
        <Dialog
            header="Import from Excel / CSV"
            visible={visible}
            onHide={committing ? () => {} : onHide}
            style={{ width: "min(1000px, 96vw)" }}
            footer={footer}
            maximizable
        >
            <p style={{ fontSize: 13, color: "#475569", marginTop: 0 }}>
                Paste rows copied straight from your Excel sheet (with the header row), or upload a CSV.
                Rows that share the same <b>product id</b> merge into one product with a pack size each.
            </p>

            {requireTarget && (
                <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Target Category</label>
                        <Dropdown value={targetCategoryId} options={categories.map((c) => ({ label: c.name, value: c._id }))}
                            onChange={(e) => { setTargetCategoryId(e.value); setTargetSubCategoryId(""); }} placeholder="Select category" style={{ width: "100%" }} filter />
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Target Sub Category</label>
                        <Dropdown value={targetSubCategoryId} options={targetSubs.map((s) => ({ label: s.name, value: s._id }))}
                            onChange={(e) => setTargetSubCategoryId(e.value)} placeholder="Select sub category" style={{ width: "100%" }} filter />
                    </div>
                </div>
            )}

            <InputTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder={SAMPLE_HINT}
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
                autoResize={false}
            />

            <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "10px 0" }}>
                <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} style={{ display: "none" }} />
                <Button label="Upload CSV/TSV" icon="pi pi-file" className="p-button-outlined p-button-sm" onClick={() => fileRef.current?.click()} type="button" />
                {text && <Button label="Clear" icon="pi pi-times" className="p-button-text p-button-sm" onClick={() => setText("")} type="button" />}
            </div>

            {parsed.unmappedHeaders.length > 0 && (
                <div style={{ fontSize: 12, color: "#b45309", marginBottom: 8 }}>
                    <i className="pi pi-info-circle" /> Ignored unrecognized columns: {parsed.unmappedHeaders.join(", ")}
                </div>
            )}
            {needsTarget && parsed.items.length > 0 && (
                <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 8 }}>
                    <i className="pi pi-exclamation-triangle" /> Select a target category & sub category (or include them as columns) before importing.
                </div>
            )}

            {parsed.items.length > 0 && (
                <DataTable value={parsed.items} scrollable scrollHeight="300px" className="p-datatable-sm p-datatable-gridlines" dataKey="productId">
                    <Column field="productId" header="ID" style={{ width: 80 }} />
                    <Column field="name" header="Product Title" />
                    <Column header="Action" body={actionBody} style={{ width: 90 }} />
                    <Column field="tierCount" header="Packs" style={{ width: 70 }} />
                    <Column header="Status" body={errorBody} />
                </DataTable>
            )}
        </Dialog>
    );
};

export default ProductPasteImportDialog;
