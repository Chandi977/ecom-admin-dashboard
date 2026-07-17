const numberOrZero = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
};

const getPriceTiers = (product) => {
    const pricingTiers = Array.isArray(product?.pricing?.priceList)
        ? product.pricing.priceList
        : [];
    const productTiers = Array.isArray(product?.priceList) ? product.priceList : [];
    return pricingTiers.length ? pricingTiers : productTiers;
};

const getPrimaryPriceTier = (product) => {
    const tier = getPriceTiers(product)[0] || {};
    const sellingPrice =
        numberOrZero(tier.price) ||
        numberOrZero(tier.sellingPrice) ||
        numberOrZero(tier.SP) ||
        numberOrZero(product?.pricing?.basePrice) ||
        numberOrZero(product?.price);
    const mrp =
        numberOrZero(tier.original_price) ||
        numberOrZero(tier.originalPrice) ||
        numberOrZero(tier.MRP) ||
        sellingPrice;

    return {
        number: numberOrZero(tier.number) || 1,
        sellingPrice,
        mrp,
        discount: numberOrZero(tier.discount),
        stockQuantity: numberOrZero(tier.stock_quantity ?? tier.stockQuantity),
    };
};

const getDiscountPercent = (product) => {
    const tier = getPrimaryPriceTier(product);
    if (tier.discount > 0) return tier.discount;
    if (!tier.mrp || tier.mrp <= tier.sellingPrice) return 0;
    return Math.round(((tier.mrp - tier.sellingPrice) / tier.mrp) * 100);
};

const getStock = (product) => {
    const inventoryStock = numberOrZero(product?.inventory?.availableStock);
    if (inventoryStock > 0) return inventoryStock;
    const tierStock = getPriceTiers(product).reduce(
        (sum, tier) => sum + numberOrZero(tier?.stock_quantity ?? tier?.stockQuantity),
        0,
    );
    return tierStock || numberOrZero(product?.stock_quantity);
};

const getName = (product) =>
    [
        typeof product?.brand === "object" ? product?.brand?.name : "",
        product?.name,
        product?.model,
        product?.product_id,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

const getDateValue = (product) => {
    const timestamp = Date.parse(product?.createdAt || product?.updatedAt);
    return Number.isFinite(timestamp) ? timestamp : 0;
};

const withStableFallback = (compare) => (a, b) => {
    const result = compare(a.item, b.item);
    return result || a.index - b.index;
};

export const PRODUCT_SORT_OPTIONS = [
    { label: "Default sorting", value: "" },
    { label: "High to Low", value: "high to low" },
    { label: "Low to high", value: "low to high" },
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "Name: A to Z", value: "name asc" },
    { label: "Name: Z to A", value: "name desc" },
    { label: "Discount: high to low", value: "discount high to low" },
    { label: "Discount: low to high", value: "discount low to high" },
    { label: "Stock: high to low", value: "stock high to low" },
    { label: "Pack size: low to high", value: "pack low to high" },
    { label: "Pack size: high to low", value: "pack high to low" },
];

export const sortProducts = (items = [], sortBy = "") => {
    if (!sortBy) return items;

    const comparators = {
        "low to high": (a, b) =>
            getPrimaryPriceTier(a).sellingPrice - getPrimaryPriceTier(b).sellingPrice,
        "high to low": (a, b) =>
            getPrimaryPriceTier(b).sellingPrice - getPrimaryPriceTier(a).sellingPrice,
        newest: (a, b) => getDateValue(b) - getDateValue(a),
        oldest: (a, b) => getDateValue(a) - getDateValue(b),
        "name asc": (a, b) => getName(a).localeCompare(getName(b)),
        "name desc": (a, b) => getName(b).localeCompare(getName(a)),
        "discount high to low": (a, b) => getDiscountPercent(b) - getDiscountPercent(a),
        "discount low to high": (a, b) => getDiscountPercent(a) - getDiscountPercent(b),
        "stock high to low": (a, b) => getStock(b) - getStock(a),
        "pack low to high": (a, b) =>
            getPrimaryPriceTier(a).number - getPrimaryPriceTier(b).number,
        "pack high to low": (a, b) =>
            getPrimaryPriceTier(b).number - getPrimaryPriceTier(a).number,
    };

    const comparator = comparators[sortBy];
    if (!comparator) return items;

    return items
        .map((item, index) => ({ item, index }))
        .sort(withStableFallback(comparator))
        .map(({ item }) => item);
};
