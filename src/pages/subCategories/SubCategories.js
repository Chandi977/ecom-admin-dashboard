import React, { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import AddcategoryDialog from "./AddsubcategoryDialog";
import { FaPen, FaTrash } from "react-icons/fa";
import { can } from "../../rbac/permissions";
import { DEV } from "../../services/constants";

const CATEGORY_ORDER = ["main", "rollabel", "packpro"];

const normalizeCategoryKey = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const sortSubCategories = (items = []) =>
    [...items].sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(normalizeCategoryKey(a.categoryName));
        const bIndex = CATEGORY_ORDER.indexOf(normalizeCategoryKey(b.categoryName));
        if (aIndex !== bIndex) {
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
    });

function SubCategories() {
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = useCallback(async () => {
        const [subCategoryRes, categoryRes] = await Promise.all([
            handleGetRequest("/subcategory/all"),
            handleGetRequest("/category/all"),
        ]);
        const categories = Array.isArray(categoryRes?.data) ? categoryRes.data : [];
        const categoryById = new Map(categories.map((category) => [String(category?._id), category]));
        const subCategories = Array.isArray(subCategoryRes?.data) ? subCategoryRes.data : [];
        const enrichedSubCategories = subCategories.map((subCategory) => {
            const rawCategory = subCategory?.category;
            const categoryId = typeof rawCategory === "object" ? rawCategory?._id : rawCategory;
            const category = typeof rawCategory === "object" ? rawCategory : categoryById.get(String(categoryId));
            return {
                ...subCategory,
                category,
                categoryName: category?.name || "-",
            };
        });
        setManufacturers(sortSubCategories(enrichedSubCategories));
    }, []);
    useEffect(() => {
        getBrands();
    }, [getBrands]);

    const handleDelete = async (subcategoryId) => {
        if (!subcategoryId) {
            toast.info("Select a subcategory to delete.");
            return;
        }
        const subcategory = manufacturers.find((item) => item?._id === subcategoryId);
        const label = subcategory?.name || "this subcategory";
        if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

        const data = { id: [subcategoryId] };
        setDeletingId(subcategoryId);
        try {
            const res = await dispatch(handlePostRequest(data, "/subcategory/delete", true, false));
            if (res?.success) {
                setManufacturers((prev) => prev.filter((item) => item?._id !== subcategoryId));
                await getBrands();
                toast.success("Subcategory deleted.");
            } else {
                toast.warn(res?.message || "Unable to delete subcategory.");
            }
        } finally {
            setDeletingId(null);
        }
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("subcategory added");
        window.location.reload();
    };

    const onHideFaq = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    return (
        <>
            <style>{`
                .subcat-cards-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                    margin-top: 24px;
                }
                .layout-main .subcat-card {
                    --subcat-accent: #0c4e9c;
                    --subcat-bg-accent: #e9f3f8;
                    --subcat-color-accent: #0c4e9c;
                    background: #fff !important;
                    border-radius: 16px !important;
                    border: 2px solid var(--subcat-accent) !important;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04) !important;
                    padding: 28px 22px;
                    min-width: 240px;
                    max-width: 300px;
                    flex: 1 1 240px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    cursor: pointer;
                    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .layout-main .subcat-card:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08) !important;
                    border-color: var(--subcat-accent) !important;
                }
                .subcat-avatar {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: var(--subcat-bg-accent) !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.2rem;
                    color: var(--subcat-color-accent) !important;
                    margin-bottom: 16px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.22s ease;
                }
                .subcat-card:hover .subcat-avatar {
                    transform: scale(1.08);
                }
                .subcat-avatar img {
                    width: 125%;
                    height: 125%;
                    object-fit: contain;
                    border-radius: 50%;
                }
                .subcat-info {
                    text-align: center;
                    margin-bottom: 4px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                }
                .subcat-info .subcat-name {
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: #0f172a;
                }
                .subcat-info .subcat-category {
                    color: #10b981;
                    font-size: 0.9rem;
                    font-weight: 700;
                    background: #ecfdf5;
                    padding: 2px 10px;
                    border-radius: 9999px;
                }
                .subcat-info .subcat-date {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                .subcat-delete-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #fef2f2;
                    color: #dc2626;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 1px solid #fee2e2;
                    transition: all 0.2s ease;
                    z-index: 10;
                }
                .subcat-delete-btn:hover {
                    background: #dc2626;
                    color: #fff;
                    border-color: #dc2626;
                    transform: scale(1.08);
                }
                .subcat-delete-btn .tooltip {
                    display: none;
                    position: absolute;
                    top: 38px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #222;
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    z-index: 11;
                    white-space: nowrap;
                }
                .subcat-delete-btn:hover .tooltip {
                    display: block;
                }
            `}</style>
            <Dialog visible={showDialog} header="SubCategory" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AddcategoryDialog onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2 className="pb-4" style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 4, color: "#222" }}>
                        SubCategories
                    </h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
                {(can("subcategory:create") || can("subcategory:delete")) && (
                    <div className="Top__Btn">
                        {can("subcategory:create") && <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />}
                        {can("subcategory:delete") && <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />}
                    </div>
                )}
            </div>
            <div className="subcat-cards-container mb-4">
                {manufacturers.map((subcat, idx) => {
                    const thumbnailKey = subcat.productImage;
                    const imgUrl = thumbnailKey
                        ? (String(thumbnailKey).startsWith("http")
                            ? thumbnailKey
                            : `${DEV}/getImage?image=${thumbnailKey}`)
                        : null;

                    return (
                        <div
                            className="subcat-card"
                            key={subcat._id || idx}
                            onClick={() => history.push(`/subcategory/${subcat._id}`)}
                        >
                            {can("subcategory:delete") && (
                                <button
                                    className="subcat-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(subcat._id);
                                    }}
                                    type="button"
                                    disabled={deletingId === subcat._id}
                                >
                                    <FaTrash style={{ fontSize: "1.1rem" }} />
                                    <span className="tooltip">Delete SubCategory</span>
                                </button>
                            )}
                            <div className="subcat-avatar">
                                {imgUrl ? (
                                    <img
                                        src={imgUrl}
                                        alt={subcat.name}
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                            const tagIcon = e.currentTarget.nextSibling;
                                            if (tagIcon) tagIcon.style.display = "block";
                                        }}
                                    />
                                ) : null}
                                <i className="pi pi-tags" style={{ display: imgUrl ? "none" : "block" }} />
                            </div>
                            <div className="subcat-info">
                                <div className="subcat-name">{subcat.name || "-"}</div>
                                <div className="subcat-category">{subcat.categoryName || subcat.category?.name || "-"}</div>
                                <div className="subcat-date">{moment(subcat.createdAt).format("DD/MM/YYYY")}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default SubCategories;
