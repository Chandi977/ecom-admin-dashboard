import React from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";

/**
 * Editors for a category's `spec_schema` and `common_attributes`.
 *
 * These drive the category-level attribute inheritance introduced on the backend:
 *  - spec_schema    : the spec fields products in this category expose. Replaces
 *                     the hard-coded specificationSchemas.js — DynamicSpecificationSection
 *                     reads it to render the product spec form.
 *  - common_attributes: category-wide attribute defaults (hsn_code, material, …)
 *                     every product inherits unless it sets its own value.
 *
 * Both are kept as plain editable state in the parent form and normalized just
 * before submit with the exported helpers, mirroring the FieldVisibilityGrid /
 * overviewFields conventions already used by the category forms.
 */

export const SPEC_FIELD_TYPE_OPTIONS = [
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Select", value: "select" },
];

const SPEC_FIELD_TYPES = SPEC_FIELD_TYPE_OPTIONS.map((option) => option.value);

export const slugifySpecKey = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

export const createSpecField = () => ({
    key: "",
    label: "",
    type: "text",
    options: [],
    required: false,
    unit: "",
    default_value: "",
});

// Backend spec_schema -> editable rows (defensive: guarantees the shape the UI needs).
export const specSchemaToEditable = (schema) =>
    (Array.isArray(schema) ? schema : []).map((field) => ({
        key: field?.key ?? "",
        label: field?.label ?? "",
        type: SPEC_FIELD_TYPES.includes(field?.type) ? field.type : "text",
        options: Array.isArray(field?.options) ? field.options : [],
        required: !!field?.required,
        unit: field?.unit ?? "",
        default_value: field?.default_value ?? "",
    }));

// Editable rows -> clean spec_schema for submit. Drops rows without a usable key.
export const normalizeSpecSchema = (fields) =>
    (Array.isArray(fields) ? fields : [])
        .map((field) => {
            const key = slugifySpecKey(field.key || field.label);
            const type = SPEC_FIELD_TYPES.includes(field.type) ? field.type : "text";
            const options =
                type === "select"
                    ? (Array.isArray(field.options) ? field.options : String(field.options || "").split(","))
                          .map((option) => String(option).trim())
                          .filter(Boolean)
                    : undefined;
            const defaultValue =
                field.default_value === "" || field.default_value === undefined || field.default_value === null
                    ? undefined
                    : type === "number"
                    ? Number(field.default_value)
                    : field.default_value;
            return {
                key,
                label: String(field.label || field.key || "").trim() || key,
                type,
                ...(options && options.length ? { options } : {}),
                required: !!field.required,
                ...(String(field.unit || "").trim() ? { unit: String(field.unit).trim() } : {}),
                ...(defaultValue !== undefined && !(type === "number" && Number.isNaN(defaultValue))
                    ? { default_value: defaultValue }
                    : {}),
            };
        })
        .filter((field) => field.key);

// ── common_attributes <-> editable key/value pairs ──────────────────────────
export const createAttributePair = () => ({ key: "", value: "" });

export const attributesToPairs = (attributes) =>
    attributes && typeof attributes === "object" && !Array.isArray(attributes)
        ? Object.entries(attributes).map(([key, value]) => ({ key, value }))
        : [];

export const pairsToAttributes = (pairs) =>
    (Array.isArray(pairs) ? pairs : []).reduce((out, pair) => {
        const key = String(pair?.key || "").trim();
        if (key && !key.includes(".") && !key.startsWith("$") && pair.value !== "" && pair.value !== undefined && pair.value !== null) {
            out[key] = pair.value;
        }
        return out;
    }, {});

