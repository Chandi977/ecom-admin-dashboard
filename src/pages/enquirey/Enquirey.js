import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import { useDispatch } from "react-redux";
import Paginator from "../../components/Paginator";
import { DEV } from "../../services/constants";
import Axios from "axios";

function Enquirey() {
    const [loading, setloading] = useState();
    const [editable, setEditable] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const breadItems = [{ label: "Home" }, { label: "Enquirey" }];
    const history = useHistory();
    const [enquirey, setEnquirey] = useState([]);

    const getData = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/getAllEnquiry", params);
        const result = await handleGetRequest("/countEnquiry");
        setTotal(result?.data);
        setEnquirey(res?.data);
    };

    useEffect(() => {
        getData();
    }, [skip]);

    const [values, setValues] = useState({
        name: "",
        email: "",
        phone: "",
        quantity: "",
    });

    const temporary = ["name", "email", "phone", "quantity"];

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/searchEnquiry", {
            params: {
                [names]: value,
            },
        });
        setEnquirey(result?.data?.data);
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

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: "flex" }}>
                <Button icon="pi pi-eye" className="p-button-rounded mr-2 Elipse_Icon" onClick={() => history.push(`/enquireydetails/${rowData?._id}`)} />
            </div>
        );
    };
    const dateTemplate = (rowdata) => {
        return (
            <div>
                <p>{moment(rowdata?.createdAt).format("DD-MM-YYYY")}</p>
            </div>
        );
    };

    const dispatch = useDispatch();

    const handledDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        if (selectedId?.length > 0) {
            const res = dispatch(handlePostRequest(data, "/deleteEnquiry", true, true));
            getData();
            toast.success("enquiry deleted.");
        } else {
            toast.info("Please select atleast one row.");
        }
    };

    const productTemplate = (rowData) => {
        return (
            <p>
                {rowData?.product?.title} {rowData?.product?.series} {rowData?.product?.tyre_width}/{rowData?.product?.tyre_profile} R{rowData?.product?.rim_diameter}
            </p>
        );
    };

    const commentTemplate = (rowData) => {
        return <p>Tyres</p>;
    };

    const handleskip = (num) => {
        setSkip(num);
    };

    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Enquirey</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="Top__Btn">
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
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
                            value={enquirey}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="name" header="Full Name" filterElement={() => handleFilter("name")} />
                            <Column filter field="phone" header="Contact No" filterElement={() => handleFilter("phone")} />
                            <Column filter field="email" header="Email" filterElement={() => handleFilter("email")} />
                            <Column filter field="quantity" header="Quantity" filterElement={() => handleFilter("quantity")} />
                            <Column body={productTemplate} header="Enquirey Details" />
                            <Column body={commentTemplate} header="Comment Enquiry" />
                            <Column header="Created On" body={dateTemplate} />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={enquirey} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Enquirey;
