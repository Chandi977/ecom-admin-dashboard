// Label products encode the labels-per-roll quantity in the model by
// convention: "CL_65x70_250" = base model "CL_65x70" with 250 labels per roll.
// Parsed at display time only (mirrors the storefront's utils/labelVariants.ts)
// so the admin can see the quantity without any schema/data change.

// "CL_65x70_250" -> { baseModel: "CL_65x70", labelQty: 250 }; null when the
// model doesn't end in "_<digits>" (e.g. "CL_65x70" itself).
export const parseLabelModel = (model) => {
    const text = String(model ?? "").trim();
    const match = text.match(/^(.+)_(\d+)$/);
    if (!match) return null;
    const labelQty = Number(match[2]);
    if (!Number.isFinite(labelQty) || labelQty <= 0) return null;
    return { baseModel: match[1], labelQty };
};
