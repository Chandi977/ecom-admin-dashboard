import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import Axios from "axios";
import { DEV } from "../../services/constants";
import Paginator from "../../components/Paginator";

function VehicleManufacturer() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const [role, setRole] = useState();

    const breadItems = [{ label: "Home" }, { label: "Vehicle Manufacturer" }];

    const home = {
        icon: "pi pi-home",
        url: "/",
    };
    const history = useHistory();

    const handledClicked = () => {
        setShowDialog(true);
    };

    const getVehicleManufacturers = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/getAll/Vehicle/manufacturer", params);
        const total = await handleGetRequest("/count/vehicleManufacturer");
        setManufacturers(res?.data);
        setTotal(total?.data);
    };
    useEffect(() => {
        getVehicleManufacturers();
    }, [skip]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/manufacturerdetails/${rowData?.id}`);
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
        const res = await dispatch(handlePostRequest(data, `/delete/vehicle_manufacturer`, true, true));
        toast.success("vehicle manufacturer deleted.");
        getVehicleManufacturers();
    };
    const onsuccess = () => {
        onHideVehicleManufacturer();
        toast.success("vehicle manufacturer added.");
        window.location.reload();
    };

    const [values, setValues] = useState({
        id: "",
        title: "",
    });

    const temporary = ["id", "title"];

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/search/VehicleManufacturer", {
            params: {
                [names]: value,
            },
        });
        setManufacturers(result?.data?.data);
    };

    const handleFilter = (name) => {
        return <input style={{ width: "100%", height: "37px", borderRadius: "5px", border: "1px solid #cecece" }} value={values[name]} onChange={(e) => handleApplyFilter(e.target.value, name)}></input>;
    };

    const handleskip = (num) => {
        setSkip(num);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    return (
        <>
            <Dialog visible={showDialog} header="Vehicle Manufacturer" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <VehicleManufacturerDialog onHideVehicleManufacturer={onHideVehicleManufacturer} onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Vehicle Manufacturer</h2>
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
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="id" header="ID" filterElement={() => handleFilter("id")} />
                            <Column filter field="title" header="Title" filterElement={() => handleFilter("title")} />
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

export default VehicleManufacturer;
