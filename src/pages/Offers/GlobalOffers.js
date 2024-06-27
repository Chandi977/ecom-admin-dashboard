import React, { useEffect, useMemo, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { handleDeleteRequest } from "../../services/DeleteTemplate";
import GlobalOfferDialogue from "./GlobalOfferDialogue";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import Paginator from "../../components/Paginator";

function GlobalOffers() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const menu = useRef(null);
    const history = useHistory();

    const breadItems = [{ label: "Home" }, { label: "Global Offers" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };
    const getVehicleManufacturers = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/allOffers", params);
        const result = await handleGetRequest("/countGlobal");
        setTotal(result?.data);
        setManufacturers(res?.data);
    };
    useEffect(() => {
        getVehicleManufacturers();
    }, [skip]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/globaloffer/${rowData?._id}`);
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
    const dateTemplate2 = (rowdata) => {
        return (
            <div>
                <p>
                    {moment.unix(rowdata?.time / 1000).format("DD-MMM-YYYY")} &nbsp; | &nbsp;
                    {moment.unix(rowdata?.time / 1000).format("hh:mm a")}
                </p>
            </div>
        );
    };
    const buttonTemplate = (rowData) => {
        return <Button label={rowData?.status} onClick={handledClicked} className="status_button" style={{ width: "240px" }} />;
    };

    const onHideGlobalOffer = () => {
        setShowDialog(false);
    };
    const handleDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        const res = dispatch(handlePostRequest(data, "/deleteOffer", true, true));
        getVehicleManufacturers();
        toast.success("users deleted.");
    };

    const discountTemplate = (rowData) => {
        return <p>{rowData?.discount}%</p>;
    };
    const [values, setValues] = useState({
        tyreType: "",
        discount: "",
        time: "",
        status: "",
    });

    const temporary = ["tyreType", "discount", "time", "status"];

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/searchOffer", {
            params: {
                [names]: value,
            },
        });
        setManufacturers(result?.data?.data);
    };

    const handleFilter = (name) => {
        return <input style={{ width: "100%", height: "37px", borderRadius: "5px", border: "1px solid #cecece" }} value={values[name]} onChange={(e) => handleApplyFilter(e.target.value, name)}></input>;
    };

    const onsuccess = () => {
        onHideGlobalOffer();
        toast.success("global offer added.");
        window.location.reload();
    };

    const handleskip = (num) => {
        setSkip(num);
    };
    return (
        <>
            <Dialog visible={showDialog} header="Offers" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <GlobalOfferDialogue onHideGlobalOffer={onHideGlobalOffer} onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Global Offers</h2>
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
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={manufacturers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="tyreType" header="Tyre type" filterElement={() => handleFilter("tyreType")} />
                            <Column filter header="Status" body={buttonTemplate} filterElement={() => handleFilter("status")} />
                            <Column filter header="Discount" body={discountTemplate} filterElement={() => handleFilter("discount")} />
                            <Column filter header="Created On" body={dateTemplate} />
                            <Column header="Expire On" body={dateTemplate2} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={manufacturers} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default GlobalOffers;
