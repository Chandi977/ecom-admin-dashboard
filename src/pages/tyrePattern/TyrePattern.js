import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import AddTyrePatternDialog from "./AddTyrePatternDialog";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import Paginator from "../../components/Paginator";
import { handlePostRequest } from "../../services/PostTemplate";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Axios from "axios";
import { DEV } from "../../services/constants";

function TyrePattern() {
    const [showDialog, setShowDialog] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const menu = useRef(null);
    const breadItems = [{ label: "Home" }, { label: "Tyre Patterns" }];
    const [patterns, setPatterns] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const [role, setRole] = useState();
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const history = useHistory();
    const handledClicked = () => {
        history.push("");
    };

    const getData = async () => {
        const params = {
            skip: skip,
        };
        const result = await handleGetRequest("/all/Patterns", params);
        const Count = await handleGetRequest("/patternCount");
        setTotal(Count?.data);
        setPatterns(result?.data);
    };

    useEffect(() => {
        getData();
    }, []);
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} aria-controls="popup_menu" aria-haspopup />
            </div>
        );
    };

    const handleActionButton = (e, rowdata) => {
        e.preventDefault();
        history.push(`/tyrepatternprofile/${rowdata?.id}`);
    };

    const onHideTyrePatternDialog = () => {
        setShowDialog(false);
    };

    const handleSuccess = () => {
        onHideTyrePatternDialog();
        getData();
        window.location.reload();
    };

    const handleManufacturer = (rowData) => {
        return <p>{rowData?.manufacturer?.id}</p>;
    };

    const handleskip = (num) => {
        setSkip(num);
    };

    const handledDelete = () => {
        const selectedIds = selectedRow.map((val) => {
            return val?.id;
        });
        const data = {
            id: selectedIds,
        };
        const res = dispatch(handlePostRequest(data, "/deletePattern", true, true));
        getData();
        window.location.reload();
        toast.success("tyre pattern deleted");
    };
    const [values, setValues] = useState({
        id: "",
        title: "",
        manufacturer: "",
    });

    const temporary = ["id", "title", "manufacturer"];

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/SearchPatterns", {
            params: {
                [names]: value,
            },
        });
        setPatterns(result?.data?.data);
    };

    const handleFilter = (name) => {
        return <input style={{ width: "100%", height: "37px", borderRadius: "5px", border: "none" }} value={values[name]} onChange={(e) => handleApplyFilter(e.target.value, name)}></input>;
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);
    return (
        <>
            {/* Add Tyre Pattern Dialog */}
            <Dialog visible={showDialog} header="Add Tyre Pattern" style={{ width: "650px" }} onHide={() => setShowDialog(false)}>
                <AddTyrePatternDialog onHideTyrePatternDialog={onHideTyrePatternDialog} handleSuccess={handleSuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Tyre Pattern</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                {role === "admin" && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={() => setShowDialog(true)} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handledDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
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
                            value={patterns}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="id" header="ID" filterElement={() => handleFilter("id")} />
                            <Column filter field="title" header="Title" filterElement={() => handleFilter("title")} />
                            <Column body={handleManufacturer} header="Manufacturer" />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={patterns} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default TyrePattern;
