import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";

function CustomersData() {
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const response = await handleGetRequest("/customer/get");
                const rows = Array.isArray(response?.data) ? response.data : [];
                const sortedData = rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                if (isMounted) setManufacturers(sortedData);
            } catch (error) {
                console.error("Error fetching data from API:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();
        return () => {
            isMounted = false;
        };
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
                        {loading ? (
                            <p>Loading data...</p>
                        ) : manufacturers.length > 0 ? (
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
                            <p>No customer data found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomersData;
