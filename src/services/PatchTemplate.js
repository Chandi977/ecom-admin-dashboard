import { toast } from "react-toastify";
import { DEV } from "./constants";
import { clearGetRequestCache } from "./GetTemplate";
import { isAuthFailureStatus } from "../utils/authSession";
import apiClient from "./apiClient";

export const handlePatchRequest = async (data, url) => {
    const token = localStorage.getItem("token");
    const response = await apiClient({
        method: "patch",
        url: `${DEV + url}`,
        data: data,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => {
            clearGetRequestCache();
            return res?.data;
        })
        .catch((error) => {
            if (isAuthFailureStatus(error?.response?.status)) {
                // apiClient interceptor already cleared the session, toasted the
                // expiry message and redirected to /auth — drop stale caches only.
                clearGetRequestCache();
            } else {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            }
        });

    return response;
};
