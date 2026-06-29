import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { useCategories } from "../../../hooks/useProductQuery";
import { FormInputText, FormInputTextArea } from "../../../components/FormControls";
import { mergeOverviewFieldsWithTemplate, createOverviewField } from "../../../utils/overviewFields";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import classNames from "classnames";

export const SEOSection = () => {
    const { control, watch, setValue } = useFormContext();
    const { data: categories } = useCategories();

    const categoriesList = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);

    const selectedCategoryId = watch("categoryId");
    
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "seo.overviewFields",
    });

    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        if (!selectedCategoryId) return;

        const category = categoriesList.find((c) => String(c._id) === String(selectedCategoryId));
        const templateFields = category?.overview_fields || [];
        const currentFields = watch("seo.overviewFields") || [];

        const merged = mergeOverviewFieldsWithTemplate(templateFields, currentFields);
        
        if (JSON.stringify(currentFields) !== JSON.stringify(merged)) {
            setValue("seo.overviewFields", merged, { shouldDirty: true });
        }
    }, [selectedCategoryId, categoriesList, setValue]);

    const handleAddField = () => {
        append(createOverviewField({ visible: true }));
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        move(draggedIndex, index);
        setDraggedIndex(null);
    };

    return (
        <div style={{ padding: "0.5rem 0" }}>
            <div className="p-fluid p-formgrid grid">
                <FormInputText
                    name="seo.metaTitle"
                    label="Meta Title"
                    placeholder="SEO Page Title (recommended 50-60 characters)"
                    description="The main title displayed on search engines"
                />

                <FormInputText
                    name="seo.canonicalUrl"
                    label="Canonical URL"
                    placeholder="https://prempackaging.com/product/slug"
                    description="Preferred URL link to resolve duplicate pages"
                />

                <FormInputTextArea
                    name="seo.metaDescription"
                    label="Meta Description"
                    placeholder="SEO Page Description (recommended 150-160 characters)"
                    rows={2}
                    description="The snippet text shown below the title in search queries"
                />

                <div className="p-field col-12 md:col-6" style={{ marginBottom: "1rem" }}>
                    <label htmlFor="seo.keywords" className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                        SEO Keywords (comma separated)
                    </label>
                    <Controller
                        name="seo.keywords"
                        control={control}
                        render={({ field, fieldState }) => (
                            <>
                                <InputText
                                    id="seo.keywords"
                                    value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                                    onChange={(e) => {
                                        const valueArray = e.target.value
                                            .split(",")
                                            .map((kw) => kw.trim())
                                            .filter(Boolean);
                                        field.onChange(valueArray);
                                    }}
                                    placeholder="e.g. corrugated boxes, packaging materials, shipping box"
                                    className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                    style={{ width: "100%", height: "38px", borderRadius: "6px" }}
                                />
                                {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                            </>
                        )}
                    />
                </div>

                <FormInputTextArea
                    name="seo.schemaMarkup"
                    label="Schema Markup / JSON-LD"
                    placeholder='e.g. {"@context": "https://schema.org", "@type": "Product", "name": "Box"}'
                    rows={3}
                    description="Paste JSON-LD structured data for rich search results"
                />
            </div>

            <div style={{ marginTop: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                        <h5 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Quick Overview Fields</h5>
                        <p style={{ margin: 0, fontSize: "11px", color: "#6c757d" }}>
                            These bullets show next to the image. Drag to reorder. Hide/show using the checkboxes.
                        </p>
                    </div>
                    <Button
                        type="button"
                        label="Add Field"
                        icon="pi pi-plus"
                        className="p-button-outlined p-button-sm"
                        onClick={handleAddField}
                        style={{ width: "130px", height: "35px" }}
                    />
                </div>

                {fields.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", color: "#6c757d" }}>
                        <i className="pi pi-list" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
                        No overview fields defined. Overview fields will be loaded from category templates if selected.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    background: "#fff",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "8px",
                                    border: "1px solid #cecece",
                                    cursor: "grab",
                                }}
                            >
                                <i className="pi pi-bars" style={{ color: "#888", fontSize: "14px" }}></i>

                                <Controller
                                    name={`seo.overviewFields.${index}.visible`}
                                    control={control}
                                    render={({ field: inputField }) => (
                                        <Checkbox
                                            inputId={`seo.overviewFields.${index}.visible`}
                                            checked={inputField.value !== false}
                                            onChange={(e) => inputField.onChange(e.checked)}
                                            tooltip="Show/Hide on page"
                                            tooltipOptions={{ position: "top" }}
                                        />
                                    )}
                                />

                                <div style={{ flex: 1 }}>
                                    <Controller
                                        name={`seo.overviewFields.${index}.label`}
                                        control={control}
                                        rules={{ required: "Label is required" }}
                                        render={({ field: inputField, fieldState }) => (
                                            <div className="p-fluid">
                                                <InputText
                                                    {...inputField}
                                                    placeholder="Label (e.g. Material)"
                                                    className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                                                    style={{ height: "35px" }}
                                                />
                                                {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                            </div>
                                        )}
                                    />
                                </div>

                                <div style={{ flex: 2 }}>
                                    <Controller
                                        name={`seo.overviewFields.${index}.value`}
                                        control={control}
                                        render={({ field: inputField }) => (
                                            <div className="p-fluid">
                                                <InputText
                                                    {...inputField}
                                                    placeholder="Value (e.g. 100% Recyclable)"
                                                    className="Input__Round"
                                                    style={{ height: "35px" }}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-button-text"
                                    onClick={() => remove(index)}
                                    style={{ width: "32px", height: "32px" }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
