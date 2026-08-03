import { DEV } from "../services/constants";

const PRODUCT_IMAGE_BUCKET_HOSTS = new Set([
    "prem-industries-ecom-images.s3.ap-south-1.amazonaws.com",
    "prem-industries-ecom-images.s3.amazonaws.com",
]);

const decodeObjectKey = (pathname) =>
    pathname
        .replace(/^\/+/, "")
        .split("/")
        .map((segment) => {
            try {
                return decodeURIComponent(segment);
            } catch {
                return segment;
            }
        })
        .join("/");

/**
 * Product APIs return short-lived signed S3 URLs. Convert our bucket URLs (or
 * legacy raw keys) to the stable backend image endpoint so an expired URL can
 * be refreshed without forwarding its signed query string.
 */
const getProductImageKey = (source) => {
    const trimmed = String(source || "").trim();
    if (!trimmed || trimmed.startsWith("/")) return "";

    let objectKey = trimmed;

    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const url = new URL(trimmed);
            if (!PRODUCT_IMAGE_BUCKET_HOSTS.has(url.hostname.toLowerCase())) {
                return "";
            }
            objectKey = decodeObjectKey(url.pathname);
        } catch {
            return "";
        }
    }

    return objectKey;
};

export const getProductImageUrl = (source) => {
    const trimmed = String(source || "").trim();
    if (!trimmed || /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
        return trimmed;
    }

    return `${DEV}/getImage?image=${encodeURIComponent(trimmed)}`;
};

export const refreshProductImageUrl = (source) => {
    const objectKey = getProductImageKey(source);
    if (!objectKey) return null;

    return fetch(`${DEV}/getImage?image=${encodeURIComponent(objectKey)}`, {
        headers: { Accept: "application/json" },
    }).then(async (response) => {
        const payload = await response.json();
        const refreshedUrl = payload?.data?.url;

        if (!response.ok || !payload?.success || typeof refreshedUrl !== "string") {
            throw new Error(payload?.message || "Unable to refresh product image");
        }

        return refreshedUrl;
    });
};

export const recoverProductImage = (image, source) => {
    if (!image || image.dataset.refreshAttempted === "true") {
        if (image) image.style.opacity = 0.3;
        return;
    }

    const refreshRequest = refreshProductImageUrl(source);
    if (!refreshRequest) {
        image.style.opacity = 0.3;
        return;
    }

    image.dataset.refreshAttempted = "true";
    refreshRequest
        .then((refreshedUrl) => {
            image.src = refreshedUrl;
        })
        .catch(() => {
            image.style.opacity = 0.3;
        });
};
