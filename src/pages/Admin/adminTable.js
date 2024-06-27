import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { Dialog } from "primereact/dialog";
import CustomerDialog from "./CustomerDialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import Axios from "axios";
import { DEV } from "../../services/constants";
import Paginator from "../../components/Paginator";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { AiTwotoneDelete } from "react-icons/ai";
import { JsonToExcel } from "react-json-to-excel";

function AllAdmin() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const breadItems = [{ label: "Home" }, { label: "Admin" }];
    const temporary = ["name", "email", "number", "role", "city", "zipcode", "createdAt"];
    const home = { icon: "pi pi-home", url: "/" };
    const history = useHistory();
    const [values, setValues] = useState({
        name: "",
        email: "",
        number: "",
        role: "",
        city: "",
        zipcode: "",
        createdAt: "",
    });

    const getData = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/all/admin", params);
        const total = await handleGetRequest("/count/admin");
        const users = await handleGetRequest("/all/admin/list");
        setUsers(users?.data);
        setTotal(total?.data);
        setCustomers(res?.data);
    };

    useEffect(() => {
        getData();
    }, [skip]);

    const handleDelete = async (value) => {
        const data = {
            id: [value?._id],
        };
        console.log(data);
        const res = dispatch(handlePostRequest(data, "/deleteUser", true, true));
        getData();
        toast.success("users deleted.");
        window.location.reload();
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: "flex" }}>
                <Button icon="pi pi-eye" className="p-button-rounded mr-2 Elipse_Icon" onClick={() => history.push(`/customer/${rowData?._id}`)} />
                <p style={{ fontSize: "33px", marginLeft: "10px", color: "red", cursor: "pointer" }} onClick={() => handleDelete(rowData)}>
                    <i>
                        <AiTwotoneDelete />
                    </i>
                </p>
            </div>
        );
    };
    const handledClicked = () => {
        const role = localStorage.getItem("role");
        if (role === "admin") {
            setShowDialog(true);
        } else {
            toast.info("You are not authorized to add customer");
        }
    };

    const onHideCustomerDialog = () => {
        setShowDialog(false);
    };

    const handledDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        if (selectedId?.length > 0) {
            const res = dispatch(handlePostRequest(data, "/deleteUser", true, true));
            getData();
            toast.success("users deleted.");
        } else {
            toast.info("Please select atleast one user");
        }
    };

    const handleAddress = (rowData) => {
        return <p>{rowData?.role}</p>;
    };

    const handleCity = (rowData) => {
        return <p>{rowData?.contact_address?.length > 0 ? rowData?.contact_address?.[0]?.town : "not found"}</p>;
    };

    const handleZipcode = (rowData) => {
        return <p>{rowData?.contact_address?.length > 0 ? rowData?.contact_address?.[0]?.pincode : "not found"}</p>;
    };

    const handleDate = (rowData) => {
        return <p>{moment(rowData?.createdAt).format("DD/MM/YYYY")}</p>;
    };

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/searchusers", {
            params: {
                [names]: value,
            },
        });
        setCustomers(result?.data?.data);
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

    const handleskip = (num) => {
        setSkip(num);
    };

    const handlesuccess = () => {
        onHideCustomerDialog();
        toast.success("user added.");
        getData();
        window.location.reload();
    };
    
    console.log(users);
    return (
        <>
            <Dialog visible={showDialog} header="Add Customer" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <CustomerDialog onHideCustomerDialog={onHideCustomerDialog} handlesuccess={handlesuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2>Admin List</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="Top__Btn">
                    <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    <JsonToExcel title="Download" data={users} fileName="users" btnClassName="buttonsaaa" />
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
                            value={customers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="user_id"  header="ID" filterElement={() => handleFilter("user_id")} />
                            <Column filter field="first_name" style={{textTransform:"capitalize"}} header="First Name" filterElement={() => handleFilter("name")} />
                            <Column filter field="email_address" header="Email" filterElement={() => handleFilter("email")} />
                            <Column filter field="mobile_number" header="Contact No." filterElement={() => handleFilter("number")} />
                            <Column filter body={handleAddress} style={{textTransform:"capitalize"}} header="Role" filterElement={() => handleFilter("role")} />

                            <Column body={handleDate} header="Created On" />
                            <Column header="Action" body={actionBodyTemplate} />
                        </DataTable>
                        <Paginator data={customers} total={total} skip={skip} handleskip={handleskip} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default AllAdmin;
