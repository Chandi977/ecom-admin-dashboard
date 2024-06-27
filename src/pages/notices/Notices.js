import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import Dropzone from "react-dropzone";
import { toast } from "react-toastify";
import { handlePutRequest } from "../../services/PutTemplate";

function Notices() {
    const breadItems = [{ label: "Home" }, { label: "Banner" }];
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const [banner, setBanner] = useState([]);
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");
    const dispatch = useDispatch();

    const makecall = async (image) => {
        const result = await handleGetRequest(`/getImage?image=${image}`);
        return result?.data?.url;
    };

    const getData = async () => {
        const res = await handleGetRequest("/getbanner");
        const ima = await makecall(res?.data?.image);
        setUrl(ima);
        setBanner(res?.data);
    };

    useEffect(() => {
        getData();
    }, []);

    const handleImage = async (file) => {
        const data = {
            id: banner?._id,
            image: file,
        };
        const result = await handlePutRequest(data, "/editbanner");
        if (result?.success) {
            toast.success("Banner updated successfully");
        }
    };

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setImage(file.name);
        setUrl(res?.data?.url);
        await handleImage(file.name);
    };

    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Banner</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div style={{ marginTop: "20px" }}>
                <img src={url} style={{ objectFit: "cover", width: "100%", height: "400px" }}></img>
            </div>
            <div style={{ display: "flex", marginTop: "20px", marginBottom: "20px", justifyContent: "center" }}>
                <Dropzone onDrop={(acceptedFiles) => handleUpload(acceptedFiles[0])}>
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <button style={{ padding: "10px 30px", fontSize: "18px", border: "none", backgroundColor: "green", color: "white", borderRadius: "6px" }}>Add new</button>
                        </div>
                    )}
                </Dropzone>
            </div>
        </>
    );
}

export default Notices;
