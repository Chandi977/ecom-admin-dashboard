import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";

import { useDispatch } from "react-redux";
import { handlePutRequest } from "../../services/PutTemplate";
import moment from "moment";
import { toast } from "react-toastify";

function EditGlobalOffer() {
    const [showDialog, setShowDialog] = useState(false);
    const [editable, setEditable] = useState(false);
    const [manufacturer, setManufacturers] = useState();
    const [loading, setLoading] = useState();
    const [type, setType] = useState();
    const [status, setStatus] = useState();
    const [time, setTime] = useState();
    const history = useHistory();
    const menu = useRef(null);
    const dispatch = useDispatch();
    const { id } = useParams();
    const getData = async () => {
        const res = await handleGetRequest(`/offer/${id}`);

        const keyData = res?.data;
        setManufacturers(res?.data);
        setType(res?.data?.tyreType);
        setStatus(res?.data?.status);
        setTime(moment.unix(res?.data?.time / 1000).format("YYYY-MM-DDTHH:mm"));
        Object.keys(keyData).forEach((key) => {
            if (formik.initialValues.hasOwnProperty(key)) {
                formik.setFieldValue(key, keyData[key]);
            }
        });
    };
    useEffect(() => {
        getData();
    }, []);

    const breadItems = [{ label: "Home" }, { label: "Global Offer", url: "/globaloffers" }];
    const home = { icon: "pi pi-home", url: "/" };

    const formik = useFormik({
        initialValues: {
            tyreType: "",
            createdAt: "",
            id: manufacturer?._id ?? "",
            time: "",
            discount: "",
        },

        onSubmit: async (data) => {
            const dat = {
                id: data?.id,
                time: moment(time).valueOf(),
                status: status,
                discount: data?.discount,
                tyreType: type,
            };
            setLoading(true);
            const res = await handlePutRequest(dat, "/editOffer");
            toast.success("offer edited");
        },
        enableReinitialize: true,
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
            <Dialog visible={showDialog} header="Global Offer" style={{ width: "750px" }} onHide={() => setShowDialog(false)}></Dialog>
            <div className="customer_header__">
                <div className="left___">
                    <h2>{manufacturer?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src={manufacturer?.image} />
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
                                    <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                        Tyre Type
                                    </label>
                                    <select value={type} onChange={(e) => setType(e.target.value)} className="select__">
                                        <option selected disabled>
                                            select tyre type
                                        </option>
                                        <option value="featured">featured</option>
                                        <option value="economy">economy</option>
                                        <option value="premium">premium</option>
                                    </select>

                                    {getFormErrorMessage("title")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="discount" className={classNames({ "p-error": isFormFieldValid("discount") }, "Label__Text")}>
                                        Discount
                                    </label>
                                    <InputText id="discount" name="discount" value={formik.values.discount} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("discount") }, "Input__Round")} />

                                    {getFormErrorMessage("discount")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="meta_Description" className={classNames({ "p-error": isFormFieldValid("meta_Description") }, "Label__Text")}>
                                        Status
                                    </label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="select__">
                                        <option selected disabled>
                                            select status
                                        </option>
                                        <option value="active">active</option>
                                        <option value="disabled">disabled</option>
                                    </select>

                                    {getFormErrorMessage("meta_Description")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                        Expiry Time
                                    </label>
                                    <InputText id="meta_title" name="meta_title" value={time} onChange={(e) => setTime(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} type="datetime-local" />

                                    {getFormErrorMessage("meta_title")}
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

export default EditGlobalOffer;
