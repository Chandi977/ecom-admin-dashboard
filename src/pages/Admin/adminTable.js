import React, { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import CustomerDialog from "./CustomerDialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { exportJsonToExcel } from "../../utils/exportToExcel";

function AllAdmin() {
    const [showDialog, setShowDialog] = useState(false);
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const history = useHistory();

    const getData = useCallback(async () => {
        const res = await handleGetRequest("/all/admin");
        const users = await handleGetRequest("/all/admin/list");
        setUsers(users?.data);
        setCustomers(res?.data);
    }, []);

    useEffect(() => {
        getData();
    }, [getData]);

    const handleDelete = async (value) => {
        if (!value?._id) {
            toast.info("Select an admin to delete.");
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

    const handleBulkDelete = () => {
        toast.info("Select an admin to delete.");
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
            <style>{`
                .admin-cards-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                    margin-top: 24px;
                }
                .admin-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    padding: 24px 22px;
                    min-width: 260px;
                    max-width: 320px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    border: 3px solid #F6F6F6;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                }
                .admin-card:hover {
                    transform: translateY(-6px) scale(1.02);
                    box-shadow: 0 8px 28px rgba(0,0,0,0.12);
                    border-color: #e3f2fd;
                }
                .admin-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #e3f2fd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.2rem;
                    color: #1976d2;
                    margin-bottom: 14px;
                }
                .admin-info {
                    text-align: center;
                    margin-bottom: 12px;
                }
                .admin-info .admin-name {
                    font-weight: 700;
                    font-size: 1.18rem;
                    color: #222;
                }
                .admin-info .admin-email {
                    color: #888;
                    font-size: 1.01rem;
                }
                .admin-info .admin-contact {
                    color: #1976d2;
                    font-size: 1.01rem;
                }
                .admin-info .admin-role {
                    color: #22c55e;
                    font-size: 1.01rem;
                    font-weight: 600;
                }
                .admin-info .admin-date {
                    color: #b0b3bb;
                    font-size: 0.98rem;
                }
                .admin-actions {
                    display: flex;
                    gap: 18px;
                    margin-top: 10px;
                }
                .admin-action-btn {
                    background: #e3f2fd;
                    border-radius: 50%;
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: none;
                    transition: background 0.2s;
                    position: relative;
                }
                .admin-action-btn:hover {
                    background: #bbdefb;
                }
                .admin-action-btn .tooltip {
                    display: none;
                    position: absolute;
                    top: 44px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #222;
                    color: #fff;
                    padding: 6px 14px;
                    border-radius: 7px;
                    font-size: 0.95rem;
                    z-index: 10;
                    white-space: nowrap;
                }
                .admin-action-btn:hover .tooltip {
                    display: block;
                }
            `}</style>
            <Dialog visible={showDialog} header="Add Customer" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <CustomerDialog onHideCustomerDialog={onHideCustomerDialog} handlesuccess={handlesuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 4, color: "#222" }}>Admin List ({customers.length})</h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
                <div className="Top__Btn">
                    <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handleBulkDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    <Button
                        label="Download"
                        className="buttonsaaa"
                        onClick={() => exportJsonToExcel({ data: users, fileName: "users" })}
                    />
                </div>
            </div>

            <div className="admin-cards-container">
                {customers.map((admin, idx) => (
                    <div className="admin-card" key={admin._id || idx}>
                        <div className="admin-avatar">
                            <i className="pi pi-user" />
                        </div>
                        <div className="admin-info">
                            <div className="admin-name">{admin.first_name || "-"}</div>
                            <div className="admin-email">{admin.email_address || "-"}</div>
                            <div className="admin-contact">{admin.mobile_number || "-"}</div>
                            {/* <div className="admin-role">{admin.role || "Admin"}</div> */}
                            <div className="admin-date">{moment(admin.createdAt).format("DD/MM/YYYY")}</div>
                        </div>
                        <div className="admin-actions">
                            <button className="admin-action-btn" onClick={() => history.push(`/customer/${admin._id}`)}>
                                <i className="pi pi-pencil" style={{ color: "#1976d2", fontSize: "1.3rem" }}></i>
                                <span className="tooltip">Edit Admin</span>
                            </button>
                            <button className="admin-action-btn" onClick={() => handleDelete(admin)}>
                                <i className="pi pi-trash" style={{ color: "red", fontSize: "1.3rem" }}></i>
                                <span className="tooltip">Delete Admin</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default AllAdmin;
