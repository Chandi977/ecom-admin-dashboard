import axios from "axios";
import { toast } from "react-toastify";
import { DEV } from "./constants";
import { clearGetRequestCache } from "./GetTemplate";
import { handleAuthFailure, isAuthFailureStatus } from "../utils/authSession";

export const handlePatchRequest = async (data, url) => {
    const token = localStorage.getItem("token");
    const response = await axios({
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
                clearGetRequestCache();
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Session expired. Please log in again.");
                handleAuthFailure();
            } else {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            }
        });

    return response;
};
