import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Axios from "axios";
import { DEV } from "../../services/constants";
import Paginator from "../../components/Paginator";

function CustomPackaging() {
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await Axios.get(DEV + "/custom/packaging/get");
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

    return (
        <div className="Page__Header" style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <h2>Custom Packaging Form</h2>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        {manufacturers.length > 0 ? (
                            <DataTable
                                className="datatable-responsive"
                                value={manufacturers}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                                emptyMessage="No List found."
                                paginator={true}
                                responsiveLayout="scroll"
                                rows={6}
                            >
                                <Column field="company_name" header="Company Name" />
                                <Column field="product_category" header="Product Category" />
                                <Column field="moq" header="MOQ" />
                                <Column field="rich_text" header="Rich Text" />
                                <Column field="contact_person_name" header="Contact Person Name" />
                                <Column field="contact_person_mobile_number" header="Contact Person Mobile Number" />
                                <Column field="contact_person_email" header="Contact Person Email" />
                            </DataTable>
                        ) : (
                            <p>Loading data...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomPackaging;
