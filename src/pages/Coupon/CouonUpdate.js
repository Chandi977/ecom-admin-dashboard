// src/pages/CouponUpdate.jsx
import React, { useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { useHistory, useParams } from "react-router-dom";
import { handlePutRequest } from "../../services/PutTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import { toast } from "react-toastify";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { useDispatch } from "react-redux";

function CouponUpdate() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [type, setType] = useState("all");
    const [name, setName] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [productType, setProductType] = useState("all");
    const [brand, setBrand] = useState(null);
    const [category, setCategory] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [noOfUse, setNoOfUse] = useState("single");
    const [discountPercentage, setDiscountPercentage] = useState(null);
    const [discountPrice, setDiscountPrice] = useState(null);
    const [minimumOrderValue, setMinimumOrderValue] = useState(null);
    const [maxDiscountCap, setMaxDiscountCap] = useState(null);
    const [couponDescription, setCouponDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const dispatch = useDispatch();

    const getData = async () => {
        const res = await handleGetRequest(`/coupon/get/${id}`);
        const cat = await handleGetRequest("/category/all");
        const brandRes = await handleGetRequest("/brand/all");

        setType(res?.data?.type);
        setName(res?.data?.name);
        setCouponCode(res?.data?.couponCode);
        setProductType(res?.data?.productType);
        setBrand(res?.data?.brand);
        setCategory(res?.data?.category);
        setStartDate(res?.data?.startDate ? new Date(res?.data?.startDate) : null);
        setEndDate(res?.data?.endDate ? new Date(res?.data?.endDate) : null);
        setNoOfUse(res?.data?.noOfUse);
        setDiscountPercentage(res?.data?.discountPercentage);
        setDiscountPrice(res?.data?.discountPrice);
        setMinimumOrderValue(res?.data?.minimumOrderValue);
        setMaxDiscountCap(res?.data?.maxDiscountCap);
        setCouponDescription(res?.data?.couponDescription);
        setManufacturers(res?.data);
        setCategories(cat?.data);
        setBrands(brandRes?.data);
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const typeOptions = [
        { label: "Product", value: "product" },
        { label: "Shipping", value: "shipping" },
        { label: "Both", value: "both" },
    ];

    const productTypeOptions = [
        { label: "Brand", value: "brand" },
        { label: "Category", value: "category" },
    ];

    const noOfUseOptions = [
        { label: "Single", value: "single" },
        { label: "Multiple", value: "multiple" },
    ];

    const breadItems = [{ label: "Home" }, { label: "Coupon", url: "/coupon" }];
    const home = { icon: "pi pi-home", url: "/" };

    const formik = useFormik({
        initialValues: {
            type: "all",
            name: "",
            couponCode: "",
            productType: "all",
            brand: "",
            category: "",
            startDate: null,
            endDate: null,
            noOfUse: "single",
            discountPercentage: 0,
            discountPrice: 0,
            minimumOrderValue: 0,
            maxDiscountCap: 0,
            couponDescription: "",
        },
        onSubmit: async () => {
            const dat = {
                type,
                name,
                couponCode,
                productType,
                brand,
                category,
                startDate,
                endDate,
                noOfUse,
                discountPercentage,
                discountPrice,
                minimumOrderValue,
                maxDiscountCap,
                couponDescription,
                _id: id,
            };
            const res = await handlePutRequest(dat, "/coupon/update");
            if (res?.success === true) {
                toast.success("Coupon Updated Successfully");
            }
        },
    });

    const isFormFieldValid = (field) => !!(formik.touched[field] && formik.errors[field]);

    const getFormErrorMessage = (field) => isFormFieldValid(field) && <small className="p-error">{formik.errors[field]}</small>;

    const handleCancel = () => {
        history.push("/coupon");
    };

    return (
        <>
            {/* INTERNAL CSS */}
            <style>{`
/* ---------- Header & page shell ---------- */
.customer_header__{display:flex;align-items:center;padding:8px 0 12px;margin-bottom:8px}
.customer_header__ h2{font-size:clamp(18px,1.6vw,22px);font-weight:600;margin:0}
.customer_header__ .subhead{font-size:20px}
.customer_details_section_coupon{max-width:1080px;margin:0 auto;padding:8px 14px 28px}
.right_section{background:#fff;border:1px solid #eef0f3;border-radius:18px;box-shadow:0 8px 28px rgba(20,24,40,.06);padding:22px}

/* ---------- Grid layout ---------- */
.form__{display:grid;grid-template-columns:1fr 1fr;gap:22px 28px;margin-top:8px}
.form_left,.form_right{display:grid;gap:14px}
@media (max-width:820px){.form__{grid-template-columns:1fr}}

/* ---------- Field grouping ---------- */
.field-group{display:flex;flex-direction:column;gap:6px}

/* ---------- Labels & errors ---------- */
.Label__Text{display:block;font-size:13px;font-weight:600;color:#283444}
.p-error{color:#d14343}

/* ---------- PrimeReact inputs (InputText/Dropdown/Calendar) ---------- */
.p-inputtext.Input__Round,
.p-dropdown.Input__Round,
.p-calendar.Input__Round .p-inputtext{
  border-radius:12px!important;border:1px solid #dfe3e8;background:#fafbfc;
  transition:border .18s ease,box-shadow .18s ease,background .18s ease;height:40px
}
.p-inputtext.Input__Round:focus,
.p-dropdown.Input__Round.p-focus,
.p-calendar.Input__Round .p-inputtext:focus{
  outline:none;border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,.14)!important;background:#fff
}
.p-invalid.p-inputtext,.p-invalid.p-dropdown,.p-invalid .p-inputtext{border-color:#d14343!important}
.p-calendar.Input__Round .p-button{border-top-right-radius:12px;border-bottom-right-radius:12px}
.p-calendar.Input__Round .p-inputtext{border-right:none}

/* ---------- Native select (Brand/Category) ---------- */
.native-select{
  width:100%;padding:8px 12px;border-radius:12px;border:1px solid #dfe3e8;background:#fafbfc;height:40px;
  transition:border .18s ease,box-shadow .18s ease,background .18s ease
}
.native-select:focus{border-color:#2563eb;outline:none;box-shadow:0 0 0 3px rgba(37,99,235,.14);background:#fff}

/* ---------- Footer buttons ---------- */
.Down__Btn{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}
.Btn__Transparent{
  background:transparent;color:#334155;border:1px solid #e2e8f0;
  padding:10px 14px;border-radius:12px;font-weight:600;cursor:pointer
}
.Btn__Transparent:hover{background:#f8fafc}
.Btn__Dark{
  background:#111827;color:#fff;border:1px solid #111827;
  padding:10px 16px;border-radius:12px;font-weight:700;cursor:pointer
}
.Btn__Dark:hover{filter:brightness(0.92)}
      `}</style>

            <div className="customer_header__">
                <div className="left___">
                    <h2>
                        <span className="subhead">Coupon</span> <b>{manufacturer?.couponCode}</b>
                    </h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>
            </div>

            <div className="customer_details_section_coupon">
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__ pb-1 mb-3" style={{ backgroundColor: "#EEEEEE", padding: "20px", borderRadius: "12px" }}>
                            <div className="form_left">
                                <div className="field-group">
                                    <label htmlFor="type" className={classNames({ "p-error": isFormFieldValid("type") }, "Label__Text")}>
                                        Coupon Type<span style={{ color: "red" }}>*</span>
                                    </label>
                                    <Dropdown id="type" name="type" value={type} options={typeOptions} onChange={(e) => setType(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("type") }, "Input__Round")} />
                                    {getFormErrorMessage("type")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="couponCode" className={classNames({ "p-error": isFormFieldValid("couponCode") }, "Label__Text")}>
                                        Coupon Code<span style={{ color: "red" }}>*</span>
                                    </label>
                                    <InputText id="couponCode" name="couponCode" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("couponCode") }, "Input__Round")} />
                                    {getFormErrorMessage("couponCode")}
                                </div>

                                {/* {brand && (
                                    <div className="field-group">
                                        <label htmlFor="brand" className={classNames({ "p-error": isFormFieldValid("brand") }, "Label__Text")}>
                                            Brand<span style={{ color: "red" }}>*</span>
                                        </label>
                                        <select className="native-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                                            <option disabled>Select a brand</option>
                                            {brands?.map((item) => (
                                                <option key={item._id} value={item._id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                        {getFormErrorMessage("brand")}
                                    </div>
                                )} */}

                                <div className="field-group">
                                    <label htmlFor="startDate" className={classNames({ "p-error": isFormFieldValid("startDate") }, "Label__Text")}>
                                        Start Date<span style={{ color: "red" }}>*</span>
                                    </label>
                                    <Calendar id="startDate" name="startDate" value={startDate} onChange={(e) => setStartDate(e.value)} className={classNames({ "p-invalid": isFormFieldValid("startDate") }, "Input__Round")} showTime dateFormat="yy-mm-dd" hourFormat="24" />
                                    {getFormErrorMessage("startDate")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="endDate" className={classNames({ "p-error": isFormFieldValid("endDate") }, "Label__Text")}>
                                        End Date<span style={{ color: "red" }}>*</span>
                                    </label>
                                    <Calendar id="endDate" name="endDate" value={endDate} onChange={(e) => setEndDate(e.value)} className={classNames({ "p-invalid": isFormFieldValid("endDate") }, "Input__Round")} showTime minDate={startDate} dateFormat="yy-mm-dd" hourFormat="24" />
                                    {getFormErrorMessage("endDate")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="minimumOrderValue" className={classNames({ "p-error": isFormFieldValid("minimumOrderValue") }, "Label__Text")}>
                                        Minimum Order Value
                                    </label>
                                    <InputText id="minimumOrderValue" name="minimumOrderValue" value={minimumOrderValue} onChange={(e) => setMinimumOrderValue(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("minimumOrderValue") }, "Input__Round")} />
                                    {getFormErrorMessage("minimumOrderValue")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="maxDiscountCap" className={classNames({ "p-error": isFormFieldValid("maxDiscountCap") }, "Label__Text")}>
                                        Maximum Discount Cap
                                    </label>
                                    <InputText id="maxDiscountCap" name="maxDiscountCap" value={maxDiscountCap} onChange={(e) => setMaxDiscountCap(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("maxDiscountCap") }, "Input__Round")} />
                                    {getFormErrorMessage("maxDiscountCap")}
                                </div>
                            </div>

                            <div className="form_right">
                                <div className="field-group">
                                    <label htmlFor="productType" className={classNames({ "p-error": isFormFieldValid("productType") }, "Label__Text")}>
                                        Product Type<span style={{ color: "red" }}>*</span>
                                    </label>
                                    <Dropdown id="productType" name="productType" value={productType} options={productTypeOptions} onChange={(e) => setProductType(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("productType") }, "Input__Round")} />
                                    {getFormErrorMessage("productType")}
                                </div>

                                {category && (
                                    <div className="field-group">
                                        <label htmlFor="category" className={classNames({ "p-error": isFormFieldValid("category") }, "Label__Text")}>
                                            Category
                                        </label>
                                        <select className="native-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                            <option disabled>Select a category</option>
                                            {categories?.map((item) => (
                                                <option key={item._id} value={item._id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                        {getFormErrorMessage("category")}
                                    </div>
                                )}

                                <div className="field-group">
                                    <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                        Coupon Name<span style={{ color: "red" }}>*</span>
                                    </label>
                                    <InputText id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />
                                    {getFormErrorMessage("name")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="noOfUse" className={classNames({ "p-error": isFormFieldValid("noOfUse") }, "Label__Text")}>
                                        Number Of Use<span style={{ color: "red" }}>*</span>
                                    </label>
                                    <Dropdown id="noOfUse" name="noOfUse" value={noOfUse} options={noOfUseOptions} onChange={(e) => setNoOfUse(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("noOfUse") }, "Input__Round")} />
                                    {getFormErrorMessage("noOfUse")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="discountPercentage" className={classNames({ "p-error": isFormFieldValid("discountPercentage") }, "Label__Text")}>
                                        Discount Percentage
                                    </label>
                                    <InputText id="discountPercentage" name="discountPercentage" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("discountPercentage") }, "Input__Round")} />
                                    {getFormErrorMessage("discountPercentage")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="discountPrice" className={classNames({ "p-error": isFormFieldValid("discountPrice") }, "Label__Text")}>
                                        Discount Price
                                    </label>
                                    <InputText id="discountPrice" name="discountPrice" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("discountPrice") }, "Input__Round")} />
                                    {getFormErrorMessage("discountPrice")}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="couponDescription" className={classNames({ "p-error": isFormFieldValid("couponDescription") }, "Label__Text")}>
                                        About Coupon
                                    </label>
                                    <InputText id="couponDescription" name="couponDescription" value={couponDescription} onChange={(e) => setCouponDescription(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("couponDescription") }, "Input__Round")} />
                                    {getFormErrorMessage("couponDescription")}
                                </div>
                            </div>
                        </div>

                        <div className="Down__Btn m-0 p-0">
                            <Button label="Cancel Changes" className="btn-danger" style={{ marginTop: "10px" }} onClick={handleCancel} type="button" />
                            <Button label="Update Changes" className="Btn__Dark" type="submit" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CouponUpdate;
