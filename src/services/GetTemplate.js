import axios from "axios";
import { toast } from "react-toastify";
import { DEV } from "./constants";

export const handleGetRequest = async (url, params, isShowToast = false) => {
    const token = localStorage.getItem("token");
    try {
        const requestParams = {
            ...(params || {}),
        };
        const response = await axios.get(DEV + url, {
            params: {
                ...(requestParams?.skip && { skip: requestParams?.skip }),
                ...requestParams,
            },
            ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        });
        if (isShowToast) toast.success(response?.data?.message);
        return response.data;
    } catch (error) {
        const id = toast.loading("Please wait...");
        if (error?.response?.status === 401) toast.update(id, { render: error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!", type: "error", isLoading: false, autoClose: 3000 });
        else toast.update(id, { render: error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!", type: "warn", isLoading: false, autoClose: 3000 });
    }
};
