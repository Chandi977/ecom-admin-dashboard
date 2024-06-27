import React, { useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { Link, useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import Paginator from "../../components/Paginator";
import { handlePostRequest } from "../../services/PostTemplate";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Axios from "axios";
import { DEV } from "../../services/constants";

function Logs() {
    const [selectedRow, setselectedRow] = useState([]);
    const breadItems = [{ label: "Home" }, { label: "Logs" }];
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);

    const getData = async () => {
        const params = {
            skip: skip,
        };
        const result = await handleGetRequest("/allLogss", params);
        const total = await handleGetRequest("/countlogss");
        setTotal(total?.data);
        setLogs(result?.data);
    };

    useEffect(() => {
        getData();
    }, [skip]);

    const dispatch = useDispatch();

    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const history = useHistory();
    const handledClicked = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        const res = dispatch(handlePostRequest(data, "/deleteLogs", true, true));
        getData();
        toast.success("logs deleted.");
        window.location.reload();
    };

    const dateTemplate = (rowData) => {
        return <p>{moment(rowData?.createdAt).format("DD/MM/YYYY")}</p>;
    };

    const linktmeplate = (rowData) => {
        return <Link to={rowData?.link}>{rowData?.link}</Link>;
    };

    const idTmeplate = (rowData) => {
        return <p>{rowData?._id.substring(1, 6)}</p>;
    };

    const handleskip = (num) => {
        setSkip(num);
    };

    const [values, setValues] = useState({
        id: "",
        title: "",
        link: "",
    });

    const temporary = ["id", "title", "link"];

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/searchLogs", {
            params: {
                [names]: value,
            },
        });
        setLogs(result?.data?.data);
    };

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
                onChange={(e) => handleApplyFilter(e.target.value, name)}
            ></input>
        );
    };
    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Logs</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="Top__Btn">
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
                            value={logs}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter body={idTmeplate} header="ID" filterElement={() => handleFilter("id")} />
                            <Column filter field="title" header="Title" filterElement={() => handleFilter("title")} />
                            <Column filter body={linktmeplate} header="Links" filterElement={() => handleFilter("link")} />
                            <Column filter header="Created On" body={dateTemplate} />
                        </DataTable>
                        <Paginator data={logs} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Logs;
