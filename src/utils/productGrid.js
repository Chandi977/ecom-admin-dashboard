// Shared logic for the admin "Excel" product grid + the paste/CSV importer.
//
// The grid renders one row PER PACK SIZE (a product's pricing.priceList tier),
// with product-level columns shown on the product's first tier row. Spec columns
// are derived per category so a Corrugated Box shows L/B/H (inch + mm) while a
// Label shows core size / labels-in-roll, etc. Nothing here talks to the network
// — components call productService with the payloads these helpers build.

import { buildSchemaFromCategory, humanizeSpecKey } from "./specificationSchemas";

// Flat spec fields the backend stores on a product (mirrors SPEC_FIELD_KEYS in
// ecom-backend-optimized product-catalog.service.ts). Used to detect which spec
// columns a loaded product set actually populates.
export const SPEC_FIELD_KEYS = [
    "length_inch", "breadth_inch", "height_inch",
    "length_mm", "breadth_mm", "height_mm",
    "length", "width", "height",
    "size_inch", "size_mm",
    "thickness_micron", "thickness", "gusset", "flap_mm",
    "core_size", "label_in_roll", "pouch_weight",
    "material", "color", "print", "adhesive",
];

// Preferred left-to-right order for spec columns when present. Anything not in
// this list is appended in discovery order after these.
const SPEC_COLUMN_ORDER = [
    "length_inch", "breadth_inch", "height_inch",
    "length_mm", "breadth_mm", "height_mm",
    "length", "width", "height",
    "size_inch", "size_mm",
    "thickness_micron", "thickness", "gusset", "flap_mm",
    "core_size", "label_in_roll",
    "material", "color", "print", "adhesive", "pouch_weight",
];

const NUMERIC_SPEC_KEYS = new Set([
    "length_inch", "breadth_inch", "height_inch", "length_mm", "breadth_mm", "height_mm",
    "length", "width", "height", "thickness_micron", "thickness", "gusset", "flap_mm",
    "core_size", "pouch_weight",
]);

export const isSpecNumeric = (key) => NUMERIC_SPEC_KEYS.has(key);

const hasValue = (v) => v !== undefined && v !== null && v !== "";

export const getEntityId = (value) => (value && typeof value === "object" ? value._id : value);

// ----- number / gst parsing --------------------------------------------------

// Strip currency symbols, thousands separators and stray spaces from a pasted
// price/number cell, returning a finite Number or undefined.
export const parseLooseNumber = (value) => {
    if (value === null || value === undefined || value === "") return undefined;
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    const cleaned = String(value).replace(/[₹$,\s]/g, "").replace(/rs\.?/gi, "").replace(/%/g, "").trim();
    if (cleaned === "") return undefined;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
};

// Normalize a gst cell to the stored decimal form (0.05). Accepts "5%", "5",
// "0.05" — anything > 1 is treated as a percentage.
export const normalizeGstToDecimal = (value) => {
    const num = parseLooseNumber(value);
    if (num === undefined) return undefined;
    return num > 1 ? num / 100 : num;
};

// Percent label for a stored gst decimal ("0.05" -> "5%").
export const gstToPercentLabel = (value) => {
    if (!hasValue(value)) return "";
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    const pct = num > 1 ? num : num * 100;
    return `${Math.round(pct * 100) / 100}%`;
};

// ----- pricing tiers ---------------------------------------------------------

// Normalize a product's pack-size tiers into a stable shape regardless of which
// legacy field names a tier used (price/sellingPrice/SP, original_price/MRP...).
export const getTierList = (product) => {
    const raw = Array.isArray(product?.pricing?.priceList) && product.pricing.priceList.length
        ? product.pricing.priceList
        : Array.isArray(product?.priceList) ? product.priceList : [];
    return raw.map((tier) => ({
        number: tier.number ?? "",
        price: tier.price ?? tier.sellingPrice ?? tier.SP ?? "",
        original_price: tier.original_price ?? tier.originalPrice ?? tier.MRP ?? "",
        pack_weight: tier.pack_weight ?? tier.packWeight ?? "",
        stock_quantity: tier.stock_quantity ?? tier.stockQuantity ?? "",
        discount: tier.discount ?? 0,
    }));
};

// Discount % from MRP/SP, matching PricingSection's rule.
export const computeDiscount = (sellingPrice, originalPrice) => {
    const sp = Number(sellingPrice);
    const mrp = Number(originalPrice);
    if (Number.isFinite(sp) && Number.isFinite(mrp) && mrp > sp && mrp > 0) {
        return Math.round(((mrp - sp) / mrp) * 100);
    }
    return 0;
};

