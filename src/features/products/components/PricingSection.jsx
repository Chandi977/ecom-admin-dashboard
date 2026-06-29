import React from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FormInputNumber } from "../../../components/FormControls";
import classNames from "classnames";

export const PricingSection = () => {
    const { control, register, setValue, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "pricing.priceList",
    });

    const watchPriceList = watch("pricing.priceList") || [];

    const handleAddTier = () => {
        append({
            number: "",
            sellingPrice: "",
            originalPrice: "",
            discount: 0,
            packWeight: "",
            stockQuantity: "",
        });
    };

    const calculateAndSetDiscount = (index, sellingPrice, originalPrice) => {
        if (originalPrice && sellingPrice && originalPrice > sellingPrice) {
            const pct = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
            setValue(`pricing.priceList.${index}.discount`, pct, { shouldDirty: true });
        } else {
            setValue(`pricing.priceList.${index}.discount`, 0, { shouldDirty: true });
        }
    };

    return (
        <div style={{ padding: "0.5rem 0" }}>
            <div className="p-fluid p-formgrid grid">
                <FormInputNumber
                    name="pricing.basePrice"
                    label="Base Price (Default/Reference Price)"
                    placeholder="e.g. 150"
                    min={0}
                />
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h5 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Pricing Tiers & Quantity Breaks</h5>
                    <Button
                        type="button"
                        label="Add Tier"
                        icon="pi pi-plus"
                        className="p-button-outlined p-button-sm"
                        onClick={handleAddTier}
                        style={{ width: "120px", height: "35px" }}
                    />
                </div>

                {fields.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", color: "#6c757d" }}>
                        <i className="pi pi-tags" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
                        No pricing tiers defined. Add at least one tier for the product.
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #dee2e6", textAlign: "left", background: "#f8f9fa" }}>
                                    <th style={{ padding: "10px", fontSize: "13px", fontWeight: 600 }}>Min Quantity <span className="p-error">*</span></th>
                                    <th style={{ padding: "10px", fontSize: "13px", fontWeight: 600 }}>Original Price (MRP)</th>
                                    <th style={{ padding: "10px", fontSize: "13px", fontWeight: 600 }}>Selling Price (SP) <span className="p-error">*</span></th>
                                    <th style={{ padding: "10px", fontSize: "13px", fontWeight: 600 }}>Discount (%)</th>
                                    <th style={{ padding: "10px", fontSize: "13px", fontWeight: 600 }}>Pack Weight (kg)</th>
                                    <th style={{ padding: "10px", fontSize: "13px", fontWeight: 600 }}>Stock Quantity <span className="p-error">*</span></th>
                                    <th style={{ padding: "10px", textAlign: "center", width: "80px", fontSize: "13px", fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => {
                                    const item = watchPriceList[index] || {};
                                    return (
                                        <tr key={field.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                                            <td style={{ padding: "8px" }}>
                                                <Controller
                                                    name={`pricing.priceList.${index}.number`}
                                                    control={control}
                                                    render={({ field: inputField, fieldState }) => (
                                                        <div className="p-fluid">
                                                            <InputText
                                                                type="number"
                                                                {...inputField}
                                                                placeholder="e.g. 50"
                                                                onChange={(e) => inputField.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                                className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                                style={{ height: "35px", borderRadius: "6px" }}
                                                            />
                                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                                        </div>
                                                    )}
                                                />
                                            </td>

                                            <td style={{ padding: "8px" }}>
                                                <Controller
                                                    name={`pricing.priceList.${index}.originalPrice`}
                                                    control={control}
                                                    render={({ field: inputField, fieldState }) => (
                                                        <div className="p-fluid">
                                                            <InputText
                                                                type="number"
                                                                {...inputField}
                                                                placeholder="Original MRP"
                                                                onChange={(e) => {
                                                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                                                    inputField.onChange(val);
                                                                    calculateAndSetDiscount(index, Number(item.sellingPrice), Number(val));
                                                                }}
                                                                className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                                style={{ height: "35px", borderRadius: "6px" }}
                                                            />
                                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                                        </div>
                                                    )}
                                                />
                                            </td>

                                            <td style={{ padding: "8px" }}>
                                                <Controller
                                                    name={`pricing.priceList.${index}.sellingPrice`}
                                                    control={control}
                                                    render={({ field: inputField, fieldState }) => (
                                                        <div className="p-fluid">
                                                            <InputText
                                                                type="number"
                                                                {...inputField}
                                                                placeholder="Selling Price"
                                                                onChange={(e) => {
                                                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                                                    inputField.onChange(val);
                                                                    calculateAndSetDiscount(index, Number(val), Number(item.originalPrice));
                                                                }}
                                                                className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                                style={{ height: "35px", borderRadius: "6px" }}
                                                            />
                                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                                        </div>
                                                    )}
                                                />
                                            </td>

                                            <td style={{ padding: "8px" }}>
                                                <Controller
                                                    name={`pricing.priceList.${index}.discount`}
                                                    control={control}
                                                    render={({ field: inputField, fieldState }) => (
                                                        <div className="p-fluid">
                                                            <InputText
                                                                type="number"
                                                                {...inputField}
                                                                placeholder="0%"
                                                                onChange={(e) => inputField.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                                className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                                style={{ height: "35px", borderRadius: "6px", background: "#f1f3f5" }}
                                                                disabled
                                                            />
                                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                                        </div>
                                                    )}
                                                />
                                            </td>

                                            <td style={{ padding: "8px" }}>
                                                <Controller
                                                    name={`pricing.priceList.${index}.packWeight`}
                                                    control={control}
                                                    render={({ field: inputField, fieldState }) => (
                                                        <div className="p-fluid">
                                                            <InputText
                                                                type="number"
                                                                step="0.001"
                                                                {...inputField}
                                                                placeholder="Weight in kg"
                                                                onChange={(e) => inputField.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                                className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                                style={{ height: "35px", borderRadius: "6px" }}
                                                            />
                                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                                        </div>
                                                    )}
                                                />
                                            </td>

                                            <td style={{ padding: "8px" }}>
                                                <Controller
                                                    name={`pricing.priceList.${index}.stockQuantity`}
                                                    control={control}
                                                    render={({ field: inputField, fieldState }) => (
                                                        <div className="p-fluid">
                                                            <InputText
                                                                type="number"
                                                                {...inputField}
                                                                placeholder="Available stock"
                                                                onChange={(e) => inputField.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                                className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                                style={{ height: "35px", borderRadius: "6px" }}
                                                            />
                                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                                        </div>
                                                    )}
                                                />
                                            </td>

                                            <td style={{ padding: "8px", textAlign: "center" }}>
                                                <Button
                                                    type="button"
                                                    icon="pi pi-trash"
                                                    className="p-button-rounded p-button-danger p-button-text"
                                                    onClick={() => remove(index)}
                                                    style={{ width: "32px", height: "32px" }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
