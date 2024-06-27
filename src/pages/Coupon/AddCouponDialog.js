import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import * as Yup from 'yup';
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/saga-blue/theme.css"; // Choose your theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function AddCoupon({ onsuccess }) {
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState();
    const [selectedCategory, setSelectedCategory] = useState();
    const [selectedStartDate, setSelectedStartDate] = useState(null); // State for start date
    const [selectedEndDate, setSelectedEndDate] = useState(null); // State for end date
    const [showBrandField, setShowBrandField] = useState(false);
    const [showProductFields, setShowProductFields] = useState(false);
    const [showCategoryField, setShowCategoryField] = useState(false);

    const validationSchema = Yup.object({
        discountPercentage: Yup.number()
            .min(1, 'Value must be between 1 and 100')
            .max(100, 'Value must be between 1 and 100')
            .required('Discount percentage is required'),
    });

    const typeOptions = [
        { label: "Product", value: "product" },
        { label: "Shipping", value: "shipping" },
        { label: "Both", value: "both" },
    ];

    const productTypeOptions = [
        { label: "Brand", value: "brand" },
        { label: "Category", value: "category" },
        { label: "All", value: "all" },
    ];

    const getData = async () => {
        const cat = await handleGetRequest("/category/all");
        const brand = await handleGetRequest("/brand/all");
        setCategories(cat?.data);
        setBrands(brand?.data);
    };

    useEffect(() => {
        getData();
    }, []);

    const handleProductTypeChange = (e) => {
        const selectedType = e.value;
        formik.handleChange(e); // Update formik values

        // Determine which field(s) to show based on product type
        if (selectedType === "brand") {
            setShowBrandField(true);
            setShowCategoryField(false);
        } else if (selectedType === "category") {
            setShowBrandField(false);
            setShowCategoryField(true);
        }
    };

    const handleTypeChange = (e) => {
        const selectedType = e.value;
        formik.setFieldValue("type", selectedType);
        setShowProductFields(selectedType === "product");
    };

    const formik = useFormik({
        initialValues: {
            type: "",
            name: "",
            couponCode: "",
            productType: "",
            brand: "",
            category: "",
            noOfUse: "",
            discountPrice: 0,
            discountPercentage: 0,
            minimumOrderValue: 0,
            maxDiscountCap: 0,
            startDate: "",
            endDate: "",
        },
        validationSchema,
        onSubmit: async (data) => {
            setLoading(true);

            const dat = {
                type: data.type,
                name: data.name,
                couponCode: data.couponCode,
                productType: data.productType,
                brand: selectedBrand,
                category: selectedCategory,
                noOfUse: "single",
                discountPrice: parseInt(data.discountPrice),
                discountPercentage: parseInt(data.discountPercentage),
                minimumOrderValue: parseInt(data.minimumOrderValue),
                maxDiscountCap: parseInt(data.maxDiscountCap),
                startDate: data.startDate,
                endDate: data.endDate,
            };
            const res = await dispatch(handlePostRequest(dat, "/coupon/create", true, true));
            // console.log("coupon code",dat)
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
                            <label htmlFor="type">Type</label>
                            <Dropdown id="type" name="type" value={formik.values.type} options={typeOptions} onChange={handleTypeChange} placeholder="Select Type" className={classNames({ "p-invalid": isFormFieldValid("type") }, "Input__Round")} />
                            {getFormErrorMessage("type")}
                        </div>

                        {showProductFields && (
                            <>
                                <div className="p-field " style={{ marginTop: "20px" }}>
                                    <label htmlFor="productType">Product Type</label>
                                    <Dropdown
                                        id="productType"
                                        name="productType"
                                        value={formik.values.productType}
                                        options={productTypeOptions}
                                        onChange={handleProductTypeChange}
                                        placeholder="Select Product Type"
                                        className={classNames({ "p-invalid": isFormFieldValid("productType") }, "Input__Round")}
                                    />
                                    {getFormErrorMessage("productType")}
                                </div>

                                {formik.values.productType === "brand" && (
                                    <div className="p-field" style={{ marginTop: "20px" }}>
                                        <label htmlFor="brand">Brand</label>
                                        <Dropdown id="brand" name="brand" value={selectedBrand} options={brands.map((brand) => ({ label: brand.name, value: brand._id }))} onChange={(e) => setSelectedBrand(e.value)} placeholder="Select a brand" className="Input__Round" />
                                    </div>
                                )}

                                {formik.values.productType === "category" && (
                                    <div className="p-field" style={{ marginTop: "20px" }}>
                                        <label htmlFor="category">Category</label>
                                        <Dropdown id="category" name="category" value={selectedCategory} options={categories.map((category) => ({ label: category.name, value: category._id }))} onChange={(e) => setSelectedCategory(e.value)} placeholder="Select a category" className="Input__Round" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                Coupon Name
                            </label>
                            <InputText placeholder="Amazon" id="name" name="name" value={formik.values.name} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                            {getFormErrorMessage("name")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="couponCode" className={classNames({ "p-error": isFormFieldValid("couponCode") }, "Label__Text")}>
                                Coupon Code
                            </label>
                            <InputText placeholder="Amazon" id="couponCode" name="couponCode" value={formik.values.couponCode} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("couponCode") }, "Input__Round")} />

                            {getFormErrorMessage("couponCode")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="discountPrice" className={classNames({ "p-error": isFormFieldValid("discountPrice") }, "Label__Text")}>
                                Discount Price
                            </label>
                            <InputText placeholder="30" id="discountPrice" name="discountPrice" value={formik.values.discountPrice} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("discountPrice") }, "Input__Round")} />

                            {getFormErrorMessage("discountPrice")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                <div className="p-field">
                    <label
                        htmlFor="discountPercentage"
                        className={classNames({ "p-error": isFormFieldValid("discountPercentage") }, "Label__Text")}
                    >
                        Discount Percentage
                    </label>
                    <InputText
                        type="number"
                        min="1"
                        max="100"
                        placeholder="20%"
                        id="discountPercentage"
                        name="discountPercentage"
                        value={formik.values.discountPercentage}
                        onChange={formik.handleChange}
                        className={classNames({ "p-invalid": isFormFieldValid("discountPercentage") }, "Input__Round")}
                    />
                    {getFormErrorMessage("discountPercentage")}
                </div>
            </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="minimumOrderValue" className={classNames({ "p-error": isFormFieldValid("minimumOrderValue") }, "Label__Text")}>
                                Minimum Order Value
                            </label>
                            <InputText placeholder="300" id="minimumOrderValue" name="minimumOrderValue" value={formik.values.minimumOrderValue} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("minimumOrderValue") }, "Input__Round")} />

                            {getFormErrorMessage("minimumOrderValue")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="maxDiscountCap" className={classNames({ "p-error": isFormFieldValid("maxDiscountCap") }, "Label__Text")}>
                                Max Discount Cap
                            </label>
                            <InputText placeholder="40" id="maxDiscountCap" name="maxDiscountCap" value={formik.values.maxDiscountCap} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("maxDiscountCap") }, "Input__Round")} />

                            {getFormErrorMessage("maxDiscountCap")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="startDate" className={classNames({ "p-error": isFormFieldValid("startDate") }, "Label__Text")}>
                                Start date
                            </label>
                            <Calendar
                                id="startDate"
                                name="startDate"
                                value={selectedStartDate}
                                onChange={(e) => {
                                    formik.setFieldValue("startDate", e.value);
                                    setSelectedStartDate(e.value);
                                }}
                                className={classNames({ "p-invalid": isFormFieldValid("startDate") }, "Input__Round")}
                                showTime
                                dateFormat="yy-mm-dd"
                                hourFormat="24"
                                placeholder="Select Date and Time"
                            />
                            {getFormErrorMessage("startDate")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="endDate" className={classNames({ "p-error": isFormFieldValid("endDate") }, "Label__Text")}>
                                End date
                            </label>
                            <Calendar
                                id="endDate"
                                name="endDate"
                                value={selectedEndDate}
                                onChange={(e) => formik.setFieldValue("endDate", e.value)}
                                minDate={selectedStartDate} // Setting minDate to selected start date
                                className={classNames({ "p-invalid": isFormFieldValid("endDate") }, "Input__Round")}
                                showTime
                                dateFormat="yy-mm-dd"
                                hourFormat="24"
                                placeholder="Select Date and Time"
                            />
                            {getFormErrorMessage("endDate")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Create Coupon" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AddCoupon;
