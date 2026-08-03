import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, seoOnlyProductFormSchema } from "../../schemas/productSchema";
import { useProduct, useUpdateProduct } from "../../hooks/useProductQuery";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { BreadCrumb } from "primereact/breadcrumb";
import { ProgressSpinner } from "primereact/progressspinner";
import { BasicInfoSection } from "./components/BasicInfoSection";
import { MediaUploadSection } from "./components/MediaUploadSection";
import { PricingSection } from "./components/PricingSection";
import { InventorySection } from "./components/InventorySection";
import { DynamicSpecificationSection } from "./components/DynamicSpecificationSection";
import { SEOSection } from "./components/SEOSection";
import { FieldVisibilitySection } from "./components/FieldVisibilitySection";
import { RelatedProductsSection } from "./components/RelatedProductsSection";
import { can, isSeoOnlyRole } from "../../rbac/permissions";

export const ProductEdit = () => {
    const { id } = useParams();
    const history = useHistory();
    // The SEO role can save this form, but PUT /product/update strips everything
    // outside SEO_PRODUCT_FIELDS (id, slug, meta_*, overview_fields, seo). Showing
    // the other sections as editable would look like a bug, so they are omitted.
    const canUpdate = can("product:update");
    const seoOnly = isSeoOnlyRole();
    const canSave = canUpdate || seoOnly;

    const { data: apiResponse, isLoading, isError } = useProduct(id);
    const updateMutation = useUpdateProduct();

    const breadItems = [
        { label: "Home", url: "/" },
        { label: "Products", url: "/products" },
        { label: "Edit" },
    ];
    const home = { icon: "pi pi-home", url: "/" };

    const methods = useForm({
        // SEO-only users validate against the relaxed schema: the full one demands a
        // thumbnail, a gallery image and a pricing tier, which they cannot supply
        // because those sections are hidden from them. See seoOnlyProductFormSchema.
        resolver: zodResolver(seoOnly ? seoOnlyProductFormSchema : productFormSchema),
        mode: "onBlur",
    });

    const { handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = methods;

    useEffect(() => {
        if (apiResponse?.success && apiResponse?.data) {
            const prod = apiResponse.data;

            const formValues = {
                name: prod.name || "",
                product_id: prod.product_id || "",
                slug: prod.slug || "",
                brandId: typeof prod.brand === "object" ? prod.brand?._id : prod.brand || "",
                categoryId: typeof prod.category === "object" ? prod.category?._id : prod.category || "",
                subCategoryId: typeof prod.subCategory === "object" ? prod.subCategory?._id : prod.subCategory || typeof prod.sub_category === "object" ? prod.sub_category?._id : prod.sub_category || "",
                gst: prod.gst ?? "",
                model: prod.model || "",
                hsn_code: prod.hsn_code || "",
                sac_code: prod.sac_code || "",
                tax_category: prod.tax_category || "",
                common_overrides: {},
                // Raw product (own values only — fetched with inherit:false) so
                // BasicInfoSection can pre-fill overrides just for the category's
                // common keys. Stripped by zod before submit, never sent.
                __rawProduct: prod,
                description: prod.description || "",
                aboutItem: prod.aboutItem || "",
                usage: prod.usage || "",
                deliveryTime: prod.deliveryTime || prod.delivery_time || "",
                top_product: !!prod.top_product,
                deal_product: !!prod.deal_product,
                
                media: {
                    thumbnail: prod.media?.thumbnail || prod.images?.[0]?.image || prod.images?.[0] || "",
                    images: prod.media?.images || prod.images?.map((im) => typeof im === "object" ? im.image : im) || [],
                    videos: prod.media?.videos || [],
                    documents: prod.media?.documents || [],
                },

                pricing: {
                    basePrice: prod.pricing?.basePrice ?? prod.price,
                    priceList: prod.pricing?.priceList?.map((tier) => ({
                        number: tier.number,
                        // Support both the current (sellingPrice/price) and legacy (SP/MRP) tier shapes.
                        sellingPrice: tier.sellingPrice ?? tier.price ?? tier.SP,
                        originalPrice: tier.originalPrice ?? tier.original_price ?? tier.MRP,
                        discount: tier.discount || 0,
                        packWeight: tier.packWeight ?? tier.pack_weight,
                        stockQuantity: tier.stockQuantity ?? tier.stock_quantity,
                    })) || prod.priceList?.map((tier) => ({
                        number: tier.number,
                        sellingPrice: tier.price ?? tier.SP ?? tier.sellingPrice,
                        originalPrice: tier.original_price ?? tier.MRP ?? tier.originalPrice,
                        discount: tier.discount || 0,
                        packWeight: tier.pack_weight,
                        stockQuantity: tier.stock_quantity,
                    })) || [],
                },

                inventory: {
                    availableStock: prod.inventory?.availableStock ?? prod.stock_quantity ?? 0,
                    reservedStock: prod.inventory?.reservedStock ?? 0,
                    minimumStock: prod.inventory?.minimumStock ?? 0,
                    warehouse: prod.inventory?.warehouse || "",
                },

                specification: {
                    length: prod.specification?.length ?? prod.length,
                    width: prod.specification?.width ?? prod.width,
                    height: prod.specification?.height ?? prod.height,
                    length_inch: prod.specification?.length_inch ?? prod.length_inch,
                    length_mm: prod.specification?.length_mm ?? prod.length_mm,
                    breadth_inch: prod.specification?.breadth_inch ?? prod.breadth_inch,
                    breadth_mm: prod.specification?.breadth_mm ?? prod.breadth_mm,
                    height_inch: prod.specification?.height_inch ?? prod.height_inch,
                    height_mm: prod.specification?.height_mm ?? prod.height_mm,
                    size_inch: prod.specification?.size_inch ?? prod.size_inch,
                    size_mm: prod.specification?.size_mm ?? prod.size_mm,
                    flap_mm: prod.specification?.flap_mm ?? prod.flap_mm,
                    thickness: prod.specification?.thickness ?? prod.thickness,
                    thickness_micron: prod.specification?.thickness_micron ?? prod.thickness_micron,
                    gusset: prod.specification?.gusset ?? prod.gusset,
                    print: prod.specification?.print ?? prod.print,
                    label_in_roll: prod.specification?.label_in_roll ?? prod.label_in_roll ?? prod.label_in_role,
                    core_size: prod.specification?.core_size ?? prod.core_size,
                    pouch_weight: prod.specification?.pouch_weight ?? prod.pouch_weight,
                    adhesive: prod.specification?.adhesive ?? prod.adhesive,
                    material: prod.specification?.material ?? prod.material,
                    color: prod.specification?.color ?? prod.color,
                },
                seo: {
                    metaTitle: prod.seo?.meta_title ?? prod.seo?.metaTitle ?? prod.meta_title ?? "",
                    metaDescription: prod.seo?.meta_description ?? prod.seo?.metaDescription ?? prod.meta_description ?? "",
                    canonicalUrl: prod.seo?.canonical ?? prod.seo?.canonicalUrl ?? "",
                    keywords: prod.seo?.keywords ?? prod.keywords ?? [],
                    schemaMarkup: prod.seo?.schema_markup ?? prod.seo?.schemaMarkup ?? "",
                    overviewFields: prod.seo?.overview_fields ?? prod.seo?.overviewFields ?? prod.overview_fields ?? [],
                },

                fieldVisibility: prod.field_visibility && typeof prod.field_visibility === "object" ? prod.field_visibility : {},

                buyItWithIds: prod.buyItWith?.map((b) => typeof b === "object" ? b._id : b) || [],
                relatedProductIds: prod.relatedProducts?.map((r) => typeof r === "object" ? r._id : r) || [],
            };

            reset(formValues);
        }
    }, [apiResponse, reset]);

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
            model: values.model || undefined,
            hsn_code: values.hsn_code || undefined,
            sac_code: values.sac_code || undefined,
            tax_category: values.tax_category || undefined,
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

        // Stay on the edit page after saving. useUpdateProduct already toasts
        // success and invalidates the detail query, which refetches and re-syncs
        // the form (clearing the "unsaved changes" state) without navigating away.
        updateMutation.mutate({ id, data: apiPayload });
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

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", flexDirection: "column", gap: "1rem" }}>
                <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                <span style={{ color: "#6c757d", fontWeight: 500 }}>Loading product catalog...</span>
            </div>
        );
    }

    if (isError || !apiResponse?.success) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #dee2e6" }}>
                <i className="pi pi-exclamation-triangle" style={{ fontSize: "3rem", color: "#ef4444", marginBottom: "1rem" }}></i>
                <h3>Error Loading Product</h3>
                <p style={{ color: "#6c757d" }}>{apiResponse?.message || "Could not retrieve details for this SKU ID."}</p>
                <Button label="Back to catalog" className="p-button-secondary mt-3" onClick={() => history.push("/products")} />
            </div>
        );
    }

    const errorCount = Object.keys(errors).length +
        (errors.media ? 1 : 0) +
        (errors.pricing ? 1 : 0) +
        (errors.inventory ? 1 : 0) +
        (errors.seo ? 1 : 0);

    // Validation covers the whole product, so an SEO-only user can still be
    // blocked by a section that is hidden from them. Name those sections.
    const hiddenSectionErrors = [
        errors.media && "images",
        errors.pricing && "pricing",
        errors.inventory && "inventory",
        errors.specification && "specifications",
    ].filter(Boolean);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ position: "relative", paddingBottom: "80px" }}>
                <div className="Page__Header" style={{ marginBottom: "2rem" }}>
                    <div>
                        <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Edit Product</h2>
                        <BreadCrumb model={breadItems} home={home} />
                    </div>
                </div>

                {seoOnly && (
                    <div
                        className="card"
                        style={{ background: "#f8fafc", border: "1px solid #dee2e6", borderRadius: "8px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}
                    >
                        <span style={{ fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <i className="pi pi-info-circle" style={{ color: "#2196F3" }} />
                            SEO editing mode
                        </span>
                        <small className="p-text-secondary" style={{ display: "block", marginTop: "0.35rem" }}>
                            You can edit the SEO section and the product slug. Pricing, inventory, media,
                            specifications, field visibility and related products belong to the catalog team and are
                            hidden here — the server discards them for your role anyway.
                        </small>
                    </div>
                )}

                <div className="card" style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <Accordion multiple activeIndex={[0]}>
                        <AccordionTab header="Section 1: Basic Information">
                            <BasicInfoSection readOnly={seoOnly} />
                        </AccordionTab>
                        {!seoOnly && (
                        <AccordionTab header="Section 2: Product Images & Media">
                            <MediaUploadSection />
                        </AccordionTab>
                        )}
                        {!seoOnly && (
                        <AccordionTab header="Section 3: Pricing & Quantity Tiers">
                            <PricingSection />
                        </AccordionTab>
                        )}
                        {!seoOnly && (
                        <AccordionTab header="Section 4: Inventory Management">
                            <InventorySection />
                        </AccordionTab>
                        )}
                        {!seoOnly && (
                        <AccordionTab header="Section 5: Dimensions & Dynamic Specifications">
                            <DynamicSpecificationSection />
                        </AccordionTab>
                        )}
                        <AccordionTab header="Section 6: Search Engine Optimization (SEO)">
                            <SEOSection />
                        </AccordionTab>
                        {!seoOnly && (
                        <AccordionTab header="Section 7: Storefront Field Visibility">
                            <FieldVisibilitySection />
                        </AccordionTab>
                        )}
                        {!seoOnly && (
                        <AccordionTab header="Section 8: Related Products & Buy It With">
                            <RelatedProductsSection />
                        </AccordionTab>
                        )}
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
                                {/* The form validates the whole product, including the
                                    hidden non-SEO sections — say so rather than pointing
                                    an SEO user at fields they cannot see. */}
                                {seoOnly && hiddenSectionErrors.length > 0
                                    ? `This product is incomplete outside SEO (${hiddenSectionErrors.join(", ")}). A catalog editor has to fill that in before it can be saved.`
                                    : `Please fix ${errorCount} validation error(s) before saving.`}
                            </span>
                        )}
                        {errorCount === 0 && isDirty && (
                            <span style={{ color: "#22c55e", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <i className="pi pi-check-circle"></i>
                                You have unsaved changes.
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
                            disabled={isSubmitting || updateMutation.isLoading}
                        />
                        {canSave && (
                        <Button
                            type="submit"
                            label={isSubmitting || updateMutation.isLoading ? "Saving..." : seoOnly ? "Save SEO Changes" : "Save Changes"}
                            className="p-button-primary"
                            icon={isSubmitting || updateMutation.isLoading ? "pi pi-spin pi-spinner" : "pi pi-save"}
                            style={{ width: seoOnly ? "190px" : "150px", borderRadius: "6px" }}
                            disabled={isSubmitting || updateMutation.isLoading}
                        />
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
};
