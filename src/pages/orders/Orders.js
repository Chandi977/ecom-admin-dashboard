import React, { useCallback, useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment/moment";
import Paginator from "../../components/Paginator";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

function Orders() {
    const [selectedRow, setselectedRow] = useState([]);
    const [resData, setResData] = useState([]);
    const home = { icon: "pi pi-home", url: "/" };
    const breadItems = [{ label: "Orders" }];
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);
    const history = useHistory();
    const getData = useCallback(async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/order/all/orders", params);
        const total = await handleGetRequest("/order/count");

        // Sort the data by updatedAt field in descending order
        // const sortedData = res?.data.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.updatedAt).valueOf());

        setResData(res?.data);
        setTotal(total?.data);
        // console.log("response", sortedData);
    }, [skip]);
    

    useEffect(() => {
        getData();
    }, [getData]);

    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/orderdetail/${rowData?._id}`);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-eye" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} />
            </div>
        );
    };
    const timeTemplate = (rowData) => {
        return (
            <div>
                <p>{moment(rowData.updatedAt).format("DD-MM-YY")}</p>
                <p>{moment(rowData.updatedAt).format("hh:mm a")}</p>
            </div>
        );
    };

    const timeTemplateCreated = (rowData) => {
        return (
            <div>
                <p>{moment(rowData.createdAt).format("DD-MM-YY")}</p>
                <p>{moment(rowData.createdAt).format("hh:mm a")}</p>
            </div>
        );
    };

    const handleskip = (num) => {
        setSkip(num);
    };

    const [values, setValues] = useState({
        order_id: "",
        first_name: "",
        phone: "",
        state: "",
        city: "",
        zipcode: "",
        price: "",
        status: "",
    });

    const handleApplyFilter = async (value, names) => {
        setValues((prev) => ({ ...prev, [names]: value }));
        const result = await Axios.get(DEV + "/order/search", {
            params: {
                [names]: value,
            },
        });
        setResData(result?.data?.data);
    };

    const debouncedApplyFilter = useDebouncedCallback(handleApplyFilter, 600);

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
                onChange={(e) => debouncedApplyFilter(e.target.value, name)}
            ></input>
        );
    };


    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Orders</h2>
                    <BreadCrumb model={breadItems} home={home}  />
                </div>
                {/* {role === "admin" && (
                    <div className="Top__Btn">
                        <Button icon="pi pi-trash" iconPos="right" onClick={handledClicked} className="Btn__DarkDelete" style={{ width: "340px" }} />
                    </div>
                )} */}
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
                            value={resData}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column filter field="orderId" header="ID" filterElement={() => handleFilter("orderId")} />
                            <Column filter field="name" header="Full Name" filterElement={() => handleFilter("name")} style={{ textTransform: "capitalize" }} />
                            <Column field="phone" header="Phone" filterElement={() => handleFilter("phone")} style={{ textTransform: "capitalize" }} />
                            <Column field="state" header="State" filterElement={() => handleFilter("state")} style={{ textTransform: "capitalize" }} />
                            <Column field="town" header="City" filterElement={() => handleFilter("city")} style={{ textTransform: "capitalize" }} />
                            <Column field="pincode" header="Zip Code" filterElement={() => handleFilter("zipcode")} />
                            {/* <Column field="price" header="Price" filterElement={() => handleFilter("price")} /> */}
                            <Column field="status" header="Delivery Status" filterElement={() => handleFilter("status")} style={{ textTransform: "capitalize" }} />

                            <Column header="Updated On" body={timeTemplate} />
                            <Column header="Created On" body={timeTemplateCreated} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={resData} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Orders;
