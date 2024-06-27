import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Editor } from "primereact/editor";
import { RadioButton } from "primereact/radiobutton";

const AddTyreProfileDialog = ({ onHideTyreProfileDialog }) => {
    const [text1, setText1] = useState("");

    const formik = useFormik({
        initialValues: {
            title: "",
            price: "",
            tyreWidth: "",
            discount: "",
            rimDiameter: "",
            aspectRatio: "",
            loadIndex: "",
            tyreManufacturer: "",
            vehicleManufacturer: "",
            tyrePattern: "",
            speedRatting: "",
            tubeless: "Y",
            noOfTyres: "",
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
                            <InputText id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                            {getFormErrorMessage("title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="price" className={classNames({ "p-error": isFormFieldValid("price") }, "Label__Text")}>
                                Price
                            </label>
                            <InputText id="price" name="price" value={formik.values.price} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("price") }, "Input__Round")} />

                            {getFormErrorMessage("price")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="tyreWidth" className={classNames({ "p-error": isFormFieldValid("tyreWidth") }, "Label__Text")}>
                                Tyre Width
                            </label>
                            <InputText id="tyreWidth" name="tyreWidth" value={formik.values.tyreWidth} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("tyreWidth") }, "Input__Round")} />

                            {getFormErrorMessage("tyreWidth")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="discount" className={classNames({ "p-error": isFormFieldValid("discount") }, "Label__Text")}>
                                Discount(%)
                            </label>
                            <InputText id="discount" name="discount" value={formik.values.discount} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("discount") }, "Input__Round")} />

                            {getFormErrorMessage("discount")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="rimDiameter" className={classNames({ "p-error": isFormFieldValid("rimDiameter") }, "Label__Text")}>
                                Rim Diameter In Inches
                            </label>
                            <InputText id="rimDiameter" name="rimDiameter" value={formik.values.rimDiameter} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("rimDiameter") }, "Input__Round")} />

                            {getFormErrorMessage("rimDiameter")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="aspectRatio" className={classNames({ "p-error": isFormFieldValid("aspectRatio") }, "Label__Text")}>
                                Aspect Ratio
                            </label>
                            <InputText id="aspectRatio" name="aspectRatio" value={formik.values.aspectRatio} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("aspectRatio") }, "Input__Round")} />

                            {getFormErrorMessage("aspectRatio")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="loadIndex" className={classNames({ "p-error": isFormFieldValid("loadIndex") }, "Label__Text")}>
                                Load Index
                            </label>
                            <InputText id="loadIndex" name="loadIndex" value={formik.values.loadIndex} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("loadIndex") }, "Input__Round")} />

                            {getFormErrorMessage("loadIndex")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="tyreManufacturer" className={classNames({ "p-error": isFormFieldValid("tyreManufacturer") }, "Label__Text")}>
                                Tyre Manufacturer
                            </label>
                            <InputText id="tyreManufacturer" name="tyreManufacturer" value={formik.values.tyreManufacturer} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("tyreManufacturer") }, "Input__Round")} />

                            {getFormErrorMessage("tyreManufacturer")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
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
                            <label htmlFor="tyrePattern" className={classNames({ "p-error": isFormFieldValid("tyrePattern") }, "Label__Text")}>
                                Tyre Pattern
                            </label>
                            <InputText id="tyrePattern" name="tyrePattern" value={formik.values.tyrePattern} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("tyrePattern") }, "Input__Round")} />

                            {getFormErrorMessage("tyrePattern")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="speedRating" className={classNames({ "p-error": isFormFieldValid("speedRating") }, "Label__Text")}>
                                Speed Rating
                            </label>
                            <InputText id="speedRating" name="speedRating" value={formik.values.speedRating} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("speedRating") }, "Input__Round")} />

                            {getFormErrorMessage("speedRating")}
                        </div>
                    </div>

                    <div className="p-field p-col-12 md:col-6">
                        <label htmlFor="tubeless" className="Label__Text" style={{ paddingBottom: "5px" }}>
                            Tubeless
                        </label>
                        <div className="Radio__Btn">
                            <div className="p-field-radiobutton">
                                <RadioButton inputId="tubeless" name="tubeless" value={"Y"} onChange={formik.handleChange} checked={formik.values.tubeless === "Y"} />
                                <label htmlFor="tubeless">Yes</label>
                            </div>
                            <div className="p-field-radiobutton">
                                <RadioButton inputId="tubeless" name="tubeless" value={"N"} onChange={formik.handleChange} checked={formik.values.tubeless === "N"} />
                                <label htmlFor="tubeless">No</label>
                            </div>
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="noOfTyres" className={classNames({ "p-error": isFormFieldValid("noOfTyres") }, "Label__Text")}>
                                No. Of Tyres
                            </label>
                            <InputText id="noOfTyres" name="noOfTyres" value={formik.values.noOfTyres} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("noOfTyres") }, "Input__Round")} />

                            {getFormErrorMessage("noOfTyres")}
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
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideTyreProfileDialog()} />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default AddTyreProfileDialog;
