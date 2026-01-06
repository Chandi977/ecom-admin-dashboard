import React, { useCallback, useEffect, useState } from "react";
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
import Paginator from "../../components/Paginator";
import AddproductDialog from "./AddproductDialog";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

function Products() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const breadItems = [{ label: "Home" }, { label: "Products" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = useCallback(async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/product/get", params);
        const total = await handleGetRequest("/product/count");
        setProducts(res?.data);
        setManufacturers(res?.data);
        setTotal(total?.data);
    }, [skip]);

    console.log(products);
    useEffect(() => {
        getBrands();
    }, [getBrands]);
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

    const handleDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        dispatch(handlePostRequest(data, "/product/delete", true, true));
        getBrands();
        toast.success("product deleted.");
        window.location.reload();
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("product added");
        setShowDialog(false);
        window.location.reload();
    };

    const [values, setValues] = useState({
        product_id: "",
        name: "",
        slug: "",
        model: "",
    });

    const handleApplyFilter = async (value, names) => {
        setValues((prev) => ({ ...prev, [names]: value }));
        if (!value) {
            getBrands();
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const result = await Axios.get(DEV + "/product/search", {
                params: {
                    [names]: value,
                },
                ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
            });
            setManufacturers(result?.data?.data || []);
        } catch (error) {
            if (error?.response?.status === 404) {
                setManufacturers([]);
                return;
            }
            toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
        }
    };

    const debouncedApplyFilter = useDebouncedCallback(handleApplyFilter, 600);

    const handleFilter = (name) => {
        return (
            <input
                style={{
                    width: "100%",
                    height: "37px",
                    borderRadius: "5px",
                    border: "1px solid #cecece",
                }}
                value={values[name]}
                onChange={(e) => debouncedApplyFilter(e.target.value, name)}
            ></input>
        );
    };

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
                    <div className="card">
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={manufacturers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "2em" }} />
                            <Column filter field="product_id" header="ID" filterElement={() => handleFilter("product_id")} />
                            <Column filter field="name" header="Name" style={{textTransform:"capitalize"}} filterElement={() => handleFilter("name")} />
                            <Column filter field="model" header="Model" style={{textTransform:"capitalize"}} filterElement={() => handleFilter("model")} />
                            <Column filter header="Slug" field="slug" filterElement={() => handleFilter("slug")} />
                            <Column header="Brand"  body={brandTemplate} />
                            <Column header="Category"  body={categoryTemplate} />
                            <Column header="Created On" body={dateTemplate} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={manufacturers} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Products;
