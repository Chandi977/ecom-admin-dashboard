import { useQuery, useMutation, useQueryClient } from "react-query";
import { productService } from "../services/productService";
import { handleGetRequest } from "../services/GetTemplate";
import { toast } from "react-toastify";

export const productKeys = {
    all: ["products"],
    lists: () => [...productKeys.all, "list"],
    list: (params) => [...productKeys.lists(), params],
    details: () => [...productKeys.all, "detail"],
    detail: (id) => [...productKeys.details(), id],
    search: (params) => [...productKeys.all, "search", params],
    brands: () => ["brands"],
    categories: () => ["categories"],
    subCategories: () => ["subcategories"],
};

export function useProducts(params = {}) {
    return useQuery(
        productKeys.list(params),
        () => productService.getProducts(params),
        {
            keepPreviousData: true,
            onError: (err) => {
                toast.error(err?.message || "Failed to load products");
            },
        }
    );
}

export function useSearchProducts(params = {}) {
    const hasFilters = Object.values(params).some(val => val !== "" && val !== undefined);
    
    return useQuery(
        productKeys.search(params),
        () => hasFilters ? productService.searchProducts(params) : productService.getProducts(params),
        {
            keepPreviousData: true,
            staleTime: 30000,
            onError: (err) => {
                toast.error(err?.message || "Product search failed");
            },
        }
    );
}

export function useProduct(id) {
    return useQuery(
        productKeys.detail(id),
        () => productService.getProductById(id),
        {
            enabled: !!id && id !== "create",
            onError: (err) => {
                toast.error(err?.message || "Failed to fetch product details");
            },
        }
    );
}

export function useBrands() {
    return useQuery(
        productKeys.brands(),
        async () => {
            const res = await handleGetRequest("/brand/all");
            return res?.data || [];
        },
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

export function useCategories() {
    return useQuery(
        productKeys.categories(),
        async () => {
            const res = await handleGetRequest("/category/all");
            return res?.data || [];
        },
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

export function useSubCategories() {
    return useQuery(
        productKeys.subCategories(),
        async () => {
            const res = await handleGetRequest("/subcategory/all");
            return res?.data || [];
        },
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation(
        (data) => productService.createProduct(data),
        {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success("Product created successfully!");
                    queryClient.invalidateQueries(productKeys.all);
                } else {
                    toast.error(res.message || "Failed to create product");
                }
            },
            onError: (err) => {
                toast.error(err?.response?.data?.message || err?.message || "Failed to create product");
            },
        }
    );
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation(
        ({ id, data }) => productService.updateProduct(id, data),
        {
            onSuccess: (res, variables) => {
                if (res.success) {
                    toast.success("Product updated successfully!");
                    queryClient.invalidateQueries(productKeys.all);
                    queryClient.invalidateQueries(productKeys.detail(variables.id));
                } else {
                    toast.error(res.message || "Failed to update product");
                }
            },
            onError: (err) => {
                toast.error(err?.response?.data?.message || err?.message || "Failed to update product");
            },
        }
    );
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation(
        (ids) => productService.deleteProducts(ids),
        {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success("Product(s) deleted successfully!");
                    queryClient.invalidateQueries(productKeys.all);
                } else {
                    toast.error(res.message || "Failed to delete product(s)");
                }
            },
            onError: (err) => {
                toast.error(err?.response?.data?.message || err?.message || "Failed to delete product(s)");
            },
        }
    );
}
