import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import { toast } from "react-toastify";

const SECTION_OPTIONS = [
    { label: "Dimensions & Specs", value: "dims" },
    { label: "Content & SEO", value: "content" },
    { label: "Details (media, related…)", value: "extras" },
];
import { productService } from "../../../services/productService";
import ProductExtrasDialog from "./ProductExtrasDialog";
import {
    deriveSpecColumns,
    getTierList,
    getEntityId,
    buildPriceListPayload,
    gstToPercentLabel,
    normalizeGstToDecimal,
    parseLooseNumber,
    emptyTier,
    isSpecNumeric,
} from "../../../utils/productGrid";
import { normalizePackSizes } from "../../../utils/packSizes";
import { parseLabelModel } from "../../../utils/labelVariants";
import { getProductImageUrl, recoverProductImage } from "../../../utils/productImageUrl";
import { can, isSeoOnlyRole } from "../../../rbac/permissions";

// Every cell in this sheet autosaves a non-SEO product field, so the whole grid
// needs product:update. The SEO role (seo:write only) gets a read-only sheet —
// its updates would be stripped server-side.
// A blank `role` prop (parent still resolving it) falls back to the session role
// instead of reading as "no permissions".
const canEdit = (role) => can("product:update", role || undefined);

const NUMERIC_PRODUCT_FIELDS = new Set(["gst", "availableStock"]);

const MIN_GRID_HEIGHT = 280;
const GRID_BOTTOM_GUTTER = 8;

const toWorking = (product) => ({
    ...product,
    __id: getEntityId(product?._id) || product?._id,
    __tiers: getTierList(product),
});

