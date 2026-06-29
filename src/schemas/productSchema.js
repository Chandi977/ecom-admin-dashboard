import { z } from "zod";

export const priceListItemSchema = z.object({
    number: z.preprocess((val) => Number(val), z.number().int().positive("Quantity must be a positive integer")),
    sellingPrice: z.preprocess((val) => Number(val), z.number().positive("Selling price must be greater than 0")),
    originalPrice: z.preprocess((val) => (val === "" || val === undefined) ? undefined : Number(val), z.number().positive("Original price must be greater than 0").optional()),
    discount: z.preprocess((val) => (val === "" || val === undefined) ? 0 : Number(val), z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").optional()),
    packWeight: z.preprocess((val) => (val === "" || val === undefined) ? undefined : Number(val), z.number().positive("Weight must be positive").optional()),
    stockQuantity: z.preprocess((val) => Number(val), z.number().min(0, "Stock quantity cannot be negative")),
});

export const overviewFieldSchema = z.object({
    key: z.string().min(1, "Key is required"),
    label: z.string().min(1, "Label is required"),
    value: z.string().optional(),
    visible: z.boolean().default(true),
});

export const productFormSchema = z.object({
    name: z.string().min(1, "Product name is required").max(100, "Product name too long"),
    product_id: z.string().min(1, "SKU/Product ID is required").regex(/^[A-Za-z0-9-_]+$/, "SKU can only contain letters, numbers, hyphens and underscores"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores"),
    brandId: z.string().min(1, "Brand is required"),
    categoryId: z.string().min(1, "Category is required"),
    subCategoryId: z.string().optional(),
    // GST is optional: blank means "inherit the category's GST". An empty string
    // becomes undefined here (not 0) so it is omitted from the payload downstream.
    gst: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().min(0, "GST cannot be negative").optional(),
    ),
    // Per-product overrides for category common fields (key -> value). Blank
    // entries are stripped before submit so the product inherits those defaults.
    common_overrides: z.record(z.any()).optional(),
    description: z.string().optional(),
    aboutItem: z.string().optional(),
    usage: z.string().optional(),
    deliveryTime: z.string().optional(),
    top_product: z.boolean().default(false),
    deal_product: z.boolean().default(false),
    
    media: z.object({
        thumbnail: z.string().min(1, "Thumbnail image is required"),
        images: z.array(z.string()).min(1, "At least one gallery image is required"),
        videos: z.array(z.string()).optional(),
        documents: z.array(z.string()).optional(),
    }),

    pricing: z.object({
        basePrice: z.preprocess((val) => (val === "" || val === undefined) ? undefined : Number(val), z.number().min(0, "Base price cannot be negative").optional()),
        priceList: z.array(priceListItemSchema).min(1, "At least one pricing tier is required"),
    }),

    inventory: z.object({
        availableStock: z.preprocess((val) => Number(val), z.number().min(0, "Available stock cannot be negative")),
        reservedStock: z.preprocess((val) => (val === "" || val === undefined) ? 0 : Number(val), z.number().min(0, "Reserved stock cannot be negative").default(0)),
        minimumStock: z.preprocess((val) => (val === "" || val === undefined) ? 0 : Number(val), z.number().min(0, "Minimum stock cannot be negative").default(0)),
        warehouse: z.string().optional(),
    }),

    specification: z.record(z.any()),

    seo: z.object({
        metaTitle: z.string().max(60, "Meta title should be maximum 60 characters").optional(),
        metaDescription: z.string().max(160, "Meta description should be maximum 160 characters").optional(),
        canonicalUrl: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
        keywords: z.array(z.string()).default([]),
        schemaMarkup: z.string().optional(),
        overviewFields: z.array(overviewFieldSchema).default([]),
    }),

    // Storefront field-visibility map (key -> boolean). A missing key means the
    // field is shown; only an explicit `false` hides it on the product page.
    fieldVisibility: z.record(z.boolean()).default({}),

    buyItWithIds: z.array(z.string()).default([]),
    relatedProductIds: z.array(z.string()).default([]),
});
