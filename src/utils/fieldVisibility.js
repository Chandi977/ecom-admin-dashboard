// Storefront field-visibility controls.
//
// The product stores a `field_visibility` map (key -> boolean). A missing key
// (or `true`) means the field is shown on the storefront; only an explicit
// `false` hides it. Keys here MUST mirror those read by the storefront in
// `ecom-frontend-optimised/utils/fieldVisibility.ts`. The `spec:` rows are
// dynamic — one per specification field the product actually has a value for.

export const specVisibilityKey = (specKey) => `spec:${specKey}`;

// Mirrors the storefront's labelFromKey (ProductSpecifications.tsx) so the admin
// checkbox label matches the row the customer sees.
export const labelFromSpecKey = (specKey) =>
    String(specKey || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

// Fixed (non-spec) toggles, grouped to MIRROR the real product page top-to-bottom
// so the admin reads like a copy of the storefront layout: the Main View card,
// then the Quick Overview / Specifications / Product Details sections below it.
// (Quick Overview rows are templated in the "Quick Overview Fields" block above;
// individual Specification rows are toggled per-product.)
export const FIELD_VISIBILITY_GROUPS = [
    {
        title: "Main View",
        description: "The product card shown next to the image at the top of the page.",
        items: [
            { key: "price:mrp", label: "MRP (struck-through)" },
            { key: "price:savings", label: "Savings" },
            { key: "price:pack_weight", label: "Pack Weight" },
            { key: "field:about_item", label: "About the Item line" },
            { key: "note:gst", label: '"Price is excluding GST" note' },
            { key: "note:delivery", label: '"Delivery within 7-10 working days" note' },
            { key: "badge:free_delivery", label: "Free Delivery badge" },
            { key: "badge:secure_transaction", label: "Secure Transaction badge" },
            { key: "badge:no_returns", label: "No Returns badge" },
            { key: "badge:recyclable", label: "100% Recyclable badge" },
        ],
    },
    {
        title: "Quick Overview",
        description: "The Quick Overview list (top card + the section lower down).",
        items: [
            { key: "section:quick_overview", label: "Show Quick Overview section" },
        ],
    },
    {
        title: "Specifications",
        description: "The Specifications grid lower on the page.",
        items: [
            { key: "section:specifications", label: "Show Specifications section" },
        ],
    },
    {
        title: "Product Details / About",
        description: "The Product Details (description) block.",
        items: [
            { key: "section:product_details", label: "Show Product Details section" },
        ],
    },
];

// Block-level section keys (whole Quick Overview / Specifications / Product
// Details blocks). Used by the product editor to offer a "hide whole section"
// master toggle alongside the per-row toggles.
export const SECTION_KEYS = {
    quickOverview: "section:quick_overview",
    specifications: "section:specifications",
    productDetails: "section:product_details",
};

// The "Main View" (top product card) group, reused on the product editor where
// it sits above the per-row Quick Overview / Specifications groups.
export const MAIN_VIEW_GROUP = FIELD_VISIBILITY_GROUPS[0];

// A field is visible unless an admin explicitly stored `false` for its key.
export const isFieldVisible = (visibilityMap, key) =>
    !visibilityMap || visibilityMap[key] !== false;

// Drops empty/invalid keys and coerces values to booleans before saving.
export const normalizeFieldVisibility = (visibilityMap) => {
    if (!visibilityMap || typeof visibilityMap !== "object") return {};
    return Object.entries(visibilityMap).reduce((acc, [key, value]) => {
        const cleanKey = String(key).trim();
        if (cleanKey && !cleanKey.includes(".") && !cleanKey.startsWith("$")) {
            acc[cleanKey] = value !== false;
        }
        return acc;
    }, {});
};