export const ProductExcelGrid = ({
    products = [],
    brands = [],
    category,
    subCategory,
    context = {},
    role = "",
    loading = false,
    onRefetch,
    onDeleteProduct,
    showCategoryColumns = false,
    emptyMessage = "No products found.",
    visibleSections = ["dims", "content", "extras"],
}) => {
    const editable = canEdit(role);
    const seoOnly = isSeoOnlyRole(role || undefined);
    const [workingProducts, setWorkingProducts] = useState(() => products.map(toWorking));
    const [activePackSizes, setActivePackSizes] = useState([]);
    const [extras, setExtras] = useState({ open: false, productId: null, tab: 0 });
    const [savingCount, setSavingCount] = useState(0);
    const [savedAt, setSavedAt] = useState(null);
    const showSection = useCallback((s) => visibleSections.includes(s), [visibleSections]);
    const saveQueues = useRef({});
    const gridRef = useRef(null);
    const [gridHeight, setGridHeight] = useState(null);

    // The sheet's own scrollbars sit on its bottom/right edges, so the element has to end
    // inside the viewport or the horizontal scrollbar is unreachable. Page chrome above and
    // below varies by route and toolbar wrapping, so measure it instead of hardcoding.
    useLayoutEffect(() => {
        const measure = () => {
            const el = gridRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const docTop = rect.top + window.scrollY;
            const belowGrid = Math.max(0, document.documentElement.scrollHeight - (rect.bottom + window.scrollY));
            setGridHeight(Math.max(MIN_GRID_HEIGHT, window.innerHeight - docTop - belowGrid - GRID_BOTTOM_GUTTER));
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);
    const configuredPackSizes = useMemo(
        () => normalizePackSizes(subCategory?.pack_sizes, []),
        [subCategory],
    );

    const openExtras = (productId, tab) => setExtras({ open: true, productId, tab });
    const extrasProduct = useMemo(
        () => workingProducts.find((wp) => wp.__id === extras.productId) || null,
        [workingProducts, extras.productId],
    );

    // Resync when the parent supplies a new product set (initial load / refetch).
    useEffect(() => {
        const wpList = products.map(toWorking);
        setWorkingProducts(wpList);

        if (configuredPackSizes.length) {
            setActivePackSizes(configuredPackSizes);
            return;
        }

        const sizes = new Set();
        wpList.forEach((wp) => {
            wp.__tiers.forEach((t) => {
                const num = Number(t?.number);
                if (Number.isFinite(num) && num > 0) {
                    sizes.add(num);
                }
            });
        });
        setActivePackSizes(normalizePackSizes(Array.from(sizes)));
    }, [products, configuredPackSizes]);

    const brandOptions = useMemo(
        () => brands.map((b) => ({ label: b.name, value: b._id })),
        [brands],
    );
    const brandLookup = useMemo(
        () => brands.reduce((acc, b) => { acc[b._id] = b.name; return acc; }, {}),
        [brands],
    );

    const isCorrugated = useMemo(() => {
        return String(subCategory?.slug || "").toLowerCase().includes("corrugated") || 
               String(subCategory?.name || "").toLowerCase().includes("corrugated");
    }, [subCategory]);

    const isPaperBag = useMemo(() => {
        return String(subCategory?.slug || "").toLowerCase().includes("paper-bag") || 
               String(subCategory?.name || "").toLowerCase().includes("paper bag");
    }, [subCategory]);

    const isPolyBag = useMemo(() => {
        return String(subCategory?.slug || "").toLowerCase().includes("poly-bag") || 
               String(subCategory?.name || "").toLowerCase().includes("poly bag");
    }, [subCategory]);

    const isLabel = useMemo(() => {
        return String(subCategory?.slug || "").toLowerCase().includes("label") || 
               String(subCategory?.name || "").toLowerCase().includes("label");
    }, [subCategory]);

    const hideColor = isCorrugated || isPaperBag || isPolyBag;
    const hideSacCode = isCorrugated || isPaperBag || isPolyBag || isLabel;
    const hideTaxCategory = isPaperBag || isPolyBag || isLabel;

    const specColumns = useMemo(() => {
        let derived = deriveSpecColumns(workingProducts, category, subCategory)
            .filter((col) => !["size_inch", "size_mm", "color"].includes(col.key));

        if (isCorrugated) {
            const hideKeys = new Set(["length", "width", "label_in_roll", "material", "pouch_weight"]);
            derived = derived.filter((col) => !hideKeys.has(col.key));
        } else if (isPaperBag) {
            const showKeys = new Set(["thickness", "material"]);
            derived = derived.filter((col) => showKeys.has(col.key));
        } else if (isPolyBag) {
            const showKeys = new Set(["thickness_micron", "flap_mm"]);
            derived = derived.filter((col) => showKeys.has(col.key));
        }

        derived = derived.map((col) => {
            if (col.key === "thickness" && isPaperBag) {
                return { ...col, label: "Thickness (gsm)" };
            }
            if (col.key === "gusset" && isPaperBag) {
                return { ...col, label: "Gusset (mm)" };
            }
            if (col.key === "flap_mm") {
                return { ...col, label: "Flap (mm)" };
            }
            return col;
        });

        if (!workingProducts || workingProducts.length === 0) {
            return derived;
        }

        return derived.filter((col) => {
            return workingProducts.some((wp) => {
                const val = wp[col.key];
                return val !== undefined && val !== null && val !== "" && val !== "null" && val !== 0 && val !== "0";
            });
        });
    }, [workingProducts, category, subCategory, isCorrugated, isPaperBag, isPolyBag, isLabel]);

    const rows = useMemo(() => {
        const mapped = workingProducts.map((wp) => {
            const labelParsed = parseLabelModel(wp.model);
            const row = {
                rowKey: wp.__id,
                productId: wp.__id,
                product: wp,
                product_id: wp.product_id ?? "",
                slug: wp.slug ?? "",
                brand: getEntityId(wp.brand) ?? "",
                name: wp.name ?? "",
                model: wp.model ?? "",
                // Quantity variants ("CL_65x70_250/400/500") are separate DB
                // products but one real product; base_model is the rowspan
                // grouping key that merges their Model cell. Rows whose model
                // has no "_<qty>" suffix get a per-row key so unrelated rows
                // (e.g. empty models) never merge.
                base_model: labelParsed?.baseModel ?? (wp.model || `__row_${wp.__id}`),
                base_model_display: labelParsed?.baseModel ?? wp.model ?? "",
                // Read-only, parsed from the model's "_<qty>" suffix (convention:
                // "CL_65x70_250" = 250 labels per roll); label_in_roll as fallback.
                label_qty: labelParsed?.labelQty ?? wp.label_in_roll ?? "",
                size_inch: wp.size_inch ?? "",
                size_mm: wp.size_mm ?? "",
                color: wp.color ?? "",
                delivery_time: wp.delivery_time ?? "",
                hsn_code: wp.hsn_code ?? "",
                sac_code: wp.sac_code ?? "",
                tax_category: wp.tax_category ?? "",
                gst: wp.gst ?? "",
                reviewed_on: wp.reviewed_on ?? "",
                minimumStock: wp.inventory?.minimumStock ?? "",
                availableStock: wp.inventory?.availableStock ?? "",
                top_product: !!wp.top_product,
                deal_product: !!wp.deal_product,
                aboutItem: wp.aboutItem ?? "",
                usage: wp.usage ?? "",
                meta_title: wp.meta_title ?? wp.seo?.meta_title ?? "",
                meta_description: wp.meta_description ?? wp.seo?.meta_description ?? "",
                description: wp.description ?? "",
                categoryName: (wp.category && typeof wp.category === "object") ? wp.category.name : "",
                subCategoryName: (wp.sub_category && typeof wp.sub_category === "object") ? wp.sub_category.name : "",
                ...specColumns.reduce((acc, col) => { acc[col.key] = wp[col.key] ?? ""; return acc; }, {}),
            };

            // Map tier fields to specific size keys
            activePackSizes.forEach((size) => {
                const tier = wp.__tiers.find((t) => Number(t?.number) === Number(size));
                row[`mrp_${size}`] = tier?.original_price ?? "";
                row[`price_${size}`] = tier?.price ?? "";
                row[`price_regional_${size}`] = tier?.price_regional ?? "";
                row[`price_national_${size}`] = tier?.price_national ?? "";
                row[`weight_${size}`] = tier?.pack_weight ?? "";
                row[`stock_${size}`] = tier?.stock_quantity ?? "";
            });

            return row;
        });

        if (!isLabel) return mapped;

        // Rowspan grouping only merges cells on ADJACENT rows, so variants of a
        // base model must sit together: groups keep the parent's ordering (first
        // appearance), quantities sort ascending within a group (mirrors the
        // storefront, where the lowest quantity represents the family).
        const firstSeen = new Map();
        mapped.forEach((row, index) => {
            if (!firstSeen.has(row.base_model)) firstSeen.set(row.base_model, index);
        });
        return [...mapped].sort((a, b) => {
            const groupDiff = firstSeen.get(a.base_model) - firstSeen.get(b.base_model);
            if (groupDiff !== 0) return groupDiff;
            return (Number(a.label_qty) || 0) - (Number(b.label_qty) || 0);
        });
    }, [workingProducts, specColumns, activePackSizes, isLabel]);

    const enqueueSave = useCallback((id, task) => {
        const prev = saveQueues.current[id] || Promise.resolve();
        setSavingCount((c) => c + 1);
        const next = prev
            .then(task)
            .catch((err) => {
                toast.error(err?.response?.data?.message || err?.message || "Save failed");
            })
            .finally(() => {
                setSavingCount((c) => Math.max(0, c - 1));
                setSavedAt(Date.now());
            });
        saveQueues.current[id] = next;
        return next;
    }, []);

    const patchWorkingProduct = useCallback((id, mutate) => {
        setWorkingProducts((prev) => prev.map((wp) => (wp.__id === id ? mutate({ ...wp }) : wp)));
    }, []);

    const saveProductField = useCallback((id, payload) => {
        // Belt-and-braces: the cell editors are already detached when !editable.
        if (!editable) {
            toast.info("This sheet is read-only for your role.");
            return;
        }
        enqueueSave(id, async () => {
            const res = await productService.updateProduct(id, payload);
            if (!res?.success) toast.error(res?.message || "Update failed");
        });
    }, [enqueueSave, editable]);

    const saveTiers = useCallback((id, tiers) => {
        const priceList = buildPriceListPayload(tiers);
        saveProductField(id, { priceList, pricing: { priceList } });
    }, [saveProductField]);

    // --- cell edit completion -------------------------------------------------
    const onCellEditComplete = useCallback((e) => {
        const { rowData, newValue, field } = e;
        const id = rowData.productId;
        const prevValue = rowData[field];
        if (newValue === undefined || String(newValue) === String(prevValue ?? "")) return;

        // Check if this is a pack-size field (e.g., mrp_1, price_1, weight_1, stock_1)
        const match = field.match(/^(mrp|price|price_regional|price_national|weight|stock)_(\d+)$/);
        if (match) {
            const prefix = match[1];
            const size = Number(match[2]);
            
            const fieldMap = {
                mrp: "original_price",
                price: "price",
                price_regional: "price_regional",
                price_national: "price_national",
                weight: "pack_weight",
                stock: "stock_quantity"
            };
            const dbField = fieldMap[prefix];
            const numericVal = newValue === "" ? "" : parseLooseNumber(newValue);

            patchWorkingProduct(id, (wp) => {
                const tiers = wp.__tiers.length ? [...wp.__tiers] : [];
                let tierIndex = tiers.findIndex((t) => Number(t?.number) === size);
                
                const updatedTier = {
                    ...(tierIndex === -1 ? emptyTier() : tiers[tierIndex]),
                    number: size,
                    [dbField]: numericVal
                };

                // Check if all fields in the tier are empty/deleted
                const isTierEmpty =
                    !updatedTier.original_price &&
                    !updatedTier.price &&
                    !updatedTier.price_regional &&
                    !updatedTier.price_national &&
                    !updatedTier.pack_weight &&
                    !updatedTier.stock_quantity;

                if (isTierEmpty) {
                    if (tierIndex !== -1) {
                        tiers.splice(tierIndex, 1);
                    }
                } else {
                    if (tierIndex === -1) {
                        tiers.push(updatedTier);
                    } else {
                        tiers[tierIndex] = updatedTier;
                    }
                }

                wp.__tiers = tiers;
                saveTiers(id, tiers);
                return wp;
            });
            return;
        }

        // product-level field
        if (field === "minimumStock") {
            const stock = parseLooseNumber(newValue) ?? 0;
            patchWorkingProduct(id, (wp) => {
                wp.inventory = { ...(wp.inventory || {}), minimumStock: stock };
                return wp;
            });
            saveProductField(id, { inventory: { minimumStock: stock } });
            return;
        }
        if (field === "availableStock") {
            const stock = parseLooseNumber(newValue) ?? 0;
            patchWorkingProduct(id, (wp) => {
                wp.inventory = { ...(wp.inventory || {}), availableStock: stock };
                return wp;
            });
            saveProductField(id, { inventory: { availableStock: stock } });
            return;
        }
        if (field === "gst") {
            const decimal = normalizeGstToDecimal(newValue);
            patchWorkingProduct(id, (wp) => { wp.gst = decimal; return wp; });
            saveProductField(id, { gst: decimal });
            return;
        }
        // brand / product_id / name / hsn_code / reviewed_on / spec fields
        const value = NUMERIC_PRODUCT_FIELDS.has(field) || isSpecNumeric(field)
            ? parseLooseNumber(newValue)
            : newValue;
        patchWorkingProduct(id, (wp) => { wp[field] = value; return wp; });
        saveProductField(id, { [field]: value });
    }, [patchWorkingProduct, saveProductField, saveTiers]);

    // --- editors --------------------------------------------------------------
    const textEditor = (options) => (
        <InputText
            type="text"
            value={options.value ?? ""}
            onChange={(e) => options.editorCallback(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="grid-cell-input"
            autoFocus
        />
    );

    const numberEditor = (options) => (
        <InputText
            type="number"
            value={options.value ?? ""}
            onChange={(e) => options.editorCallback(e.target.value === "" ? "" : e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="grid-cell-input"
            autoFocus
        />
    );

    const gstEditor = (options) => {
        const num = Number(options.value);
        const initial = options.value === "" || options.value == null || !Number.isFinite(num)
            ? ""
            : String(num > 1 ? num : Math.round(num * 100 * 100) / 100);
        return (
            <InputText
                type="text"
                defaultValue={initial}
                onChange={(e) => options.editorCallback(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="grid-cell-input"
                placeholder="e.g. 5 or 5%"
                autoFocus
                filter
            />
        );
    };

    const brandEditor = (options) => (
        <Dropdown
            value={options.value}
            options={brandOptions}
            onChange={(e) => options.editorCallback(e.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="grid-cell-dropdown"
            placeholder="Select Brand"
            autoFocus
            filter
        />
    );

    const taxCategoryEditor = (options) => (
        <Dropdown
            value={options.value || ""}
            options={[{ label: "Goods", value: "Goods" }, { label: "Services", value: "Services" }]}
            onChange={(e) => options.editorCallback(e.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="grid-cell-dropdown"
            placeholder="Tax"
            autoFocus
        />
    );

    // --- bodies ---------------------------------------------------------------
    // Empty cells read as a muted "--" so a blank never looks like a rendering
    // bug (and the cell is still click-to-edit).
    const productBody = (field, render) => (rowData) => {
        const content = render ? render(rowData) : rowData[field];
        if (content === "" || content === null || content === undefined) {
            return <span className="grid-empty">--</span>;
        }
        return <span>{content}</span>;
    };

    // Long free-text: clamp to one line with an ellipsis and expose the full value
    // on hover (native title tooltip).
    const longTextBody = (field, render) => (rowData) => {
        const raw = render ? render(rowData) : rowData[field];
        const text = raw === undefined || raw === null ? "" : String(raw);
        if (!text) return <span className="grid-empty">--</span>;
        return <span className="grid-truncate" title={text}>{text}</span>;
    };

    const gstBody = productBody("gst", (r) => gstToPercentLabel(r.gst) || "--");
    const brandBody = productBody("brand", (r) => brandLookup[r.brand] || (r.product?.brand?.name) || "--");

    // Boolean flags toggle on a single click (not the double-click cell-edit flow)
    // and autosave immediately.
    const boolBody = (field) => (rowData) => (
        <Checkbox
            checked={!!rowData[field]}
            disabled={!editable}
            onChange={(e) => {
                patchWorkingProduct(rowData.productId, (wp) => { wp[field] = e.checked; return wp; });
                saveProductField(rowData.productId, { [field]: e.checked });
            }}
        />
    );

    // Description is rich HTML edited in the full product editor; show a plain,
    // clamped preview here (read-only, full text on hover).
    const descriptionBody = (rowData) => {
        const text = String(rowData.description || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        if (!text) return <span className="grid-empty">--</span>;
        return <span className="grid-truncate" title={text}>{text}</span>;
    };
    const imageBody = (rowData) => {
        const wp = rowData.product;
        const thumbnailKey = wp?.media?.thumbnail || wp?.images?.[0]?.image || wp?.images?.[0];
        
        let content;
        if (!thumbnailKey) {
            content = <i className="pi pi-image" style={{ fontSize: "1.3rem", color: "#cbd5e1" }}></i>;
        } else {
            const imgUrl = getProductImageUrl(thumbnailKey);

            content = (
                <img
                    src={imgUrl}
                    alt={rowData.name || "Product"}
                    style={{ width: "30px", height: "30px", objectFit: "contain", borderRadius: "4px", border: "1px solid #dee2e6" }}
                    onError={(e) => {
                        recoverProductImage(e.currentTarget, thumbnailKey);
                    }}
                />
            );
        }

        return (
            <div
                onClick={() => openExtras(rowData.productId, 0)}
                style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "36px"
                }}
                title="Click to manage images"
            >
                {content}
            </div>
        );
    };

    // Summary cell for a relational/complex field group. Shows a compact count +
    // an edit button that opens the per-product ProductExtrasDialog at `tab`.
    const extrasBody = (tab, summarize) => (rowData) => {
        const wp = rowData.product;
        return (
            <button
                type="button"
                onClick={() => openExtras(rowData.productId, tab)}
                title="Edit"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #dbe4ff", background: "#f5f8ff", color: "#1d4ed8", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}
            >
                <span>{summarize(wp)}</span>
                <i className="pi pi-pencil" style={{ fontSize: 11 }} />
            </button>
        );
    };

    const countMedia = (wp) => {
        const imgs = (Array.isArray(wp?.media?.gallery) && wp.media.gallery.length ? wp.media.gallery : (wp?.images || [])).length;
        const vids = (wp?.media?.videos || []).length;
        const docs = (wp?.media?.documents || []).length;
        return `${imgs}🖼${vids ? ` ${vids}🎬` : ""}${docs ? ` ${docs}📄` : ""}`;
    };
    const countRelations = (wp) => `${(wp?.buyItWith || []).length}+${(wp?.relatedProducts || []).length}`;
    const countOverview = (wp) => String((wp?.overview_fields || wp?.seo?.overview_fields || []).length);
    const countHidden = (wp) => {
        const fv = wp?.field_visibility || {};
        const hidden = Object.values(fv).filter((v) => v === false).length;
        return hidden ? `${hidden} hidden` : "all";
    };
    const countAttrs = (wp) => String(Object.keys(wp?.attributes || {}).length);

    const actionBody = (rowData) => (
        <div style={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
            {onDeleteProduct && (
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-sm p-button-danger"
                    tooltip="Delete product"
                    tooltipOptions={{ position: "left" }}
                    onClick={() => onDeleteProduct(rowData.product)}
                    type="button"
                    style={{ width: 26, height: 26 }}
                />
            )}
        </div>
    );

    const editorProps = editable
        ? { editMode: "cell" }
        : {};

    const cellEditProps = (baseEditor) => editable
        ? {
            editor: baseEditor,
            onCellEditComplete,
        }
        : {};

    // --- Header Column Group --------------------------------------------------
    const headerGroup = useMemo(() => {
        return (
            <ColumnGroup>
                <Row>
                    {[
                        <Column key="img" header="Img" rowSpan={2} className="grid-sticky-img" style={{ width: 56, minWidth: 56, maxWidth: 56, textAlign: "center" }} />,
                        <Column key="id" header="ID" rowSpan={2} className="grid-sticky-id" style={{ width: 120, minWidth: 120, maxWidth: 120, fontWeight: 600 }} />,
                        <Column key="brand" header="Brand" rowSpan={2} style={{ minWidth: 120 }} />,
                        <Column key="name" header="Product Title" rowSpan={2} style={{ minWidth: 170, textTransform: "capitalize" }} />,
                        <Column key="model" header="Model" rowSpan={2} style={{ minWidth: 80 }} />,
                        ...(isLabel ? [<Column key="label_qty" header="Label Qty" rowSpan={2} className="grid-num" style={{ minWidth: 74 }} />] : []),
                        <Column key="slug" header="Slug" rowSpan={2} style={{ minWidth: 150 }} />,
                        ...(showCategoryColumns ? [
                            <Column key="cat" header="Category" rowSpan={2} style={{ minWidth: 110 }} />,
                            <Column key="sub" header="Sub Category" rowSpan={2} style={{ minWidth: 120 }} />
                        ] : []),
                        ...(showSection("dims") ? [
                            <Column key="size_inch_h" header="Size (Inch)" rowSpan={2} className="grid-section-start" style={{ minWidth: 90 }} />,
                            <Column key="size_mm_h" header="Size (MM)" rowSpan={2} style={{ minWidth: 90 }} />,
                            ...(!hideColor ? [<Column key="color_h" header="Color" rowSpan={2} style={{ minWidth: 80 }} />] : []),
                            ...specColumns.map((col) => (
                                <Column key={col.key} header={col.label} rowSpan={2} className={isSpecNumeric(col.key) ? "grid-num" : ""} style={{ minWidth: 78 }} />
                            )),
                        ] : []),
                        <Column key="hsn" header="HSN Code" rowSpan={2} className="grid-section-start" style={{ minWidth: 96 }} />,
                        ...(!hideSacCode ? [<Column key="sac" header="SAC Code" rowSpan={2} style={{ minWidth: 90 }} />] : []),
                        ...(!hideTaxCategory ? [<Column key="tax" header="Tax Category" rowSpan={2} style={{ minWidth: 110 }} />] : []),
                        <Column key="gst" header="GST" rowSpan={2} className="grid-num" style={{ minWidth: 62 }} />,

                        ...activePackSizes.map((size) => (
                            <Column key={`group_${size}`} header={String(size)} colSpan={isPaperBag ? 6 : 4} alignHeader="center" style={{ minWidth: isPaperBag ? 480 : 320, textAlign: "center" }} />
                        )),

                        <Column key="stock_reqd" header="Stock Reqd" rowSpan={2} className="grid-section-start grid-num" style={{ minWidth: 82 }} />,
                        <Column key="stock_avail" header="Available Stock" rowSpan={2} className="grid-num" style={{ minWidth: 95 }} />,
                        <Column key="delivery" header="Delivery" rowSpan={2} style={{ minWidth: 110 }} />,
                        ...(!isCorrugated ? [<Column key="reviewed" header="Reviewed On" rowSpan={2} style={{ minWidth: 96 }} />] : []),
                        <Column key="top" header="Top" rowSpan={2} style={{ minWidth: 52, textAlign: "center" }} />,
                        <Column key="deal" header="Deal" rowSpan={2} style={{ minWidth: 52, textAlign: "center" }} />,
                        ...(showSection("content") ? [
                            <Column key="about_h" header="About Item" rowSpan={2} className="grid-section-start" style={{ minWidth: 160 }} />,
                            <Column key="usage_h" header="Usage" rowSpan={2} style={{ minWidth: 160 }} />,
                            <Column key="meta_title_h" header="Meta Title" rowSpan={2} style={{ minWidth: 150 }} />,
                            <Column key="meta_desc_h" header="Meta Description" rowSpan={2} style={{ minWidth: 180 }} />,
                            <Column key="desc_h" header="Description" rowSpan={2} style={{ minWidth: 180 }} />,
                        ] : []),
                        ...(showSection("extras") ? [
                            <Column key="media_h" header="Media" rowSpan={2} className="grid-section-start" style={{ minWidth: 90, textAlign: "center" }} />,
                            <Column key="related_h" header="Related" rowSpan={2} style={{ minWidth: 80, textAlign: "center" }} />,
                            <Column key="overview_h" header="Overview" rowSpan={2} style={{ minWidth: 80, textAlign: "center" }} />,
                            <Column key="visibility_h" header="Visibility" rowSpan={2} style={{ minWidth: 84, textAlign: "center" }} />,
                            <Column key="attrs_h" header="Attributes" rowSpan={2} style={{ minWidth: 90, textAlign: "center" }} />,
                        ] : []),
                        ...(editable ? [<Column key="action" header="" rowSpan={2} style={{ minWidth: 52 }} />] : []),
                    ]}
                </Row>
                <Row>
                    {activePackSizes.map((size) => {
                        const cols = [
                            <Column key={`mrp_h_${size}`} header="MRP" alignHeader="center" style={{ minWidth: 80, textAlign: "center" }} />,
                            <Column key={`price_h_${size}`} header="SP local" alignHeader="center" style={{ minWidth: 80, textAlign: "center" }} />
                        ];
                        if (isPaperBag) {
                            cols.push(
                                <Column key={`price_regional_h_${size}`} header="SP regional" alignHeader="center" style={{ minWidth: 80, textAlign: "center" }} />,
                                <Column key={`price_national_h_${size}`} header="SP national" alignHeader="center" style={{ minWidth: 80, textAlign: "center" }} />
                            );
                        }
                        cols.push(
                            <Column key={`weight_h_${size}`} header="Weight" alignHeader="center" style={{ minWidth: 80, textAlign: "center" }} />,
                            <Column key={`stock_h_${size}`} header="Stock" alignHeader="center" style={{ minWidth: 80, textAlign: "center" }} />
                        );
                        return cols;
                    }).flat()}
                </Row>
            </ColumnGroup>
        );
    }, [activePackSizes, specColumns, showCategoryColumns, editable, showSection, isCorrugated, isPaperBag, isPolyBag, isLabel, hideColor]);

    return (
        <>
            <style>{`
                .product-excel-grid {
                    width: 100%;
                    max-width: 100%;
                    /* Fallback only; the real height is measured against the viewport at runtime. */
                    height: calc(100vh - 300px);
                    min-height: ${MIN_GRID_HEIGHT}px;
                    overflow: auto;
                    overscroll-behavior-x: contain;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                }
                .product-excel-grid::-webkit-scrollbar {
                    width: 14px;
                    height: 14px;
                }
                .product-excel-grid::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .product-excel-grid::-webkit-scrollbar-thumb {
                    background: #94a3b8;
                    border: 3px solid #f1f5f9;
                    border-radius: 8px;
                }
                .product-excel-grid::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
                /* The admin-wide card styling in App.scss puts overflow:hidden on every
                   .p-datatable, which would clip this sheet's width away before the scroll
                   container below ever sees it. Keep .product-excel-grid the only scroller. */
                .product-excel-grid .p-datatable,
                .product-excel-grid .p-datatable-wrapper {
                    overflow: visible !important;
                    border-radius: 0 !important;
                }
                .product-excel-grid .p-datatable-table { min-width: max-content; }
                .product-excel-grid .p-datatable-thead > tr:nth-child(1) > th {
                    position: sticky;
                    top: 0;
                    z-index: 11;
                }
                .product-excel-grid .p-datatable-thead > tr:nth-child(2) > th {
                    position: sticky;
                    top: 29px;
                    z-index: 10;
                }
                .product-excel-grid .p-datatable-thead > tr > th {
                    padding: 6px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: .02em; background: #f8fafc; white-space: nowrap;
                    border: 1px solid #cbd5e1 !important;
                }
                .product-excel-grid .p-datatable-tbody > tr > td {
                    padding: 2px 6px; font-size: 12.5px; border: 1px solid #cbd5e1 !important;
                    white-space: nowrap; vertical-align: middle;
                    overflow: hidden !important; text-overflow: ellipsis !important;
                }
                .product-excel-grid .p-datatable-tbody > tr > td.p-cell-editing { padding: 0; }
                .product-excel-grid .grid-cell-input {
                    width: 100%; min-width: 60px; height: 30px; border: 2px solid #6366f1;
                    border-radius: 3px; padding: 2px 6px; font-size: 12.5px;
                }
                .product-excel-grid .grid-cell-dropdown { width: 100%; min-width: 110px; height: 30px; }
                .product-excel-grid .grid-cell-dropdown .p-dropdown-label { padding: 4px 6px; font-size: 12.5px; }
                .product-excel-grid .grid-muted { color: #cbd5e1; }
                .product-excel-grid .grid-empty { color: #cbd5e1; }
                /* Zebra striping for readability across a very wide sheet. */
                .product-excel-grid .p-datatable-tbody > tr:nth-child(even) > td { background: #fbfcfe; }
                .product-excel-grid .p-datatable-tbody > tr:hover > td { background: #eef4ff; }
                .product-excel-grid .grid-tier-cell { background: #fffdf5; }
                .product-excel-grid .p-datatable-tbody > tr:hover > td.grid-tier-cell { background: #fff7e6; }
                /* Numbers read right-aligned. */
                .product-excel-grid td.grid-num, .product-excel-grid th.grid-num { text-align: right; }
                /* Merged Model cell spanning a label's quantity variants. */
                .product-excel-grid .p-datatable-tbody > tr > td[rowspan] { font-weight: 600; }
                /* Editable cells hint they're clickable. */
                .product-excel-grid .p-datatable-tbody > tr > td.p-editable-column { cursor: cell; }
                .product-excel-grid .p-datatable-tbody > tr > td.p-editable-column:hover { box-shadow: inset 0 0 0 1px #c7d2fe; }
                /* One-line clamp for long free-text, full value on hover. */
                .product-excel-grid .grid-truncate {
                    display: inline-block; max-width: 240px; overflow: hidden;
                    text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom;
                }
                /* Light left divider where a new column section begins. */
                .product-excel-grid td.grid-section-start, .product-excel-grid th.grid-section-start {
                    border-left: 2px solid #818cf8 !important;
                }

                /* Sticky column logic for Img and ID */
                .product-excel-grid th.grid-sticky-img {
                    position: sticky !important;
                    left: 0 !important;
                    z-index: 13 !important;
                    background: #f8fafc !important;
                    background-clip: padding-box !important;
                    border-right: 1px solid #cbd5e1 !important;
                }
                .product-excel-grid td.grid-sticky-img {
                    position: sticky !important;
                    left: 0 !important;
                    z-index: 9 !important;
                    background: #ffffff !important;
                    background-clip: padding-box !important;
                    border-right: 1px solid #cbd5e1 !important;
                }
                .product-excel-grid th.grid-sticky-id {
                    position: sticky !important;
                    left: 56px !important;
                    z-index: 13 !important;
                    background: #f8fafc !important;
                    background-clip: padding-box !important;
                    border-right: 2px solid #94a3b8 !important;
                }
                .product-excel-grid td.grid-sticky-id {
                    position: sticky !important;
                    left: 56px !important;
                    z-index: 9 !important;
                    background: #ffffff !important;
                    background-clip: padding-box !important;
                    border-right: 2px solid #94a3b8 !important;
                }

                /* Hover backgrounds for sticky columns */
                .product-excel-grid .p-datatable-tbody > tr:nth-child(even) > td.grid-sticky-img,
                .product-excel-grid .p-datatable-tbody > tr:nth-child(even) > td.grid-sticky-id {
                    background: #fbfcfe !important;
                    background-clip: padding-box !important;
                }
                .product-excel-grid .p-datatable-tbody > tr:nth-child(odd) > td.grid-sticky-img,
                .product-excel-grid .p-datatable-tbody > tr:nth-child(odd) > td.grid-sticky-id {
                    background: #ffffff !important;
                    background-clip: padding-box !important;
                }
                .product-excel-grid .p-datatable-tbody > tr:hover > td.grid-sticky-img,
                .product-excel-grid .p-datatable-tbody > tr:hover > td.grid-sticky-id {
                    background: #eef4ff !important;
                    background-clip: padding-box !important;
                }
            `}</style>
            {editable && (savingCount > 0 || savedAt) ? (
                <div style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 9999,
                    backgroundColor: savingCount > 0 ? "#fef3c7" : "#dcfce7",
                    color: savingCount > 0 ? "#b45309" : "#15803d",
                    border: savingCount > 0 ? "1px solid #f59e0b" : "1px solid #22c55e",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    borderRadius: "9999px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    pointerEvents: "none"
                }}>
                    {savingCount > 0 ? (
                        <>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: 13, color: "#d97706" }} />
                            <span>Saving changes…</span>
                        </>
                    ) : (
                        <>
                            <i className="pi pi-check-circle" style={{ fontSize: 13, color: "#16a34a" }} />
                            <span>All changes saved</span>
                        </>
                    )}
                </div>
            ) : null}
            {!editable ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 8, borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: 12 }}>
                    <i className="pi pi-lock" style={{ fontSize: 12 }} />
                    <span>
                        {seoOnly
                            ? "Read-only sheet for the SEO role — bulk cell edits write pricing, stock and spec fields, which your role cannot change. Open a product to edit its SEO fields."
                            : "Read-only sheet — editing products needs the catalog product permission."}
                    </span>
                </div>
            ) : null}
            <div className="product-excel-grid" ref={gridRef} style={gridHeight ? { height: `${gridHeight}px` } : undefined}>
                <DataTable
                    value={rows}
                    dataKey="rowKey"
                    loading={loading}
                    emptyMessage={emptyMessage}
                    className="p-datatable-sm p-datatable-gridlines"
                    headerColumnGroup={headerGroup}
                    {...(isLabel ? { rowGroupMode: "rowspan", groupRowsBy: "base_model" } : {})}
                    {...editorProps}
                >
                    <Column field="images" className="grid-sticky-img" style={{ width: 56, minWidth: 56, maxWidth: 56, textAlign: "center" }} body={imageBody} />
                    <Column field="product_id" className="grid-sticky-id" style={{ width: 120, minWidth: 120, maxWidth: 120, fontWeight: 600 }}
                        body={productBody("product_id")} {...cellEditProps(textEditor)} />
                    <Column field="brand" style={{ minWidth: 120 }}
                        body={brandBody} {...cellEditProps(brandEditor)} />
                    <Column field="name" style={{ minWidth: 170, textTransform: "capitalize" }}
                        body={longTextBody("name")} {...cellEditProps(textEditor)} />
                    {isLabel ? (
                        // Merged (rowspan) across quantity variants of one base
                        // model; read-only here — the full per-variant model
                        // stays editable on the product edit page.
                        <Column field="base_model" style={{ minWidth: 80 }}
                            body={productBody("base_model_display")} />
                    ) : (
                        <Column field="model" style={{ minWidth: 80 }}
                            body={productBody("model")} {...cellEditProps(textEditor)} />
                    )}
                    {isLabel && (
                        <Column field="label_qty" className="grid-num" style={{ minWidth: 74 }}
                            body={productBody("label_qty")} />
                    )}
                    <Column field="slug" style={{ minWidth: 150 }}
                        body={longTextBody("slug")} {...cellEditProps(textEditor)} />

                    {showCategoryColumns && [
                        <Column key="__cat" field="categoryName" style={{ minWidth: 110 }} body={productBody("categoryName")} />,
                        <Column key="__sub" field="subCategoryName" style={{ minWidth: 120 }} body={productBody("subCategoryName")} />,
                    ]}

                    {showSection("dims") && [
                        <Column key="size_inch" field="size_inch" className="grid-section-start" style={{ minWidth: 90 }}
                            body={productBody("size_inch")} {...cellEditProps(textEditor)} />,
                        <Column key="size_mm" field="size_mm" style={{ minWidth: 90 }}
                            body={productBody("size_mm")} {...cellEditProps(textEditor)} />,
                        ...(!hideColor ? [
                            <Column key="color" field="color" style={{ minWidth: 80 }}
                                body={productBody("color")} {...cellEditProps(textEditor)} />
                        ] : []),
                        ...specColumns.map((col) => (
                            <Column
                                key={col.key}
                                field={col.key}
                                className={isSpecNumeric(col.key) ? "grid-num" : ""}
                                style={{ minWidth: 78 }}
                                body={productBody(col.key)}
                                {...cellEditProps(isSpecNumeric(col.key) ? numberEditor : textEditor)}
                            />
                        )),
                    ]}

                    <Column field="hsn_code" className="grid-section-start" style={{ minWidth: 96 }}
                        body={productBody("hsn_code")} {...cellEditProps(textEditor)} />
                    {!hideSacCode && (
                        <Column field="sac_code" style={{ minWidth: 90 }}
                            body={productBody("sac_code")} {...cellEditProps(textEditor)} />
                    )}
                    {!hideTaxCategory && (
                        <Column field="tax_category" style={{ minWidth: 110 }}
                            body={productBody("tax_category")} {...cellEditProps(taxCategoryEditor)} />
                    )}
                    <Column field="gst" className="grid-num" style={{ minWidth: 62 }}
                        body={gstBody} {...cellEditProps(gstEditor)} />

                    {activePackSizes.map((size) => {
                        const cols = [
                            <Column key={`mrp_${size}`} field={`mrp_${size}`} bodyClassName="grid-tier-cell grid-num grid-section-start" style={{ minWidth: 80 }}
                                {...cellEditProps(numberEditor)} />,
                            <Column key={`price_${size}`} field={`price_${size}`} bodyClassName="grid-tier-cell grid-num" style={{ minWidth: 80 }}
                                {...cellEditProps(numberEditor)} />
                        ];
                        if (isPaperBag) {
                            cols.push(
                                <Column key={`price_regional_${size}`} field={`price_regional_${size}`} bodyClassName="grid-tier-cell grid-num" style={{ minWidth: 80 }}
                                    {...cellEditProps(numberEditor)} />,
                                <Column key={`price_national_${size}`} field={`price_national_${size}`} bodyClassName="grid-tier-cell grid-num" style={{ minWidth: 80 }}
                                    {...cellEditProps(numberEditor)} />
                            );
                        }
                        cols.push(
                            <Column key={`weight_${size}`} field={`weight_${size}`} bodyClassName="grid-tier-cell grid-num" style={{ minWidth: 80 }}
                                {...cellEditProps(numberEditor)} />,
                            <Column key={`stock_${size}`} field={`stock_${size}`} bodyClassName="grid-tier-cell grid-num" style={{ minWidth: 80 }}
                                {...cellEditProps(numberEditor)} />
                        );
                        return cols;
                    }).flat()}

                    <Column field="minimumStock" className="grid-num" bodyClassName="grid-section-start grid-num" style={{ minWidth: 82 }}
                        body={productBody("minimumStock")} {...cellEditProps(numberEditor)} />
                    <Column field="availableStock" className="grid-num" style={{ minWidth: 95 }}
                        body={productBody("availableStock")} {...cellEditProps(numberEditor)} />
                    <Column field="delivery_time" style={{ minWidth: 110 }}
                        body={productBody("delivery_time")} {...cellEditProps(textEditor)} />
                    {!isCorrugated && (
                        <Column field="reviewed_on" style={{ minWidth: 96 }}
                            body={productBody("reviewed_on")} {...cellEditProps(textEditor)} />
                    )}
                    <Column field="top_product" style={{ minWidth: 52, textAlign: "center" }} body={boolBody("top_product")} />
                    <Column field="deal_product" style={{ minWidth: 52, textAlign: "center" }} body={boolBody("deal_product")} />
                    {showSection("content") && [
                        <Column key="aboutItem" field="aboutItem" className="grid-section-start" style={{ minWidth: 160 }}
                            body={longTextBody("aboutItem")} {...cellEditProps(textEditor)} />,
                        <Column key="usage" field="usage" style={{ minWidth: 160 }}
                            body={longTextBody("usage")} {...cellEditProps(textEditor)} />,
                        <Column key="meta_title" field="meta_title" style={{ minWidth: 150 }}
                            body={longTextBody("meta_title")} {...cellEditProps(textEditor)} />,
                        <Column key="meta_description" field="meta_description" style={{ minWidth: 180 }}
                            body={longTextBody("meta_description")} {...cellEditProps(textEditor)} />,
                        <Column key="description" field="description" style={{ minWidth: 180 }} body={descriptionBody} />,
                    ]}
                    {showSection("extras") && [
                        <Column key="x_media" className="grid-section-start" style={{ minWidth: 90, textAlign: "center" }} body={extrasBody(0, countMedia)} />,
                        <Column key="x_related" style={{ minWidth: 80, textAlign: "center" }} body={extrasBody(1, countRelations)} />,
                        <Column key="x_overview" style={{ minWidth: 80, textAlign: "center" }} body={extrasBody(2, countOverview)} />,
                        <Column key="x_visibility" style={{ minWidth: 84, textAlign: "center" }} body={extrasBody(3, countHidden)} />,
                        <Column key="x_attrs" style={{ minWidth: 90, textAlign: "center" }} body={extrasBody(4, countAttrs)} />,
                    ]}

                    {editable && <Column body={actionBody} style={{ minWidth: 52 }} />}
                </DataTable>
            </div>
            <ProductExtrasDialog
                product={extrasProduct}
                allProducts={products}
                visible={extras.open}
                initialTab={extras.tab}
                readOnly={!editable}
                onHide={() => setExtras((prev) => ({ ...prev, open: false }))}
                onSaved={onRefetch}
            />
        </>
    );
};

export default ProductExcelGrid;
