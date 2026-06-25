export interface IBrand {
    _id: string;
    name: string;
    slug: string;
    brand_id?: string;
    image?: string;
}

export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    category_id?: string;
    gst?: number;
    meta_title?: string;
    meta_description?: string;
    overview_fields?: Array<{ label: string; key?: string }>;
}

export interface ISubCategory {
    _id: string;
    name: string;
    slug: string;
    category?: string;
    sub_category_id?: string;
    gst?: number;
}

export interface IOverviewField {
    key: string;
    label: string;
    value?: string;
    visible?: boolean;
}

export interface ISEO {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    keywords?: string[];
    schemaMarkup?: string;
    overviewFields: IOverviewField[];
}

export interface IProductMedia {
    thumbnail: string;
    images: string[];
    videos?: string[];
    documents?: string[];
}

export interface IInventory {
    availableStock: number;
    reservedStock: number;
    minimumStock: number;
    warehouse?: string;
}

export interface IPriceListItem {
    number: number;         // quantity tier
    sellingPrice: number;   // SP
    originalPrice?: number; // MRP
    discount?: number;      // discount percentage or amount
    packWeight?: number;    // pack weight in kg
    stockQuantity: number;  // stock quantity for this tier
}

export interface IPricing {
    basePrice?: number;
    priceList: IPriceListItem[];
}

export interface IProductSpecification {
    length?: number;
    width?: number;
    height?: number;
    length_inch?: number;
    length_mm?: number;
    breadth_inch?: number;
    breadth_mm?: number;
    height_inch?: number;
    height_mm?: number;
    size_inch?: string;
    size_mm?: string;
    flap_mm?: number;
    thickness?: number;
    thickness_micron?: number;
    gusset?: number;
    print?: string;
    label_in_roll?: number;
    core_size?: number;
    pouch_weight?: number;
    adhesive?: string;
    material?: string;
    color?: string;
    // Any other custom dynamic fields
    [key: string]: any;
}

export interface IProduct {
    _id: string;
    product_id: string; // SKU
    name: string;
    slug: string;
    brand?: string | IBrand;
    category?: string | ICategory;
    subCategory?: string | ISubCategory;
    gst?: number;
    description?: string;
    aboutItem?: string;
    usage?: string;
    deliveryTime?: string;
    top_product?: boolean;
    deal_product?: boolean;
    specification: IProductSpecification;
    pricing: IPricing;
    inventory: IInventory;
    media: IProductMedia;
    seo: ISEO;
    buyItWith?: string[] | IProduct[];
    relatedProducts?: string[] | IProduct[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IProductFormData extends Omit<IProduct, '_id' | 'brand' | 'category' | 'subCategory' | 'buyItWith' | 'relatedProducts'> {
    brandId: string;
    categoryId: string;
    subCategoryId: string;
    buyItWithIds: string[];
    relatedProductIds: string[];
}
