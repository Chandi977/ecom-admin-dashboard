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

function Deal() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [meta_title, setMetaTitle] = useState();
    const [meta_description, setMetaDescription] = useState();
    const [deal_id, setDealId] = useState();
    const [newPrice, setNewPrice] = useState();
    const [discount, setDiscount] = useState();
    const [selectedProduct, setSelectedProduct] = useState();
    const [products, setProducts] = useState();

    const getData = async () => {
        const res = await handleGetRequest(`/deal/get/${id}`);
        const data = await handleGetRequest(`/product/all`);
        setProducts(data?.data);
        setDealId(res?.data?.deal_id);
        setNewPrice(res?.data?.newPrice);
        setDiscount(res?.data?.discount);
        setSelectedProduct(res?.data?.product?._id);
        setMetaTitle(res?.data?.meta_title);
        setMetaDescription(res?.data?.meta_description);
        setManufacturers(res?.data);
    };
    useEffect(() => {
        getData();
    }, []);

    const breadItems = [{ label: "Home" }, { label: "Deals", url: "/deals" }];
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
                deal_id: deal_id,
                newPrice: newPrice,
                discount: discount,
                product: selectedProduct,
                meta_title: meta_title,
                meta_description: meta_description,
            };
            const res = await handlePutRequest(dat, "/deal/update");
            if (res?.success === true) {
                toast.success("deal edited");
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
                            <p>&nbsp;{deal_id}</p>
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
                                        Deal ID
                                    </label>
                                    <InputText id="width" name="title" value={deal_id} onChange={(e) => setDealId(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("width") }, "Input__Round")} />

                                    {getFormErrorMessage("width")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        New Price
                                    </label>
                                    <InputText id="createdAt" name="createdAt" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

                                    {getFormErrorMessage("createdAt")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Discount
                                    </label>
                                    <InputText id="createdAt" name="createdAt" value={discount} onChange={(e) => setDiscount(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

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
                                    <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                                        <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                            Product
                                        </label>
                                        <select style={{ marginTop: "10px", height: "30px", border: "1px solid #cecece", borderRadius: "6px" }} value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                            <option selected disabled>
                                                Please select product
                                            </option>
                                            {products?.map((item) => (
                                                <option value={item._id}>{item.name}</option>
                                            ))}
                                        </select>
                                        {getFormErrorMessage("name")}
                                    </div>

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

export default Deal;
