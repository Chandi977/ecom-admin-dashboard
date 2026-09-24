import { toast } from "react-toastify";
import { DEV } from "./constants";
import { loadingAction } from "../redux/loadingAction";
import { isAuthFailureStatus } from "../utils/authSession";
import apiClient from "./apiClient";

export const handleDeleteRequest =
    (data, url, isShowLoad = false, isShowToast = true) =>
    async (dispatch) => {
        const token=localStorage.getItem("token")
        try {
            if (isShowLoad) dispatch(loadingAction(true));
            const response = await apiClient({
                method: "DELETE",
                url: `${DEV + url}`,
                data: data,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (isShowToast) toast.success(response?.data?.message);
            if (isShowLoad) dispatch(loadingAction(false));
            return response?.data;
        } catch (error) {
            if (isShowLoad) dispatch(loadingAction(false));
            if (isAuthFailureStatus(error?.response?.status)) {
                // apiClient interceptor already cleared the session, toasted the
                // expiry message and redirected to /auth.
            } else if (error?.response?.status === 400 || error?.response?.status === 500) {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            } else {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            }

            return error?.response;
        }
    };
