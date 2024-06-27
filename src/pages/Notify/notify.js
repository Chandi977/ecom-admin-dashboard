import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { Paginator } from "primereact/paginator";
import moment from "moment";

function NotifyData() {
    const [manufacturers, setManufacturers] = useState([]);
    const [productName, setProductName] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await Axios.get(DEV + "/notify/get");
                // console.log(response);
                setManufacturers(response.data.data);
            } catch (error) {
                console.error("Error fetching data from API:", error);
            }
        }

        fetchData();
    }, []);

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

    const serialNumberTemplate = (rowData, index) => {
        // Correcting the serial number to start from 1
        return (
            <span>{index + 1}</span>
        );
    };

    return (
        <div className="Page__Header" style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <h2>Customer Data</h2>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        {manufacturers.length > 0 ? (
                            <>
                                <DataTable
                                    filterDisplay="row"
                                    className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                                    emptyMessage="No List found."
                                    paginator={true}
                                    responsiveLayout="scroll"
                                    value={manufacturers}
                                    rows={6}
                                >
                                
                                    <Column field="name" header=" Name" />
                                    <Column field="email_address" header="Email" />
                                    <Column field="mobile_number" header="Phone No." />
                                    <Column field="product_id" header="Product" body={(rowData) => (
                                        <>
                                            {/* <div>{rowData.message}</div> */}
                                            <div style={{textTransform:"capitalize"}}>{rowData.product_id?.name} {rowData.product_id?.model}</div>
                                        </>
                                    )} />
                                    <Column field="createdAt" header="CreatedAt" body={dateTemplate} />
                                </DataTable>
                            </>
                        ) : (
                            <p>Loading data...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotifyData;
