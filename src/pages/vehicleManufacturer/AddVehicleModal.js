import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
import VehicleManufacturerDialog from "./VehicleManufacturerDialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { handleDeleteRequest } from "../../services/DeleteTemplate";
import ModalDialog from "./ModalDialog";
import { toast } from "react-toastify";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { handlePostRequest } from "../../services/PostTemplate";

const MIN_FILTER_LENGTH = 2;
const FILTER_DEBOUNCE_MS = 300;

function AddVehicleModal() {
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
    const [role, setRole] = useState();

    const breadItems = [{ label: "Home" }, { label: "Add Vehicle Model" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };
    const getVehicleManufacturers = async () => {
        const params = {
            skip: skip,
            limit: rows,
        };
        const res = await handleGetRequest("/getAll/vehicle_model", params);
        const total = await handleGetRequest("/countModel");
        setTotal(total?.data);
        setManufacturers(res?.data);
    };
    useEffect(() => {
        if (!isFiltering) {
            getVehicleManufacturers();
        }
    }, [isFiltering, rows, skip]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/modeldetails/${rowData?.id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} aria-controls="popup_menu" aria-haspopup />
            </div>
        );
    };

    const imageTemplate = (rowdata) => {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <p style={{ textTransform: "capitalize" }}>{rowdata?.title}</p>
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
    const manuTemplate = (rowdata) => {
        return (
            <div>
                <p>{rowdata?.manufacturer?.title}</p>
            </div>
        );
    };

    const onHideVehicleManufacturer = () => {
        setShowDialog(false);
    };
    const handleDelete = async () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        setLoading(true);
        const res = await dispatch(handlePostRequest(data, `/delete/vehicle_model`, true, true));
        toast.success("vehicle model deleted.");
        setLoading(false);
        getVehicleManufacturers();
    };

    const onsuccess = () => {
        onHideVehicleManufacturer();
        toast.success("modal added.");
        window.location.reload();
    };

    const [values, setValues] = useState({
        id: "",
        title: "",
        manufacturer: "",
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
        const result = await Axios.get(DEV + "/searchModels", {
            params: {
                [names]: trimmed,
            },
        });
        const filteredModels = result?.data?.data || [];
        setManufacturers(filteredModels);
        setTotal(filteredModels.length);
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

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);
    return (
        <>
            <>
                <Dialog visible={showDialog} header="Vehicle Manufacturer" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                    <ModalDialog onsuccess={onsuccess} onHideVehicleManufacturer={onHideVehicleManufacturer} />
                </Dialog>

                <div className="Page__Header">
                    <div>
                        <h2>Vehicle Model</h2>
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
                                <Column filter field="id" header="ID" filterElement={() => handleFilter("id")} />
                                <Column filter header="manufacturer" body={manuTemplate} filterElement={() => handleFilter("manufacturer")} />
                                <Column filter body={imageTemplate} header="Title" filterElement={() => handleFilter("title")} />
                                <Column header="Created On" body={dateTemplate} />
                                <Column header="Action" body={actionBodyTemplate} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </>
        </>
    );
}

export default AddVehicleModal;
