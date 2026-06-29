export const slugifyOverviewFieldKey = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

export const createOverviewField = (overrides = {}) => ({
    key: "",
    label: "",
    value: "",
    ...overrides,
});

export const normalizeOverviewFields = (fields, { includeValue = false } = {}) => {
    if (!Array.isArray(fields)) {
        return [];
    }

    return fields
        .map((field, index) => {
            const label = String(field?.label || "").trim();
            const key = String(field?.key || "").trim() || slugifyOverviewFieldKey(label) || `field_${index + 1}`;
            const normalizedField = {
                key,
                label,
            };

            if (includeValue) {
                normalizedField.value = String(field?.value || "").trim();
            }

            return normalizedField;
        })
        .filter((field) => (includeValue ? field.label || field.value : field.label));
};

export const mergeOverviewFieldsWithTemplate = (templateFields, currentFields) => {
    const normalizedTemplate = normalizeOverviewFields(templateFields);
    const normalizedCurrent = normalizeOverviewFields(currentFields, { includeValue: true });

    if (!normalizedTemplate.length) {
        return normalizedCurrent;
    }

    const currentFieldMap = new Map(normalizedCurrent.map((field) => [field.key, field]));
    const templateKeys = new Set(normalizedTemplate.map((field) => field.key));

    const mergedTemplateFields = normalizedTemplate.map((field) => ({
        key: field.key,
        label: field.label,
        value: currentFieldMap.get(field.key)?.value || "",
    }));

    const customFields = normalizedCurrent.filter((field) => !templateKeys.has(field.key));

    return [...mergedTemplateFields, ...customFields];
};
