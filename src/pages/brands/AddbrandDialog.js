import React, { useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";

function AddbrandDialog({ onsuccess }) {
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [images, setImages] = useState();
    const [urls, setUrls] = useState();

    const formik = useFormik({
        initialValues: {
            name: "",
            brand_id: "",
            meta_title: "",
            meta_description: "",
            image:"",
        },

        onSubmit: async (data) => {
            setLoading(true);
            data["image"] = images;
            const dat = {
                name: data.name,
                brand_id: data.brand_id,
                meta_title: data.meta_title,
                meta_description: data.meta_description,
            };
            const res = await dispatch(handlePostRequest(dat, "/brand/create", true, true));
            onsuccess();
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setImages(file.name);
        setUrls(res?.data?.url);
    };

    const handleRemvoe = (index) => {
        setImages();
        setUrls();
    };
    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="brand_id" className={classNames({ "p-error": isFormFieldValid("brand_id") }, "Label__Text")}>
                                Brand ID
                            </label>
                            <InputText placeholder="3342" id="brand_id" name="brand_id" value={formik.values.brand_id} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("brand_id") }, "Input__Round")} />

                            {getFormErrorMessage("brand_id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                Brand Name
                            </label>
                            <InputText placeholder="Amazon" id="name" name="name" value={formik.values.name} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                            {getFormErrorMessage("name")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="image" className={classNames({ "p-error": isFormFieldValid("image") }, "Label__Text")}>
                                High Quality Image
                            </label>
                            <InputText type="file" id="image" name="image" onChange={(e) => handleUpload(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("image") }, "Input__RoundFile")} />

                            {getFormErrorMessage("image")}
                        </div>
                        {images && (
                            <div style={{ position: "relative" }}>
                                <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={urls}></img>
                                <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe()}></i>
                            </div>
                        )}
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                Meta Title
                            </label>
                            <InputText placeholder="Amazon" id="meta_title" name="meta_title" value={formik.values.meta_title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} />

                            {getFormErrorMessage("meta_title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_description" className={classNames({ "p-error": isFormFieldValid("meta_description") }, "Label__Text")}>
                                Meta Description
                            </label>
                            <InputText placeholder="Amazon" id="meta_description" name="meta_description" value={formik.values.meta_description} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_description") }, "Input__Round")} />

                            {getFormErrorMessage("meta_description")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Create Brand" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AddbrandDialog;
