import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";

function StaticPages() {
    const [loading, setloading] = useState();
    const [editable, setEditable] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const breadItems = [{ label: "Home" }, { label: "Pages" }];
    const [pages, setPages] = useState([]);

    const home = { icon: "pi pi-home", url: "/" };

    const getData = async () => {
        const result = await handleGetRequest("/allpages");
        setPages(result?.data);
    };

    useEffect(() => {
        getData();
    }, []);

    const menu = useRef(null);
    const pagesList = [
        {
            id: 1,
            type: "Order and Refunds",
            createdOnDate: "2022-12-12",
            createdOnTime: "01:12:01 AM",
            createUser: "Admin",
            url: "/orderandrefunds",
        },
        {
            id: 2,
            type: "Terms and Conditions",
            createdOnDate: "2022-12-12",
            createdOnTime: "01:12:01 AM",
            createUser: "Admin",
            url: "/termsandconditions",
        },
        {
            id: 3,
            type: "Privacy",
            createdOnDate: "2022-12-12",
            createdOnTime: "01:12:01 AM",
            createUser: "Admin",
            url: "/privacypolicy",
        },
        {
            id: 4,
            type: "About Us",
            createdOnDate: "2022-12-12",
            createdOnTime: "01:12:01 AM",
            createUser: "Admin",
            url: "/aboutus",
        },
    ];
    const history = useHistory();
    const handledClicked = () => {
        history.push("");
    };
    const handledDetailClicked = (rowData) => {
        history.push(`/allStaticPages/${rowData?.id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-eye" tooltip="view details" className="p-button-rounded mr-2 Elipse_Icon" onClick={() => handledDetailClicked(rowData)} />
            </div>
        );
    };
    const buttonTemplate = (rowData) => {
        return <Button label="Active" onClick={handledClicked} className="status_button" style={{ width: "240px" }} />;
    };
    const dateTemplate = (rowdata) => {
        return <p>{moment(rowdata?.createdAt).format("DD/MM/YYYY")}</p>;
    };
    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Pages</h2>
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
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={pages}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="id" header="ID" />
                            <Column filter field="title" header="Type" />
                            <Column filter header="Created On" body={dateTemplate} />
                            <Column filter field="user" header="Create User" />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StaticPages;
