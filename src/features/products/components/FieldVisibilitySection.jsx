import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "primereact/checkbox";
import { FieldVisibilityGrid } from "../../../components/FieldVisibilityGrid";
import {
    MAIN_VIEW_GROUP,
    SECTION_KEYS,
    specVisibilityKey,
    labelFromSpecKey,
    isFieldVisible,
} from "../../../utils/fieldVisibility";

const HIDDEN_SPEC_KEYS = new Set(["attributes", "_id", "product", "createdAt", "updatedAt", "__v"]);

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const cardStyle = {
    background: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "1rem 1.25rem",
};

// Per-product control, laid out to mirror the real product page top-to-bottom:
// Main View card, then the Quick Overview / Specifications / Product Details
// sections with one checkbox per row that actually renders for THIS product.
// Main View items, Specification rows and the section toggles use the
// `field_visibility` map; individual Quick Overview rows reuse their existing
// `overview_fields[].visible` flag (also editable in the SEO section).
export const FieldVisibilitySection = () => {
    const { watch, setValue } = useFormContext();
    const visibility = watch("fieldVisibility") || {};
    const specification = watch("specification") || {};
    const overviewFields = watch("seo.overviewFields") || [];

    const toggleFv = (key, checked) => {
        setValue("fieldVisibility", { ...visibility, [key]: checked }, { shouldDirty: true });
    };

    const toggleOverviewRow = (index, checked) => {
        const next = overviewFields.map((field, i) => (i === index ? { ...field, visible: checked } : field));
        setValue("seo.overviewFields", next, { shouldDirty: true });
    };

    const specItems = useMemo(
        () =>
            Object.entries(specification)
                .filter(([key, value]) => !HIDDEN_SPEC_KEYS.has(key) && hasValue(value))
                .map(([key]) => ({ key: specVisibilityKey(key), label: labelFromSpecKey(key) })),
        [specification],
    );

    // Specifications + Product Details run through field_visibility (FieldVisibilityGrid).
    const specGroup = {
        title: "Specifications",
        description: specItems.length
            ? "Each row in the Specifications grid. Untick the top box to hide the whole grid."
            : "No specification values yet — fill in the Dimensions / Specifications section to control rows here.",
        items: [
            { key: SECTION_KEYS.specifications, label: "Show whole Specifications section" },
            ...specItems,
        ],
    };

    const detailsGroup = {
        title: "Product Details / About",
        description: "The Product Details (description) block on the right.",
        items: [{ key: SECTION_KEYS.productDetails, label: "Show Product Details section" }],
    };

    const quickOverviewSectionShown = isFieldVisible(visibility, SECTION_KEYS.quickOverview);

    return (
        <div style={{ padding: "0.5rem 0" }}>
            <p style={{ margin: "0 0 1.25rem", fontSize: "12px", color: "#6c757d" }}>
                Tick to <strong>show</strong> a field on this product's public page, untick to <strong>hide</strong> it.
                Everything is shown by default. Sections are laid out the same order as the live page. Category-level
                defaults still apply to anything you leave untouched here.
            </p>

            {/* 1. Main View (top card) */}
            <div style={{ marginBottom: "1.25rem" }}>
                <FieldVisibilityGrid groups={[MAIN_VIEW_GROUP]} value={visibility} onToggle={toggleFv} />
            </div>

            {/* 2. Quick Overview rows (reuse overview_fields[].visible) */}
            <div style={{ ...cardStyle, marginBottom: "1.25rem" }}>
                <h5 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 0.25rem" }}>Quick Overview</h5>
                <p style={{ margin: "0 0 0.75rem", fontSize: "11px", color: "#6c757d" }}>
                    Rows shown next to the image and in the lower Quick Overview list (also editable in the SEO section).
                </p>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "0.5rem 1.5rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Checkbox
                            inputId="fv-section-quick-overview"
                            checked={quickOverviewSectionShown}
                            onChange={(e) => toggleFv(SECTION_KEYS.quickOverview, e.checked)}
                        />
                        <label
                            htmlFor="fv-section-quick-overview"
                            style={{ fontSize: "13px", cursor: "pointer", fontWeight: 600, color: quickOverviewSectionShown ? "#212529" : "#adb5bd" }}
                        >
                            Show whole Quick Overview section
                        </label>
                    </div>

                    {overviewFields.map((field, index) => {
                        const checked = field?.visible !== false;
                        const label = String(field?.label || "").trim() || `Row ${index + 1}`;
                        return (
                            <div key={field?.key || `qo-${index}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Checkbox
                                    inputId={`fv-qo-${index}`}
                                    checked={checked}
                                    disabled={!quickOverviewSectionShown}
                                    onChange={(e) => toggleOverviewRow(index, e.checked)}
                                />
                                <label
                                    htmlFor={`fv-qo-${index}`}
                                    style={{ fontSize: "13px", cursor: "pointer", color: checked && quickOverviewSectionShown ? "#212529" : "#adb5bd" }}
                                >
                                    {label}
                                </label>
                            </div>
                        );
                    })}
                </div>
                {overviewFields.length === 0 && (
                    <p style={{ margin: "0.5rem 0 0", fontSize: "11px", color: "#adb5bd" }}>
                        This product has no custom Quick Overview rows — they are auto-generated. Add rows in the SEO
                        section to control them individually.
                    </p>
                )}
            </div>

            {/* 3. Specifications + 4. Product Details */}
            <FieldVisibilityGrid groups={[specGroup, detailsGroup]} value={visibility} onToggle={toggleFv} />
        </div>
    );
};
