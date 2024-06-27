import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";

function AddOfferDialogue({ onHideOfferdialogue, onsuccess }) {
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [tyres, setTyres] = useState([]);
    const [tyre, setTyre] = useState();

    const validationSchema = Yup.object().shape({
        newPrice: Yup.string().required("This field is required"),
    });

    const getData = async () => {
        const result = await handleGetRequest("/getAllTyres");
        setTyres(result?.data);
    };
    useEffect(() => {
        getData();
    }, []);

    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            newPrice: "",
        },

        onSubmit: async (data) => {
            const dat = {
                productId: tyre,
                newPrice: data?.newPrice,
            };
            setLoading(true);
            const res = await dispatch(handlePostRequest(dat, "/addDeal", true, true));
            if (res?.success === true) {
                onsuccess();
            }
            console.log(res);
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const HideVehicleManufacturer = (e) => {
        e.preventDefault();
        onHideOfferdialogue();
    };
    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Tyre
                            </label>
                            <select value={tyre} onChange={(e) => setTyre(e.target.value)} className="select__">
                                <option selected disabled>
                                    Please select the tyre
                                </option>
                                {tyres?.map((tyre) => {
                                    return <option value={tyre?._id}>{tyre?.title}</option>;
                                })}
                            </select>
                            {getFormErrorMessage("title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="newPrice" className={classNames({ "p-error": isFormFieldValid("newPrice") }, "Label__Text")}>
                                New Price
                            </label>
                            <InputText id="newPrice" name="newPrice" value={formik.values.newPrice} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("newPrice") }, "Input__Round")} />

                            {getFormErrorMessage("newPrice")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={(e) => HideVehicleManufacturer(e)} type="button" />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
}

export default AddOfferDialogue;
