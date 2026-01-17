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

function Products() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");
    const tableRef = useRef(null);

    const breadItems = [{ label: "Home" }, { label: "Products" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };

    const getBrands = useCallback(
        async (currentSkip = 0, append = false) => {
            if (loading) return;
            setLoading(true);
            try {
                const params = {
                    skip: currentSkip,
                    limit: ITEMS_PER_PAGE,
                };
                const res = await handleGetRequest("/product/get", params);
                const totalRes = await handleGetRequest("/product/count");

                const newData = res?.data || [];
                setTotal(totalRes?.data || 0);

                setProducts((prev) => (append ? [...prev, ...newData] : newData));
                setHasMore(newData.length === ITEMS_PER_PAGE);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        },
        [loading],
    );

    // Initial load
    useEffect(() => {
        getBrands(0, false);
    }, []);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        const tableWrapper = document.querySelector(".p-datatable-wrapper");
        if (!tableWrapper || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = tableWrapper;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            const newSkip = skip + ITEMS_PER_PAGE;
            setSkip(newSkip);
            getBrands(newSkip, true);
        }
    }, [skip, loading, hasMore, getBrands]);

    useEffect(() => {
        const tableWrapper = document.querySelector(".p-datatable-wrapper");
        if (tableWrapper) {
            tableWrapper.addEventListener("scroll", handleScroll);
            return () => tableWrapper.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);
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
        setHasMore(true);
        getBrands(0, false);
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("Product added");
        setShowDialog(false);
        setSkip(0);
        setHasMore(true);
        getBrands(0, false);
    };

    const [values, setValues] = useState({
        product_id: "",
        name: "",
        slug: "",
        model: "",
    });

    const handleApplyFilter = async (value, names) => {
        setValues((prev) => ({ ...prev, [names]: value }));
        const token = localStorage.getItem("token");
        try {
            const result = await Axios.get(DEV + "/product/search", {
                params: {
                    [names]: value,
                },
                ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
            });
            setProducts(result?.data?.data || []);
            setHasMore(false);
            setTotal(result?.data?.data?.length || 0);
        } catch (error) {
            if (error?.response?.status === 404) {
                setProducts([]);
                setHasMore(false);
                setTotal(0);
                return;
            }
            toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
        }
    };

    const debouncedApplyFilter = useDebouncedCallback((value, name) => {
        if (!value || value.length < 2) {
            setSkip(0);
            setHasMore(true);
            getBrands(0, false);
            return;
        }
        handleApplyFilter(value, name);
    }, 300);

    // Optimized filter input for instant typing
    const filterLabels = {
        product_id: "Product ID",
        name: "Name",
        model: "Model",
        slug: "Slug",
    };
    const filterPlaceholders = {
        product_id: "Search by ID",
        name: "Search by name",
        model: "Search by model",
        slug: "Search by slug",
    };
    const FilterInput = React.memo(({ name }) => {
        const [inputValue, setInputValue] = useState(values[name] || "");
        const lastUserInput = useRef("");

        const onInputChange = useCallback(
            (e) => {
                setInputValue(e.target.value);
                lastUserInput.current = e.target.value;
                debouncedApplyFilter(e.target.value, name);
            },
            [debouncedApplyFilter, name],
        );

        useEffect(() => {
            if (values[name] !== lastUserInput.current) {
                setInputValue(values[name] || "");
            }
        }, [values[name], name]);

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
                />
            </div>
        );
    });

    const handleFilter = useCallback((name) => <FilterInput name={name} />, []);

    const handleskip = (num) => {
        setSkip(num);
    };
    const onHideFaq = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    const brandTemplate = (rowdata) => {
        return <p>{rowdata?.brand?.name}</p>;
    };

    const categoryTemplate = (rowdata) => {
        return <p>{rowdata?.category?.name}</p>;
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
                            {/* Add more filter fields if needed */}
                        </div>
                        {/* Product Table with margin to clear filter bar */}
                        <div style={{ marginTop: 0 }}>
                            <DataTable
                                ref={tableRef}
                                className="datatable-responsive"
                                emptyMessage="No List found."
                                responsiveLayout="scroll"
                                scrollable
                                scrollHeight="calc(100vh - 300px)"
                                value={products}
                                selection={selectedRow}
                                onSelectionChange={(e) => setselectedRow(e.value)}
                                loading={loading}
                                footer={hasMore && products.length > 0 ? <div style={{ textAlign: "center", padding: "10px" }}>{loading ? "Loading more..." : `Showing ${products.length} of ${total} products`}</div> : null}
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
