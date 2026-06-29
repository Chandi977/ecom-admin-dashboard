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
    .brand-card {
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
    .brand-card:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: 0 8px 28px rgba(0,0,0,0.12);
        border-color: #e3f2fd;
    }
    .brand-avatar {
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
    .brand-info {
        text-align: center;
        margin-bottom: 12px;
    }
    .brand-info .brand-name {
        font-weight: 700;
        font-size: 1.18rem;
        color: #222;
    }
    .brand-info .brand-slug {
        color: #888;
        font-size: 1.01rem;
    }
    .brand-info .brand-date {
        color: #b0b3bb;
        font-size: 0.98rem;
    }
    .brand-actions {
        display: flex;
        gap: 18px;
        margin-top: 10px;
    }
    .brand-action-btn {
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
    .brand-action-btn:hover {
        background: #bbdefb;
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
                {role === "admin" || role === "catalog-manager" && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    </div>
                )}
            </div>
            <div className="brand-cards-container mb-4">
                {sortedManufacturers.map((brand, idx) => (
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
                            {role === "admin" || role === "catalog-manager" && (
                            <>
                            <button className="brand-action-btn" onClick={() => history.push(`/brand/${brand._id}`)}>
                                <i className="pi pi-pencil" style={{ color: "#1976d2", fontSize: "1.3rem" }}></i>
                                <span className="tooltip">Edit Brand</span>
                            </button>
                            <button className="brand-action-btn" onClick={() => handleDelete(brand._id)}>
                                <i className="pi pi-trash" style={{ color: "red", fontSize: "1.3rem" }}></i>
                                <span className="tooltip">Delete Brand</span>
                            </button>
                            </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Brands;
