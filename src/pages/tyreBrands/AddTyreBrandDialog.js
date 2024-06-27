import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Editor } from "primereact/editor";

const AddTyreBrandDialog = ({ onHideTyreBrandDialog }) => {
    const [text1, setText1] = useState("");

    const formik = useFormik({
        initialValues: {
            title: "",
            logo: "",
            highQualityImage: "",
            description: "",
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
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Title
                            </label>
                            <InputText placeholder="test brand" id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                            {getFormErrorMessage("title")}
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
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="highQualityImage" className={classNames({ "p-error": isFormFieldValid("highQualityImage") }, "Label__Text")}>
                                High Quality Image
                            </label>
                            <InputText type="file" id="highQualityImage" name="highQualityImage" value={formik.values.highQualityImage} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("highQualityImage") }, "Input__RoundFile")} />

                            {getFormErrorMessage("highQualityImage")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                Description
                            </label>
                            <Editor style={{ height: "150px" }} value={text1} onTextChange={(e) => setText1(e.htmlValue)} />

                            {getFormErrorMessage("description")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideTyreBrandDialog()} type="button" />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default AddTyreBrandDialog;
