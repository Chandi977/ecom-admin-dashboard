import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";

function AddsubcategoryDialog({ onsuccess }) {
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [image, setImage] = useState();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const getCategories = async () => {
        const res = await handleGetRequest("/category/all");
        setCategories(res?.data);
    };

    useEffect(() => {
        getCategories();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: "",
            sub_category_id: "",
            meta_title: "",
            meta_description: "",
        },

        onSubmit: async (data) => {
            setLoading(true);
            const dat = {
                name: data.name,
                sub_category_id: data.sub_category_id,
                meta_title: data.meta_title,
                meta_description: data.meta_description,
                category: selectedCategory,
            };
            const res = await dispatch(handlePostRequest(dat, "/subcategory/create", true, true));
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
                            <label htmlFor="sub_category_id" className={classNames({ "p-error": isFormFieldValid("sub_category_id") }, "Label__Text")}>
                                SubCategory ID
                            </label>
                            <InputText placeholder="3342" id="sub_category_id" name="sub_category_id" value={formik.values.sub_category_id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("sub_category_id") }, "Input__Round")} />

                            {getFormErrorMessage("sub_category_id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                SubCategory Name
                            </label>
                            <InputText placeholder="Paper bags" id="name" name="name" value={formik.values.name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                            {getFormErrorMessage("name")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                Category
                            </label>
                            <select style={{ marginTop: "10px", height: "30px", border: "1px solid #cecece", borderRadius: "6px" }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option selected disabled>
                                    Please select category
                                </option>
                                {categories?.map((item) => (
                                    <option value={item._id}>{item.name}</option>
                                ))}
                            </select>
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
                    <Button label="Create SubCategory" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AddsubcategoryDialog;