// A tier is persistable only when it has both a pack size and a selling price
// (the backend priceListItem schema requires `number` and `price`).
export const isTierComplete = (tier) =>
    hasValue(tier?.number) && hasValue(tier?.price);

// Build the backend priceList payload from a product's local tiers, dropping any
// incomplete rows and recomputing discount.
export const buildPriceListPayload = (tiers = []) =>
    tiers.filter(isTierComplete).map((tier) => ({
        number: parseLooseNumber(tier.number),
        price: parseLooseNumber(tier.price),
        original_price: parseLooseNumber(tier.original_price),
        pack_weight: parseLooseNumber(tier.pack_weight),
        stock_quantity: parseLooseNumber(tier.stock_quantity) ?? 0,
        discount: computeDiscount(tier.price, tier.original_price),
    }));

export const emptyTier = () => ({
    number: "", price: "", original_price: "", pack_weight: "", stock_quantity: "", discount: 0,
});

// ----- product-level accessors ----------------------------------------------

export const getBrandName = (product, brandLookup = {}) => {
    const brand = product?.brand;
    if (brand && typeof brand === "object") return brand.name || "";
    return brandLookup[brand] || "";
};

export const getAvailableStock = (product) => {
    const stock = product?.inventory?.availableStock;
    return hasValue(stock) ? stock : "";
};

export const getSpecValue = (product, key) => (hasValue(product?.[key]) ? product[key] : "");

// ----- category-adaptive spec columns ---------------------------------------

// Which spec columns to show for a set of products in a given category:
// the category's admin-declared spec_schema keys UNION every spec key that at
// least one loaded product actually has a value for, ordered by
// SPEC_COLUMN_ORDER then discovery order. The legacy hard-coded presets are
// deliberately NOT used here — they describe an empty create form, and would add
// blank generic columns (length/width/height) for families whose real data uses
// the _inch/_mm keys instead. Columns must reflect the actual stored data.
export const deriveSpecColumns = (products = [], category /*, subCategory */) => {
    const keys = new Set();

    const schema = buildSchemaFromCategory(category);
    (schema?.fields || []).forEach((field) => {
        if (field?.name && field.name !== "gsm") keys.add(field.name);
    });

    products.forEach((product) => {
        SPEC_FIELD_KEYS.forEach((key) => {
            if (hasValue(product?.[key])) keys.add(key);
        });
    });

    const ordered = [];
    SPEC_COLUMN_ORDER.forEach((key) => {
        if (keys.has(key)) { ordered.push(key); keys.delete(key); }
    });
    keys.forEach((key) => ordered.push(key));

    return ordered.map((key) => ({ key, label: humanizeSpecKey(key) }));
};

// ----- flatten products -> grid rows (one per pack-size tier) ----------------

export const flattenProductsToRows = (products = [], brandLookup = {}) => {
    const rows = [];
    products.forEach((product) => {
        const id = getEntityId(product?._id) || product?._id;
        const tiers = getTierList(product);
        const list = tiers.length ? tiers : [emptyTier()];
        list.forEach((tier, tierIndex) => {
            rows.push({
                rowKey: `${id}:${tierIndex}`,
                productId: id,
                tierIndex,
                tierCount: list.length,
                isFirstTier: tierIndex === 0,
                // product-level
                product_id: product?.product_id ?? "",
                brand: getEntityId(product?.brand) ?? "",
                brandName: getBrandName(product, brandLookup),
                name: product?.name ?? "",
                hsn_code: product?.hsn_code ?? "",
                gst: product?.gst ?? "",
                reviewed_on: product?.reviewed_on ?? "",
                availableStock: getAvailableStock(product),
                _product: product,
                // tier-level
                number: tier.number,
                original_price: tier.original_price,
                price: tier.price,
                pack_weight: tier.pack_weight,
                stock_quantity: tier.stock_quantity,
                discount: tier.discount,
            });
        });
    });
    return rows;
};

// =====================================================================
// Paste / CSV import
// =====================================================================

