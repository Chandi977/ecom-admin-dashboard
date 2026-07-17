import axios from "axios";
import { DEV } from "./constants";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const productService = {
    async getProducts(params = {}) {
        const response = await axios.get(`${DEV}/product/get`, {
            params: {
                ...params,
                includeMeta: true,
                populate: true,
            },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async searchProducts(params = {}) {
        const response = await axios.get(`${DEV}/product/search`, {
            params: {
                ...params,
                includeMeta: true,
                populate: true,
            },
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async getProductById(id) {
        const response = await axios.get(`${DEV}/product/get/id/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async createProduct(payload) {
        const response = await axios.post(`${DEV}/product/create`, payload, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
        });
        return response.data;
    },

    async updateProduct(id, payload) {
        const response = await axios.put(
            `${DEV}/product/update`,
            { id, ...payload },
            {
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
            }
        );
        return response.data;
    },

    async deleteProducts(ids) {
        const response = await axios.post(
            `${DEV}/product/delete`,
            { id: ids },
            {
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
            }
        );
        return response.data;
    },

    async deleteProductImages(keys) {
        const payload = { keys: Array.isArray(keys) ? keys : [keys] };
        const response = await axios.post(`${DEV}/product/image/delete`, payload, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
        });
        return response.data;
    },

    async uploadImage(file, onProgress) {
        const formData = new FormData();
        formData.append("image", file);
        
        const response = await axios.post(`${DEV}/uploadImage`, formData, {
            headers: {
                ...getAuthHeader(),
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
        });
        
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        throw new Error(response.data?.message || "Image upload failed");
    },

    async importCSV(file) {
        const formData = new FormData();
        formData.append("csv", file);
        const response = await axios.post(`${DEV}/product/csv/import`, formData, {
            headers: {
                ...getAuthHeader(),
            },
        });
        return response.data;
    },
};
