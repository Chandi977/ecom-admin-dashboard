import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";

function Category() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [name, setName] = useState();
    const [slug, setSlug] = useState();
    const [meta_title, setMetaTitle] = useState();
    const [meta_description, setMetaDescription] = useState();
    const [category_id, setCategoryId] = useState();

    const getData = async () => {
        const res = await handleGetRequest(`/category/get/${id}`);
        setName(res?.data?.name);
        setSlug(res?.data?.slug);
        setMetaTitle(res?.data?.meta_title);
        setMetaDescription(res?.data?.meta_description);
        setCategoryId(res?.data?.category_id);

        setManufacturers(res?.data);
    };
    useEffect(() => {
        getData();
    }, []);

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
                    <img src="" />
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
                            </div>
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" onClick={handleCancel} />
                            <Button label="Update" className="Btn__Dark" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Category;
