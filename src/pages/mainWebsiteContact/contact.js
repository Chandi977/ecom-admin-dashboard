import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Axios from "axios";
import moment from "moment/moment";

function ContactData({ embedded = false }) {
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await Axios.get("https://server.prempackaging.com/premind/api/contact/form/get");
                // console.log(response);
                setManufacturers(response.data.data);
            } catch (error) {
                console.error("Error fetching data from API:", error);
            }
        }

        fetchData();
        // console.log(manufacturers);
    }, []);

    const content = (
        <div className={embedded ? "" : "card"}>
            {manufacturers.length > 0 ? (
                <DataTable
                    className="datatable-responsive"
                    value={manufacturers}
                    paginator={true}
                    PaginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                    emptyMessage="No List found."
                    rows={6}
                >
                    <Column field="name" header="Name" />
                    <Column field="email" header="Email" />
                    <Column field="phone_no" header="Phone No." />
                    <Column field="message" header="Message" />
                    <Column
                        field="createdAt"
                        header="Created At"
                        body={(rowData) => (
                            <div>
                                <p>{moment(rowData.createdAt).format("DD-MM-YY")}</p>
                                <p>{moment(rowData.createdAt).format("hh:mm a")}</p>
                            </div>
                        )}
                    />
                </DataTable>
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );

    if (embedded) return content;

    return (
        <div className="Page__Header" style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <h2>Contact Data Main Website</h2>
            </div>
            <div className="grid">
                <div className="col-12">
                    {content}
                </div>
            </div>
        </div>
    );
}

export default ContactData;
