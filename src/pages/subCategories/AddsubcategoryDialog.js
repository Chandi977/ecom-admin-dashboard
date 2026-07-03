import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import { CommonAttributesEditor, pairsToAttributes } from "../../components/CategoryAttributesEditor";

function AddsubcategoryDialog({ onsuccess }) {
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [gst, setGst] = useState("");
    const [hsn_code, setHsnCode] = useState("");
    const [sac_code, setSacCode] = useState("");
    const [tax_category, setTaxCategory] = useState("Goods");
    const [delivery_time, setDeliveryTime] = useState("");
    const [attributePairs, setAttributePairs] = useState([]);

    const getCategories = useCallback(async () => {
        const res = await handleGetRequest("/category/all");
        setCategories(res?.data);
    }, []);

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    const formik = useFormik({
        initialValues: {
            name: "",
        },

        onSubmit: async (data) => {
            if (gst !== "" && gst !== null && gst !== undefined) {
                const numericGst = Number(gst);
                if (numericGst < 0 || numericGst > 1) {
                    toast.error("GST Rate must be a decimal value between 0 and 1 (e.g. 0.18 for 18%)");
                    return;
                }
            }
            const dat = {
                name: data.name,
                category: selectedCategory,
                gst: gst !== "" && gst !== null ? Number(gst) : undefined,
                hsn_code: hsn_code.trim() || undefined,
                sac_code: sac_code.trim() || undefined,
                tax_category: tax_category.trim() || undefined,
                delivery_time: delivery_time.trim() || undefined,
                common_attributes: pairsToAttributes(attributePairs),
            };
            await dispatch(handlePostRequest(dat, "/subcategory/create", true, true));
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
                                <option value="" disabled>
                                    Please select category
                                </option>
                                {categories?.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            {getFormErrorMessage("name")}
                        </div>
                    </div>

                    {/* Tax and Fulfillment Sections */}
                    <div className="p-field col-12 md:col-12">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "10px", marginBottom: "15px" }}>
                            {/* Tax Configuration Card */}
                            <div className="card" style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid #dee2e6", margin: 0 }}>
                                <h5 style={{ fontWeight: 600, color: "#182C5A", marginBottom: "1.25rem", marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "16px" }}>
                                    <i className="pi pi-percentage" style={{ fontSize: "1.1rem" }}></i> Tax Configuration
                                </h5>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div>
                                        <label htmlFor="subcategory_gst" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            GST Rate (Decimal)
                                        </label>
                                        <InputText id="subcategory_gst" type="number" min={0} max={1} step="any" value={gst} onChange={(e) => setGst(e.target.value)} placeholder="Inherit from Category" className="Input__Round" />
                                        {gst !== "" && gst !== null && gst !== undefined && (
                                            <small style={{ display: "block", marginTop: "0.25rem" }}>
                                                {Number(gst) > 1 || Number(gst) < 0 ? (
                                                    <span className="p-error">GST rate must be between 0 and 1 (e.g. 0.18 for 18%)</span>
                                                ) : (
                                                    <span className="p-text-secondary">Calculated: {Math.round(Number(gst) * 100)}% GST</span>
                                                )}
                                            </small>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="subcategory_hsn" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            HSN Code
                                        </label>
                                        <InputText id="subcategory_hsn" value={hsn_code} onChange={(e) => setHsnCode(e.target.value)} placeholder="Inherit from Category" className="Input__Round" />
                                    </div>
                                    <div>
                                        <label htmlFor="subcategory_sac" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            SAC Code
                                        </label>
                                        <InputText id="subcategory_sac" value={sac_code} onChange={(e) => setSacCode(e.target.value)} placeholder="Inherit from Category" className="Input__Round" />
                                    </div>
                                    <div>
                                        <label htmlFor="subcategory_tax_cat" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            Tax Category
                                        </label>
                                        <Dropdown id="subcategory_tax_cat" value={tax_category} options={[{ label: "Goods", value: "Goods" }, { label: "Services", value: "Services" }]} onChange={(e) => setTaxCategory(e.value)} placeholder="Select Tax Category" className="Input__Round" />
                                    </div>
                                </div>
                            </div>

                            {/* Fulfillment Configuration Card */}
                            <div className="card" style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid #dee2e6", margin: 0 }}>
                                <h5 style={{ fontWeight: 600, color: "#22C55E", marginBottom: "1.25rem", marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "16px" }}>
                                    <i className="pi pi-truck" style={{ fontSize: "1.1rem" }}></i> Fulfillment Configuration
                                </h5>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div>
                                        <label htmlFor="subcategory_delivery" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            Estimated Delivery Time
                                        </label>
                                        <InputText id="subcategory_delivery" value={delivery_time} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="e.g. 3-5 business days" className="Input__Round" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <CommonAttributesEditor value={attributePairs} onChange={setAttributePairs} />
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
