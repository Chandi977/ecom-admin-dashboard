import React from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { createOverviewField, normalizeOverviewFields, slugifyOverviewFieldKey } from "../../utils/overviewFields";

function AddcategoryDialog({ onsuccess }) {
    const dispatch = useDispatch();
    const [overviewFields, setOverviewFields] = React.useState([]);

    const handleOverviewFieldChange = (index, field, value) => {
        setOverviewFields((prev) =>
            prev.map((item, itemIndex) => {
                if (itemIndex !== index) {
                    return item;
                }

                if (field === "label") {
                    return {
                        ...item,
                        label: value,
                        key: item.key || slugifyOverviewFieldKey(value),
                    };
                }

                return {
                    ...item,
                    [field]: value,
                };
            }),
        );
    };

    const handleAddOverviewField = () => {
        setOverviewFields((prev) => [...prev, createOverviewField()]);
    };

    const handleRemoveOverviewField = (index) => {
        setOverviewFields((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            category_id: "",
            meta_title: "",
            meta_description: "",
        },

        onSubmit: async (data) => {
            const dat = {
                name: data.name,
                category_id: data.category_id,
                meta_title: data.meta_title,
                meta_description: data.meta_description,
                overview_fields: normalizeOverviewFields(overviewFields),
            };
            await dispatch(handlePostRequest(dat, "/category/create", true, true));
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
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label className="Label__Text">Quick Overview Fields</label>
                                <Button type="button" label="Add Field" onClick={handleAddOverviewField} style={{ width: "140px", height: "35px" }} />
                            </div>
                            <small>These fields will be available for products in this category.</small>
                            {overviewFields.map((field, index) => (
                                <div key={field.key || `overview-field-${index}`} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <InputText
                                        placeholder="Field label"
                                        value={field.label}
                                        onChange={(e) => handleOverviewFieldChange(index, "label", e.target.value)}
                                        className="Input__Round"
                                    />
                                    <Button type="button" label="Remove" className="p-button-danger" onClick={() => handleRemoveOverviewField(index)} />
                                </div>
                            ))}
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
