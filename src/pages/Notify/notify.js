import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";

export function NotificationRequests({ embedded = false }) {
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const response = await handleGetRequest("/notify/get");
                const rows = Array.isArray(response?.data) ? response.data : [];
                if (isMounted) setManufacturers(rows);
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

    const content = (
        <div className="grid">
            <div className="col-12">
                <div className={embedded ? "" : "card"}>
                    {loading ? (
                        <p>Loading data...</p>
                    ) : manufacturers.length > 0 ? (
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No notification requests found."
                            paginator={true}
                            responsiveLayout="scroll"
                            value={manufacturers}
                            rows={6}
                        >
                            <Column field="name" header="Name" />
                            <Column field="email_address" header="Email" />
                            <Column field="mobile_number" header="Phone No." />
                            <Column
                                field="product_id"
                                header="Product"
                                body={(rowData) => (
                                    <div style={{ textTransform: "capitalize" }}>
                                        {rowData.product_id?.name} {rowData.product_id?.model}
                                    </div>
                                )}
                            />
                            <Column field="createdAt" header="Created At" body={dateTemplate} />
                        </DataTable>
                    ) : (
                        <p>No notification requests found.</p>
                    )}
                </div>
            </div>
        </div>
    );

    if (embedded) return content;

    return (
        <div className="Page__Header" style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <h2>Notify Requests</h2>
            </div>
            {content}
        </div>
    );
}

export default NotificationRequests;