// Header label (normalized: lowercased, non-alphanumerics collapsed) -> field.
const HEADER_ALIASES = {
    productid: "product_id", sku: "product_id", skuid: "product_id", id: "product_id",
    brand: "brand", brandname: "brand",
    producttitle: "name", title: "name", name: "name", productname: "name",
    linch: "length_inch", lengthinch: "length_inch",
    binch: "breadth_inch", breadthinch: "breadth_inch", widthinch: "breadth_inch",
    hinch: "height_inch", heightinch: "height_inch",
    lmm: "length_mm", lengthmm: "length_mm",
    bmm: "breadth_mm", breadthmm: "breadth_mm", widthmm: "breadth_mm",
    hmm: "height_mm", heightmm: "height_mm",
    sizemm: "size_mm", sizemmhxl: "size_mm", sizemmhl: "size_mm", sizemmlxh: "size_mm",
    sizeinch: "size_inch", sizeinches: "size_inch", sizeincheshxl: "size_inch", sizeinchhxl: "size_inch", sizeincheshl: "size_inch",
    hsncode: "hsn_code", hsn: "hsn_code",
    gst: "gst",
    packsize: "number", pack: "number", packqty: "number", quantity: "number", qty: "number",
    mrp: "original_price", originalprice: "original_price",
    localsp: "price", sp: "price", sellingprice: "price", price: "price",
    weight: "pack_weight", packweight: "pack_weight", wt: "pack_weight",
    stock: "stock_quantity", stockquantity: "stock_quantity",
    stockavailable: "availableStock", available: "availableStock", availablestock: "availableStock",
    reviewedon: "reviewed_on", reviewed: "reviewed_on", reviewdate: "reviewed_on",
    // spec passthroughs
    thicknessmicron: "thickness_micron", micron: "thickness_micron",
    thickness: "thickness", gusset: "gusset", flap: "flap_mm", flapmm: "flap_mm",
    coresize: "core_size", labelinroll: "label_in_roll",
    material: "material", color: "color", colour: "color", print: "print", adhesive: "adhesive",
    category: "category", subcategory: "sub_category", subcat: "sub_category",
};

const normalizeHeader = (h) => String(h || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const STRING_FIELDS = new Set(["product_id", "brand", "name", "hsn_code", "reviewed_on", "size_inch", "size_mm", "material", "color", "print", "adhesive", "label_in_roll", "category", "sub_category"]);

// Tier-level fields (one pack-size tier's pricing/stock). When these column
// headers repeat across a single header row, the sheet is in "wide" layout:
// several pack sizes laid out side by side on one product line.
const TIER_HEADER_FIELDS = new Set(["original_price", "price", "stock_quantity", "pack_weight"]);

// Coerce one raw cell onto a target object under its internal field name.
const assignCell = (target, field, raw) => {
    if (raw === undefined || raw === "") return;
    if (field === "gst") target.gst = normalizeGstToDecimal(raw);
    else if (STRING_FIELDS.has(field)) target[field] = String(raw).trim();
    else target[field] = parseLooseNumber(raw);
};

// Split the tier-level header columns into blocks (one block == one pack tier).
// A single MRP/SP/Stock/Wt set is one block (tall layout — one tier per row).
// Each repeat of an already-seen tier field starts a new block (wide layout —
// e.g. MRP|SP|Stock|Wt|MRP|SP|Stock|Wt|... => 2+ blocks).
const computeTierBlocks = (headerFields) => {
    const blocks = [];
    let current = null;
    let seen = null;
    headerFields.forEach((field, index) => {
        if (!field || !TIER_HEADER_FIELDS.has(field)) return;
        if (!current || seen.has(field)) {
            current = [];
            seen = new Set();
            blocks.push(current);
        }
        current.push({ field, index });
        seen.add(field);
    });
    return blocks;
};

// Parse pasted TSV (Excel) or CSV text into
// { headers, unmappedHeaders, rows, tierBlockCount }, one row object per pack
// tier keyed by internal field name.
//
// In tall layout each source line is one tier already. In wide layout each line
// fans out into one row per tier block; since a wide sheet has no pack-size
// column, sizes come from opts.packSizes (index-aligned to the blocks).
export const parsePastedTable = (text, { packSizes = [] } = {}) => {
    const lines = String(text || "").replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "");
    if (lines.length < 2) return { headers: [], unmappedHeaders: [], rows: [], tierBlockCount: 0 };

    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const split = (line) => line.split(delimiter).map((c) => c.trim());

    const rawHeaders = split(lines[0]);
    const headerFields = rawHeaders.map((h) => HEADER_ALIASES[normalizeHeader(h)] || null);
    const unmappedHeaders = rawHeaders.filter((h, i) => !headerFields[i]);

    const blocks = computeTierBlocks(headerFields);
    const wide = blocks.length > 1;

    const rows = [];
    lines.slice(1).forEach((line) => {
        const cells = split(line);

        if (!wide) {
            const row = {};
            headerFields.forEach((field, i) => { if (field) assignCell(row, field, cells[i]); });
            rows.push(row);
            return;
        }

        // Wide layout: product-level fields are shared across the line; emit one
        // row per tier block, tagged with the matching pack size.
        const base = {};
        headerFields.forEach((field, i) => {
            if (!field || TIER_HEADER_FIELDS.has(field)) return;
            assignCell(base, field, cells[i]);
        });
        blocks.forEach((block, bi) => {
            const row = { ...base };
            block.forEach(({ field, index }) => assignCell(row, field, cells[index]));
            const size = packSizes[bi];
            if (hasValue(size)) row.number = parseLooseNumber(size) ?? size;
            // Skip a tier with no pricing at all (product with fewer sizes filled).
            if (hasValue(row.price) || hasValue(row.original_price) || hasValue(row.stock_quantity)) {
                rows.push(row);
            }
        });
    });

    return { headers: rawHeaders, unmappedHeaders, rows, tierBlockCount: blocks.length };
};

