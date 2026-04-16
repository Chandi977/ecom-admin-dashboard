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
import AddCoupon from "./AddCouponDialog";

function Coupons() {
    const [selectedRow, setselectedRow] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(12);
    const dispatch = useDispatch();
    const history = useHistory();
    const [role, setRole] = useState("");

    const handledClicked = () => {
        setShowDialog(true);
    };
    const getBrands = useCallback(async () => {
        const params = {
            skip: skip,
            limit: rows,
        };
        const res = await handleGetRequest("/coupon/get/all", params);
        const total = await handleGetRequest("/coupon/count");
        // console.log("res", res);
        setManufacturers(res?.data);
        setTotal(total?.data);
    }, [rows, skip]);
    useEffect(() => {
        getBrands();
    }, [getBrands]);
    const handleActionButton = (e, rowData) => {
        e.preventDefault();
        history.push(`/coupon/${rowData?._id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-pencil" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} aria-controls="popup_menu" aria-haspopup />
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
        dispatch(handlePostRequest(data, "/coupon/delete", true, true));
        getBrands();
        toast.success("Coupon Deleted.");
        window.location.reload();
    };

    const onsuccess = () => {
        onHideFaq();
        toast.success("Coupon Added Successfully");
        setShowDialog(false);
        window.location.reload();
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

    // const reversedManufacturers = [...manufacturers].reverse();
    // console.log("reversed array", reversedManufacturers);
    // console.log("original array", manufacturers);
    return (
        <>
            <Dialog visible={showDialog} header="Add Coupon" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AddCoupon onsuccess={onsuccess} />
            </Dialog>

            <div className="Page__Header">
                <div>
                    <h2 className="pb-4">Coupon Codes ({total})</h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
                {role === "admin" && (
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handleDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    </div>
                )}
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card text-center">
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive"
                            lazy
                            paginator
                            first={skip}
                            rows={rows}
                            rowsPerPageOptions={[12, 24, 48]}
                            totalRecords={total}
                            onPage={onPageChange}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No Coupon Code found."
                            responsiveLayout="scroll"
                            value={manufacturers}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column field="name" header="Coupon Name" />
                            <Column header="Coupon Code" field="couponCode" />
                            {/* <Column field="type" header="Type" /> */}
                            <Column header="Created On" body={dateTemplate} />
                            <Column className="text-center" header="Update / Delete Coupon" body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Coupons;
