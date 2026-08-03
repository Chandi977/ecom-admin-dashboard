import React, { useState, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useQueryClient } from "react-query";
import { useSearchProducts, useDeleteProduct, useBrands, useCategories, useSubCategories, productKeys } from "../../hooks/useProductQuery";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { toast } from "react-toastify";
import { ProductDetailsDialog } from "./components/ProductDetailsDialog";
import ProductExcelGrid from "./components/ProductExcelGrid";
import ProductPasteImportDialog from "./components/ProductPasteImportDialog";
import { PRODUCT_SORT_OPTIONS, sortProducts } from "../../utils/productSorting";
import { getProductImageUrl, recoverProductImage } from "../../utils/productImageUrl";
import { can, isSeoOnlyRole } from "../../rbac/permissions";

const ITEMS_PER_PAGE = 10;
const CATEGORY_SECTION_ORDER = ["main", "rollabel", "packpro"];

const normalizeCategoryKey = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const getEntityId = (value) => (typeof value === "object" ? value?._id : value);

const sortByName = (items = []) =>
    [...items].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));

const sortCategorySections = (categories = []) =>
    [...categories].sort((a, b) => {
        const aIndex = CATEGORY_SECTION_ORDER.indexOf(normalizeCategoryKey(a?.name));
        const bIndex = CATEGORY_SECTION_ORDER.indexOf(normalizeCategoryKey(b?.name));
        if (aIndex === -1 && bIndex === -1) {
            return String(a?.name || "").localeCompare(String(b?.name || ""));
        }
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

export const ProductList = () => {
    const history = useHistory();
    const queryClient = useQueryClient();

    const [selectedRows, setSelectedRows] = useState([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(ITEMS_PER_PAGE);
    const [activeDetailProduct, setActiveDetailProduct] = useState(null);
    const [sortBy, setSortBy] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
    const [viewMode, setViewMode] = useState("table");
    const [importOpen, setImportOpen] = useState(false);

    const [filters, setFilters] = useState({
        product_id: "",
        name: "",
        model: "",
        slug: "",
        brand: "",
        category: "",
    });

    const [role] = useState(() => localStorage.getItem("role") || "");
    // Catalog write permissions. The SEO role holds seo:write but not
    // product:update, so it still gets into the editor (SEO fields + slug only)
    // while every create/delete/bulk control stays out of reach.
    const canUpdate = can("product:update");
    const canCreate = can("product:create");
    const canDelete = can("product:delete");
    const seoOnly = isSeoOnlyRole();

    const { data: brandsList = [] } = useBrands();
    const { data: categoriesList = [] } = useCategories();
    const { data: subCategoriesList = [], isLoading: isCatalogLoading } = useSubCategories();

    const brandLookup = useMemo(() => {
        return brandsList.reduce((acc, item) => {
            acc[item._id] = item.name;
            acc[item.name.toLowerCase()] = item._id;
            return acc;
        }, {});
    }, [brandsList]);

    const categoryLookup = useMemo(() => {
        return categoriesList.reduce((acc, item) => {
            acc[item._id] = item.name;
            acc[item.name.toLowerCase()] = item._id;
            return acc;
        }, {});
    }, [categoriesList]);

    const categorySections = useMemo(() => {
        const subCategoriesByCategory = subCategoriesList.reduce((acc, subCategory) => {
            const categoryId = String(getEntityId(subCategory?.category) || "");
            if (!categoryId) return acc;
            if (!acc.has(categoryId)) acc.set(categoryId, []);
            acc.get(categoryId).push(subCategory);
            return acc;
        }, new Map());

        return sortCategorySections(categoriesList).map((category) => ({
            ...category,
            subCategories: sortByName(subCategoriesByCategory.get(String(category?._id)) || []),
        }));
    }, [categoriesList, subCategoriesList]);

    const selectedCategory = useMemo(
        () => categoriesList.find((category) => String(category?._id) === String(selectedCategoryId)),
        [categoriesList, selectedCategoryId],
    );

    const selectedSubCategory = useMemo(
        () => subCategoriesList.find((subCategory) => String(subCategory?._id) === String(selectedSubCategoryId)),
        [subCategoriesList, selectedSubCategoryId],
    );

    const selectedLegacyCategory = useMemo(() => {
        if (!selectedSubCategory) return null;

        const subName = normalizeCategoryKey(selectedSubCategory?.name);
        const subSlug = normalizeCategoryKey(selectedSubCategory?.slug);
        const parentCategoryId = String(getEntityId(selectedSubCategory?.category) || "");

        return categoriesList.find((category) => {
            const categoryId = String(category?._id || "");
            if (categoryId && categoryId === parentCategoryId) return false;
            return normalizeCategoryKey(category?.name) === subName || normalizeCategoryKey(category?.slug) === subSlug;
        });
    }, [categoriesList, selectedSubCategory]);

    const catalogPath = useMemo(() => {
        const parts = ["Product"];
        if (selectedCategory?.name) parts.push(selectedCategory.name);
        if (selectedSubCategory?.name) parts.push(selectedSubCategory.name);
        parts.push("Products");
        return parts.join(" > ");
    }, [selectedCategory, selectedSubCategory]);

    const activeQueryParams = useMemo(() => {
        const query = {
            skip: first,
            limit: rows,
        };

        Object.entries(filters).forEach(([key, val]) => {
            const trimmed = val.trim();
            if (trimmed && trimmed.length >= 2) {
                if (key === "brand") {
                    const matchedBrandId = brandsList.find((b) => 
                        b.name.toLowerCase().includes(trimmed.toLowerCase())
                    )?._id;
                    query.brand = matchedBrandId || trimmed;
                } else if (key === "category") {
                    if (selectedCategoryId) return;
                    const matchedCatId = categoriesList.find((c) => 
                        c.name.toLowerCase().includes(trimmed.toLowerCase())
                    )?._id;
                    query.category = matchedCatId || trimmed;
                } else {
                    query[key] = trimmed;
                }
            }
        });

        if (selectedSubCategoryId && selectedLegacyCategory?._id) {
            query.category = selectedLegacyCategory._id;
        } else if (selectedCategoryId) {
            query.category = selectedCategoryId;
        }

        if (selectedSubCategoryId && !selectedLegacyCategory?._id) {
            query.sub_category = selectedSubCategoryId;
        }

        return query;
    }, [filters, first, rows, brandsList, categoriesList, selectedCategoryId, selectedSubCategoryId, selectedLegacyCategory]);

    const { data, isLoading } = useSearchProducts(activeQueryParams);
    const deleteMutation = useDeleteProduct();

    const products = data?.data || [];
    const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
    const totalRecords = data?.meta?.total ?? data?.data?.length ?? 0;

    const handleFilterChange = useCallback((value, name) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setFirst(0);
    }, []);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const handleAddProduct = () => {
        const params = new URLSearchParams();
        if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
        if (selectedSubCategoryId) params.set("subCategoryId", selectedSubCategoryId);
        const query = params.toString();
        history.push(`/products/create${query ? `?${query}` : ""}`);
    };

    const handleCategorySelect = useCallback((categoryId) => {
        setSelectedCategoryId(categoryId);
        setSelectedSubCategoryId("");
        setSelectedRows([]);
        setFirst(0);
    }, []);

    const handleSubCategorySelect = useCallback((subCategory) => {
        const categoryId = getEntityId(subCategory?.category);
        if (categoryId) setSelectedCategoryId(String(categoryId));
        setSelectedSubCategoryId(subCategory?._id || "");
        setSelectedRows([]);
        setFirst(0);
    }, []);

    const handleClearCatalogSelection = useCallback(() => {
        setSelectedCategoryId("");
        setSelectedSubCategoryId("");
        setSelectedRows([]);
        setFirst(0);
    }, []);

    const handleDeleteSingle = useCallback((product) => {
        if (!canDelete) {
            toast.info("You do not have permission to delete products.");
            return;
        }
        if (!product?._id) return;
        const label = product.product_id || product.name || "this product";
        if (window.confirm(`Delete ${label}? This cannot be undone.`)) {
            deleteMutation.mutate([product._id]);
        }
    }, [deleteMutation, canDelete]);

    const handleDeleteSelected = async () => {
        if (!canDelete) {
            toast.info("You do not have permission to delete products.");
            return;
        }
        if (!selectedRows.length) {
            toast.warn("Select at least one product to delete");
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} product(s)?`)) {
            const ids = selectedRows.map((p) => p._id);
            deleteMutation.mutate(ids, {
                onSuccess: () => {
                    setSelectedRows([]);
                },
            });
        }
    };

    const thumbnailTemplate = (rowData) => {
        const thumbnailKey = rowData?.media?.thumbnail || rowData?.images?.[0]?.image || rowData?.images?.[0];
        if (!thumbnailKey) return <i className="pi pi-image" style={{ fontSize: "1.5rem", color: "#ccc" }}></i>;
        
        const imgUrl = getProductImageUrl(thumbnailKey);

        return (
            <img
                src={imgUrl}
                alt={rowData.name}
                style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px", border: "1px solid #dee2e6" }}
                onError={(e) => {
                    recoverProductImage(e.currentTarget, thumbnailKey);
                }}
            />
        );
    };
    const priceTemplate = (rowData) => {
        const base = rowData?.price ?? rowData?.pricing?.basePrice;
        const priceList = rowData?.priceList ?? rowData?.pricing?.priceList ?? [];
        const firstTier = priceList[0];
        const displayPrice = firstTier?.price ?? firstTier?.sellingPrice ?? base ?? 0;
        return <span>₹{displayPrice}</span>;
    };

    const gstTemplate = (rowData) => {
        const gstVal = rowData?.gst;
        return <span>{gstVal != null ? `${Math.round(gstVal * 100)}%` : "--"}</span>;
    };

    const stockTemplate = (rowData) => {
        const stock = rowData?.inventory?.availableStock ?? 0;
        const isLow = stock <= (rowData?.inventory?.minimumStock ?? 10);
        return (
            <span style={{ fontWeight: 600, color: isLow ? "#ef4444" : "#22c55e" }}>
                {stock} {isLow && <i className="pi pi-exclamation-triangle" style={{ fontSize: "10px", marginLeft: "4px" }}></i>}
            </span>
        );
    };

    const brandTemplate = (rowData) => {
        const brandVal = rowData?.brand;
        const brandName = typeof brandVal === "object" ? brandVal?.name : brandLookup[brandVal] || brandVal;
        return <span>{brandName || "--"}</span>;
    };

    const categoryTemplate = (rowData) => {
        const catVal = rowData?.category;
        const catName = typeof catVal === "object" ? catVal?.name : categoryLookup[catVal] || catVal;
        return <span>{catName || "--"}</span>;
    };

    const subCategoryTemplate = (rowData) => {
        const subCat = rowData?.subCategory || rowData?.sub_category;
        const subCatName = typeof subCat === "object" ? subCat?.name : subCat;
        return <span>{subCatName || "--"}</span>;
    };

    const badgeTemplate = (value, activeColor) => {
        return (
            <span
                style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: value ? activeColor : "#ccc",
                }}
            />
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: "flex", gap: "0.25rem" }}>
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-text p-button-sm"
                    onClick={() => setActiveDetailProduct(rowData)}
                    tooltip="View details"
                    tooltipOptions={{ position: "bottom" }}
                />
                {/* SEO-only users open the same editor, but only its SEO fields
                    (and the slug) are editable there. */}
                {(canUpdate || seoOnly) && (
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text p-button-sm p-button-info"
                    onClick={() => history.push(`/product/${rowData._id}`)}
                    tooltip={canUpdate ? "Edit product" : "Edit SEO fields"}
                    tooltipOptions={{ position: "bottom" }}
                />
                )}
            </div>
        );
    };

    const FilterInput = React.memo(({ name, placeholder }) => {
        const [value, setValue] = useState(filters[name] || "");
        const debouncedFilterChange = useDebouncedCallback((val) => {
            handleFilterChange(val, name);
        }, 400);

        const onChange = (e) => {
            setValue(e.target.value);
            debouncedFilterChange(e.target.value);
        };

        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        style={{ height: "36px", width: "100%", borderRadius: "6px" }}
                    />
                </span>
            </div>
        );
    });

    return (
        <>
            <style>{`
                .product-catalog-layout {
                    display: grid;
                    grid-template-columns: 300px minmax(0, 1fr);
                    gap: 18px;
                    align-items: start;
                }
                .product-catalog-sidebar {
                    padding: 14px;
                    position: sticky;
                    top: 84px;
                    max-height: calc(100vh - 112px);
                    overflow: auto;
                }
                .product-catalog-sidebar-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .product-catalog-sidebar-title h3 {
                    color: #111827;
                    font-size: 15px;
                    font-weight: 700;
                    margin: 0;
                }
                .product-catalog-tree {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .product-catalog-category {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #fff;
                }
                .product-catalog-category-button,
                .product-catalog-subcategory-button,
                .product-catalog-all-button {
                    width: 100%;
                    border: 0;
                    background: transparent;
                    color: #374151;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    text-align: left;
                    transition: background 0.18s ease, color 0.18s ease;
                }
                .product-catalog-category-button {
                    min-height: 42px;
                    padding: 10px 12px;
                    font-weight: 700;
                }
                .product-catalog-subcategory-button {
                    min-height: 34px;
                    padding: 8px 12px 8px 30px;
                    font-size: 13px;
                }
                .product-catalog-all-button {
                    min-height: 40px;
                    padding: 10px 12px;
                    border: 1px solid #dbe4ff;
                    border-radius: 8px;
                    color: #1d4ed8;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .product-catalog-category-button:hover,
                .product-catalog-subcategory-button:hover,
                .product-catalog-all-button:hover {
                    background: #f3f6fb;
                }
                .product-catalog-category-button.is-active,
                .product-catalog-subcategory-button.is-active,
                .product-catalog-all-button.is-active {
                    background: #eef4ff;
                    color: #1d4ed8;
                }
                .product-catalog-count {
                    flex: 0 0 auto;
                    border: 1px solid #d8dee9;
                    border-radius: 999px;
                    color: #64748b;
                    font-size: 11px;
                    font-weight: 700;
                    line-height: 1;
                    padding: 4px 7px;
                }
                .product-catalog-empty {
                    color: #94a3b8;
                    font-size: 12px;
                    padding: 0 12px 10px 30px;
                }
                .product-catalog-main {
                    min-width: 0;
                }
                .product-catalog-path {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    min-height: 32px;
                    padding: 6px 10px;
                    border: 1px solid #d8dee9;
                    border-radius: 8px;
                    background: #f8fafc;
                    color: #334155;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }
                @media (max-width: 1100px) {
                    .product-catalog-layout {
                        grid-template-columns: 1fr;
                    }
                    .product-catalog-sidebar {
                        position: static;
                        max-height: none;
                    }
                }
            `}</style>
            <div className="Page__Header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Products Catalog</h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                        {catalogPath}
                    </p>
                    {seoOnly && (
                        <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                            Read-only catalog for the SEO role — open a product to edit its SEO fields.
                        </p>
                    )}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ display: "flex", border: "1px solid #d8dee9", borderRadius: "6px", overflow: "hidden" }}>
                        <Button
                            label="Table"
                            icon="pi pi-table"
                            className={viewMode === "table" ? "p-button-sm" : "p-button-sm p-button-text"}
                            onClick={() => setViewMode("table")}
                            style={{ borderRadius: 0 }}
                        />
                        <Button
                            label="Excel"
                            icon="pi pi-pencil"
                            className={viewMode === "excel" ? "p-button-sm" : "p-button-sm p-button-text"}
                            onClick={() => setViewMode("excel")}
                            style={{ borderRadius: 0 }}
                        />
                    </div>
                    {canCreate && (
                        <>
                        <Button
                            label="Import"
                            icon="pi pi-file-import"
                            className="p-button-outlined"
                            onClick={() => setImportOpen(true)}
                            style={{ borderRadius: "6px" }}
                        />
                        <Button
                            label="Add Product"
                            icon="pi pi-plus"
                            className="p-button-primary"
                            onClick={handleAddProduct}
                            style={{ borderRadius: "6px" }}
                        />
                        </>
                    )}
                    {canDelete && (
                        <Button
                            label="Delete"
                            icon="pi pi-trash"
                            className="p-button-danger p-button-outlined"
                            disabled={selectedRows.length === 0}
                            onClick={handleDeleteSelected}
                            style={{ borderRadius: "6px" }}
                        />
                    )}
                </div>
            </div>

            <div className="product-catalog-layout">
                <aside className="card product-catalog-sidebar" aria-label="Product catalog">
                    <div className="product-catalog-sidebar-title">
                        <h3>Product</h3>
                        <Button
                            icon="pi pi-filter-slash"
                            className="p-button-rounded p-button-text p-button-sm"
                            onClick={handleClearCatalogSelection}
                            tooltip="Clear catalog filter"
                            tooltipOptions={{ position: "bottom" }}
                            type="button"
                            disabled={!selectedCategoryId && !selectedSubCategoryId}
                        />
                    </div>
                    <button
                        type="button"
                        className={`product-catalog-all-button ${!selectedCategoryId && !selectedSubCategoryId ? "is-active" : ""}`}
                        onClick={handleClearCatalogSelection}
                    >
                        <span>All Products</span>
                    </button>
                    <div className="product-catalog-tree">
                        {isCatalogLoading && <div className="product-catalog-empty">Loading catalog...</div>}
                        {!isCatalogLoading && categorySections.length === 0 && (
                            <div className="product-catalog-empty">No categories found.</div>
                        )}
                        {categorySections.map((category) => {
                            const isCategoryActive = String(selectedCategoryId) === String(category?._id) && !selectedSubCategoryId;
                            return (
                                <div className="product-catalog-category" key={category?._id || category?.name}>
                                    <button
                                        type="button"
                                        className={`product-catalog-category-button ${isCategoryActive ? "is-active" : ""}`}
                                        onClick={() => handleCategorySelect(category?._id)}
                                    >
                                        <span>{category?.name || "Untitled Category"}</span>
                                        <span className="product-catalog-count">{category?.subCategories?.length || 0}</span>
                                    </button>
                                    {category?.subCategories?.length ? (
                                        category.subCategories.map((subCategory) => (
                                            <button
                                                type="button"
                                                className={`product-catalog-subcategory-button ${String(selectedSubCategoryId) === String(subCategory?._id) ? "is-active" : ""}`}
                                                key={subCategory?._id || subCategory?.name}
                                                onClick={() => handleSubCategorySelect(subCategory)}
                                            >
                                                <span>{subCategory?.name || "Untitled Subcategory"}</span>
                                                <i className="pi pi-chevron-right" style={{ fontSize: "10px", color: "#94a3b8" }} />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="product-catalog-empty">No subcategories</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>

                <main className="product-catalog-main">
                    <div className="product-catalog-path">
                        <i className="pi pi-sitemap" style={{ fontSize: "13px" }} />
                        <span>{catalogPath}</span>
                    </div>
                    <div
                        className="card"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "1rem",
                            padding: "1.25rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <FilterInput name="name" placeholder="Filter by Name" />
                        <FilterInput name="product_id" placeholder="Filter by SKU / ID" />
                        <FilterInput name="model" placeholder="Filter by Model" />
                        <FilterInput name="brand" placeholder="Filter by Brand" />
                        <FilterInput name="category" placeholder="Filter by Category" />
                        <div style={{ minWidth: "220px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label htmlFor="product-sort" style={{ fontSize: "12px", fontWeight: 600, color: "#495057" }}>
                                Sort
                            </label>
                            <Dropdown
                                id="product-sort"
                                value={sortBy}
                                options={PRODUCT_SORT_OPTIONS}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(event) => setSortBy(event.value)}
                                style={{ width: "100%", height: "36px", borderRadius: "6px" }}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden", padding: viewMode === "excel" ? "0.5rem" : 0 }}>
                        {viewMode === "excel" ? (
                            <ProductExcelGrid
                                products={sortedProducts}
                                brands={brandsList}
                                category={selectedCategory}
                                subCategory={selectedSubCategory}
                                context={{ categoryId: selectedCategoryId, subCategoryId: selectedSubCategoryId }}
                                role={role}
                                loading={isLoading}
                                onDeleteProduct={canDelete ? handleDeleteSingle : undefined}
                                onRefetch={() => queryClient.invalidateQueries(productKeys.all)}
                                showCategoryColumns={!selectedSubCategoryId}
                                emptyMessage="No products found."
                            />
                        ) : (
                        <DataTable
                            value={sortedProducts}
                            lazy
                            paginator
                            rows={rows}
                            first={first}
                            totalRecords={totalRecords}
                            onPage={onPageChange}
                            loading={isLoading}
                            selection={selectedRows}
                            onSelectionChange={(e) => setSelectedRows(e.value)}
                            dataKey="_id"
                            responsiveLayout="scroll"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
                            rowsPerPageOptions={[10, 25, 50]}
                            className="p-datatable-striped"
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column header="Img" body={thumbnailTemplate} style={{ width: "70px" }} />
                            <Column field="product_id" header="SKU/ID" sortable style={{ fontWeight: 600 }} />
                            <Column field="name" header="Name" sortable style={{ textTransform: "capitalize" }} />
                            <Column field="model" header="Model" />
                            <Column header="Brand" body={brandTemplate} />
                            <Column header="Category" body={categoryTemplate} />
                            <Column header="Sub-Category" body={subCategoryTemplate} />
                            <Column header="GST" body={gstTemplate} style={{ width: "90px" }} />
                            <Column header="Stock" body={stockTemplate} />
                            <Column header="Top" body={(row) => badgeTemplate(!!row.top_product, "#3b82f6")} style={{ textAlign: "center", width: "70px" }} />
                            <Column header="Deal" body={(row) => badgeTemplate(!!row.deal_product, "#fbbf24")} style={{ textAlign: "center", width: "70px" }} />
                            <Column header="Actions" body={actionBodyTemplate} style={{ width: "110px", textAlign: "center" }} />
                        </DataTable>
                        )}
                    </div>
                </main>
            </div>

            <ProductPasteImportDialog
                visible={importOpen}
                onHide={() => setImportOpen(false)}
                brands={brandsList}
                existingProducts={products}
                context={{ categoryId: selectedCategoryId, subCategoryId: selectedSubCategoryId }}
                categories={categoriesList}
                subCategories={subCategoriesList}
                requireTarget={!selectedSubCategoryId}
                onImported={async () => { queryClient.invalidateQueries(productKeys.all); }}
            />

            {activeDetailProduct && (
                <ProductDetailsDialog
                    product={activeDetailProduct}
                    brandLookup={brandLookup}
                    categoryLookup={categoryLookup}
                    onHide={() => setActiveDetailProduct(null)}
                />
            )}
        </>
    );
};
