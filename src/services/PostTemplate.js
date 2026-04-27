import axios from "axios";
import { toast } from "react-toastify";
import { loadingAction } from "../redux/loadingAction";
import { DEV } from "./constants";
import { clearGetRequestCache } from "./GetTemplate";

export const handlePostRequest =
    (data, url, isShowLoad = false, isShowToast = true) =>
    async (dispatch) => {
        let token = localStorage.getItem("token");
        try {
            if (isShowLoad) dispatch(loadingAction(true));
            console.log("POST request URL:", `${DEV + url}`); // Debug: log the URL
            const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
            const response = await axios({
                method: "post",
                url: `${DEV + url}`,
                data: data,
                headers: {
                    ...(isFormData ? {} : { "Content-Type": "application/json" }),
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (isShowLoad) dispatch(loadingAction(false));
            clearGetRequestCache();
            return response?.data;
        } catch (error) {
            console.error("Error in handlePostRequest:", error);
            if (isShowLoad) dispatch(loadingAction(false));
            if (error?.response?.status === 401 || error?.response?.status === 500) {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || error?.response?.data?.error || "Something went wrong !!");
            } else {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || error?.response?.data?.error || "Something went wrong !!");
            }
            console.error("Error response data:", error?.response?.data);
            return "error";
        }
    };
