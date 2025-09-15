import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { Dialog } from "primereact/dialog";
import CustomerDialog from "../Admin/CustomerDialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import Axios from "axios";
import { DEV } from "../../services/constants";
import Paginator from "../../components/Paginator";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { AiTwotoneDelete } from "react-icons/ai";
import { FaPen } from "react-icons/fa";
import { JsonToExcel } from "react-json-to-excel";

function Customers() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const breadItems = [{ label: "Home" }, { label: "Users" }];
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
        const res = await handleGetRequest("/allCustomers", params);
        const total = await handleGetRequest("/countUsers");
        const users = await handleGetRequest("/totalUsers");
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
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                    <Button
                        className="p-button-rounded mr-2 Elipse_Icon"
                        onClick={() => history.push(`/customer/${rowData?._id}`)}
                        onMouseEnter={(e) => {
                            const tip = e.currentTarget.nextSibling;
                            tip.style.display = "block";
                        }}
                        onMouseLeave={(e) => {
                            const tip = e.currentTarget.nextSibling;
                            tip.style.display = "none";
                        }}
                    >
                        <FaPen />
                    </Button>
                    <span style={{ display: "none", position: "absolute", top: "40px", left: "0", background: "#222", color: "#fff", padding: "6px 14px", borderRadius: "7px", fontSize: "0.95rem", zIndex: 10 }}>Edit User</span>
                </div>
                <div style={{ position: "relative", marginLeft: "10px" }}>
                    <span
                        style={{ fontSize: "33px", color: "red", cursor: "pointer" }}
                        onClick={() => handleDelete(rowData)}
                        onMouseEnter={(e) => {
                            const tip = e.currentTarget.nextSibling;
                            tip.style.display = "block";
                        }}
                        onMouseLeave={(e) => {
                            const tip = e.currentTarget.nextSibling;
                            tip.style.display = "none";
                        }}
                    >
                        <AiTwotoneDelete />
                    </span>
                    <span style={{ display: "none", position: "absolute", top: "40px", left: "0", background: "#222", color: "#fff", padding: "6px 14px", borderRadius: "7px", fontSize: "0.95rem", zIndex: 10 }}>Delete User</span>
                </div>
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
        return <input className="custom-filter-input" value={values[name]} onChange={(e) => handleApplyFilter(e.target.value, name)} />;
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

    // Add custom styles for table and page
    // You can move this to a CSS file if preferred
    const customStyles = `
    .custom-card {
        border-radius: 18px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        padding: 24px 18px 18px 18px;
        background: #fff;
    }
    .custom-table .p-datatable-thead > tr > th {
        background: #f6f8fa;
        color: #222;
        font-weight: 600;
        border: none;
        font-size: 1.08rem;
        padding: 16px 10px;
    }
    .custom-table .p-datatable-tbody > tr {
        transition: background 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .custom-table .p-datatable-tbody > tr:nth-child(even) {
        background: #f9fafb;
    }
    .custom-table .p-datatable-tbody > tr:hover {
        background: #e6f0fa !important;
        transition: background 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .custom-table .p-datatable-tbody > tr > td {
        border: none;
        padding: 14px 10px;
        font-size: 1.01rem;
    }
    .custom-table .p-datatable {
        border-radius: 14px;
        overflow: hidden;
    }
    .custom-table .p-datatable-wrapper {
        border-radius: 14px;
    }
    .custom-table .p-datatable .p-datatable-tbody > tr > td .Elipse_Icon {
        color: #1976d2;
        background: #e3f2fd;
        border-radius: 50%;
    }
    .custom-table .p-datatable .p-datatable-tbody > tr > td .Elipse_Icon:hover {
        background: #bbdefb;
    }
    .custom-table .p-datatable .p-datatable-tbody > tr > td p {
        margin: 0;
    }
    .custom-filter-input {
        width: 100%;
        height: 37px;
        border-radius: 7px;
        border: 1px solid #cecece;
        padding: 0 12px;
        background: #f6f8fa;
        transition: border 0.2s;
        margin-bottom: 2px;
    }
    .custom-filter-input:focus {
        border: 1.5px solid #1976d2;
        outline: none;
        background: #fff;
    }
    .Top__Btn .p-button, .Top__Btn .buttonsaaa {
        margin-left: 12px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 1.01rem;
        box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
    }
    .Top__Btn .p-button:first-child {
        margin-left: 0;
    }
    .Top__Btn {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .Page__Header {
        margin-bottom: 22px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    .custom-paginator {
        margin-top: 18px;
    }
    `;

    console.log(users);
    return (
        <>
            <style>{customStyles}</style>
            <Dialog visible={showDialog} header="Add Customer" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <CustomerDialog onHideCustomerDialog={onHideCustomerDialog} handlesuccess={handlesuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 4, color: "#222" }}>Users ({total})</h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
                <div className="Top__Btn">
                    <Button label="Add New User" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "140px" }} />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledDelete} className="Btn__DarkDelete" style={{ width: "140px" }} />
                    <JsonToExcel title="Download Users List" data={users} fileName="users" btnClassName="buttonsaaa" />
                </div>
            </div>

            <div className="grid">
                <div className="col-12">
                    <div className="custom-card shadow-lg">
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive custom-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={customers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            {/* <Column filter field="user_id"  header="ID" filterElement={() => handleFilter("user_id")} /> */}
                            <Column filter field="first_name" style={{ textTransform: "capitalize", fontWeight: "500" }} header="First Name" filterElement={() => handleFilter("name")} />
                            <Column filter field="email_address" header="Email" style={{ fontWeight: "500" }} filterElement={() => handleFilter("email")} />
                            <Column filter field="mobile_number" header="Contact No." style={{ fontWeight: "500" }} filterElement={() => handleFilter("number")} />
                            {/* <Column filter body={handleAddress} style={{ textTransform: "capitalize", fontWeight: "500" }} header="Role" filterElement={() => handleFilter("role")} /> */}

                            <Column body={handleDate} header="Account Created" />
                            <Column header="Edit/Delete User" body={actionBodyTemplate} />
                        </DataTable>
                        <div className="custom-paginator">
                            <Paginator data={customers} total={total} skip={skip} handleskip={handleskip} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Customers;
