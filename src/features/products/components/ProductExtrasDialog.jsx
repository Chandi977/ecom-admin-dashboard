import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import { toast } from "react-toastify";
import { productService } from "../../../services/productService";
import { DEV } from "../../../services/constants";
import { CommonAttributesEditor, attributesToPairs, pairsToAttributes } from "../../../components/CategoryAttributesEditor";
import { FieldVisibilityGrid } from "../../../components/FieldVisibilityGrid";
import { FIELD_VISIBILITY_GROUPS, normalizeFieldVisibility, specVisibilityKey, labelFromSpecKey } from "../../../utils/fieldVisibility";
import { SPEC_FIELD_KEYS, getEntityId } from "../../../utils/productGrid";

const imgUrlOf = (key) => (String(key || "").startsWith("http") ? key : `${DEV}/getImage?image=${key}`);
// Accepts every shape an image can arrive in: a raw key string, a stored
// { image } entry, or the { key, url } upload response.
const keyOf = (img) => (img && typeof img === "object" ? (img.image ?? img.key ?? "") : img);

// Per-product editor for the relational / complex fields that don't fit a flat
// spreadsheet cell: media (gallery/videos/documents), buy-it-with + related
// products, quick-overview rows, storefront field visibility, and per-product
// overrides of the category's common attributes. One Save writes them together.
// `readOnly` is set for roles without product:update (e.g. the SEO role): this
// dialog writes media, relations, attributes and field visibility, none of which
// survive the backend's field-scoped filter for them.
export const ProductExtrasDialog = ({ product, allProducts = [], visible, onHide, initialTab = 0, readOnly = false, onSaved }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef(null);

    // media
    const [thumbnail, setThumbnail] = useState("");
    const [gallery, setGallery] = useState([]);
    const [videos, setVideos] = useState([]);
    const [documents, setDocuments] = useState([]);
    // relationships
    const [buyItWith, setBuyItWith] = useState([]);
    const [related, setRelated] = useState([]);
    // overview / visibility / attributes
    const [overview, setOverview] = useState([]);
    const [visibility, setVisibility] = useState({});
    const [attrPairs, setAttrPairs] = useState([]);

    useEffect(() => { setActiveTab(initialTab); }, [initialTab, visible]);

    useEffect(() => {
        if (!product) return;
        const media = product.media || {};
        const galleryKeys = (Array.isArray(media.gallery) && media.gallery.length
            ? media.gallery
            : (Array.isArray(product.images) ? product.images : [])).map(keyOf).filter(Boolean);
        setThumbnail(media.thumbnail || galleryKeys[0] || "");
        setGallery(galleryKeys);
        setVideos(Array.isArray(media.videos) ? media.videos : []);
        setDocuments(Array.isArray(media.documents) ? media.documents : []);
        setBuyItWith((product.buyItWith || []).map(getEntityId).filter(Boolean));
        setRelated((product.relatedProducts || []).map(getEntityId).filter(Boolean));
        const ov = product.overview_fields || product.seo?.overview_fields || [];
        setOverview(ov.map((f) => ({ label: f.label ?? "", value: f.value ?? "", key: f.key, visible: f.visible !== false })));
        setVisibility(product.field_visibility && typeof product.field_visibility === "object" ? { ...product.field_visibility } : {});
        setAttrPairs(attributesToPairs(product.attributes || {}));
    }, [product, visible]);

    // Options for the relationship pickers: loaded products + any already-linked
    // id that isn't in the loaded set (so existing links are never dropped).
    const productOptions = useMemo(() => {
        const opts = allProducts
            .filter((p) => getEntityId(p._id) !== getEntityId(product?._id))
            .map((p) => ({ label: `${p.product_id ? p.product_id + " - " : ""}${p.name || ""}`.trim() || String(p._id), value: getEntityId(p._id) }));
        const known = new Set(opts.map((o) => o.value));
        [...buyItWith, ...related].forEach((id) => { if (id && !known.has(id)) { known.add(id); opts.push({ label: String(id), value: id }); } });
        return opts;
    }, [allProducts, product, buyItWith, related]);

    // Field-visibility groups = the fixed groups + a dynamic group of this
    // product's spec rows (spec:<key>), so every rendered field is toggleable.
    const visibilityGroups = useMemo(() => {
        const specKeys = SPEC_FIELD_KEYS.filter((k) => product && product[k] !== undefined && product[k] !== null && product[k] !== "");
        const specGroup = specKeys.length
            ? [{ title: "Specification Rows", description: "Individual spec rows shown on this product.", items: specKeys.map((k) => ({ key: specVisibilityKey(k), label: labelFromSpecKey(k) })) }]
            : [];
        return [...FIELD_VISIBILITY_GROUPS, ...specGroup];
    }, [product]);

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        if (readOnly) {
            toast.info("These details are read-only for your role.");
            return;
        }
        try {
            const keys = [];
            for (const file of files) {
                // uploadImage resolves to { key, url } — gallery holds bare S3 keys.
                const key = keyOf(await productService.uploadImage(file));
                if (key) keys.push(key);
            }
            setGallery((prev) => {
                const next = [...prev, ...keys];
                if (!thumbnail && next[0]) setThumbnail(next[0]);
                return next;
            });
            toast.success(`${keys.length} image(s) uploaded.`);
        } catch (err) {
            toast.error(err?.message || "Upload failed");
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const handleSave = async () => {
        if (!product) return;
        if (readOnly) {
            toast.info("These details are read-only for your role.");
            return;
        }
        setSaving(true);
        try {
            const overviewPayload = overview
                .filter((f) => String(f.label || "").trim())
                .map((f) => ({ label: f.label.trim(), value: f.value ?? "", ...(f.key ? { key: f.key } : {}), visible: f.visible !== false }));
            const payload = {
                images: gallery.map((k) => ({ image: k })),
                media: { thumbnail: thumbnail || gallery[0] || "", gallery, videos, documents },
                buyItWith,
                relatedProducts: related,
                overview_fields: overviewPayload,
                field_visibility: normalizeFieldVisibility(visibility),
                attributes: pairsToAttributes(attrPairs),
            };
            const res = await productService.updateProduct(getEntityId(product._id), payload);
            if (res?.success) {
                toast.success("Product details saved.");
                if (onSaved) await onSaved();
                onHide();
            } else {
                toast.error(res?.message || "Save failed");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const removeAt = (setter) => (index) => setter((prev) => prev.filter((_, i) => i !== index));
    const stringListEditor = (list, setter, placeholder) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {list.map((val, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <InputText value={val} onChange={(e) => setter(list.map((v, vi) => (vi === i ? e.target.value : v)))} disabled={readOnly} style={{ flex: 1 }} className="Input__Round" />
                    {!readOnly && <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => removeAt(setter)(i)} type="button" />}
                </div>
            ))}
            {!readOnly && (
                <Button label="Add" icon="pi pi-plus" className="p-button-outlined p-button-sm" style={{ width: 120 }} onClick={() => setter([...list, ""])} type="button" placeholder={placeholder} />
            )}
        </div>
    );

    const readOnlyNote = (
        <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
            Read-only for your role — this is owned by the catalog team.
        </p>
    );

    const footer = (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            {readOnly && (
                <small style={{ color: "#94a3b8", marginRight: "auto" }}>
                    Read-only for your role — media, relations and attributes belong to the catalog team.
                </small>
            )}
            <Button label={readOnly ? "Close" : "Cancel"} className="p-button-text" onClick={onHide} disabled={saving} />
            {!readOnly && (
                <Button label={saving ? "Saving…" : "Save"} icon={saving ? "pi pi-spin pi-spinner" : "pi pi-save"} onClick={handleSave} disabled={saving} />
            )}
        </div>
    );

    return (
        <Dialog
            header={`Product Details — ${product?.product_id || product?.name || ""}`}
            visible={visible}
            onHide={saving ? () => {} : onHide}
            style={{ width: "min(920px, 96vw)" }}
            footer={footer}
            maximizable
        >
            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                <TabPanel header="Media">
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                            <label className="Label__Text" style={{ fontWeight: 600 }}>Gallery Images</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                                {gallery.map((key, i) => (
                                    <div key={`${key}-${i}`} style={{ position: "relative", border: thumbnail === key ? "2px solid #6366f1" : "1px solid #dee2e6", borderRadius: 6, padding: 2 }}>
                                        <img src={imgUrlOf(key)} alt="" style={{ width: 72, height: 72, objectFit: "contain", display: "block" }} onError={(e) => { e.currentTarget.style.opacity = 0.3; }} />
                                        {!readOnly && (
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                                            <Button icon="pi pi-star" className={`p-button-text p-button-sm ${thumbnail === key ? "p-button-warning" : ""}`} tooltip="Set as thumbnail" onClick={() => setThumbnail(key)} type="button" style={{ width: 26, height: 24 }} />
                                            <Button icon="pi pi-times" className="p-button-text p-button-sm p-button-danger" onClick={() => { setGallery(gallery.filter((_, gi) => gi !== i)); if (thumbnail === key) setThumbnail(""); }} type="button" style={{ width: 26, height: 24 }} />
                                        </div>
                                        )}
                                    </div>
                                ))}
                                {gallery.length === 0 && <span style={{ color: "#94a3b8", fontSize: 13 }}>No images yet.</span>}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: "none" }} />
                            {readOnly ? (
                                <div style={{ marginTop: 10 }}>{readOnlyNote}</div>
                            ) : (
                                <Button label="Upload Images" icon="pi pi-upload" className="p-button-outlined p-button-sm" style={{ marginTop: 10 }} onClick={() => fileRef.current?.click()} type="button" />
                            )}
                        </div>
                        <div>
                            <label className="Label__Text" style={{ fontWeight: 600 }}>Video URLs</label>
                            <div style={{ marginTop: 6 }}>{stringListEditor(videos, setVideos, "https://…")}</div>
                        </div>
                        <div>
                            <label className="Label__Text" style={{ fontWeight: 600 }}>Document URLs</label>
                            <div style={{ marginTop: 6 }}>{stringListEditor(documents, setDocuments, "https://…")}</div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Relationships">
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label className="Label__Text" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Buy It With</label>
                            <MultiSelect value={buyItWith} options={productOptions} onChange={(e) => setBuyItWith(e.value)} filter display="chip" placeholder="Select products" disabled={readOnly} style={{ width: "100%" }} />
                        </div>
                        <div>
                            <label className="Label__Text" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Related Products</label>
                            <MultiSelect value={related} options={productOptions} onChange={(e) => setRelated(e.value)} filter display="chip" placeholder="Select products" disabled={readOnly} style={{ width: "100%" }} />
                        </div>
                        {readOnly ? readOnlyNote : null}
                    </div>
                </TabPanel>

                <TabPanel header="Overview Fields">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <small className="p-text-secondary">Quick-overview rows shown on the product page. Untick to hide a row.</small>
                        {overview.map((f, i) => (
                            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <InputText value={f.label} placeholder="Label" onChange={(e) => setOverview(overview.map((r, ri) => (ri === i ? { ...r, label: e.target.value } : r)))} disabled={readOnly} style={{ flex: "1 1 160px" }} className="Input__Round" />
                                <InputText value={f.value} placeholder="Value" onChange={(e) => setOverview(overview.map((r, ri) => (ri === i ? { ...r, value: e.target.value } : r)))} disabled={readOnly} style={{ flex: "1 1 160px" }} className="Input__Round" />
                                <label style={{ display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                                    <Checkbox checked={f.visible !== false} disabled={readOnly} onChange={(e) => setOverview(overview.map((r, ri) => (ri === i ? { ...r, visible: e.checked } : r)))} />
                                    <span style={{ fontSize: 12 }}>Show</span>
                                </label>
                                {!readOnly && <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => removeAt(setOverview)(i)} type="button" />}
                            </div>
                        ))}
                        {readOnly ? readOnlyNote : (
                            <Button label="Add Row" icon="pi pi-plus" className="p-button-outlined p-button-sm" style={{ width: 130 }} onClick={() => setOverview([...overview, { label: "", value: "", visible: true }])} type="button" />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Field Visibility">
                    {/* FieldVisibilityGrid has no read-only mode, so show the note
                        instead of toggles that would be discarded on save. */}
                    {readOnly ? readOnlyNote : (
                        <FieldVisibilityGrid
                            groups={visibilityGroups}
                            value={visibility}
                            onToggle={(key, checked) => setVisibility((prev) => ({ ...prev, [key]: checked }))}
                        />
                    )}
                </TabPanel>

                <TabPanel header="Common Attributes">
                    {readOnly ? readOnlyNote : <CommonAttributesEditor value={attrPairs} onChange={setAttrPairs} />}
                </TabPanel>
            </TabView>
        </Dialog>
    );
};

export default ProductExtrasDialog;
