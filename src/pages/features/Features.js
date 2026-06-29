import React, { useCallback, useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatureDialogue from "./FeatureDialogue";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

const MIN_FILTER_LENGTH = 2;
const FILTER_DEBOUNCE_MS = 300;

function Features() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [features, setFeatures] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(10);
    const [isFiltering, setIsFiltering] = useState(false);
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
        dispatch(handlePostRequest(data, "/deleteFeature", true, true));
        getData();
        toast.success("feature deleted.");
        window.location.reload();
    };

    const getData = useCallback(async () => {
        const params = {
            skip: skip,
            limit: rows,
        };
        const res = await handleGetRequest("/features", params);
        const total = await handleGetRequest("/countFeature");
        setFeatures(res?.data);
        setTotal(total?.data);
    }, [rows, skip]);

    useEffect(() => {
        if (!isFiltering) {
            getData();
        }
    }, [getData, isFiltering]);

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

    const handleApplyFilter = async (value, names) => {
        const trimmed = (value || "").trim();
        if (!trimmed || trimmed.length < MIN_FILTER_LENGTH) {
            setIsFiltering(false);
            setSkip(0);
            return;
        }
        setIsFiltering(true);
        setSkip(0);
        const result = await Axios.get(DEV + "/searchFeature", {
            params: {
                [names]: trimmed,
            },
        });
        const filteredFeatures = result?.data?.data || [];
        setFeatures(filteredFeatures);
        setTotal(filteredFeatures.length);
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default Features;
