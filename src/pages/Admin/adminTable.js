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
import { ROLE_LABELS } from "../../rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";

function AllAdmin() {
    const [showDialog, setShowDialog] = useState(false);
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const history = useHistory();
    // Staff accounts are managed by full-access roles only (user:write).
    const { can } = usePermissions();
    const canManageStaff = can("user:write");

    const getData = useCallback(async () => {
        try {
            const res = await handleGetRequest("/all/admin");
            const usersResp = await handleGetRequest("/all/admin/list");
            setUsers(usersResp?.data || []);
            setCustomers(res?.data || []);
        } catch (error) {
            // Keep UI stable even if unauthorized
            setUsers([]);
            setCustomers([]);
        }
    }, []);

    useEffect(() => {
        getData();
    }, [getData]);

    const handleDelete = async (value) => {
        if (!canManageStaff) {
            toast.info("You are not authorized to delete staff accounts.");
            return;
        }
        if (!value?._id) {
            toast.info("Select an admin to delete.");
            return;
        }
        const data = {
            id: [value?._id],
        };
        const res = await dispatch(handlePostRequest(data, "/deleteUser", true, true));
        if (res && res !== "error" && res.success) {
            toast.success("User deleted.");
            getData();
        }
    };

    const handledClicked = () => {
        if (canManageStaff) {
            setShowDialog(true);
        } else {
            toast.info("You are not authorized to add staff accounts.");
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
                .layout-main .admin-card {
                    --admin-accent: #0c4e9c;
                    --admin-bg-accent: #e9f3f8;
                    --admin-color-accent: #0c4e9c;
                    background: #fff !important;
                    border-radius: 16px !important;
                    border: 2px solid var(--admin-accent) !important;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04) !important;
                    padding: 24px 22px;
                    min-width: 240px;
                    max-width: 300px;
                    flex: 1 1 240px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .layout-main .admin-card:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08) !important;
                    border-color: var(--admin-accent) !important;
                }
                .admin-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: var(--admin-bg-accent) !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    color: var(--admin-color-accent) !important;
                    margin-bottom: 16px;
                    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
                    transition: transform 0.22s ease;
                }
                .admin-card:hover .admin-avatar {
                    transform: scale(1.1);
                }
                .admin-info {
                    text-align: center;
                    margin-bottom: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    width: 100%;
                }
                .admin-info .admin-name {
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: #0f172a;
                }
                .admin-info .admin-email {
                    color: #64748b;
                    font-size: 0.95rem;
                    background: #f1f5f9;
                    padding: 2px 10px;
                    border-radius: 9999px;
                    font-weight: 500;
                    word-break: break-all;
                    max-width: 100%;
                }
                .admin-info .admin-contact {
                    color: #0c4e9c;
                    font-size: 0.95rem;
                    font-weight: 600;
                }
                .admin-info .admin-role {
                    color: #0c4e9c;
                    background: #e9f3f8;
                    border: 1px solid #cfe3f0;
                    border-radius: 9999px;
                    padding: 2px 12px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }
                .admin-info .admin-date {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                .admin-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: auto;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 14px;
                    width: 100%;
                    justify-content: center;
                }
                .admin-action-btn {
                    border-radius: 8px;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .admin-action-edit {
                    background: #eff6ff;
                    color: #2563eb;
                }
                .admin-action-edit:hover {
                    background: #2563eb;
                    color: #fff;
                }
                .admin-action-delete {
                    background: #fef2f2;
                    color: #dc2626;
                }
                .admin-action-delete:hover {
                    background: #dc2626;
                    color: #fff;
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
            <Dialog visible={showDialog} header="Add Staff Account" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <CustomerDialog onHideCustomerDialog={onHideCustomerDialog} handlesuccess={handlesuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 4, color: "#222" }}>Admin List ({customers.length})</h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
                <div className="Top__Btn">
                    {canManageStaff && (
                        <>
                            <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                            <Button icon="pi pi-trash" iconPos="right" onClick={handleBulkDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                        </>
                    )}
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
                            {/* Unknown/legacy role keys fall back to the raw value. */}
                            <div className="admin-role">{ROLE_LABELS[admin.role] || admin.role || "-"}</div>
                            <div className="admin-email">{admin.email_address || "-"}</div>
                            <div className="admin-contact">{admin.mobile_number || "-"}</div>
                            <div className="admin-date">{moment(admin.createdAt).format("DD/MM/YYYY")}</div>
                        </div>
                        {canManageStaff && (
                            <div className="admin-actions">
                                <button className="admin-action-btn admin-action-edit" onClick={() => history.push(`/customer/${admin._id}`)}>
                                    <i className="pi pi-pencil" style={{ fontSize: "1.1rem" }}></i>
                                    <span className="tooltip">Edit Admin</span>
                                </button>
                                <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(admin)}>
                                    <i className="pi pi-trash" style={{ fontSize: "1.1rem" }}></i>
                                    <span className="tooltip">Delete Admin</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}

export default AllAdmin;
