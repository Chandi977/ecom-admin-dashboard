import React, { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import AddcategoryDialog from "./AddcategoryDialog";
import { FaPen } from "react-icons/fa";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { can } from "../../rbac/permissions";

const MIN_FILTER_LENGTH = 2;
const FILTER_DEBOUNCE_MS = 300;
const CATEGORY_SECTION_ORDER = ["main", "rollabel", "packpro"];

const normalizeCategoryKey = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const sortCategories = (categories = []) =>
    [...categories].sort((a, b) => {
        const aIndex = CATEGORY_SECTION_ORDER.indexOf(normalizeCategoryKey(a?.name));
        const bIndex = CATEGORY_SECTION_ORDER.indexOf(normalizeCategoryKey(b?.name));
        if (aIndex === -1 && bIndex === -1) {
            return String(a?.name || "").localeCompare(String(b?.name || ""));
        }
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

function Categories() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(10);
    const [isFiltering, setIsFiltering] = useState(false);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    useEffect(() => {
        setRole(localStorage.getItem("role"));
    }, []);

    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = useCallback(async () => {
        const res = await handleGetRequest("/category/all");
        const categories = Array.isArray(res?.data) ? res.data : [];
        const sortedCategories = sortCategories(categories);
        setAllCategories(categories);
        setManufacturers(sortedCategories);
        setTotal(sortedCategories.length);
    }, []);
    useEffect(() => {
        if (!isFiltering) {
            getBrands();
        }
    }, [getBrands, isFiltering]);
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                {role === "admin" || role === "catalog-manager" && (
                <Button className="p-button-rounded mr-2 Elipse_Icon" onClick={() => history.push(`/category/${rowData?._id}`)}>
                    <FaPen />
                </Button>
                )}
            </div>
        );
    };

    const dateTemplate = (rowdata) => {
        return (
            <div>
                <p>
                    {moment(rowdata?.createdAt).format("DD-MM-YY")} &nbsp; | &nbsp;
                    {moment(rowdata?.createdAt).format("hh:mm a")}
                </p>
            </div>
        );
    };

    const subCategoriesTemplate = (rowdata) => {
        const subCategories = Array.isArray(rowdata?.subCategories) ? rowdata.subCategories : [];
        if (subCategories.length === 0) {
            return <span>-</span>;
        }

        return (
            <div className="subcategory-list">
                {subCategories.map((subCategory) => (
                    <span className="subcategory-chip" key={subCategory?._id || subCategory?.name}>
                        {subCategory?.name}
                    </span>
                ))}
            </div>
        );
    };

    const handleDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        dispatch(handlePostRequest(data, "/category/delete", true, true));
        getBrands();
        toast.success("Category Deleted.");
        window.location.reload();
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("New Category Added");
        setShowDialog(false);
        window.location.reload();
    };

    const [values, setValues] = useState({
        category_id: "",
        name: "",
        slug: "",
    });

    const handleApplyFilter = async (value, names) => {
        const trimmed = (value || "").trim();
        const sortedCategories = sortCategories(allCategories);
        if (!trimmed || trimmed.length < MIN_FILTER_LENGTH) {
            setIsFiltering(false);
            setSkip(0);
            setManufacturers(sortedCategories);
            setTotal(sortedCategories.length);
            return;
        }
        setIsFiltering(true);
        setSkip(0);
        const searchValue = trimmed.toLowerCase();
        const filteredCategories = sortedCategories.filter((category) =>
            String(category?.[names] || "")
                .toLowerCase()
                .includes(searchValue),
        );
        setManufacturers(filteredCategories);
        setTotal(filteredCategories.length);
    };

    const debouncedApplyFilter = useDebouncedCallback(handleApplyFilter, FILTER_DEBOUNCE_MS);

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
                onChange={(e) => {
                    const nextValue = e.target.value;
                    setValues((prev) => ({ ...prev, [name]: nextValue }));
                    debouncedApplyFilter(nextValue, name);
                }}
            ></input>
        );
    };

    const onPageChange = useCallback((event) => {
        setSkip(event.first);
        setRows(event.rows);
    }, []);
    const onHideFaq = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);
    return (
        <>
            <Dialog visible={showDialog} header="Category" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AddcategoryDialog onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2 className="pb-4" style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 4, color: "#222" }}>
                        Categories
                    </h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
                {role === "admin" || role === "catalog-manager" && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        {can("category:delete") && <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />}
                    </div>
                )}
            </div>
            <style>{`
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
                .custom-paginator {
                    margin-top: 18px;
                }
                .subcategory-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .subcategory-chip {
                    display: inline-flex;
                    align-items: center;
                    min-height: 24px;
                    padding: 3px 9px;
                    border-radius: 6px;
                    border: 1px solid #d8dee9;
                    background: #f8fafc;
                    color: #334155;
                    font-size: 0.86rem;
                    line-height: 1.2;
                }
            `}</style>
            <div className="grid">
                <div className="col-12">
                    <div className="custom-card shadow-lg">
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive custom-table"
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
                            value={manufacturers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="category_id" header="ID" filterElement={() => handleFilter("category_id")} />
                            <Column filter field="name" header="Name" filterElement={() => handleFilter("name")} />
                            <Column filter header="Slug" field="slug" filterElement={() => handleFilter("slug")} />
                            <Column header="Sub Categories" body={subCategoriesTemplate} />
                            <Column header="Created On" body={dateTemplate} />
                            <Column header="Edit Category" body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Categories;
