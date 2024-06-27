import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import FeatureDialogue from "./FeatureDialogue";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import Axios from "axios";
import { DEV } from "../../services/constants";
import Paginator from "../../components/Paginator";

function Features() {
    const [loading, setloading] = useState();
    const [editable, setEditable] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [features, setFeatures] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const home = {
        icon: "pi pi-home",
        url: "/",
    };
    const breadItems = [{ label: "Home" }, { label: "Features" }];
    const history = useHistory();
    const handledClicked = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?.id;
        });
        const data = {
            id: selectedId,
        };
        const res = dispatch(handlePostRequest(data, "/deleteFeature", true, true));
        getData();
        toast.success("feature deleted.");
        window.location.reload();
    };

    const getData = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/features", params);
        const total = await handleGetRequest("/countFeature");
        setFeatures(res?.data);
        setTotal(total?.data);
    };

    const handleskip = (num) => {
        setSkip(num);
    };

    useEffect(() => {
        getData();
    }, []);
    const menu = useRef(null);

    const handleRoute = (id) => {
        history.push(`feature/${id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={() => handleRoute(rowData?.id)} aria-controls="popup_menu" aria-haspopup />
            </div>
        );
    };
    const createdTemplate = (rowData) => {
        return <p>{moment(rowData?.createdAt).format("DD/MM/YYYY")}</p>;
    };
    const buttonTemplate = (rowData) => {
        return <img src={rowData?.image} style={{ width: "50px" }}></img>;
    };
    const handledAdd = () => {
        setShowDialog(true);
    };
    const onHidefeatureDialog = () => {
        setShowDialog(false);
    };
    const onsuccess = () => {
        onHidefeatureDialog();
        toast.success("feature added");
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
        const result = await Axios.get(DEV + "/searchFeature", {
            params: {
                [names]: value,
            },
        });
        setFeatures(result?.data?.data);
    };

    const handleFilter = (name) => {
        return <input style={{ width: "100%", height: "37px", borderRadius: "5px", border: "1px solid #cecece" }} value={values[name]} onChange={(e) => handleApplyFilter(e.target.value, name)}></input>;
    };

    return (
        <>
            <Dialog visible={showDialog} header="Add New Features" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <FeatureDialogue onHidefeatureDialog={onHidefeatureDialog} onsuccess={onsuccess} />
            </Dialog>
            <div className="Page__Header">
                <div>
                    <h2>Features</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="Top__Btn">
                    <Button icon="pi pi-plus" iconPos="right" onClick={handledAdd} className="Btn__DarkAdd" style={{ width: "100px", height: "35px" }} label="Add" />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledClicked} className="Btn__DarkDelete" style={{ width: "240px" }} />
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
                            value={features}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="id" header="ID" filterElement={() => handleFilter("id")} />
                            <Column filter field="title" header="Message" filterElement={() => handleFilter("title")} />
                            <Column header="Created On" body={createdTemplate} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={features} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Features;
