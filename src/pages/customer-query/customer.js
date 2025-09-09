import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { Paginator } from "primereact/paginator";
import moment from "moment";

function CustomersData() {
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await Axios.get(DEV + "/customer/get");
                console.log(response);
                const sortedData = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setManufacturers(sortedData);
            } catch (error) {
                console.error("Error fetching data from API:", error);
            }
        }

        fetchData();
        // console.log(manufacturers);
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
                                    <Column field="email" header="Email" />
                                    <Column field="phone_no" header="Phone No." />
                                    <Column field="message" header="Message" />
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

export default CustomersData;
