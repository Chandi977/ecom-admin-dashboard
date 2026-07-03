import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFormContext, Controller } from "react-hook-form";
import { MultiSelect } from "primereact/multiselect";
import { useAllProducts } from "../../../hooks/useProductQuery";

// Editors for the product's cross-sell links (buyItWith) and related/similar
// products. Both persist through the standard update payload
// (buyItWith / relatedProducts arrays of product ids).
export const RelatedProductsSection = () => {
    const { control } = useFormContext();
    const { id } = useParams();
    const { data: products, isLoading } = useAllProducts();

    // Exclude the product itself from its own related/buy-it-with options.
    const options = useMemo(() => {
        if (!Array.isArray(products)) return [];
        return products
            .filter((p) => String(p._id) !== String(id))
            .map((p) => {
                const modelInfo = [p.product_id, p.model].filter(Boolean).join(" / ");
                return {
                    label: modelInfo ? `${p.name} (${modelInfo})` : p.name,
                    value: p._id,
                    name: p.name,
                    product_id: p.product_id,
                    model: p.model,
                    media: p.media,
                    images: p.images,
                };
            });
    }, [products, id]);

    const itemTemplate = (option) => {
        const thumbnailKey = option?.media?.thumbnail || option?.images?.[0]?.image || option?.images?.[0];
        const imgUrl = thumbnailKey
            ? (thumbnailKey.startsWith("http")
                ? thumbnailKey
                : `${import.meta.env.VITE_API_URL || "https://server.prempackaging.com/premind/api"}/getImage?image=${thumbnailKey}`)
            : null;

        return (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                {imgUrl ? (
                    <img
                        src={imgUrl}
                        alt={option.name}
                        style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "4px", border: "1px solid #dee2e6", backgroundColor: "#fff" }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/36?text=No+Img";
                        }}
                    />
                ) : (
                    <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f3f5", borderRadius: "4px", border: "1px solid #dee2e6" }}>
                        <i className="pi pi-image" style={{ fontSize: "1rem", color: "#ccc" }}></i>
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: "13px", color: "#333" }}>{option.name}</span>
                    <span style={{ fontSize: "11px", color: "#6c757d" }}>
                        ID: {option.product_id || "--"} | Model: {option.model || "--"}
                    </span>
                </div>
            </div>
        );
    };

    const renderPicker = (name, label, help) => (
        <div className="p-field col-12" style={{ marginBottom: "1.5rem" }}>
            <label className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {label}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <MultiSelect
                        value={field.value || []}
                        options={options}
                        optionLabel="label"
                        optionValue="value"
                        itemTemplate={itemTemplate}
                        onChange={(e) => field.onChange(e.value)}
                        filter
                        display="chip"
                        placeholder={isLoading ? "Loading products..." : "Select products"}
                        style={{ width: "100%" }}
                        className="Input__Round"
                        panelStyle={{ maxWidth: "480px" }}
                    />
                )}
            />
            <small className="p-text-secondary" style={{ display: "block", marginTop: "0.25rem" }}>
                {help}
            </small>
        </div>
    );

    return (
        <div className="p-fluid p-formgrid grid">
            {renderPicker(
                "buyItWithIds",
                "Frequently Bought Together (Buy It With)",
                "Products suggested to be purchased alongside this item on the product page.",
            )}
            {renderPicker(
                "relatedProductIds",
                "Related / Similar Products",
                "Products shown in the 'related products' carousel on the storefront.",
            )}
        </div>
    );
};
