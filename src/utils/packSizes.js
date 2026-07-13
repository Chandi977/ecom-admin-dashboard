export const DEFAULT_PACK_SIZES = [1, 5, 10];

export const normalizePackSizes = (values, fallback = DEFAULT_PACK_SIZES) => {
    const source = Array.isArray(values) && values.length ? values : fallback;
    const unique = new Set();

    source.forEach((value) => {
        const num = Number(value);
        if (Number.isFinite(num) && num > 0) {
            unique.add(num);
        }
    });

    return Array.from(unique).sort((a, b) => a - b);
};
