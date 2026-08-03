import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { productService } from "../../services/productService";
import { PRODUCT_SORT_OPTIONS, sortProducts } from "../../utils/productSorting";
import ProductExcelGrid from "../../features/products/components/ProductExcelGrid";
import ProductPasteImportDialog from "../../features/products/components/ProductPasteImportDialog";
import { MultiSelect } from "primereact/multiselect";
import { normalizePackSizes } from "../../utils/packSizes";
import Editor from "../../components/SafeRichTextEditor";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { can, isSeoOnlyRole } from "../../rbac/permissions";


const SECTION_OPTIONS = [
    { label: "Dimensions & Specs", value: "dims" },
    { label: "Content & SEO", value: "content" },
    { label: "Details (media, related…)", value: "extras" },
];

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const getId = (value) => (typeof value === "object" ? value?._id : value);

const toFaqRows = (faqs) =>
    (Array.isArray(faqs) ? faqs : []).map((faq) => ({
        question: String(faq?.question || ""),
        answer: String(faq?.answer || ""),
    }));

const normalizeSeoContent = (content) => ({
    heading: String(content?.heading || "").trim(),
    description: String(content?.description || "").trim(),
    faqs: toFaqRows(content?.faqs)
        .map((faq) => ({
            question: faq.question.trim(),
            answer: faq.answer.trim(),
        }))
        .filter((faq) => faq.question && faq.answer),
});

const seoContentMatches = (expected, actual) =>
    JSON.stringify(normalizeSeoContent(expected)) === JSON.stringify(normalizeSeoContent(actual));

