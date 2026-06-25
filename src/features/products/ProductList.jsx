import React, { useState, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useSearchProducts, useDeleteProduct, useBrands, useCategories } from "../../hooks/useProductQuery";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { toast } from "react-toastify";
import { ProductDetailsDialog } from "./components/ProductDetailsDialog";

const ITEMS_PER_PAGE = 10;

export const ProductList = () => {
    const history = useHistory();
    
    const [selectedRows, setSelectedRows] = useState([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(ITEMS_PER_PAGE);
    const [activeDetailProduct, setActiveDetailProduct] = useState(null);

    const [filters, setFilters] = useState({
        product_id: "",
        name: "",
        model: "",
        slug: "",
        brand: "",
        category: "",
    });

    const [role] = useState(() => localStorage.getItem("role") || "");

    const { data: brandsList = [] } = useBrands();
    const { data: categoriesList = [] } = useCategories();

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
                    const matchedCatId = categoriesList.find((c) => 
                        c.name.toLowerCase().includes(trimmed.toLowerCase())
                    )?._id;
                    query.category = matchedCatId || trimmed;
                } else {
                    query[key] = trimmed;
                }
            }
        });

        return query;
    }, [filters, first, rows, brandsList, categoriesList]);

    const { data, isLoading } = useSearchProducts(activeQueryParams);
    const deleteMutation = useDeleteProduct();

    const products = data?.data || [];
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
        history.push("/products/create");
    };

    const handleDeleteSelected = async () => {
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
        
        const imgUrl = thumbnailKey.startsWith("http")
            ? thumbnailKey
            : `${import.meta.env.VITE_API_URL || "https://server.prempackaging.com/premind/api"}/getImage?image=${thumbnailKey}`;

        return (
            <img
                src={imgUrl}
                alt={rowData.name}
                style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px", border: "1px solid #dee2e6" }}
                onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40?text=No+Img";
                }}
            />
        );
    };

    const priceTemplate = (rowData) => {
        const base = rowData?.pricing?.basePrice;
        const firstTierSp = rowData?.pricing?.priceList?.[0]?.sellingPrice;
        const displayPrice = firstTierSp ?? base ?? 0;
        return <span>₹{displayPrice}</span>;
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
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text p-button-sm p-button-info"
                    onClick={() => history.push(`/product/${rowData._id}`)}
                    tooltip="Edit product"
                    tooltipOptions={{ position: "bottom" }}
                />
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
            <div className="Page__Header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Products Catalog</h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                        Manage corporate packaging inventory, price tiers, and dynamic specifications.
                    </p>
                </div>
                {role === "admin" && (
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <Button
                            label="Add Product"
                            icon="pi pi-plus"
                            className="p-button-primary"
                            onClick={handleAddProduct}
                            style={{ borderRadius: "6px" }}
                        />
                        <Button
                            label="Delete"
                            icon="pi pi-trash"
                            className="p-button-danger p-button-outlined"
                            disabled={selectedRows.length === 0}
                            onClick={handleDeleteSelected}
                            style={{ borderRadius: "6px" }}
                        />
                    </div>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    padding: "1.25rem",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    marginBottom: "1.5rem",
                }}
            >
                <FilterInput name="name" placeholder="Filter by Name" />
                <FilterInput name="product_id" placeholder="Filter by SKU / ID" />
                <FilterInput name="model" placeholder="Filter by Model" />
                <FilterInput name="brand" placeholder="Filter by Brand" />
                <FilterInput name="category" placeholder="Filter by Category" />
            </div>

            <div className="card" style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                <DataTable
                    value={products}
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
                    <Column header="Price" body={priceTemplate} />
                    <Column header="Stock" body={stockTemplate} />
                    <Column header="Top" body={(row) => badgeTemplate(!!row.top_product, "#3b82f6")} style={{ textAlign: "center", width: "70px" }} />
                    <Column header="Deal" body={(row) => badgeTemplate(!!row.deal_product, "#fbbf24")} style={{ textAlign: "center", width: "70px" }} />
                    <Column header="Actions" body={actionBodyTemplate} style={{ width: "110px", textAlign: "center" }} />
                </DataTable>
            </div>

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
