import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Editor } from "primereact/editor";

const AddTyrePatternProfileDialog = ({ onHideTyrePatternProfileDialog }) => {
    const [text1, setText1] = useState("");

    const formik = useFormik({
        initialValues: {
            title: "",
            manufacturer: "",
            patternImage: "",
            warrentyImage: "",
            warrentyClouse: "",
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
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Title
                            </label>
                            <InputText id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                            {getFormErrorMessage("title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="manufacturer" className={classNames({ "p-error": isFormFieldValid("manufacturer") }, "Label__Text")}>
                                Manufacturer
                            </label>
                            <InputText id="manufacturer" name="manufacturer" value={formik.values.manufacturer} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("manufacturer") }, "Input__Round")} />

                            {getFormErrorMessage("manufacturer")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="patternImage" className={classNames({ "p-error": isFormFieldValid("patternImage") }, "Label__Text")}>
                                Pattern Image
                            </label>
                            <InputText type="file" id="patternImage" name="patternImage" value={formik.values.patternImage} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("patternImage") }, "Input__RoundFile")} />

                            {getFormErrorMessage("patternImage")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="warrentyImage" className={classNames({ "p-error": isFormFieldValid("warrentyImage") }, "Label__Text")}>
                                Warrenty Image
                            </label>
                            <InputText type="file" id="warrentyImage" name="warrentyImage" value={formik.values.warrentyImage} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("warrentyImage") }, "Input__RoundFile")} />

                            {getFormErrorMessage("warrentyImage")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="warrentyClouse" className={classNames({ "p-error": isFormFieldValid("warrentyClouse") }, "Label__Text")}>
                                Warrenty Clouse
                            </label>
                            <Editor style={{ height: "90px" }} value={text1} onTextChange={(e) => setText1(e.htmlValue)} />

                            {getFormErrorMessage("warrentyClouse")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                Description
                            </label>
                            <Editor style={{ height: "90px" }} value={text1} onTextChange={(e) => setText1(e.htmlValue)} />

                            {getFormErrorMessage("description")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideTyrePatternProfileDialog()} />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default AddTyrePatternProfileDialog;