const rowStyle = { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" };

export function SpecSchemaBuilder({ value, onChange }) {
    const fields = Array.isArray(value) ? value : [];

    const updateField = (index, patch) =>
        onChange(fields.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field)));
    const addField = () => onChange([...fields, createSpecField()]);
    const removeField = (index) => onChange(fields.filter((_, fieldIndex) => fieldIndex !== index));
    const moveField = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= fields.length) return;
        const next = [...fields];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="Label__Text">Specification Fields</label>
                <Button type="button" label="Add Spec Field" icon="pi pi-plus" onClick={addField} style={{ width: "170px", height: "35px" }} />
            </div>
            <small>
                Defines the spec inputs shown on the product form for this category, replacing hard-coded schemas.
                Products inherit each field&apos;s default unless they set their own value.
            </small>

            {fields.length === 0 && (
                <small className="p-text-secondary">No spec fields yet. Products in this category will show no dynamic specifications.</small>
            )}

            {fields.map((field, index) => (
                <div key={`spec-field-${index}`} style={{ border: "1px solid #dee2e6", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={rowStyle}>
                        <InputText
                            placeholder="Label (e.g. Length)"
                            value={field.label}
                            onChange={(e) => {
                                const label = e.target.value;
                                updateField(index, { label, key: field.key || slugifySpecKey(label) });
                            }}
                            className="Input__Round"
                            style={{ flex: "1 1 160px" }}
                        />
                        <InputText
                            placeholder="key (e.g. length_mm)"
                            value={field.key}
                            onChange={(e) => updateField(index, { key: e.target.value })}
                            className="Input__Round"
                            style={{ flex: "1 1 140px" }}
                        />
                        <Dropdown
                            value={field.type}
                            options={SPEC_FIELD_TYPE_OPTIONS}
                            onChange={(e) => updateField(index, { type: e.value })}
                            style={{ width: "120px" }}
                        />
                    </div>
                    <div style={rowStyle}>
                        {field.type === "select" && (
                            <InputText
                                placeholder="Options (comma separated)"
                                value={(field.options || []).join(", ")}
                                onChange={(e) => updateField(index, { options: e.target.value.split(",").map((option) => option.trimStart()) })}
                                className="Input__Round"
                                style={{ flex: "1 1 220px" }}
                            />
                        )}
                        <InputText
                            placeholder="Unit (mm, gsm…)"
                            value={field.unit}
                            onChange={(e) => updateField(index, { unit: e.target.value })}
                            className="Input__Round"
                            style={{ flex: "0 1 130px" }}
                        />
                        <InputText
                            placeholder="Default value"
                            value={field.default_value ?? ""}
                            onChange={(e) => updateField(index, { default_value: e.target.value })}
                            className="Input__Round"
                            style={{ flex: "0 1 130px" }}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "5px", margin: 0 }}>
                            <Checkbox checked={!!field.required} onChange={(e) => updateField(index, { required: e.checked })} />
                            <span className="Label__Text" style={{ margin: 0 }}>Required</span>
                        </label>
                        <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
                            <Button type="button" icon="pi pi-arrow-up" className="p-button-text" onClick={() => moveField(index, -1)} disabled={index === 0} tooltip="Move up" />
                            <Button type="button" icon="pi pi-arrow-down" className="p-button-text" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} tooltip="Move down" />
                            <Button type="button" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => removeField(index)} tooltip="Remove" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function CommonAttributesEditor({ value, onChange }) {
    const pairs = Array.isArray(value) ? value : [];

    const updatePair = (index, patch) =>
        onChange(pairs.map((pair, pairIndex) => (pairIndex === index ? { ...pair, ...patch } : pair)));
    const addPair = () => onChange([...pairs, createAttributePair()]);
    const removePair = (index) => onChange(pairs.filter((_, pairIndex) => pairIndex !== index));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="Label__Text">Common Attributes (inherited defaults)</label>
                <Button type="button" label="Add Attribute" icon="pi pi-plus" onClick={addPair} style={{ width: "160px", height: "35px" }} />
            </div>
            <small>
                Category-wide values (e.g. hsn_code, material) inherited by every product unless the product overrides them.
                Use this instead of repeating the same value on every product.
            </small>

            {pairs.map((pair, index) => (
                <div key={`attr-${index}`} style={rowStyle}>
                    <InputText
                        placeholder="key (e.g. hsn_code)"
                        value={pair.key}
                        onChange={(e) => updatePair(index, { key: e.target.value })}
                        className="Input__Round"
                        style={{ flex: "1 1 160px" }}
                    />
                    <InputText
                        placeholder="value"
                        value={pair.value}
                        onChange={(e) => updatePair(index, { value: e.target.value })}
                        className="Input__Round"
                        style={{ flex: "1 1 160px" }}
                    />
                    <Button type="button" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => removePair(index)} tooltip="Remove" />
                </div>
            ))}
        </div>
    );
}
