import React, { useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";

function AddcategoryDialog({ onsuccess }) {
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [image, setImage] = useState();

    const formik = useFormik({
        initialValues: {
            name: "",
            category_id: "",
            meta_title: "",
            meta_description: "",
        },

        onSubmit: async (data) => {
            setLoading(true);
            const dat = {
                name: data.name,
                category_id: data.category_id,
                meta_title: data.meta_title,
                meta_description: data.meta_description,
            };
            const res = await dispatch(handlePostRequest(dat, "/category/create", true, true));
            onsuccess();
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
                            <label htmlFor="category_id" className={classNames({ "p-error": isFormFieldValid("category_id") }, "Label__Text")}>
                                Category ID
                            </label>
                            <InputText placeholder="3342" id="category_id" name="category_id" value={formik.values.category_id} required onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("category_id") }, "Input__Round")} />

                            {getFormErrorMessage("category_id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                Category Name
                            </label>
                            <InputText placeholder="Paper bags" id="name" name="name" value={formik.values.name} required onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                            {getFormErrorMessage("name")}
                        </div>
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
                    <Button label="Create Category" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AddcategoryDialog;
