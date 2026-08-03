import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema } from "../../schemas/productSchema";
import { useCreateProduct } from "../../hooks/useProductQuery";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { BreadCrumb } from "primereact/breadcrumb";
import { BasicInfoSection } from "./components/BasicInfoSection";
import { MediaUploadSection } from "./components/MediaUploadSection";
import { PricingSection } from "./components/PricingSection";
import { InventorySection } from "./components/InventorySection";
import { DynamicSpecificationSection } from "./components/DynamicSpecificationSection";
import { SEOSection } from "./components/SEOSection";
import { FieldVisibilitySection } from "./components/FieldVisibilitySection";
import { can } from "../../rbac/permissions";

export const ProductCreate = () => {
    const history = useHistory();
    const location = useLocation();
    // POST /product/create needs product:create. The SEO role only holds
    // seo:write, so it never gets a draft form it could not submit.
    const canCreate = can("product:create");

    const createMutation = useCreateProduct();

    // Optional pre-fill when arriving from a specific subcategory (or category).
    const presetParams = new URLSearchParams(location.search);
    const presetCategoryId = presetParams.get("categoryId") || "";
    const presetSubCategoryId = presetParams.get("subCategoryId") || "";

    const breadItems = [
        { label: "Home", url: "/" },
        { label: "Products", url: "/products" },
        { label: "Add" },
    ];
    const home = { icon: "pi pi-home", url: "/" };

    const methods = useForm({
        resolver: zodResolver(productFormSchema),
        mode: "onBlur",
        defaultValues: {
            name: "",
            product_id: "",
            slug: "",
            brandId: "",
            categoryId: presetCategoryId,
            subCategoryId: presetSubCategoryId,
            gst: "",
            common_overrides: {},
            description: "",
            aboutItem: "",
            usage: "",
            deliveryTime: "",
            top_product: false,
            deal_product: false,
            media: {
                thumbnail: "",
                images: [],
                videos: [],
                documents: [],
            },
            pricing: {
                basePrice: undefined,
                priceList: [
                    {
                        number: 1,
                        sellingPrice: 0,
                        originalPrice: undefined,
                        discount: 0,
                        packWeight: undefined,
                        stockQuantity: 0,
                    },
                ],
            },
            inventory: {
                availableStock: 0,
                reservedStock: 0,
                minimumStock: 0,
                warehouse: "",
            },
            specification: {},
            seo: {
                metaTitle: "",
                metaDescription: "",
                canonicalUrl: "",
                keywords: [],
                schemaMarkup: "",
                overviewFields: [],
            },
            fieldVisibility: {},
            buyItWithIds: [],
            relatedProductIds: [],
        },
    });

    const { handleSubmit, formState: { errors, isDirty, isSubmitting } } = methods;

    const onSubmit = (values) => {
        // Per-product overrides for the category's common fields. Blank entries are
        // dropped so the product inherits those category defaults.
        const commonOverrides = Object.fromEntries(
            Object.entries(values.common_overrides || {}).filter(
                ([, v]) => v !== "" && v !== undefined && v !== null,
            ),
        );
        const apiPayload = {
            // Inherited common-field overrides first; explicit fields below win.
            ...commonOverrides,
            // Root-level flat fields (legacy compatibility)
            name: values.name,
            product_id: values.product_id,
            slug: values.slug,
            brand: values.brandId,
            category: values.categoryId,
            sub_category: values.subCategoryId || undefined,
            // Blank = inherit the category's GST (omitted from the payload).
            gst: values.gst === "" || values.gst === undefined || values.gst === null ? undefined : values.gst,
            description: values.description,
            aboutItem: values.aboutItem,
            usage: values.usage,
            delivery_time: values.deliveryTime,
            top_product: values.top_product,
            deal_product: values.deal_product,
            images: values.media.images.map(img => ({ image: img })),
            price: values.pricing.basePrice,
            priceList: values.pricing.priceList.map(tier => ({
                number: tier.number,
                price: tier.sellingPrice,
                original_price: tier.originalPrice,
                stock_quantity: tier.stockQuantity,
                discount: tier.discount,
                pack_weight: tier.packWeight,
            })),
            stock_quantity: values.inventory.availableStock,
            ...values.specification,
            meta_title: values.seo.metaTitle,
            meta_description: values.seo.metaDescription,
            overview_fields: values.seo.overviewFields,
            field_visibility: values.fieldVisibility || {},
            buyItWith: values.buyItWithIds,
            relatedProducts: values.relatedProductIds,

            // Nested collection objects (normalized architecture)
            specification: values.specification,
            pricing: {
                basePrice: values.pricing.basePrice,
                priceList: values.pricing.priceList.map(tier => ({
                    number: tier.number,
                    price: tier.sellingPrice,
                    original_price: tier.originalPrice,
                    discount: tier.discount,
                    pack_weight: tier.packWeight,
                    stock_quantity: tier.stockQuantity,
                })),
            },
            inventory: {
                availableStock: values.inventory.availableStock,
                reservedStock: values.inventory.reservedStock,
                minimumStock: values.inventory.minimumStock,
                warehouse: values.inventory.warehouse,
            },
            media: {
                thumbnail: values.media.thumbnail,
                gallery: values.media.images,
                videos: values.media.videos || [],
                documents: values.media.documents || [],
            },
            seo: {
                meta_title: values.seo.metaTitle,
                meta_description: values.seo.metaDescription,
                canonical: values.seo.canonicalUrl,
                schema_markup: values.seo.schemaMarkup,
                keywords: values.seo.keywords,
                overview_fields: values.seo.overviewFields,
            }
        };

        createMutation.mutate(apiPayload, {
            onSuccess: () => {
                history.push("/products");
            },
        });
    };

    const handleCancel = () => {
        if (isDirty) {
            if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
                history.push("/products");
            }
        } else {
            history.push("/products");
        }
    };

    const errorCount = Object.keys(errors).length +
        (errors.media ? 1 : 0) +
        (errors.pricing ? 1 : 0) +
        (errors.inventory ? 1 : 0) +
        (errors.seo ? 1 : 0);

    // Gate the whole entry point: without product:create there is nothing on this
    // page a user could usefully do.
    if (!canCreate) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #dee2e6" }}>
                <i className="pi pi-lock" style={{ fontSize: "2.5rem", color: "#94a3b8", marginBottom: "1rem" }}></i>
                <h3>Creating products is not available for your role</h3>
                <p style={{ color: "#6c757d" }}>
                    If you handle SEO, open an existing product instead — its SEO section and slug stay editable for you.
                </p>
                <Button label="Back to catalog" className="p-button-secondary mt-3" onClick={() => history.push("/products")} />
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ position: "relative", paddingBottom: "80px" }}>
                <div className="Page__Header" style={{ marginBottom: "2rem" }}>
                    <div>
                        <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Add New Product</h2>
                        <BreadCrumb model={breadItems} home={home} />
                    </div>
                </div>

                <div className="card" style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <Accordion multiple activeIndex={[0]}>
                        <AccordionTab header="Section 1: Basic Information">
                            <BasicInfoSection />
                        </AccordionTab>
                        <AccordionTab header="Section 2: Product Images & Media">
                            <MediaUploadSection />
                        </AccordionTab>
                        <AccordionTab header="Section 3: Pricing & Quantity Tiers">
                            <PricingSection />
                        </AccordionTab>
                        <AccordionTab header="Section 4: Inventory Management">
                            <InventorySection />
                        </AccordionTab>
                        <AccordionTab header="Section 5: Dimensions & Dynamic Specifications">
                            <DynamicSpecificationSection />
                        </AccordionTab>
                        <AccordionTab header="Section 6: Search Engine Optimization (SEO)">
                            <SEOSection />
                        </AccordionTab>
                        <AccordionTab header="Section 7: Storefront Field Visibility">
                            <FieldVisibilitySection />
                        </AccordionTab>
                    </Accordion>
                </div>

                <div
                    style={{
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "70px",
                        background: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(10px)",
                        borderTop: "1px solid #dee2e6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 2rem",
                        zIndex: 1000,
                        boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <div>
                        {errorCount > 0 && (
                            <span style={{ color: "#ef4444", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <i className="pi pi-exclamation-circle"></i>
                                Please fix {errorCount} validation error(s) before saving.
                            </span>
                        )}
                        {errorCount === 0 && isDirty && (
                            <span style={{ color: "#22c55e", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <i className="pi pi-check-circle"></i>
                                Unsaved draft details changed.
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <Button
                            type="button"
                            label="Cancel"
                            className="p-button-secondary p-button-outlined"
                            onClick={handleCancel}
                            style={{ width: "120px", borderRadius: "6px" }}
                            disabled={isSubmitting || createMutation.isLoading}
                        />
                        <Button
                            type="submit"
                            label={isSubmitting || createMutation.isLoading ? "Saving..." : "Save Product"}
                            className="p-button-primary"
                            icon={isSubmitting || createMutation.isLoading ? "pi pi-spin pi-spinner" : "pi pi-save"}
                            style={{ width: "150px", borderRadius: "6px" }}
                            disabled={isSubmitting || createMutation.isLoading}
                        />
                    </div>
                </div>
            </form>
        </FormProvider>
    );
};
