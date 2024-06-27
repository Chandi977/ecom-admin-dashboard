import axios from "axios";
import { toast } from "react-toastify";
import { DEV } from "./constants";

export const handlePutRequest = async (data, url) => {
    const token = localStorage.getItem("token");
    const response = await axios({
        method: "put",
        url: `${DEV + url}`,
        data: data,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => {
            return res?.data;
        })
        .catch((error) => {
            if (error?.response?.status === 400 || error?.response?.status === 500) {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            } else {
                toast.warn(error?.response?.data?.messages || error?.response?.data?.message || "Something went wrong !!");
            }
        });

    return response;
};
