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
import AddcategoryDialog from "./AddsubcategoryDialog";
import { FaPen } from "react-icons/fa";

function SubCategories() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const breadItems = [{ label: "Home" }, { label: "SubCategories" }];
    const home = { icon: "pi pi-home", url: "/" };
    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = async () => {
        const params = {
            skip: skip,
        };
        const res = await handleGetRequest("/subcategory/get", params);
        const total = await handleGetRequest("/subcategory/count");
        setManufacturers(res?.data);
        setTotal(total?.data);
    };
    useEffect(() => {
        getBrands();
    }, [skip]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/subcategory/${rowData?._id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} aria-controls="popup_menu" aria-haspopup />
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
        const res = dispatch(handlePostRequest(data, "/subcategory/delete", true, true));
        getBrands();
        toast.success("subcategory deleted.");
        window.location.reload();
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("subcategory added");
        setShowDialog(false);
        window.location.reload();
    };

    const [values, setValues] = useState({
        sub_category_id: "",
        name: "",
        slug: "",
    });

    const temporary = ["sub_category_id", "name", "slug"];

    const handleApplyFilter = async (value, names) => {
        const temp = values;
        temporary.forEach((item) => {
            if (item !== names) {
                temp[item] = "";
            }
        });
        setValues(temp);
        setValues({ ...values, [names]: value });
        const result = await Axios.get(DEV + "/subcategory/search", {
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

    const categoryTemplate = (rowData) => {
        return <div>{rowData?.category?.name}</div>;
    };
    return (
        <>
            <style>{`
                .subcat-cards-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                    margin-top: 24px;
                }
                .subcat-card {
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
                .subcat-card:hover {
                    transform: translateY(-6px) scale(1.02);
                    box-shadow: 0 8px 28px rgba(0,0,0,0.12);
                    border-color: #e3f2fd;
                }
                .subcat-avatar {
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
                .subcat-info {
                    text-align: center;
                    margin-bottom: 12px;
                }
                .subcat-info .subcat-name {
                    font-weight: 700;
                    font-size: 1.18rem;
                    color: #222;
                }
                .subcat-info .subcat-slug {
                    color: #888;
                    font-size: 1.01rem;
                }
                .subcat-info .subcat-category {
                    color: #22c55e;
                    font-size: 1.01rem;
                    font-weight: 600;
                }
                .subcat-info .subcat-date {
                    color: #b0b3bb;
                    font-size: 0.98rem;
                }
                .subcat-actions {
                    display: flex;
                    gap: 18px;
                    margin-top: 10px;
                }
                .subcat-action-btn {
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
                .subcat-action-btn:hover {
                    background: #bbdefb;
                }
                .subcat-action-btn .tooltip {
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
                .subcat-action-btn:hover .tooltip {
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
                {role === "admin" && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    </div>
                )}
            </div>
            <div className="subcat-cards-container mb-4">
                {manufacturers.map((subcat, idx) => (
                    <div className="subcat-card" key={subcat._id || idx}>
                        <div className="subcat-avatar">
                            <i className="pi pi-tags" />
                        </div>
                        <div className="subcat-info">
                            <div className="subcat-name">{subcat.name || "-"}</div>
                            {/* <div className="subcat-slug">{subcat.slug || "-"}</div> */}
                            <div className="subcat-category">{subcat.category?.name || "-"}</div>
                            <div className="subcat-date">{moment(subcat.createdAt).format("DD/MM/YYYY")}</div>
                        </div>
                        <div className="subcat-actions">
                            <button className="subcat-action-btn" onClick={() => history.push(`/subcategory/${subcat._id}`)}>
                                <FaPen style={{ color: "#1976d2", fontSize: "1.3rem" }} />
                                <span className="tooltip">Edit SubCategory</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default SubCategories;