const PRODUCT_LEVEL_IMPORT_FIELDS = [
    "product_id", "brand", "name", "hsn_code", "gst", "reviewed_on", "availableStock",
    "category", "sub_category", ...SPEC_FIELD_KEYS,
];

// Group parsed rows into product payloads. Rows sharing the same product_id
// become one product with a pack-size tier per row; product-level fields come
// from the first row of the group that supplies them.
export const groupRowsToProducts = (rows = []) => {
    const groups = new Map();
    let anonCounter = 0;

    rows.forEach((row) => {
        const key = hasValue(row.product_id) ? String(row.product_id) : `__anon_${anonCounter++}`;
        if (!groups.has(key)) groups.set(key, { product_id: hasValue(row.product_id) ? row.product_id : "", fields: {}, tiers: [] });
        const group = groups.get(key);

        PRODUCT_LEVEL_IMPORT_FIELDS.forEach((field) => {
            if (hasValue(row[field]) && !hasValue(group.fields[field])) group.fields[field] = row[field];
        });

        if (hasValue(row.number) || hasValue(row.price) || hasValue(row.original_price)) {
            group.tiers.push({
                number: row.number,
                price: row.price,
                original_price: row.original_price,
                pack_weight: row.pack_weight,
                stock_quantity: row.stock_quantity,
            });
        }
    });

    return Array.from(groups.values()).map((group) => ({
        product_id: group.product_id,
        fields: group.fields,
        tiers: group.tiers,
    }));
};

// Turn a grouped product into a create/update payload + validation result.
// - brandLookup: name(lowercased) -> id
// - existingByProductId: product_id -> existing product (for update matching)
// - context: { categoryId, subCategoryId }
export const buildImportPayload = (group, { brandLookup = {}, existingByProductId = {}, context = {} } = {}) => {
    const errors = [];
    const fields = group.fields || {};
    const name = fields.name || (group.product_id ? `Product ${group.product_id}` : "");
    if (!name) errors.push("Missing product title");

    const priceList = buildPriceListPayload(group.tiers);
    if (!priceList.length) errors.push("No valid pack size / selling price");

    // Brand: resolve by name -> id.
    let brandId;
    if (hasValue(fields.brand)) {
        brandId = brandLookup[String(fields.brand).toLowerCase()];
        if (!brandId) errors.push(`Unknown brand "${fields.brand}"`);
    }

    const categoryId = fields.category || context.categoryId;
    const subCategoryId = fields.sub_category || context.subCategoryId;

    const existing = hasValue(group.product_id) ? existingByProductId[String(group.product_id)] : undefined;

    const specPayload = {};
    SPEC_FIELD_KEYS.forEach((key) => { if (hasValue(fields[key])) specPayload[key] = fields[key]; });

    const availableStock = parseLooseNumber(fields.availableStock);

    const payload = {
        name,
        ...(hasValue(group.product_id) ? { product_id: String(group.product_id) } : {}),
        ...(brandId ? { brand: brandId } : {}),
        ...(hasValue(fields.hsn_code) ? { hsn_code: String(fields.hsn_code) } : {}),
        ...(hasValue(fields.gst) ? { gst: fields.gst } : {}),
        ...(hasValue(fields.reviewed_on) ? { reviewed_on: String(fields.reviewed_on) } : {}),
        ...(categoryId ? { category: categoryId } : {}),
        ...(subCategoryId ? { sub_category: subCategoryId } : {}),
        ...specPayload,
        priceList,
        pricing: { priceList },
        ...(availableStock !== undefined ? { inventory: { availableStock } } : {}),
    };

    return {
        action: existing ? "update" : "create",
        existingId: existing?._id,
        productId: group.product_id,
        name,
        tierCount: priceList.length,
        errors,
        payload: existing ? { id: existing._id, ...payload } : payload,
    };
};
