import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
// import ManufacturerDetailsDialog from "./ManufacturerDetailsDialog";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";

function EditOffer() {
    const [showDialog, setShowDialog] = useState(false);
    const [editable, setEditable] = useState(false);
    const [manufacturer, setManufacturers] = useState();
    const [tyre, setTyre] = useState([]);
    const [selectTyre, setSelectedTyre] = useState();
    const [price, setPrice] = useState();
    const [url, setUrl] = useState();
    const history = useHistory();
    const { id } = useParams();

    const makecall = async (image) => {
        const result = await handleGetRequest(`/getImage?image=${image}`);
        return result?.data?.url;
    };
    const getData = async () => {
        const res = await handleGetRequest(`/getSingleDeal/${id}`);
        const result = await handleGetRequest("/tyreForSelect");
        setTyre(result?.data);
        setPrice(res?.data?.newPrice);
        setSelectedTyre(res?.data?.product?._id);
        const temp = await makecall(res?.data?.product?.images?.[0]?.image);
        setUrl(temp);
        const keyData = res?.data;
        setManufacturers(res?.data);
    };
    useEffect(() => {
        getData();
    }, []);

    const handleEdit = () => {
        if (editable) {
            setEditable(false);
        } else {
            setEditable(true);
        }
    };
    console.log(tyre);
    const breadItems = [{ label: "Home" }, { label: "Offer", url: "/offers" }];
    const home = { icon: "pi pi-home", url: "/" };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            newPrice: manufacturer?.newPrice ?? "",
            createdAt: manufacturer?.product?.createdAt ?? "",
            id: manufacturer?._id,
        },

        onSubmit: async (data) => {
            const dat = {
                newPrice: price,
                productId: selectTyre,
                id: data?.id,
            };
            const res = await handlePutRequest(dat, "/editdeal");
            if (res?.success === true) {
                toast.success("deal edited");
            }
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const handleCancel = () => {
        history.push("/");
    };
    return (
        <>
            <div className="customer_header__">
                <div className="left___">
                    <h2>{manufacturer?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src={url} />
                    <div className="id_section">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <p>ID:</p>
                            <p>&nbsp;{id.substring(1, 6)}</p>
                        </div>
                        <div>
                            <Button label="Active" className="green_btn"></Button>
                        </div>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="newPrice" className={classNames({ "p-error": isFormFieldValid("newPrice") }, "Label__Text")}>
                                        new Price
                                    </label>
                                    <InputText id="newPrice" name="title" value={price} onChange={(e) => setPrice(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("newPrice") }, "Input__Round")} />

                                    {getFormErrorMessage("newPrice")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Created At
                                    </label>
                                    <InputText id="createdAt" disabled={true} name="createdAt" value={formik.values.createdAt} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

                                    {getFormErrorMessage("createdAt")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Tyre
                                    </label>
                                    <select value={selectTyre} onChange={(e) => setSelectedTyre(e.target.value)} className="select__">
                                        {tyre?.map((ty) => {
                                            return <option value={ty?._id}>{ty?.title}</option>;
                                        })}
                                    </select>
                                    {getFormErrorMessage("createdAt")}
                                </div>
                            </div>
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" onClick={handleCancel} />
                            <Button label="Update" className="Btn__Dark" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditOffer;
