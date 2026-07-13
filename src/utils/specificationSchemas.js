export const specificationSchemas = {
    "corrugated box": {
        displayName: "Corrugated Box Specifications",
        fields: [
            { name: "length", label: "Length (mm)", type: "number", required: true },
            { name: "width", label: "Width (mm)", type: "number", required: true },
            { name: "height", label: "Height (mm)", type: "number", required: true },
            { name: "material", label: "Material", type: "select", options: ["Kraft Paper", "Duplex Board", "White Kraft"], required: true },
            { name: "color", label: "Colour", type: "select", options: ["Brown", "White", "Golden"], required: false },
            { name: "print", label: "Print", type: "select", options: ["Single Colour", "Multi Colour", "No Print"], required: false }
        ]
    },
    "paper bag": {
        displayName: "Paper Bag Specifications",
        fields: [
            { name: "length", label: "Length (mm)", type: "number", required: true },
            { name: "width", label: "Width (mm)", type: "number", required: true },
            { name: "gsm", label: "Paper GSM", type: "number", required: true, description: "Grams per Square Meter" },
            { name: "gusset", label: "Gusset (mm)", type: "number", required: false, description: "Side or bottom fold depth" },
            { name: "flap_mm", label: "Flap (mm)", type: "number", required: false }
        ]
    },
    "tape": {
        displayName: "Tape Specifications",
        fields: [
            { name: "width", label: "Width (mm)", type: "number", required: true },
            { name: "length", label: "Length (m)", type: "number", required: true },
            { name: "thickness", label: "Thickness (mm)", type: "number", required: false },
            { name: "thickness_micron", label: "Micron Value", type: "number", required: true, description: "e.g. 40, 45, 50 micron" },
            { name: "color", label: "Colour", type: "select", options: ["Brown", "Transparent", "Coloured"], required: false },
            { name: "adhesive", label: "Adhesive Type", type: "select", options: ["Acrylic", "Rubber", "Hot Melt"], required: false }
        ]
    },
    "labels": {
        displayName: "Label Specifications",
        fields: [
            { name: "length", label: "Length (mm)", type: "number", required: true },
            { name: "width", label: "Width (mm)", type: "number", required: true },
            { name: "core_size", label: "Core Size (inches)", type: "number", required: true },
            { name: "label_in_roll", label: "Labels In Roll", type: "number", required: true },
            { name: "color", label: "Colour", type: "select", options: ["White", "Yellow", "Red", "Blue", "Green"], required: false }
        ]
    }
};

export function resolveSpecSchema(subCategoryName, categoryName) {
    const subNameClean = String(subCategoryName || "").toLowerCase().trim();
    const catNameClean = String(categoryName || "").toLowerCase().trim();

    for (const [key, schema] of Object.entries(specificationSchemas)) {
        if (subNameClean.includes(key) || key.includes(subNameClean)) {
            return schema;
        }
    }

    for (const [key, schema] of Object.entries(specificationSchemas)) {
        if (catNameClean.includes(key) || key.includes(catNameClean)) {
            return schema;
        }
    }

    return null;
}

// Units we know how to render as a suffix, e.g. length_mm -> "Length (mm)".
const UNIT_SUFFIXES = { mm: "mm", inch: "inch", micron: "micron", cm: "cm", gsm: "GSM" };

// Human-readable label for a raw spec key, keeping unit suffixes in parentheses.
// Shared by the product edit form (DynamicSpecificationSection) and the admin
// Excel grid so a spec column reads identically in both places.
export function humanizeSpecKey(key) {
    const parts = String(key).split("_");
    const last = parts[parts.length - 1];
    const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
    if (UNIT_SUFFIXES[last] && parts.length > 1) {
        return `${titleCase(parts.slice(0, -1).join(" "))} (${UNIT_SUFFIXES[last]})`;
    }
    return titleCase(parts.join(" "));
}

// Build a spec form schema from a category's backend `spec_schema`. Returns null
// when the category hasn't defined one, so callers fall back to the legacy
// hard-coded specificationSchemas above for un-migrated categories.
export function buildSchemaFromCategory(category) {
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
}
