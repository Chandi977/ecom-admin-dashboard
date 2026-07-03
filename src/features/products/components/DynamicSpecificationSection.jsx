import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useCategories, useSubCategories } from "../../../hooks/useProductQuery";
import { resolveSpecSchema } from "../../../utils/specificationSchemas";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import classNames from "classnames";

// Units we know how to render as a suffix, e.g. length_mm -> "Length (mm)".
const UNIT_SUFFIXES = { mm: "mm", inch: "inch", micron: "micron", cm: "cm", gsm: "GSM" };

// Human-readable label for a raw spec key, keeping unit suffixes in parentheses.
const humanizeSpecKey = (key) => {
    const parts = String(key).split("_");
    const last = parts[parts.length - 1];
    const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
    if (UNIT_SUFFIXES[last] && parts.length > 1) {
        return `${titleCase(parts.slice(0, -1).join(" "))} (${UNIT_SUFFIXES[last]})`;
    }
    return titleCase(parts.join(" "));
};

const hasValue = (v) => v !== undefined && v !== null && v !== "";

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

// Renders a single spec input (select / number / text) bound to specification.<name>.
const SpecFieldInput = ({ control, field }) => {
    const fieldPath = `specification.${field.name}`;
    return (
        <div className="p-field col-12 md:col-6" style={{ marginBottom: "1rem" }}>
            <label htmlFor={fieldPath} className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {field.label} {field.required && <span className="p-error">*</span>}
            </label>
            <Controller
                name={fieldPath}
                control={control}
                rules={field.required ? { required: `${field.label} is required` } : {}}
                render={({ field: inputField, fieldState }) => {
                    if (field.type === "select") {
                        const selectOptions = field.options?.map((opt) => ({ label: opt, value: opt })) || [];
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

        if (!schema) return;

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

    // Every spec value currently on the product, so nothing the backend returned
    // stays hidden just because the category schema doesn't list it.
    const specValues = watch("specification") || {};
    const schemaFieldNames = useMemo(
        () => new Set((specSchema?.fields || []).map((f) => f.name)),
        [specSchema],
    );

    // Extra fields: any spec key with a value that the schema above doesn't already
    // render (e.g. length_mm, breadth_inch, size_inch, label_in_roll on a legacy
    // product). Rendered as generic number/text inputs so they're visible + editable.
    const extraFields = useMemo(() => {
        return Object.keys(specValues)
            .filter((key) => !schemaFieldNames.has(key) && hasValue(specValues[key]))
            .map((key) => ({
                name: key,
                label: humanizeSpecKey(key),
                type: typeof specValues[key] === "number" ? "number" : "text",
            }));
    }, [specValues, schemaFieldNames]);

    if (!selectedCategoryId) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", color: "#6c757d" }}>
                <i className="pi pi-info-circle" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
                Please select a Category and Sub-Category first to load dynamic specifications.
            </div>
        );
    }

    const hasSchemaFields = !!specSchema?.fields?.length;

    if (!hasSchemaFields && extraFields.length === 0) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", color: "#6c757d" }}>
                <i className="pi pi-sliders-h" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
                No specific dimensions or dynamic specifications required for this Category.
            </div>
        );
    }

    return (
        <div style={{ padding: "0.5rem 0" }}>
            {hasSchemaFields && (
                <>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h5 style={{ fontSize: "14px", fontWeight: 600, color: "#2196F3", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <i className="pi pi-cog"></i> {specSchema.displayName}
                        </h5>
                        <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                            Specify the dimensional properties and material options below. All fields conform to category templates.
                        </p>
                    </div>
                    <div className="p-fluid p-formgrid grid">
                        {specSchema.fields.map((field) => (
                            <SpecFieldInput key={field.name} control={control} field={field} />
                        ))}
                    </div>
                </>
            )}

            {extraFields.length > 0 && (
                <div style={{ marginTop: hasSchemaFields ? "1.5rem" : 0 }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <h5 style={{ fontSize: "14px", fontWeight: 600, color: "#2196F3", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <i className="pi pi-list"></i> Additional Specifications
                        </h5>
                        <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                            Other saved dimensions and attributes for this product. Edit or clear any value below.
                        </p>
                    </div>
                    <div className="p-fluid p-formgrid grid">
                        {extraFields.map((field) => (
                            <SpecFieldInput key={field.name} control={control} field={field} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
