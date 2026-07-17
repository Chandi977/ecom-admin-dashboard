import React from "react";
import { Dialog } from "primereact/dialog";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";

export const ProductDetailsDialog = ({
    product,
    brandLookup,
    categoryLookup,
    onHide,
}) => {
    const brandName = typeof product?.brand === "object" ? product?.brand?.name : brandLookup[product?.brand] || product?.brand || "N/A";
    const categoryName = typeof product?.category === "object" ? product?.category?.name : categoryLookup[product?.category] || product?.category || "N/A";
    const subCategoryName = typeof product?.subCategory === "object" ? product?.subCategory?.name : product?.subCategory || "N/A";

    const resolveImgUrl = (key) => {
        if (!key) return "";
        if (key.startsWith("http")) return key;
        return `${import.meta.env.VITE_API_URL || "https://server.prempackaging.com/premind/api"}/getImage?image=${key}`;
    };

    return (
        <Dialog
            header={`Product Details: ${product.name}`}
            visible={true}
            style={{ width: "850px" }}
            modal
            onHide={onHide}
            className="p-fluid"
        >
            <Accordion activeIndex={0}>
                <AccordionTab header="Basic Information">
                    <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <p><strong>Product Name:</strong> {product.name}</p>
                            <p><strong>SKU / Product ID:</strong> {product.product_id || "N/A"}</p>
                            <p><strong>Slug / Route:</strong> {product.slug || "N/A"}</p>
                            <p><strong>Brand:</strong> {brandName}</p>
                            <p><strong>Category:</strong> {categoryName}</p>
                            <p><strong>Sub-Category:</strong> {subCategoryName}</p>
                        </div>
                        <div>
                            <p><strong>GST Rate:</strong> {product.gst || 18}%</p>
                            <p><strong>Delivery Time:</strong> {product.deliveryTime || "N/A"}</p>
                            <p><strong>Featured Flags:</strong> {product.top_product ? "Top Product" : ""} {product.deal_product ? "Deal of the Day" : ""}</p>
                            <p><strong>About the Item / Highlights:</strong> {product.aboutItem || "N/A"}</p>
                            <p><strong>Usage & Care Instructions:</strong> {product.usage || "N/A"}</p>
                        </div>
                    </div>
                    {product.description && (
                        <>
                            <Divider />
                            <strong>Product Description:</strong>
                            <div style={{ padding: "0.5rem", background: "#f8f9fa", borderRadius: "6px", overflowY: "auto", maxHeight: "150px", border: "1px solid #dee2e6" }} dangerouslySetInnerHTML={{ __html: product.description }} />
                        </>
                    )}
                </AccordionTab>

                <AccordionTab header="Category Specifications">
                    {product.specification && Object.keys(product.specification).length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 2rem" }}>
                            {Object.entries(product.specification).map(([key, val]) => (
                                <div key={key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f3f5", paddingBottom: "4px" }}>
                                    <span style={{ textTransform: "capitalize", fontWeight: 500, color: "#6c757d" }}>{key.replace("_", " ")}:</span>
                                    <span style={{ fontWeight: 600 }}>{String(val)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: "center", color: "#888" }}>No specific dimensions or specs stored.</p>
                    )}
                </AccordionTab>

                <AccordionTab header="Pricing & Tiers">
                    <p><strong>Base Reference Price:</strong> ₹{product.pricing?.basePrice || "N/A"}</p>
                    {product.pricing?.priceList && product.pricing.priceList.length > 0 ? (
                        <DataTable value={product.pricing.priceList} className="p-datatable-sm" responsiveLayout="scroll">
                            <Column field="number" header="Quantity break" />
                            <Column field="originalPrice" header="MRP" body={(row) => row.originalPrice ? `₹${row.originalPrice}` : "--"} />
                            <Column field="sellingPrice" header="Selling Price (SP)" body={(row) => `₹${row.sellingPrice}`} />
                            <Column field="discount" header="Discount" body={(row) => row.discount ? `${row.discount}%` : "--"} />
                            <Column field="packWeight" header="Pack Weight (kg)" />
                            <Column field="stockQuantity" header="Stock" />
                        </DataTable>
                    ) : (
                        <p style={{ textAlign: "center", color: "#888" }}>No price list breaks defined.</p>
                    )}
                </AccordionTab>

                <AccordionTab header="Inventory & Warehouse">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                        <div style={{ textAlign: "center", padding: "1rem", background: "#f4fcf7", borderRadius: "8px", border: "1px solid #a3e635" }}>
                            <small style={{ color: "#22c55e", fontWeight: 600 }}>AVAILABLE</small>
                            <h3 style={{ margin: "5px 0 0", color: "#166534" }}>{product.inventory?.availableStock ?? 0}</h3>
                        </div>
                        <div style={{ textAlign: "center", padding: "1rem", background: "#fffbeb", borderRadius: "8px", border: "1px solid #fde047" }}>
                            <small style={{ color: "#d97706", fontWeight: 600 }}>RESERVED</small>
                            <h3 style={{ margin: "5px 0 0", color: "#92400e" }}>{product.inventory?.reservedStock ?? 0}</h3>
                        </div>
                        <div style={{ textAlign: "center", padding: "1rem", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fca5a5" }}>
                            <small style={{ color: "#ef4444", fontWeight: 600 }}>MINIMUM (ALERT)</small>
                            <h3 style={{ margin: "5px 0 0", color: "#991b1b" }}>{product.inventory?.minimumStock ?? 0}</h3>
                        </div>
                    </div>
                    {product.inventory?.warehouse && (
                        <p style={{ marginTop: "1rem" }}><strong>Warehouse Location:</strong> {product.inventory.warehouse}</p>
                    )}
                </AccordionTab>

                <AccordionTab header="Product Images & Media">
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        {product.media?.images && product.media.images.length > 0 ? (
                            product.media.images.map((img, i) => {
                                const isThumb = product.media?.thumbnail === img;
                                return (
                                    <div key={i} style={{ position: "relative", border: isThumb ? "2px solid #2196F3" : "1px solid #ccc", padding: "4px", borderRadius: "6px", background: "#fff" }}>
                                        <img src={resolveImgUrl(img)} alt={`Gallery ${i}`} style={{ width: "90px", height: "90px", objectFit: "contain" }} />
                                        {isThumb && (
                                            <span style={{ position: "absolute", top: "2px", left: "2px", fontSize: "8px", background: "#2196F3", color: "#fff", padding: "1px 3px", borderRadius: "3px", fontWeight: 700 }}>PRIMARY</span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ textAlign: "center", color: "#888", width: "100%" }}>No images uploaded.</p>
                        )}
                    </div>
                </AccordionTab>

                <AccordionTab header="SEO & Overview Fields">
                    <p><strong>Meta Title:</strong> {product.seo?.metaTitle || "N/A"}</p>
                    <p><strong>Meta Description:</strong> {product.seo?.metaDescription || "N/A"}</p>
                    <p><strong>Canonical URL:</strong> {product.seo?.canonicalUrl || "N/A"}</p>
                    <p><strong>Keywords:</strong> {product.seo?.keywords?.join(", ") || "None"}</p>
                    {product.seo?.schemaMarkup && (
                        <>
                            <strong>Schema Markup (JSON-LD):</strong>
                            <pre style={{ background: "#f8f9fa", padding: "0.5rem", borderRadius: "6px", border: "1px solid #dee2e6", overflowX: "auto" }}>{product.seo.schemaMarkup}</pre>
                        </>
                    )}
                    {product.seo?.overviewFields && product.seo.overviewFields.length > 0 && (
                        <>
                            <Divider />
                            <strong>Bullet Highlights:</strong>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", marginTop: "0.5rem" }}>
                                {product.seo.overviewFields.map((f, i) => (
                                    <div key={i} style={{ padding: "6px 12px", background: f.visible !== false ? "#f0fdf4" : "#f1f3f5", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: 500 }}>{f.label}:</span>
                                        <span style={{ fontWeight: 600 }}>{f.value || "--"} {f.visible === false && <small style={{ color: "#d97706" }}>(HIDDEN)</small>}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </AccordionTab>

                <AccordionTab header="Cross-Sell & Product Relations">
                    <p><strong>Related / Similar Products:</strong> {product.relatedProducts?.length || 0} items linked</p>
                    <p><strong>Frequently Bought Together (Buy It With):</strong> {product.buyItWith?.length || 0} items linked</p>
                </AccordionTab>
            </Accordion>
        </Dialog>
    );
};
