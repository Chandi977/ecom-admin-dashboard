import React, { useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { useEffect } from "react";
import { handleGetRequest } from "../../services/GetTemplate";

function AdddealDialog({ onsuccess }) {
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [image, setImage] = useState();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const getData = async () => {
        const dat = await handleGetRequest("/product/all");
        setProducts(dat?.data);
    };

    useEffect(() => {
        getData();
    }, []);

    const formik = useFormik({
        initialValues: {
            newPrice: "",
            deal_id: "",
            meta_title: "",
            meta_description: "",
            discount: "",
        },

        onSubmit: async (data) => {
            setLoading(true);
            const dat = {
                meta_title: data.meta_title,
                meta_description: data.meta_description,
                deal_id: data.deal_id,
                newPrice: data.newPrice,
                discount: data.discount,
                product: selectedProduct,
            };
            const res = await dispatch(handlePostRequest(dat, "/deal/create", true, true));
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
                            <label htmlFor="deal_id" className={classNames({ "p-error": isFormFieldValid("deal_id") }, "Label__Text")}>
                                Deal ID
                            </label>
                            <InputText placeholder="3342" id="deal_id" name="deal_id" value={formik.values.deal_id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("deal_id") }, "Input__Round")} />

                            {getFormErrorMessage("deal_id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
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
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="newPrice" className={classNames({ "p-error": isFormFieldValid("newPrice") }, "Label__Text")}>
                                New Price
                            </label>
                            <InputText placeholder="200" id="newPrice" name="newPrice" value={formik.values.newPrice} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("newPrice") }, "Input__Round")} />

                            {getFormErrorMessage("newPrice")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="discount" className={classNames({ "p-error": isFormFieldValid("discount") }, "Label__Text")}>
                                Discount
                            </label>
                            <InputText placeholder="20" id="discount" name="discount" value={formik.values.discount} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("discount") }, "Input__Round")} />

                            {getFormErrorMessage("discount")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                Meta Title
                            </label>
                            <InputText placeholder="meta Title" id="meta_title" name="meta_title" value={formik.values.meta_title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} />

                            {getFormErrorMessage("meta_title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_description" className={classNames({ "p-error": isFormFieldValid("meta_description") }, "Label__Text")}>
                                Meta Description
                            </label>
                            <InputText placeholder="Meta Description" id="meta_description" name="meta_description" value={formik.values.meta_description} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_description") }, "Input__Round")} />

                            {getFormErrorMessage("meta_description")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Create Deal" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AdddealDialog;
