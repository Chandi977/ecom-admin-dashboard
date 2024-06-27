import React, { useEffect, useMemo, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory, useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import AddTyreBrandsDialog from "./AddTyreBrandsDialog";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import Paginator from "../../components/Paginator";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { toast } from "react-toastify";
import Axios from "axios";
import { DEV } from "../../services/constants";

function TyreBrands() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [brands, setBrands] = useState([]);
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);
    const dispatch = useDispatch();
    const [role, setRole] = useState();

    const menu = useRef(null);
    const breadItems = [{ label: "Home", url: "/" }, { label: "Tyre Brands" }];

    const home = { icon: "pi pi-home", url: "/" };
    const history = useHistory();
    const handledClicked = () => {
        history.push("");
    };

    const getBrands = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/getAll/Tyre/manufacturer", params);
        const total = await handleGetRequest("/countManufacturer");
        setTotal(total?.data);
        setBrands(res?.data);
    };
    useMemo(() => {
        getBrands();
    }, [skip]);

    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} aria-controls="popup_menu" aria-haspopup />
            </div>
        );
    };
    const handleActionButton = (e, rowdata) => {
        e.preventDefault();
        history.push(`tyrebrand/${rowdata?.id}`);
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
                    {moment(rowdata?.createdAt).format("DD-MM-YYYY")} &nbsp; | &nbsp; {moment(rowdata?.createdOnTime).format("hh:mm a")}
                </p>
            </div>
        );
    };

    const onHideTyreBrandsDialog = () => {
        setShowDialog(false);
    };
    const handledDelete = () => {
        const selectedIds = selectedRow.map((val) => {
            return val?.id;
        });
        const data = {
            id: selectedIds,
        };
        const res = dispatch(handlePostRequest(data, "/delete/tyre_manufacturer", true, true));
        getBrands();
        toast.success("tyre manufacturer deleted");
        window.location.reload();
    };

    const handleskip = (num) => {
        setSkip(num);
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
        const result = await Axios.get(DEV + "/searchBrand", {
            params: {
                [names]: value,
            },
        });
        setBrands(result?.data?.data);
    };

    const handleFilter = (name) => {
        return <input style={{ width: "100%", height: "37px", borderRadius: "5px", border: "none" }} value={values[name]} onChange={(e) => handleApplyFilter(e.target.value, name)}></input>;
    };

    const onsuccess = () => {
        onHideTyreBrandsDialog();
        toast.success("tyre brand added");
        window.location.reload();
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    return (
        <>
            {/* Add Tyre Brands Dialog */}
            <Dialog visible={showDialog} header="Tyre Brands" style={{ width: "650px" }} onHide={() => setShowDialog(false)}>
                <AddTyreBrandsDialog onHideTyreBrandsDialog={onHideTyreBrandsDialog} onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Tyre Brands</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                {role === "admin" ? (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={() => setShowDialog(true)} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handledDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    </div>
                ) : null}
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
                            value={brands}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="id" header="ID" filterElement={() => handleFilter("id")} />
                            <Column filter body={imageTemplate} header="Title" filterElement={() => handleFilter("title")} />
                            <Column header="Created On" body={dateTemplate} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={brands} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default TyreBrands;
