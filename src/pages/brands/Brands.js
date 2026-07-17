import React, { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import AddbrandDialog from "./AddbrandDialog";
import { FaSort } from "react-icons/fa";


function Brands() {
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [sortOrder, setSortOrder] = useState("latest"); // latest or oldest
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = useCallback(async () => {
        const res = await handleGetRequest("/brand/get");
        setManufacturers(res?.data);
    }, []);
    useEffect(() => {
        getBrands();
    }, [getBrands]);
    const handleDelete = (brandId) => {
        const selectedId = brandId ? [brandId] : [];
        const data = {
            id: selectedId,
        };
        if (selectedId.length === 0) {
            toast.info("Select a brand to delete.");
            return;
        }
        dispatch(handlePostRequest(data, "/brand/delete", true, true));
        getBrands();
        toast.success("brand deleted.");
        window.location.reload();
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("brand added");
        setShowDialog(false);
        window.location.reload();
    };

    const onHideFaq = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    // Sort brands before rendering
    const sortedManufacturers = [...manufacturers].sort((a, b) => {
        if (sortOrder === "latest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    });

    return (
        <>
            <style>{`
    .brand-cards-container {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        margin-top: 24px;
    }
    .layout-main .brand-card {
        --brand-accent: #0c4e9c;
        --brand-bg-accent: #e9f3f8;
        --brand-color-accent: #0c4e9c;
        background: #fff !important;
        border-radius: 16px !important;
        border: 2px solid var(--brand-accent) !important;
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
    .layout-main .brand-card:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08) !important;
        border-color: var(--brand-accent) !important;
    }
    .brand-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--brand-bg-accent) !important;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        color: var(--brand-color-accent) !important;
        margin-bottom: 16px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
        transition: transform 0.22s ease;
    }
    .brand-card:hover .brand-avatar {
        transform: scale(1.1);
    }
    .brand-info {
        text-align: center;
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }
    .brand-info .brand-name {
        font-weight: 700;
        font-size: 1.25rem;
        color: #0f172a;
    }
    .brand-info .brand-slug {
        color: #64748b;
        font-size: 0.95rem;
        background: #f1f5f9;
        padding: 2px 10px;
        border-radius: 9999px;
        font-weight: 500;
    }
    .brand-info .brand-date {
        color: #94a3b8;
        font-size: 0.8rem;
        font-weight: 500;
        margin-top: 2px;
    }
    .brand-actions {
        display: flex;
        gap: 12px;
        margin-top: auto;
        border-top: 1px solid #f1f5f9;
        padding-top: 14px;
        width: 100%;
        justify-content: center;
    }
    .brand-action-btn {
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
    .brand-action-edit {
        background: #eff6ff;
        color: #2563eb;
    }
    .brand-action-edit:hover {
        background: #2563eb;
        color: #fff;
    }
    .brand-action-delete {
        background: #fef2f2;
        color: #dc2626;
    }
    .brand-action-delete:hover {
        background: #dc2626;
        color: #fff;
    }
    .brand-action-btn .tooltip {
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
    .brand-action-btn:hover .tooltip {
        display: block;
    }
`}</style>

            <Dialog visible={showDialog} header="Brand" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AddbrandDialog onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 4, color: "#222" }}>Brands List ({manufacturers.length})</h2>
                    <div style={{ position: "relative", display: "inline-block" }} onMouseEnter={() => setShowSortDropdown(true)} onMouseLeave={() => setShowSortDropdown(false)}>
                        <button className="sort-filter-btn" style={{ background: "#e3f2fd", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                            <FaSort style={{ color: "#1976d2", fontSize: "1.3rem" }} />
                        </button>
                        {showSortDropdown && (
                            <div
                                className="sort-tooltip"
                                style={{
                                    position: "absolute",
                                    top: 44,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "#222",
                                    color: "#fff",
                                    padding: "10px 18px",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    zIndex: 10,
                                    minWidth: "160px",
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                                }}
                            >
                                <div
                                    style={{ marginBottom: "8px", cursor: "pointer", background: sortOrder === "latest" ? "#1976d2" : "transparent", color: sortOrder === "latest" ? "#fff" : "#fff", padding: "6px 10px", borderRadius: "6px" }}
                                    onClick={() => {
                                        setSortOrder("latest");
                                        setShowSortDropdown(false);
                                    }}
                                >
                                    Latest to Top
                                </div>
                                <div
                                    style={{ cursor: "pointer", background: sortOrder === "oldest" ? "#1976d2" : "transparent", color: sortOrder === "oldest" ? "#fff" : "#fff", padding: "6px 10px", borderRadius: "6px" }}
                                    onClick={() => {
                                        setSortOrder("oldest");
                                        setShowSortDropdown(false);
                                    }}
                                >
                                    Oldest to Top
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {(role === "admin" || role === "catalog-manager") && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    </div>
                )}
            </div>
            <div className="brand-cards-container mb-4">
                {sortedManufacturers.map((brand, idx) => {
                    return (
                        <div className="brand-card" key={brand._id || idx}>
                            <div className="brand-avatar">
                                <i className="pi pi-tag" />
                            </div>
                            <div className="brand-info">
                                <div className="brand-name">{brand.name || "-"}</div>
                                <div className="brand-slug">{brand.slug || "-"}</div>
                                <div className="brand-date">{moment(brand.createdAt).format("DD/MM/YYYY")}</div>
                            </div>
                            <div className="brand-actions">
                                {(role === "admin" || role === "catalog-manager") && (
                                <>
                                <button className="brand-action-btn brand-action-edit" onClick={() => history.push(`/brand/${brand._id}`)}>
                                    <i className="pi pi-pencil" style={{ fontSize: "1.1rem" }}></i>
                                    <span className="tooltip">Edit Brand</span>
                                </button>
                                <button className="brand-action-btn brand-action-delete" onClick={() => handleDelete(brand._id)}>
                                    <i className="pi pi-trash" style={{ fontSize: "1.1rem" }}></i>
                                    <span className="tooltip">Delete Brand</span>
                                </button>
                                </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default Brands;
