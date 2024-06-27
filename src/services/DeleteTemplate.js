import axios from "axios";
import { toast } from "react-toastify";
import { loadingAction } from "../redux/loadingAction";

export const handleDeleteRequest =
    (data, url, isShowLoad = false, isShowToast = true) =>
    async (dispatch) => {
        const token=localStorage.getItem("token")
        try {
            if (isShowLoad) dispatch(loadingAction(true));
            const response = await axios({
                method: "DELETE",
                url: `${"http://13.232.176.80/api" + url}`,
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
            if (error?.response?.status === 400 || error?.response?.status === 500) {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            } else {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            }

            return error?.response;
        }
    };