function SubCategory() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [role, setRole] = useState("");

    useEffect(() => {
        setRole(localStorage.getItem("role"));
    }, []);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [subCategoryProducts, setSubCategoryProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [sortBy, setSortBy] = useState("");
    const [importOpen, setImportOpen] = useState(false);
    const [packSizeOpen, setPackSizeOpen] = useState(false);
    const [newPackSize, setNewPackSize] = useState("");
    const [savingPackSizes, setSavingPackSizes] = useState(false);
    const [visibleSections, setVisibleSections] = useState(["dims", "content", "extras"]);
    const [seoOpen, setSeoOpen] = useState(false);
    const [seoHeading, setSeoHeading] = useState("");
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [seoFaqs, setSeoFaqs] = useState([]);
    const [savingSeo, setSavingSeo] = useState(false);
    // Pack sizes are a sub-category field, so they need subcategory:update.
    const editable = can("subcategory:update");
    // seo_content is inside SEO_SUBCATEGORY_FIELDS, so the SEO role's PUT survives
    // the backend's field filter — this editor is the SEO role's job here.
    const seoContentEditable = editable || can("seo:write");
    const seoOnly = isSeoOnlyRole();
    // Creating products / bulk-importing into this sub-category are product writes.
    const canCreateProduct = can("product:create");

    const selectedCategoryObj = useMemo(
        () => categories.find((cat) => String(cat?._id) === String(selectedCategory)),
        [categories, selectedCategory],
    );
    const packSizes = useMemo(() => normalizePackSizes(manufacturer?.pack_sizes), [manufacturer]);

    const sortedProducts = useMemo(() => sortProducts(subCategoryProducts, sortBy), [subCategoryProducts, sortBy]);

    const fetchProducts = useCallback(async (payload) => {
        const productsRes = await Axios.post(
            `${DEV}/product/filter`,
            {
                ...payload,
                includeMeta: true,
                limit: -1,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
                params: {
                    populate: true,
                },
            },
        );

        return productsRes?.data?.data || [];
    }, []);

    const findLegacyCategoryMatch = useCallback((subCategory, categoryList) => {
        const subName = normalizeText(subCategory?.name);
        const subSlug = normalizeText(subCategory?.slug);
        const currentParentId = String(getId(subCategory?.category) || "");

        return categoryList.find((category) => {
            const categoryId = String(category?._id || "");
            if (categoryId && categoryId === currentParentId) return false;
            return normalizeText(category?.name) === subName || normalizeText(category?.slug) === subSlug;
        });
    }, []);

    const fetchSubCategoryProducts = useCallback(async (subCategory, categoryList = []) => {
        if (!subCategory?._id) {
            setSubCategoryProducts([]);
            return;
        }

        setProductsLoading(true);
        try {
            const linkedProducts = await fetchProducts({ subcategory: subCategory._id });
            if (linkedProducts.length > 0) {
                setSubCategoryProducts(linkedProducts);
                return;
            }

            const legacyCategory = findLegacyCategoryMatch(subCategory, categoryList);
            if (!legacyCategory?._id) {
                setSubCategoryProducts([]);
                return;
            }

            const legacyProducts = await fetchProducts({ category: legacyCategory._id });
            setSubCategoryProducts(legacyProducts);
        } catch (error) {
            setSubCategoryProducts([]);
            toast.warn(error?.response?.data?.message || "Unable to load products for this subcategory.");
        } finally {
            setProductsLoading(false);
        }
    }, [fetchProducts, findLegacyCategoryMatch]);

    const getData = useCallback(async () => {
        const res = await handleGetRequest(`/subcategory/get/${id}`);
        const sub = res?.data;

        const [result, brandResult] = await Promise.all([
            handleGetRequest("/category/all"),
            handleGetRequest("/brand/all"),
        ]);
        const categoryList = Array.isArray(result?.data) ? result.data : [];
        const brandList = Array.isArray(brandResult?.data) ? brandResult.data : [];
        setCategories(categoryList);
        setBrands(brandList);
        setSelectedCategory(sub?.category?._id || sub?.category || "");

        setManufacturers(sub);
        fetchSubCategoryProducts(sub, categoryList);
    }, [fetchSubCategoryProducts, id]);
    useEffect(() => {
        getData();
    }, [getData]);

    const breadItems = [{ label: "Home" }, { label: "SubCategories", url: "/subcategories" }];
    const home = { icon: "pi pi-home", url: "/" };

    const handleCreateProduct = () => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set("categoryId", selectedCategory);
        if (id) params.set("subCategoryId", id);
        const query = params.toString();
        history.push(`/products/create${query ? `?${query}` : ""}`);
    };

    const handleDeleteProduct = async (product) => {
        if (!can("product:delete")) {
            toast.info("You do not have permission to delete products.");
            return;
        }
        const productId = product?._id;
        if (!productId) {
            toast.error("Unable to delete product. Missing product id.");
            return;
        }

        const productLabel = [product?.product_id, product?.name].filter(Boolean).join(" - ") || "this product";
        const confirmed = window.confirm(`Permanently delete ${productLabel}? This cannot be undone.`);
        if (!confirmed) return;

        try {
            const res = await productService.deleteProducts([productId]);
            if (res?.success) {
                toast.success("Product deleted permanently.");
                setSubCategoryProducts((prev) => prev.filter((item) => item?._id !== productId));
                if (manufacturer?._id) {
                    await fetchSubCategoryProducts(manufacturer, categories);
                }
            } else {
                toast.error(res?.message || "Failed to delete product.");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to delete product.");
        }
    };

    const savePackSizes = async (nextSizes, successMessage) => {
        const normalized = normalizePackSizes(nextSizes);
        setSavingPackSizes(true);
        try {
            const res = await handlePutRequest({ id, pack_sizes: normalized }, "/subcategory/update");
            if (res?.success) {
                setManufacturers((prev) => ({
                    ...(prev || {}),
                    ...(res?.data?.subCategory || {}),
                    pack_sizes: normalized,
                }));
                toast.success(successMessage);
                return;
            }

            toast.warn(res?.message || "Unable to update pack sizes.");
        } finally {
            setSavingPackSizes(false);
        }
    };

    const handleAddPackSize = async (event) => {
        event.preventDefault();
        if (!editable || savingPackSizes) return;

        const num = Number(newPackSize);
        if (!Number.isFinite(num) || num <= 0) {
            toast.error("Enter a valid positive pack size.");
            return;
        }

        if (packSizes.some((size) => Number(size) === num)) {
            toast.info(`Pack size ${num} already exists.`);
            return;
        }

        await savePackSizes([...packSizes, num], `Pack size ${num} added.`);
        setNewPackSize("");
    };

    const handleRemovePackSize = async (size) => {
        if (!editable || savingPackSizes) return;

        if (packSizes.length <= 1) {
            toast.warn("At least one pack size is required.");
            return;
        }

        const confirmed = window.confirm(`Remove pack size ${size}? Existing product prices will not be deleted.`);
        if (!confirmed) return;

        await savePackSizes(packSizes.filter((item) => Number(item) !== Number(size)), `Pack size ${size} removed.`);
    };

    // --- Sub-category SEO content (shared by every product page below it) -----

    const openSeoDialog = () => {
        const content = manufacturer?.seo_content || {};
        setSeoHeading(String(content.heading || ""));
        const rawDesc = String(content.description || "");
        setSeoFaqs(toFaqRows(content.faqs));

        if (rawDesc.trim()) {
            try {
                let htmlInput = rawDesc;
                if (!/<[a-z][\s\S]*>/i.test(rawDesc)) {
                    htmlInput = rawDesc
                        .split(/\n\s*\n/)
                        .map((chunk) => {
                            const trimmed = chunk.trim();
                            if (!trimmed) return "";
                            if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3).trim()}</h2>`;
                            if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2).trim()}</h1>`;
                            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                                const lis = trimmed
                                    .split("\n")
                                    .map((l) => `<li>${l.replace(/^[-*]\s+/, "")}</li>`)
                                    .join("");
                                return `<ul>${lis}</ul>`;
                            }
                            if (/^\d+[.)]\s+/.test(trimmed)) {
                                const lis = trimmed
                                    .split("\n")
                                    .map((l) => `<li>${l.replace(/^\d+[.)]\s+/, "")}</li>`)
                                    .join("");
                                return `<ol>${lis}</ol>`;
                            }
                            return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
                        })
                        .join("");
                }
                const blocksFromHtml = htmlToDraft(htmlInput);
                if (blocksFromHtml && blocksFromHtml.contentBlocks) {
                    const contentState = ContentState.createFromBlockArray(
                        blocksFromHtml.contentBlocks,
                        blocksFromHtml.entityMap
                    );
                    setEditorState(EditorState.createWithContent(contentState));
                } else {
                    setEditorState(EditorState.createEmpty());
                }
            } catch (err) {
                console.error("Error setting editor state:", err);
                setEditorState(EditorState.createEmpty());
            }
        } else {
            setEditorState(EditorState.createEmpty());
        }
        setSeoOpen(true);
    };

    const handleEditorChange = (newState) => {
        setEditorState(newState);
    };

    const updateFaq = (index, field, value) => {
        setSeoFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)));
    };

    const moveFaq = (index, offset) => {
        const target = index + offset;
        setSeoFaqs((prev) => {
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const handleSaveSeoContent = async () => {
        if (!seoContentEditable || savingSeo) return;

        // Rows missing either side are dropped server-side; warn instead of
        // silently discarding half-written copy.
        const partialRow = seoFaqs.some((faq) => {
            const hasQuestion = faq.question.trim().length > 0;
            const hasAnswer = faq.answer.trim().length > 0;
            return hasQuestion !== hasAnswer;
        });
        if (partialRow) {
            toast.error("Every FAQ needs both a question and an answer. Fill or remove the incomplete ones.");
            return;
        }

        const currentEditorContent = editorState.getCurrentContent();
        const description = currentEditorContent.hasText()
            ? draftToHtml(convertToRaw(currentEditorContent)).trim()
            : "";
        const seo_content = normalizeSeoContent({
            heading: seoHeading.trim(),
            description,
            faqs: seoFaqs,
        });

        setSavingSeo(true);
        try {
            const res = await handlePutRequest({ id, seo_content }, "/subcategory/update");
            if (res?.success) {
                // Read the record back from MongoDB before reporting success.
                // This prevents an older backend build from accepting the PUT
                // while silently dropping the newer seo_content field.
                const verifyRes = await handleGetRequest(`/subcategory/get/${id}`);
                const persistedSubCategory = verifyRes?.data;

                if (!verifyRes?.success || !persistedSubCategory ||
                    !seoContentMatches(seo_content, persistedSubCategory.seo_content)) {
                    toast.error("The server accepted the request but did not persist the SEO content. Keep this dialog open and restart/update the backend before trying again.");
                    return;
                }

                setManufacturers(persistedSubCategory);
                toast.success("SEO content saved. It now shows on every product page in this subcategory.");
                setSeoOpen(false);
                return;
            }
            toast.warn(res?.message || "Unable to save SEO content.");
        } finally {
            setSavingSeo(false);
        }
    };

    return (
        <>
            <style>{`
                .subcategory-edit-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 18px;
                    align-items: start;
                    margin-top: 12px !important;
                    padding: 1.5rem !important;
                    box-sizing: border-box !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    min-width: 0 !important;
                }
                .subcategory-edit-layout .right_section {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                }
                .subcategory-header-content {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .subcategory-header-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .subcategory-edit-layout .left_section,
                .subcategory-edit-layout .right_section {
                    width: 100%;
                    min-width: 0;
                }
                .subcategory-form-panel {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 14px;
                    background: #fff;
                }
                .subcategory-form-panel .form__ {
                    display: block;
                    margin-bottom: 16px;
                }
                .subcategory-form-panel .form_left,
                .subcategory-form-panel .form_right {
                    width: 100%;
                }
                .subcategory-form-panel .form_left > div,
                .subcategory-form-panel .form_right > div {
                    margin-top: 10px;
                }
                .subcategory-form-panel .subcategory-config-grid {
                    grid-template-columns: 1fr;
                    gap: 14px;
                }
                .subcategory-form-panel .card {
                    padding: 1rem !important;
                }
                .subcategory-form-panel .card > div > div:first-child {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 10px;
                }
                .subcategory-form-panel .card > div > div:first-child .p-button {
                    width: 100% !important;
                    max-width: 180px;
                }
                .subcategory-form-panel small {
                    line-height: 1.35;
                }
                .subcategory-products-panel {
                    padding: 0;
                    border: none;
                    background: transparent;
                    min-width: 0;
                    max-width: 100%;
                    overflow: visible !important;
                    margin: 0 !important;
                }
                .subcategory-products-panel .card {
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                }
                .subcategory-products-panel .p-datatable {
                    width: 100%;
                }
                .subcategory-products-panel .p-datatable-table {
                    width: max-content !important;
                    min-width: 100% !important;
                    table-layout: auto !important;
                }
                .subcategory-products-panel .p-datatable-thead > tr > th,
                .subcategory-products-panel .p-datatable-tbody > tr > td {
                    padding: 0.55rem 0.65rem;
                    white-space: normal;
                    vertical-align: middle;
                    line-height: 1.25;
                }
                .pack-size-dialog-form {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    margin-bottom: 18px;
                }
                .pack-size-dialog-form .p-inputtext {
                    max-width: 220px;
                }
                .pack-size-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                }
                .pack-size-item {
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f8fafc;
                }
                .pack-size-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #182C5A;
                }
                .pack-size-meta {
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.4;
                    margin-bottom: 16px;
                }
                .seo-content-meta {
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.5;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px 14px;
                    margin-bottom: 20px;
                }
                .seo-content-field {
                    margin-bottom: 22px;
                }
                .seo-content-field .p-inputtext,
                .seo-content-field .p-inputtextarea {
                    width: 100%;
                    margin-top: 6px;
                }
                .seo-content-hint {
                    display: block;
                    margin-top: 6px;
                    color: #64748b;
                    font-size: 12px;
                    line-height: 1.5;
                }
                .seo-editor-container {
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    background: #fff;
                    margin-top: 6px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .seo-sticky-toolbar {
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 100 !important;
                    background: #f8fafc !important;
                    border-bottom: 1px solid #cbd5e1 !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
                    margin-bottom: 0 !important;
                    padding: 6px 8px !important;
                    flex-shrink: 0;
                }
                .seo-editor-container .rdw-editor-main {
                    max-height: 360px !important;
                    min-height: 200px !important;
                    overflow-y: auto !important;
                    padding: 12px 16px !important;
                    background: #fff;
                }
                .seo-editor-container .rdw-editor-wrapper {
                    display: flex;
                    flex-direction: column;
                }
                .seo-content-hint code {
                    background: #f1f5f9;
                    border-radius: 4px;
                    padding: 1px 5px;
                    font-size: 11px;
                    color: #182C5A;
                }
                .seo-faq-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .seo-faq-empty {
                    color: #94a3b8;
                    font-size: 13px;
                    border: 1px dashed #cbd5e1;
                    border-radius: 8px;
                    padding: 18px;
                    text-align: center;
                }
                .seo-faq-item {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px 14px 14px;
                    margin-bottom: 12px;
                    background: #fff;
                }
                .seo-faq-item-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }
                .seo-faq-index {
                    font-size: 12px;
                    font-weight: 700;
                    color: #182C5A;
                    letter-spacing: 0.04em;
                }
                .seo-faq-actions {
                    display: flex;
                    gap: 2px;
                }
                .seo-faq-actions .p-button {
                    width: 30px;
                    height: 30px;
                }
                .seo-content-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 10px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 16px;
                    margin-top: 4px;
                }
                @media (max-width: 1100px) {
                    .subcategory-edit-layout {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            <div className="customer_details_section subcategory-edit-layout">
                <div className="right_section subcategory-products-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <h4 style={{ margin: 0, fontWeight: 600, color: "#182C5A" }}>{manufacturer?.name || manufacturer?.title}</h4>
                            <div style={{ transform: "scale(0.9)", transformOrigin: "left center" }}>
                                <BreadCrumb model={breadItems} home={home} style={{ border: "none", padding: 0, background: "transparent" }} />
                            </div>
                            {seoOnly && (
                                <small style={{ color: "#94a3b8" }}>
                                    Read-only for the SEO role — the SEO Content editor (description + FAQ) remains fully editable.
                                </small>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <Dropdown
                                id="product-sort"
                                value={sortBy}
                                options={PRODUCT_SORT_OPTIONS}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(event) => setSortBy(event.value)}
                                placeholder="Sort Products"
                                style={{ height: "38px", width: "200px", borderRadius: "6px" }}
                            />
                            <MultiSelect
                                value={visibleSections}
                                options={SECTION_OPTIONS}
                                onChange={(e) => setVisibleSections(e.value)}
                                placeholder="Columns"
                                selectedItemsLabel="{0} sections"
                                maxSelectedLabels={0}
                                showClear={false}
                                style={{ minWidth: 160, height: "38px", borderRadius: "6px" }}
                                panelStyle={{ fontSize: 13 }}
                            />
                            {/* The SEO role keeps this one — seo_content is its job here. */}
                            {seoContentEditable && (
                            <Button
                                label="SEO Content"
                                icon="pi pi-align-left"
                                className="p-button-outlined"
                                type="button"
                                onClick={openSeoDialog}
                                style={{ height: "38px" }}
                            />
                            )}
                            {editable && (
                            <Button
                                label="Pack Sizes"
                                icon="pi pi-list"
                                className="p-button-outlined"
                                type="button"
                                onClick={() => setPackSizeOpen(true)}
                                style={{ height: "38px" }}
                            />
                            )}
                            {canCreateProduct && (
                            <>
                            <Button
                                label="Import from Excel"
                                icon="pi pi-file-import"
                                className="p-button-outlined"
                                type="button"
                                onClick={() => setImportOpen(true)}
                                style={{ height: "38px" }}
                            />
                            <Button
                                label="Create Product"
                                icon="pi pi-plus"
                                className="Btn__Dark"
                                type="button"
                                onClick={handleCreateProduct}
                                style={{ height: "38px" }}
                            />
                            </>
                            )}
                        </div>
                    </div>
                    <div className="card" style={{ marginTop: 0, borderRadius: "8px", border: "1px solid #dee2e6", padding: "0.5rem", overflowX: "auto", width: "100%", display: "block" }}>
                        <ProductExcelGrid
                            products={sortedProducts}
                            brands={brands}
                            category={selectedCategoryObj}
                            subCategory={manufacturer}
                            context={{ categoryId: selectedCategory, subCategoryId: id }}
                            role={role}
                            loading={productsLoading}
                            onRefetch={() => fetchSubCategoryProducts(manufacturer, categories)}
                            onDeleteProduct={can("product:delete") ? handleDeleteProduct : undefined}
                            emptyMessage="No products found for this subcategory."
                            visibleSections={visibleSections}
                        />
                    </div>
                </div>
            </div>
            <ProductPasteImportDialog
                visible={importOpen}
                onHide={() => setImportOpen(false)}
                brands={brands}
                existingProducts={subCategoryProducts}
                context={{ categoryId: selectedCategory, subCategoryId: id }}
                onImported={() => fetchSubCategoryProducts(manufacturer, categories)}
            />
            <Dialog
                visible={packSizeOpen}
                header="Pack Sizes"
                style={{ width: "560px", maxWidth: "95vw" }}
                onHide={() => setPackSizeOpen(false)}
            >
                <div className="pack-size-meta">
                    These values control the pack-size columns shown in this subcategory product grid.
                    Removing a value hides that column from this configuration; it does not delete existing product pricing data.
                </div>
                <form className="pack-size-dialog-form" onSubmit={handleAddPackSize}>
                    <div>
                        <label htmlFor="new_pack_size" className="Label__Text" style={{ display: "block", marginBottom: 6 }}>
                            Add Pack Size
                        </label>
                        <InputText
                            id="new_pack_size"
                            type="number"
                            min="1"
                            step="any"
                            value={newPackSize}
                            onChange={(event) => setNewPackSize(event.target.value)}
                            placeholder="e.g. 25"
                            className="Input__Round"
                            disabled={!editable || savingPackSizes}
                        />
                    </div>
                    <Button
                        label={savingPackSizes ? "Saving" : "Add"}
                        icon="pi pi-plus"
                        className="Btn__Dark"
                        type="submit"
                        disabled={!editable || savingPackSizes}
                        style={{ width: "130px", height: "38px" }}
                    />
                </form>
                <div className="pack-size-list">
                    {packSizes.map((size) => (
                        <div className="pack-size-item" key={size}>
                            <span className="pack-size-value">{size}</span>
                            {editable && (
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-button-text"
                                    type="button"
                                    aria-label={`Remove pack size ${size}`}
                                    onClick={() => handleRemovePackSize(size)}
                                    disabled={savingPackSizes || packSizes.length <= 1}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </Dialog>
            <Dialog
                visible={seoOpen}
                header={`SEO Content — ${manufacturer?.name || "Subcategory"}`}
                style={{ width: "820px", maxWidth: "96vw" }}
                onHide={() => setSeoOpen(false)}
            >
                <div className="seo-content-meta">
                    This description and FAQ render on the product page of <strong>every product</strong> in this subcategory,
                    and the FAQ is also published as FAQ structured data for search engines. Write it once here instead of
                    repeating it per product.
                </div>

                <div className="seo-content-field">
                    <label htmlFor="seo_heading" className="Label__Text">
                        Section Heading
                    </label>
                    <InputText
                        id="seo_heading"
                        value={seoHeading}
                        onChange={(event) => setSeoHeading(event.target.value)}
                        placeholder={`About ${manufacturer?.name || "this subcategory"}`}
                        className="Input__Round"
                        disabled={!seoContentEditable}
                    />
                    <small className="seo-content-hint">Leave blank to use “About {manufacturer?.name || "…"}”.</small>
                </div>

                <div className="seo-content-field">
                    <label htmlFor="seo_description" className="Label__Text">
                        Description
                    </label>
                    <div className="seo-editor-container">
                        <Editor
                            editorState={editorState}
                            onEditorStateChange={handleEditorChange}
                            readOnly={!seoContentEditable}
                            toolbarClassName="seo-sticky-toolbar"
                            wrapperStyle={{ minHeight: "280px" }}
                        />
                    </div>
                    <small className="seo-content-hint">
                        Use the Word-style formatting toolbar above to add Headings (H1, H2, H3), Bold text, Bullet lists, Numbered lists, Alignments, and Links.
                        <br />
                        Write only what is true for the <strong>whole subcategory</strong> — per-product values (product
                        code, size, bundle qty) already render in the product page Specifications tab.
                    </small>
                </div>

                <div className="seo-content-field">
                    <div className="seo-faq-header">
                        <label className="Label__Text" style={{ margin: 0 }}>
                            FAQ ({seoFaqs.length})
                        </label>
                        <Button
                            label="Add Question"
                            icon="pi pi-plus"
                            className="p-button-outlined"
                            type="button"
                            onClick={() => setSeoFaqs((prev) => [...prev, { question: "", answer: "" }])}
                            disabled={!seoContentEditable}
                            style={{ height: "34px" }}
                        />
                    </div>

                    {seoFaqs.length === 0 ? (
                        <div className="seo-faq-empty">No questions yet. Add the ones buyers actually ask before ordering.</div>
                    ) : (
                        seoFaqs.map((faq, index) => (
                            <div className="seo-faq-item" key={index}>
                                <div className="seo-faq-item-head">
                                    <span className="seo-faq-index">Q{index + 1}</span>
                                    <div className="seo-faq-actions">
                                        <Button
                                            icon="pi pi-arrow-up"
                                            className="p-button-text p-button-sm"
                                            type="button"
                                            aria-label="Move question up"
                                            onClick={() => moveFaq(index, -1)}
                                            disabled={!seoContentEditable || index === 0}
                                        />
                                        <Button
                                            icon="pi pi-arrow-down"
                                            className="p-button-text p-button-sm"
                                            type="button"
                                            aria-label="Move question down"
                                            onClick={() => moveFaq(index, 1)}
                                            disabled={!seoContentEditable || index === seoFaqs.length - 1}
                                        />
                                        <Button
                                            icon="pi pi-trash"
                                            className="p-button-text p-button-danger p-button-sm"
                                            type="button"
                                            aria-label="Remove question"
                                            onClick={() => setSeoFaqs((prev) => prev.filter((_, i) => i !== index))}
                                            disabled={!seoContentEditable}
                                        />
                                    </div>
                                </div>
                                <InputText
                                    value={faq.question}
                                    onChange={(event) => updateFaq(index, "question", event.target.value)}
                                    placeholder="What ply corrugated box should I use for e-commerce shipping?"
                                    className="Input__Round"
                                    disabled={!seoContentEditable}
                                />
                                <InputTextarea
                                    value={faq.answer}
                                    onChange={(event) => updateFaq(index, "answer", event.target.value)}
                                    rows={3}
                                    autoResize
                                    placeholder="Answer shown to buyers and submitted as FAQ structured data."
                                    className="Input__Round"
                                    disabled={!seoContentEditable}
                                />
                            </div>
                        ))
                    )}
                </div>

                <div className="seo-content-footer">
                    <Button label="Cancel" className="p-button-text" type="button" onClick={() => setSeoOpen(false)} />
                    <Button
                        label={savingSeo ? "Saving" : "Save SEO Content"}
                        icon="pi pi-check"
                        className="Btn__Dark"
                        type="button"
                        onClick={handleSaveSeoContent}
                        disabled={!seoContentEditable || savingSeo}
                        style={{ width: "200px", height: "38px" }}
                    />
                </div>
            </Dialog>
        </>
    );
}

export default SubCategory;
