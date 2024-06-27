import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const ManufacturerDetailsDialog = ({ onHideManufacturerDetailsDialog }) => {
    const formik = useFormik({
        initialValues: {
            vehicleManufacturer: "",
            logo: "",
        },

        onSubmit: async (data) => {
            console.log(data);
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="vehicleManufacturer" className={classNames({ "p-error": isFormFieldValid("vehicleManufacturer") }, "Label__Text")}>
                                Vehicle Manufacturer
                            </label>
                            <InputText id="vehicleManufacturer" name="vehicleManufacturer" value={formik.values.vehicleManufacturer} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("vehicleManufacturer") }, "Input__Round")} />

                            {getFormErrorMessage("vehicleManufacturer")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="logo" className={classNames({ "p-error": isFormFieldValid("logo") }, "Label__Text")}>
                                Logo
                            </label>
                            <InputText type="file" id="logo" name="logo" value={formik.values.logo} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("logo") }, "Input__RoundFile")} />

                            {getFormErrorMessage("logo")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideManufacturerDetailsDialog()} />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default ManufacturerDetailsDialog;
