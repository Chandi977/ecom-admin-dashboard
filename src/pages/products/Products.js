import React, { useCallback, useEffect, useState, useRef } from "react";
import "./ProductsTableFix.css";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import Axios from "axios";
import { DEV } from "../../services/constants";
import AddproductDialog from "./AddproductDialog";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

const ITEMS_PER_PAGE = 10;
const MIN_FILTER_LENGTH = 2;

function Products() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(ITEMS_PER_PAGE);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        product_id: "",
        name: "",
        slug: "",
        model: "",
        brand: "",
        category: "",
    });
    const [brandLookup, setBrandLookup] = useState({});
    const [categoryLookup, setCategoryLookup] = useState({});
    const appliedFiltersRef = useRef({});
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const breadItems = [{ label: "Home" }, { label: "Products" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };

    const buildActiveFilters = useCallback((nextFilters) => {
        return Object.entries(nextFilters || {}).reduce((acc, [key, val]) => {
            const trimmed = (val || "").trim();
            if (trimmed && trimmed.length >= MIN_FILTER_LENGTH) acc[key] = trimmed;
            return acc;
        }, {});
    }, []);

    const fetchLookups = useCallback(async () => {
        try {
            const [brandRes, categoryRes] = await Promise.all([handleGetRequest("/brand/all"), handleGetRequest("/category/all")]);
            const brandMap = (brandRes?.data || []).reduce((acc, item) => {
                if (item?._id) acc[item._id] = item?.name;
                return acc;
            }, {});
            const categoryMap = (categoryRes?.data || []).reduce((acc, item) => {
                if (item?._id) acc[item._id] = item?.name;
                return acc;
            }, {});
            setBrandLookup(brandMap);
            setCategoryLookup(categoryMap);
        } catch (error) {
            console.error("Error fetching lookups:", error);
        }
    }, []);

    const fetchProducts = useCallback(
        async (currentSkip = 0, currentRows = rows, filtersArg) => {
            const activeFilters = filtersArg !== undefined ? filtersArg : appliedFiltersRef.current;
            appliedFiltersRef.current = activeFilters;
            setLoading(true);
            const token = localStorage.getItem("token");
            try {
                const params = {
                    skip: currentSkip,
                    limit: currentRows,
                    ...activeFilters,
                };

                if (Object.keys(activeFilters).length) {
                    const result = await Axios.get(DEV + "/product/search", {
                        params,
                        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
                    });
                    const newData = result?.data?.data || [];
                    const totalCount = result?.data?.count ?? newData.length;
                    setProducts(newData);
                    setTotal(totalCount);
                } else {
                    const res = await handleGetRequest("/product/get", params);
                    const totalRes = await handleGetRequest("/product/count");

                    const newData = res?.data || [];
                    const totalCount = totalRes?.data ?? newData.length;
                    setProducts(newData);
                    setTotal(totalCount);
                }
            } catch (error) {
                if (error?.response?.status === 404) {
                    setProducts([]);
                    setTotal(0);
                    return;
                }
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            } finally {
                setLoading(false);
            }
        },
        [rows],
    );

    useEffect(() => {
        fetchLookups();
    }, [fetchLookups]);

    useEffect(() => {
        fetchProducts(0, rows);
    }, []);

    const applyFilters = useCallback(
        (nextFilters) => {
            const activeFilters = buildActiveFilters(nextFilters);
            setSkip(0);
            fetchProducts(0, rows, activeFilters);
        },
        [buildActiveFilters, fetchProducts, rows],
    );

    const debouncedApplyFilters = useDebouncedCallback(applyFilters, 300);

    const handleFilterChange = useCallback(
        (value, name) => {
            setFilters((prev) => {
                const updated = { ...prev, [name]: value };
                debouncedApplyFilters(updated);
                return updated;
            });
        },
        [debouncedApplyFilters],
    );

    const onPageChange = useCallback(
        (event) => {
            const { first, rows: newRows } = event;
            setSkip(first);
            setRows(newRows);
            fetchProducts(first, newRows);
        },
        [fetchProducts],
    );
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/product/${rowData?._id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} aria-controls="popup_menu" aria-haspopup />
            </div>
        );
    };

    const dateTemplate = (rowdata) => {
        return (
            <div>
                <p>
                    {moment(rowdata?.createdAt).format("DD-MM-YY")} &nbsp; | &nbsp;
                    {moment(rowdata?.createdAt).format("hh:mm a")}
                </p>
            </div>
        );
    };

    const handleDelete = async () => {
        if (!selectedRow.length) {
            toast.warn("Select at least one product");
            return;
        }
        const selectedId = selectedRow.map((val) => val._id);
        await dispatch(handlePostRequest({ id: selectedId }, "/product/delete", true, true));
        toast.success("Product deleted");
        setselectedRow([]);
        setSkip(0);
        fetchProducts(0, rows);
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("Product added");
        setShowDialog(false);
        setSkip(0);
        fetchProducts(0, rows);
    };

    // Optimized filter input for instant typing
    const filterLabels = {
        product_id: "Product ID",
        name: "Name",
        model: "Model",
        slug: "Slug",
        brand: "Brand",
        category: "Category",
    };
    const filterPlaceholders = {
        product_id: "Search by ID",
        name: "Search by name",
        model: "Search by model",
        slug: "Search by slug",
        brand: "Search by brand",
        category: "Search by category",
    };
    const FilterInput = React.memo(({ name }) => {
        const [inputValue, setInputValue] = useState(filters[name] || "");
        const lastUserInput = useRef("");

        const onInputChange = useCallback(
            (e) => {
                setInputValue(e.target.value);
                lastUserInput.current = e.target.value;
                handleFilterChange(e.target.value, name);
            },
            [handleFilterChange, name],
        );

        useEffect(() => {
            if (filters[name] !== lastUserInput.current) {
                setInputValue(filters[name] || "");
            }
        }, [filters[name], name]);

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <label style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{filterLabels[name]}</label>
                <input
                    style={{
                        width: "100%",
                        height: "37px",
                        borderRadius: "5px",
                        border: "1px solid #cecece",
                        position: "relative",
                        zIndex: 1,
                        background: "#fff",
                        paddingLeft: 8,
                    }}
                    value={inputValue}
                    onChange={onInputChange}
                    placeholder={filterPlaceholders[name]}
                    aria-label={filterLabels[name]}
                />
            </div>
        );
    });

    const handleFilter = useCallback((name) => <FilterInput name={name} />, []);
    const onHideFaq = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    const brandTemplate = (rowdata) => {
        const brandValue = rowdata?.brand;
        const brandName = typeof brandValue === "object" ? brandValue?.name : brandLookup[brandValue] || brandValue;
        return <p>{brandName || "--"}</p>;
    };

    const categoryTemplate = (rowdata) => {
        const categoryValue = rowdata?.category;
        const categoryName = typeof categoryValue === "object" ? categoryValue?.name : categoryLookup[categoryValue] || categoryValue;
        return <p>{categoryName || "--"}</p>;
    };
    return (
        <>
            <Dialog visible={showDialog} header="Product" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AddproductDialog onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Products</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                {role === "admin" && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    </div>
                )}
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card" style={{ paddingTop: 16 }}>
                        {/* Filter/Search Bar as Navbar */}
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                background: "#fff",
                                borderRadius: 8,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                                padding: "16px 24px",
                                marginBottom: 32,
                                position: "relative",
                                zIndex: 2,
                            }}
                        >
                            <div style={{ flex: 1 }}>{handleFilter("product_id")}</div>
                            <div style={{ flex: 2 }}>{handleFilter("name")}</div>
                            <div style={{ flex: 2 }}>{handleFilter("model")}</div>
                            <div style={{ flex: 2 }}>{handleFilter("slug")}</div>
                            <div style={{ flex: 2 }}>{handleFilter("brand")}</div>
                            <div style={{ flex: 2 }}>{handleFilter("category")}</div>
                        </div>
                        {/* Product Table with margin to clear filter bar */}
                        <div style={{ marginTop: 0 }}>
                            <DataTable
                                className="datatable-responsive"
                                emptyMessage="No List found."
                                responsiveLayout="scroll"
                                scrollable
                                scrollHeight="calc(100vh - 300px)"
                                lazy
                                paginator
                                rows={rows}
                                first={skip}
                                totalRecords={total}
                                onPage={onPageChange}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                                rowsPerPageOptions={[10, 20, 50]}
                                value={products}
                                selection={selectedRow}
                                onSelectionChange={(e) => setselectedRow(e.value)}
                                loading={loading}
                            >
                                <Column selectionMode="multiple" style={{ width: "2em" }} />
                                <Column field="product_id" header="ID" />
                                <Column field="name" header="Name" style={{ textTransform: "capitalize" }} />
                                <Column field="model" header="Model" style={{ textTransform: "capitalize" }} />
                                <Column header="Slug" field="slug" />
                                <Column header="Brand" body={brandTemplate} />
                                <Column header="Category" body={categoryTemplate} />
                                <Column header="Created On" body={dateTemplate} />
                                <Column header="Action" body={actionBodyTemplate} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Products;
