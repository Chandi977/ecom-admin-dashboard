import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import moment from "moment";

function GlobalOfferDialogue({ onHideGlobalOffer, onsuccess }) {
    const [loading, setLoading] = useState();
    const [type, setType] = useState();
    const [status, setStatus] = useState();
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            tyreType: "",
            status: "",
            discount: "",
            time: "",
        },

        onSubmit: async (data) => {
            setLoading(true);
            console.log(data?.time);
            const dat = {
                tyreType: type,
                time: moment(data.time).valueOf(),
                discount: data?.discount,
                status: status,
            };
            const res = await dispatch(handlePostRequest(dat, "/addoffer", true, true));
            if (res?.success === true) {
                onsuccess();
            }
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const HideVehicleManufacturer = (e) => {
        e.preventDefault();
        onHideGlobalOffer();
    };
    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Tyre type
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
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="time" className={classNames({ "p-error": isFormFieldValid("time") }, "Label__Text")}>
                                Expiry time
                            </label>
                            <InputText id="time" name="time" value={formik.values.time} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("time") }, "Input__Round")} type="datetime-local" />

                            {getFormErrorMessage("time")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                Offer Status
                            </label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="select__">
                                <option selected disabled>
                                    select status
                                </option>
                                <option value="active">active</option>
                                <option value="disabled">disabled</option>
                            </select>

                            {getFormErrorMessage("meta_title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="discount" className={classNames({ "p-error": isFormFieldValid("discount") }, "Label__Text")}>
                                Discount
                            </label>
                            <InputText placeholder="20" id="discount" name="discount" value={formik.values.discount} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("discount") }, "Input__Round")} />

                            {getFormErrorMessage("discount")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={(e) => HideVehicleManufacturer(e)} type="button" />
                    <Button label="Create" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default GlobalOfferDialogue;
