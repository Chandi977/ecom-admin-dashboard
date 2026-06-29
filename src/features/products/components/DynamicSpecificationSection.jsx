import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useCategories, useSubCategories } from "../../../hooks/useProductQuery";
import { resolveSpecSchema } from "../../../utils/specificationSchemas";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import classNames from "classnames";

// Build the spec form schema from a category's backend `spec_schema`. Returns
// null when the category hasn't defined one, so the caller can fall back to the
// legacy hard-coded specificationSchemas.js for un-migrated categories.
const buildSchemaFromCategory = (category) => {
    const specSchema = Array.isArray(category?.spec_schema) ? category.spec_schema : [];
    if (!specSchema.length) return null;
    return {
        displayName: `${category?.name || "Category"} Specifications`,
        fields: specSchema
            .filter((field) => field && field.key)
            .map((field) => ({
                name: field.key,
                label: field.label || field.key,
                type: ["text", "number", "select"].includes(field.type) ? field.type : "text",
                options: Array.isArray(field.options) ? field.options : undefined,
                required: !!field.required,
                description: field.unit ? `Unit: ${field.unit}` : undefined,
                default_value: field.default_value,
            })),
    };
};

export const DynamicSpecificationSection = () => {
    const { control, watch, setValue, getValues } = useFormContext();
    const { data: categories } = useCategories();
    const { data: subCategories } = useSubCategories();

    const categoriesList = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);
    const subCategoriesList = useMemo(() => Array.isArray(subCategories) ? subCategories : [], [subCategories]);

    const selectedCategoryId = watch("categoryId");
    const selectedSubCategoryId = watch("subCategoryId");

    const [specSchema, setSpecSchema] = useState(null);

    useEffect(() => {
        if (!selectedCategoryId) {
            setSpecSchema(null);
            return;
        }

        const category = categoriesList.find((c) => String(c._id) === String(selectedCategoryId));
        const subCategory = subCategoriesList.find((s) => String(s._id) === String(selectedSubCategoryId));

        // Prefer the category's own spec_schema (admin-defined); fall back to the
        // legacy hard-coded schemas for categories not yet migrated.
        const schema =
            buildSchemaFromCategory(category) || resolveSpecSchema(subCategory?.name || "", category?.name || "");
        setSpecSchema(schema);

        if (!schema) {
            setValue("specification", {}, { shouldDirty: true });
            return;
        }

        // Pre-fill declared defaults for fields the form left blank. Never clobbers
        // an existing value, so editing a product keeps its saved specs intact.
        schema.fields.forEach((field) => {
            if (field.default_value === undefined || field.default_value === null || field.default_value === "") return;
            const current = getValues(`specification.${field.name}`);
            if (current === undefined || current === null || current === "") {
                setValue(`specification.${field.name}`, field.default_value, { shouldDirty: false });
            }
        });
    }, [selectedCategoryId, selectedSubCategoryId, categoriesList, subCategoriesList, setValue, getValues]);

    if (!selectedCategoryId) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", color: "#6c757d" }}>
                <i className="pi pi-info-circle" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
                Please select a Category and Sub-Category first to load dynamic specifications.
            </div>
        );
    }

    if (!specSchema) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", color: "#6c757d" }}>
                <i className="pi pi-sliders-h" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
                No specific dimensions or dynamic specifications required for this Category.
            </div>
        );
    }

    return (
        <div style={{ padding: "0.5rem 0" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h5 style={{ fontSize: "14px", fontWeight: 600, color: "#2196F3", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="pi pi-cog"></i> {specSchema.displayName}
                </h5>
                <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                    Specify the dimensional properties and material options below. All fields conform to category templates.
                </p>
            </div>

            <div className="p-fluid p-formgrid grid">
                {specSchema.fields.map((field) => {
                    const fieldPath = `specification.${field.name}`;
                    
                    return (
                        <div key={field.name} className="p-field col-12 md:col-6" style={{ marginBottom: "1rem" }}>
                            <label htmlFor={fieldPath} className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                                {field.label} {field.required && <span className="p-error">*</span>}
                            </label>

                            <Controller
                                name={fieldPath}
                                control={control}
                                rules={field.required ? { required: `${field.label} is required` } : {}}
                                render={({ field: inputField, fieldState }) => {
                                    if (field.type === "select") {
                                        const selectOptions = field.options?.map(opt => ({ label: opt, value: opt })) || [];
                                        return (
                                            <>
                                                <Dropdown
                                                    id={fieldPath}
                                                    value={inputField.value ?? ""}
                                                    options={selectOptions}
                                                    optionLabel="label"
                                                    optionValue="value"
                                                    placeholder={`Select ${field.label}`}
                                                    onChange={(e) => inputField.onChange(e.value)}
                                                    className={classNames({ "p-invalid": fieldState.invalid })}
                                                    style={{ width: "100%", height: "38px", borderRadius: "6px", display: "flex", alignItems: "center" }}
                                                />
                                                {fieldState.error && (
                                                    <small className="p-error" style={{ display: "block", marginTop: "0.25rem" }}>
                                                        {fieldState.error.message}
                                                    </small>
                                                )}
                                            </>
                                        );
                                    }

                                    return (
                                        <>
                                            <InputText
                                                id={fieldPath}
                                                type={field.type === "number" ? "number" : "text"}
                                                {...inputField}
                                                value={inputField.value ?? ""}
                                                onChange={(e) => {
                                                    const rawVal = e.target.value;
                                                    inputField.onChange(field.type === "number" && rawVal !== "" ? Number(rawVal) : rawVal);
                                                }}
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                                className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                style={{ width: "100%", height: "38px", borderRadius: "6px" }}
                                            />
                                            {fieldState.error && (
                                                <small className="p-error" style={{ display: "block", marginTop: "0.25rem" }}>
                                                    {fieldState.error.message}
                                                </small>
                                            )}
                                            {field.description && !fieldState.error && (
                                                <small className="p-text-secondary" style={{ display: "block", marginTop: "0.25rem" }}>
                                                    {field.description}
                                                </small>
                                            )}
                                        </>
                                    );
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
