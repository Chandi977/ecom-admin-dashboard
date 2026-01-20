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
import AdddealDialog from "./AdddealDialog";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

const MIN_FILTER_LENGTH = 2;
const FILTER_DEBOUNCE_MS = 300;

function Deals() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const breadItems = [{ label: "Home" }, { label: "Deals" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = useCallback(async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/deal/get", params);
        const total = await handleGetRequest("/deal/count");
        setManufacturers(res?.data);
        setTotal(total?.data);
    }, [skip]);
    useEffect(() => {
        getBrands();
    }, [getBrands]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/deal/${rowData?._id}`);
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
        dispatch(handlePostRequest(data, "/deal/delete", true, true));
        getBrands();
        toast.success("deal deleted.");
        window.location.reload();
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("deal added");
        setShowDialog(false);
        window.location.reload();
    };

    const [values, setValues] = useState({
        id: "",
        newPrice: "",
        discount: "",
    });

    const handleApplyFilter = async (value, names) => {
        const trimmed = (value || "").trim();
        if (!trimmed || trimmed.length < MIN_FILTER_LENGTH) {
            getBrands();
            return;
        }
        const result = await Axios.get(DEV + "/deal/search", {
            params: {
                [names]: trimmed,
            },
        });
        setManufacturers(result?.data?.data);
    };

    const debouncedApplyFilter = useDebouncedCallback(handleApplyFilter, FILTER_DEBOUNCE_MS);

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
                onChange={(e) => {
                    const nextValue = e.target.value;
                    setValues((prev) => ({ ...prev, [name]: nextValue }));
                    debouncedApplyFilter(nextValue, name);
                }}
            ></input>
        );
    };

    const ProductTemplate = (rowData) => {
        return (
            <div>
                <p>{rowData?.product?.name}</p>
            </div>
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
    return (
        <>
            <Dialog visible={showDialog} header="Deal" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AdddealDialog onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Deals</h2>
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
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 20, 50]}
                            totalRecords={total}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={manufacturers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="deal_id" header="ID" filterElement={() => handleFilter("id")} />
                            <Column body={ProductTemplate} header="Product" />
                            <Column filter field="newPrice" header="New Price" filterElement={() => handleFilter("newPrice")} />
                            <Column filter header="Discount" field="discount" filterElement={() => handleFilter("discount")} />
                            <Column header="Created On" body={dateTemplate} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Deals;
