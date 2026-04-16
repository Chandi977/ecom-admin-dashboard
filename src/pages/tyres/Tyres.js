import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import AddTyreDialog from "./AddTyreDialog";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { AiTwotoneDelete, AiFillEye } from "react-icons/ai";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

const MIN_FILTER_LENGTH = 2;
const FILTER_DEBOUNCE_MS = 300;

function Tyres() {
    const [showDialog, setShowDialog] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const [allTyres, setAllTyres] = useState([]);
    const [brands, setBrands] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(10);
    const [isFiltering, setIsFiltering] = useState(false);
    const menu = useRef(null);
    const breadItems = [{ label: "Home" }, { label: "Tyres" }];
    const dispatch = useDispatch();
    const [role, setRole] = useState();

    const home = { icon: "pi pi-home", url: "/" };
    const history = useHistory();
    const handledClicked = () => {
        history.push("");
    };
    const handleRoute = (e, rowData) => {
        e.preventDefault();
        history.push(`/tyreprofile/${rowData?.tyre_id}`);
    };

    const handleDelete = async (value) => {
        const data = {
            id: [value?.tyre_id],
        };
        console.log(data);
        const res = dispatch(handlePostRequest(data, "/deleteTyre", true, true));
        getData();
        toast.success("tyre deleted.");
        window.location.reload();
    };

    const handleView = (value) => {
        window.open(`https://tr-frontend.vercel.app/tyre/${value?.tyre_id}/${value?.title}-${value?.series}-${value?.tyre_width}-${value?.tyre_profile}-r${value?.rim_diameter}`, "_blank");
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: "flex" }}>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleRoute(e, rowData)} aria-controls="popup_menu" aria-haspopup />
                {role === "admin" || role === "manager" ? (
                    <p style={{ fontSize: "33px", marginLeft: "10px", color: "red", cursor: "pointer" }} onClick={() => handleDelete(rowData)}>
                        <i>
                            <AiTwotoneDelete />
                        </i>
                    </p>
                ) : null}
                <p style={{ fontSize: "33px", marginLeft: "10px", color: "green", cursor: "pointer" }} onClick={() => handleView(rowData)}>
                    <i>
                        <AiFillEye />
                    </i>
                </p>
            </div>
        );
    };

    const tyreManufacturerTemplate = (rowdata) => {
        return <p>{rowdata?.tyre_manufacturer?.title}</p>;
    };

    const tyreManufacturerTemplat = (rowdata) => {
        return <p>{rowdata?.pattern?.title}</p>;
    };
    const onHideTyreDialog = () => {
        setShowDialog(false);
    };

    const getAllTyres = async () => {
        const params = {
            skip: skip,
            limit: rows,
        };
        const res = await handleGetRequest("/getAllTyres", params);
        const total = await handleGetRequest("/countTyres");
        setTotal(total?.data);
        setAllTyres(res?.data);
    };
    useEffect(() => {
        if (!isFiltering) {
            getAllTyres();
        }
    }, [isFiltering, rows, skip]);

    const getData = async () => {
        const result = await handleGetRequest("/getAll/Tyre/manufacturer");
        const res = await handleGetRequest("/all/Patterns");
        setBrands(result?.data);
        setPatterns(res?.data);
    };

    useEffect(() => {
        getData();
    }, []);
    const priceTemplate = (rowdata) => {
        return <p>₹{rowdata?.price?.default_price}</p>;
    };

    const [values, setValues] = useState({
        id: "",
        title: "",
        manufacturer: "",
        price: "",
        pattern: "",
        ratio: "",
        width: "",
        rimDiameter: "",
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
        const result = await Axios.get(DEV + "/adminSearch", {
            params: {
                [names]: trimmed,
            },
        });
        const filteredTyres = result?.data?.data || [];
        setAllTyres(filteredTyres);
        setTotal(filteredTyres.length);
    };

    const debouncedApplyFilter = useDebouncedCallback(handleApplyFilter, FILTER_DEBOUNCE_MS);

    const handleFilter = (name) => {
        return (
            <input
                style={{ width: "100%", height: "37px", borderRadius: "5px", border: "none" }}
                value={values[name]}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    setValues((prev) => ({ ...prev, [name]: nextValue }));
                    debouncedApplyFilter(nextValue, name);
                }}
            ></input>
        );
    };

    const apllyManufacturer = async (value) => {
        const trimmed = (value || "").trim();
        if (!trimmed || trimmed.length < MIN_FILTER_LENGTH) {
            setIsFiltering(false);
            setSkip(0);
            return;
        }
        setIsFiltering(true);
        setSkip(0);
        const query = trimmed.toLowerCase().split("");
        const searchPattern = new RegExp(query.map((term) => `(?=.*${term})`).join(""), "i");
        const search = brands.filter((option) => option.title.match(searchPattern));
        const manufacturerId = search?.[0]?._id;
        if (!manufacturerId) {
            setAllTyres([]);
            setTotal(0);
            return;
        }
        const result = await Axios.get(DEV + "/adminSearch", {
            params: {
                manufacturer: manufacturerId,
            },
        });
        const filteredTyres = result?.data?.data || [];
        setAllTyres(filteredTyres);
        setTotal(filteredTyres.length);
    };

    const debouncedApplyManufacturer = useDebouncedCallback(apllyManufacturer, FILTER_DEBOUNCE_MS);

    const handleManufacturer = (name) => {
        return (
            <input
                style={{ width: "100%", height: "37px", borderRadius: "5px", border: "none" }}
                value={values[name]}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    setValues((prev) => ({ ...prev, [name]: nextValue }));
                    debouncedApplyManufacturer(nextValue);
                }}
            ></input>
        );
    };

    const apllyPattern = async (value) => {
        const trimmed = (value || "").trim();
        if (!trimmed || trimmed.length < MIN_FILTER_LENGTH) {
            setIsFiltering(false);
            setSkip(0);
            return;
        }
        setIsFiltering(true);
        setSkip(0);
        const query = trimmed.toLowerCase().split("");
        const searchPattern = new RegExp(query.map((term) => `(?=.*${term})`).join(""), "i");
        const search = patterns.filter((option) => option.title.match(searchPattern));
        const patternId = search?.[0]?._id;
        if (!patternId) {
            setAllTyres([]);
            setTotal(0);
            return;
        }
        const result = await Axios.get(DEV + "/adminSearch", {
            params: {
                pattern: patternId,
            },
        });
        const filteredTyres = result?.data?.data || [];
        setAllTyres(filteredTyres);
        setTotal(filteredTyres.length);
    };

    const debouncedApplyPattern = useDebouncedCallback(apllyPattern, FILTER_DEBOUNCE_MS);

    const handlePattern = (name) => {
        return (
            <input
                style={{ width: "100%", height: "37px", borderRadius: "5px", border: "none" }}
                value={values[name]}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    setValues((prev) => ({ ...prev, [name]: nextValue }));
                    debouncedApplyPattern(nextValue);
                }}
            ></input>
        );
    };

    const onPageChange = (event) => {
        setSkip(event.first);
        setRows(event.rows);
    };

    const handlesuccess = () => {
        onHideTyreDialog();
        toast.success("tyre added");
        window.location.reload();
    };

    const handledDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?.tyre_id;
        });
        const data = {
            id: selectedId,
        };
        const res = dispatch(handlePostRequest(data, "/deleteTyre", true, true));
        getData();
        toast.success("tyre deleted.");
        window.location.reload();
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    return (
        <>
            {/* Add Tyre Dialog */}
            <Dialog visible={showDialog} header="Add Tyre" style={{ width: "650px" }} onHide={() => setShowDialog(false)}>
                <AddTyreDialog onHideTyreDialog={onHideTyreDialog} handlesuccess={handlesuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Tyres</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                {role === "admin" || role === "manager" ? (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={() => setShowDialog(true)} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        {/* <Button icon="pi pi-trash" iconPos="right" onClick={handledDelete} className="Btn__DarkDelete" style={{ width: "240px" }} /> */}
                    </div>
                ) : null}
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
                            value={allTyres}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="tyre_id" header="ID" filterElement={() => handleFilter("id")} />
                            <Column filter field="title" header="Title" filterElement={() => handleFilter("title")} />
                            <Column body={tyreManufacturerTemplate} header="Tyre Manufacturer" />
                            <Column filter body={priceTemplate} header="Price" filterElement={() => handleFilter("price")} />
                            <Column filter body={tyreManufacturerTemplat} header="Tyre Pattern" filterElement={() => handlePattern("pattern")} />
                            <Column filter field="tyre_profile" header="Aspect Ratio" filterElement={() => handleFilter("ratio")} />
                            <Column filter field="tyre_width" header="Tyre Width" filterElement={() => handleFilter("width")} />
                            <Column filter field="rim_diameter" header="Rim Diameter (In)" filterElement={() => handleFilter("rimDiameter")} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Tyres;
