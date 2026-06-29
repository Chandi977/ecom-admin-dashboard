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
