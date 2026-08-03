import React, { useCallback, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import CustomerDialog from "../Admin/CustomerDialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import Axios from "axios";
import { DEV } from "../../services/constants";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { AiTwotoneDelete } from "react-icons/ai";
import { FaPen } from "react-icons/fa";
import { exportJsonToExcel } from "../../utils/exportToExcel";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { can } from "../../rbac/permissions";

const MIN_FILTER_LENGTH = 2;
const FILTER_DEBOUNCE_MS = 300;

function Customers() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(10);
    const [isFiltering, setIsFiltering] = useState(false);
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const history = useHistory();
    // Creating, editing and deleting user accounts all go through user:write.
    const canWrite = can("user:write");
    const [values, setValues] = useState({
        name: "",
        email: "",
        number: "",
        role: "",
        city: "",
        zipcode: "",
        createdAt: "",
    });

    const getData = useCallback(async () => {
        const params = {
            skip: skip,
            limit: rows,
        };
        const res = await handleGetRequest("/allCustomers", params);
        const total = await handleGetRequest("/countUsers");
        const users = await handleGetRequest("/totalUsers");
        setUsers(users?.data);
        setTotal(total?.data);
        setCustomers(res?.data);
    }, [rows, skip]);

    useEffect(() => {
        if (!isFiltering) {
            getData();
        }
    }, [getData, isFiltering]);

    const handleDelete = async (value) => {
        if (!canWrite) {
            toast.info("You do not have permission to delete users.");
            return;
        }
        const data = {
            id: [value?._id],
        };
        console.log(data);
        dispatch(handlePostRequest(data, "/deleteUser", true, true));
        getData();
        toast.success("users deleted.");
        window.location.reload();
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                {canWrite && (
                <>
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
                </>
                )}
            </div>
        );
    };
    const handledClicked = () => {
        if (canWrite) {
            setShowDialog(true);
        } else {
            toast.info("You are not authorized to add customer");
        }
    };

    const onHideCustomerDialog = () => {
        setShowDialog(false);
    };

    const handledDelete = () => {
        if (!canWrite) {
            toast.info("You do not have permission to delete users.");
            return;
        }
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        if (selectedId?.length > 0) {
            dispatch(handlePostRequest(data, "/deleteUser", true, true));
            getData();
            toast.success("users deleted.");
        } else {
            toast.info("Please select atleast one user");
        }
    };

    const handleDate = (rowData) => {
        return <p>{moment(rowData?.createdAt).format("DD/MM/YYYY")}</p>;
    };

    const handleApplyFilter = async (value, names) => {
        const trimmed = (value || "").trim();
        if (!trimmed || trimmed.length < MIN_FILTER_LENGTH) {
            setIsFiltering(false);
            setSkip(0);
            return;
        }
        setIsFiltering(true);
        setSkip(0);
        const result = await Axios.get(DEV + "/searchusers", {
            params: {
                [names]: trimmed,
            },
        });
        const filteredCustomers = result?.data?.data || [];
        setCustomers(filteredCustomers);
        setTotal(filteredCustomers.length);
    };

    const debouncedApplyFilter = useDebouncedCallback(handleApplyFilter, FILTER_DEBOUNCE_MS);

    const handleFilterChange = useCallback(
        (value, name) => {
            setValues((prev) => ({ ...prev, [name]: value }));
            debouncedApplyFilter(value, name);
        },
        [debouncedApplyFilter],
    );

    const handleFilter = (name) => {
        return <input className="custom-filter-input" value={values[name]} onChange={(e) => handleFilterChange(e.target.value, name)} />;
    };

    const onPageChange = useCallback((event) => {
        setSkip(event.first);
        setRows(event.rows);
    }, []);

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
                    {!canWrite && <small style={{ color: "#94a3b8" }}>Read-only for your role — account changes need the user permission.</small>}
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
                <div className="Top__Btn">
                    {canWrite && (
                    <Button label="Add New User" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "140px" }} />
                    )}
                    {canWrite && (
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledDelete} className="Btn__DarkDelete" style={{ width: "140px" }} />
                    )}
                    <Button label="Download Users List" className="buttonsaaa" onClick={() => exportJsonToExcel({ data: users, fileName: "users" })} />
                </div>
            </div>

            <div className="grid">
                <div className="col-12">
                    <div className="custom-card shadow-lg">
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive custom-table"
                            lazy={!isFiltering}
                            paginator
                            first={skip}
                            rows={rows}
                            rowsPerPageOptions={[10, 20, 50]}
                            totalRecords={total}
                            onPage={onPageChange}
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default Customers;
