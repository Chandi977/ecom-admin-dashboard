import React, { useCallback, useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import { createOverviewField, normalizeOverviewFields, slugifyOverviewFieldKey } from "../../utils/overviewFields";
import { FieldVisibilityGrid } from "../../components/FieldVisibilityGrid";
import { FIELD_VISIBILITY_GROUPS, normalizeFieldVisibility } from "../../utils/fieldVisibility";
import { SpecSchemaBuilder, CommonAttributesEditor, normalizeSpecSchema, specSchemaToEditable, pairsToAttributes, attributesToPairs } from "../../components/CategoryAttributesEditor";

function Category() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [role, setRole] = useState("");

    useEffect(() => {
        setRole(localStorage.getItem("role"));
    }, []);
    const [name, setName] = useState();
    const [slug, setSlug] = useState();
    const [meta_title, setMetaTitle] = useState();
    const [meta_description, setMetaDescription] = useState();
    const [category_id, setCategoryId] = useState();
    const [overviewFields, setOverviewFields] = useState([]);
    const [fieldVisibility, setFieldVisibility] = useState({});
    const [specFields, setSpecFields] = useState([]);
    const [attributePairs, setAttributePairs] = useState([]);

    const getData = useCallback(async () => {
        const res = await handleGetRequest(`/category/get/${id}`);
        const cat = res?.data;
        setName(cat?.name);
        setSlug(cat?.slug);
        setMetaTitle(cat?.meta_title);
        setMetaDescription(cat?.meta_description);
        setCategoryId(cat?.category_id);
        
        const commonAttrs = cat?.common_attributes || {};

        setOverviewFields(Array.isArray(cat?.overview_fields) ? cat.overview_fields : []);
        setFieldVisibility(cat?.field_visibility && typeof cat.field_visibility === "object" ? cat.field_visibility : {});
        setSpecFields(specSchemaToEditable(cat?.spec_schema));
        
        setAttributePairs(attributesToPairs(commonAttrs));

        setManufacturers(cat);
    }, [id]);
    useEffect(() => {
        getData();
    }, [getData]);

    const breadItems = [{ label: "Home" }, { label: "Categories", url: "/categories" }];
    const home = { icon: "pi pi-home", url: "/" };

    const formik = useFormik({
        initialValues: {
            category_id: "",
            name: "",
            slug: "",
            meta_title: "",
            meta_description: "",
        },

        onSubmit: async (data) => {
            const dat = {
                name: name,
                slug: slug,
                meta_title: meta_title,
                meta_description: meta_description,
                id: id,
                category_id: category_id,
                overview_fields: normalizeOverviewFields(overviewFields),
                field_visibility: normalizeFieldVisibility(fieldVisibility),
                spec_schema: normalizeSpecSchema(specFields),
                common_attributes: pairsToAttributes(attributePairs),
            };
            const res = await handlePutRequest(dat, "/category/update");
            if (res?.success === true) {
                toast.success("Category Updated Successfully");
            }
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const handleCancel = () => {
        history.push("/");
    };

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

    const handleFieldVisibilityToggle = (key, checked) => {
        setFieldVisibility((prev) => ({ ...prev, [key]: checked }));
    };

    return (
        <>
            <div className="customer_header__">
                <div className="left___">
                    <h2>{manufacturer?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src="" alt="Category" />
                    <div className="id_section">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <p>ID:</p>
                            <p>&nbsp;{category_id}</p>
                        </div>
                        <div>
                            <Button label="Active" className="green_btn"></Button>
                        </div>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="width" className={classNames({ "p-error": isFormFieldValid("width") }, "Label__Text")}>
                                        Category ID
                                    </label>
                                    <InputText id="width" name="title" value={category_id} onChange={(e) => setCategoryId(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("width") }, "Input__Round")} />

                                    {getFormErrorMessage("width")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Slug
                                    </label>
                                    <InputText id="createdAt" disabled={true} name="createdAt" value={slug} onChange={(e) => setSlug(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

                                    {getFormErrorMessage("createdAt")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="rim_diameter" className={classNames({ "p-error": isFormFieldValid("rim_diameter") }, "Label__Text")}>
                                        Meta Description
                                    </label>
                                    <InputText id="rim_diameter" name="title" value={meta_description} onChange={(e) => setMetaDescription(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("rim_diameter") }, "Input__Round")} />

                                    {getFormErrorMessage("rim_diameter")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="profile" className={classNames({ "p-error": isFormFieldValid("profile") }, "Label__Text")}>
                                        Name
                                    </label>
                                    <InputText id="profile" name="title" value={name} onChange={(e) => setName(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("profile") }, "Input__Round")} />

                                    {getFormErrorMessage("profile")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="rim_diameter" className={classNames({ "p-error": isFormFieldValid("rim_diameter") }, "Label__Text")}>
                                        Meta Title
                                    </label>
                                    <InputText id="rim_diameter" name="title" value={meta_title} onChange={(e) => setMetaTitle(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("rim_diameter") }, "Input__Round")} />

                                    {getFormErrorMessage("rim_diameter")}
                                </div>
                                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <label className="Label__Text">Quick Overview Fields</label>
                                        {(role === "admin" || role === "catalog-manager") && <Button type="button" label="Add Field" onClick={handleAddOverviewField} style={{ width: "140px", height: "35px" }} />}
                                    </div>
                                    <small>These fields define the quick overview rows for this category.</small>
                                    {overviewFields.map((field, index) => (
                                        <div key={field.key || `overview-field-${index}`} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                            <InputText
                                                placeholder="Field label"
                                                value={field.label}
                                                onChange={(e) => handleOverviewFieldChange(index, "label", e.target.value)}
                                                className="Input__Round"
                                            />
                                            {(role === "admin" || role === "catalog-manager") && <Button type="button" label="Remove" className="p-button-danger" onClick={() => handleRemoveOverviewField(index)} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "20px" }}>
                            <label className="Label__Text">Storefront Field Visibility</label>
                            <small style={{ display: "block", marginBottom: "10px" }}>
                                Controls which common product-page fields are shown for every product in this
                                category. Ticked = shown, unticked = hidden. Individual products can still hide
                                their own specification rows. Everything is shown by default.
                            </small>
                            <FieldVisibilityGrid
                                groups={FIELD_VISIBILITY_GROUPS}
                                value={fieldVisibility}
                                onToggle={handleFieldVisibilityToggle}
                            />
                        </div>

                        <div style={{ marginTop: "20px" }}>
                            <SpecSchemaBuilder value={specFields} onChange={setSpecFields} />
                        </div>

                        <div style={{ marginTop: "20px" }}>
                            <CommonAttributesEditor value={attributePairs} onChange={setAttributePairs} />
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" onClick={handleCancel} />
                            {(role === "admin" || role === "catalog-manager") && <Button label="Update" className="Btn__Dark" />}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Category;
