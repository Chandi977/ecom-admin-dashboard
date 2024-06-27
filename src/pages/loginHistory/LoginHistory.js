import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import Paginator from "../../components/Paginator";

function LoginHistory() {
    const [loading, setloading] = useState();
    const [editable, setEditable] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const breadItems = [{ label: "Home" }, { label: "Login History" }];
    const [Logs, setLogs] = useState([]);
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);

    const getData = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/allLogs", params);
        const total = await handleGetRequest("/countlogs");
        setTotal(total?.data);
        setLogs(res?.data);
    };

    useEffect(() => {
        getData();
    }, [skip]);

    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const menu = useRef(null);
    const history = useHistory();
    const handledClicked = () => {
        history.push("");
    };
    const dateTemplate = (rowdata) => {
        return (
            <div>
                <p>
                    {moment(rowdata?.updatedAt).format("DD-MM-YY")} &nbsp; | &nbsp; {moment(rowdata?.updatedAt).format("hh:mm a")}
                </p>
            </div>
        );
    };

    const handleskip = (num) => {
        setSkip(num);
    };
    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Login History</h2>
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
                            value={Logs}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="_id" header="ID" />
                            <Column filter field="user" header="User" />
                            <Column filter field="userIp" header="User Ip" />
                            <Column filter field="userAgent" header="User Agent" />
                            <Column filter field="type" header="Type" />
                            <Column filter header="Created On" body={dateTemplate} />
                        </DataTable>
                        <Paginator data={Logs} url="/countlogs" total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginHistory;
