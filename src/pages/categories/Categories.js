import React, { useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
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
import Axios from "axios";
import { DEV } from "../../services/constants";
import Paginator from "../../components/Paginator";
import AddcategoryDialog from "./AddcategoryDialog";
import { FaPen } from "react-icons/fa";

function Categories() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const breadItems = [{ label: "Home" }, { label: "Categories" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/category/get", params);
        const total = await handleGetRequest("/category/count");
        setManufacturers(res?.data);
        setTotal(total?.data);
    };
    useEffect(() => {
        getBrands();
    }, [skip]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/category/${rowData?._id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button className="p-button-rounded mr-2 Elipse_Icon" onClick={() => history.push(`/category/${rowData?._id}`)}>
                    <FaPen />
                </Button>
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

    const handleDelete = () => {
        const selectedId = selectedRow.map((val, index) => {
            return val?._id;
        });
        const data = {
            id: selectedId,
        };
        const res = dispatch(handlePostRequest(data, "/category/delete", true, true));
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
        categories_id: "",
        name: "",
        slug: "",
    });

    const temporary = ["category_id", "name", "slug"];

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/category/search", {
            params: {
                [names]: value,
            },
        });
        setManufacturers(result?.data?.data);
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
                {role === "admin" && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
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
            `}</style>
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
                            value={manufacturers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="category_id" header="ID" filterElement={() => handleFilter("category_id")} />
                            <Column filter field="name" header="Name" filterElement={() => handleFilter("name")} />
                            <Column filter header="Slug" field="slug" filterElement={() => handleFilter("slug")} />
                            <Column header="Created On" body={dateTemplate} />
                            <Column header="Edit Category" body={actionBodyTemplate} />
                        </DataTable>
                        <div className="custom-paginator">
                            <Paginator data={manufacturers} total={total} skip={skip} handleskip={handleskip} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Categories;
