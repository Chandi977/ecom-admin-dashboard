import axios from "axios";
import { toast } from "react-toastify";
import { DEV } from "./constants";
import { handleAuthFailure, isAuthFailureStatus } from "../utils/authSession";

const CACHEABLE_GET_URLS = new Set(["/category/all", "/subcategory/all", "/brand/all"]);
const GET_CACHE_TTL_MS = 5 * 60 * 1000;
const getCache = new Map();
const inFlightGetRequests = new Map();

const buildCacheKey = (url, params, token) => `${token || ""}:${url}:${JSON.stringify(params || {})}`;

export const handleGetRequest = async (url, params, isShowToast = false) => {
    const token = localStorage.getItem("token");
    const requestParams = {
        ...(params || {}),
    };
    const shouldCache = CACHEABLE_GET_URLS.has(url);
    const cacheKey = shouldCache ? buildCacheKey(url, requestParams, token) : null;

    if (shouldCache) {
        const cached = getCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            if (isShowToast) toast.success(cached.data?.message);
            return cached.data;
        }

        if (inFlightGetRequests.has(cacheKey)) {
            return inFlightGetRequests.get(cacheKey);
        }
    }

    const request = (async () => {
        try {
            const response = await axios.get(DEV + url, {
                params: {
                    ...(requestParams?.skip && { skip: requestParams?.skip }),
                    ...requestParams,
                },
                ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
            });
            if (isShowToast) toast.success(response?.data?.message);
            if (shouldCache) {
                getCache.set(cacheKey, {
                    data: response.data,
                    expiresAt: Date.now() + GET_CACHE_TTL_MS,
                });
            }
            return response.data;
        } catch (error) {
            const id = toast.loading("Please wait...");
            if (isAuthFailureStatus(error?.response?.status)) {
                clearGetRequestCache();
                toast.update(id, { render: error?.response?.data?.messages || error?.response?.data?.message || "Session expired. Please log in again.", type: "error", isLoading: false, autoClose: 3000 });
                handleAuthFailure();
            } else {
                toast.update(id, { render: error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!", type: "warn", isLoading: false, autoClose: 3000 });
            }
        } finally {
            if (shouldCache) {
                inFlightGetRequests.delete(cacheKey);
            }
        }
    })();

    if (shouldCache) {
        inFlightGetRequests.set(cacheKey, request);
    }

    return request;
};

export const clearGetRequestCache = () => {
    getCache.clear();
    inFlightGetRequests.clear();
};
