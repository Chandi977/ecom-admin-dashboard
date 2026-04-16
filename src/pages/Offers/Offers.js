import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
// import VehicleManufacturerDialog from "./VehicleManufacturerDialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { handleDeleteRequest } from "../../services/DeleteTemplate";
import AddOfferDialogue from "./AddOfferDialogue";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

const MIN_FILTER_LENGTH = 2;
const FILTER_DEBOUNCE_MS = 300;

function Offers() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState();
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(10);
    const [isFiltering, setIsFiltering] = useState(false);
    const dispatch = useDispatch();
    const menu = useRef(null);
    const history = useHistory();

    console.log(manufacturers);

    const breadItems = [{ label: "Home" }, { label: "Offers" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };
    const getVehicleManufacturers = async () => {
        const params = {
            skip: skip,
            limit: rows,
        };
        const res = await handleGetRequest("/getDeals", params);
        console.log(res);
        const total = await handleGetRequest("/countDeals");
        setManufacturers(res?.data);
        setTotal(total?.data);
    };
    useEffect(() => {
        if (!isFiltering) {
            getVehicleManufacturers();
        }
    }, [isFiltering, rows, skip]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/offer/${rowData?._id}`);
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

    const onHideOfferdialogue = () => {
        setShowDialog(false);
    };

    const handleDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        const res = dispatch(handlePostRequest(data, "/deleteDeal", true, true));
        getVehicleManufacturers();
        toast.success("deal deleted.");
        window.location.reload();
    };

    const handleTitle = (rowData) => {
        return <p>{rowData?.product?.title}</p>;
    };
    const handlePrice = (rowData) => {
        return <p>{rowData?.product?.price?.default_price}</p>;
    };
    const handleID = (rowData) => {
        return <p>{rowData?.product?.tyre_id}</p>;
    };

    const onsuccess = () => {
        onHideOfferdialogue();
        toast.success("deal added");
        window.location.reload();
    };

    const [values, setValues] = useState({
        title: "",
        price: "",
        newPrice: "",
    });

    const handleApplyFilter = async (value, names) => {
        const trimmed = (value || "").trim();
        if (!trimmed || trimmed.length < MIN_FILTER_LENGTH) {
            setIsFiltering(false);
            setSkip(0);
            return;
        }
        setIsFiltering(true);
        setSkip(0);
        const result = await Axios.get(DEV + "/searchDeal", {
            params: {
                [names]: trimmed,
            },
        });
        const filteredOffers = result?.data?.data || [];
        setManufacturers(filteredOffers);
        setTotal(filteredOffers.length);
    };

    const debouncedApplyFilter = useDebouncedCallback(handleApplyFilter, FILTER_DEBOUNCE_MS);

    const handleFilter = (name) => {
        return (
            <input
                style={{ width: "100%", height: "37px", borderRadius: "5px", border: "1px solid #cecece" }}
                value={values[name]}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    setValues((prev) => ({ ...prev, [name]: nextValue }));
                    debouncedApplyFilter(nextValue, name);
                }}
            ></input>
        );
    };

    const onPageChange = useCallback((event) => {
        setSkip(event.first);
        setRows(event.rows);
    }, []);
    return (
        <>
            <Dialog visible={showDialog} header="Offers" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AddOfferDialogue onHideOfferdialogue={onHideOfferdialogue} onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Offers</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="Top__Btn">
                    <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                </div>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive"
                            lazy={!isFiltering}
                            paginator
                            first={skip}
                            rows={rows}
                            rowsPerPageOptions={[10, 20, 50]}
                            totalRecords={total}
                            onPage={onPageChange}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={manufacturers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter body={handleID} header="ID" filterElement={() => handleFilter("id")} />
                            <Column filter body={handleTitle} header="Title" filterElement={() => handleFilter("title")} />
                            <Column filter header="Price" body={handlePrice} filterElement={() => handleFilter("price")} />
                            <Column filter header="new Price" field="newPrice" filterElement={() => handleFilter("newPrice")} />
                            <Column header="Created On" body={dateTemplate} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Offers;
