import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import ManufacturerDetailsDialog from "./ManufacturerDetailsDialog";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { handlePutRequest } from "../../services/PutTemplate";
import { handlePostRequest } from "../../services/PostTemplate";
import Dropzone from "react-dropzone";
import { HiCamera } from "react-icons/hi";
import { toast } from "react-toastify";

function VarientDetails() {
    const [showDialog, setShowDialog] = useState(false);
    const [editable, setEditable] = useState(false);
    const [manufacturer, setManufacturers] = useState();
    const [vehManufacture, setVehanu] = useState([]);
    const [model, setModel] = useState([]);
    const [selectedManu, setSelectedManu] = useState();
    const [selectedModel, setSelectedModel] = useState();
    const [image, setImage] = useState();
    const [url, setUrl] = useState();
    const history = useHistory();
    const dispatch = useDispatch();
    const { id } = useParams();
    const [role, setRole] = useState();

    const makecall = async (image) => {
        const result = await handleGetRequest(`/getImage?image=${image}`);
        return result?.data?.url;
    };

    const getData = async () => {
        const res = await handleGetRequest(`/vehicle/${id}`);
        const result = await handleGetRequest("/getAll/Vehicle/manufacturer");
        setVehanu(result?.data);
        const keyData = res?.data;
        setManufacturers(res?.data);
        setImage(res?.data?.image);
        setSelectedManu(res?.data?.manufacturer?._id);
        setSelectedModel(res?.data?.model?._id);
        const temp = await makecall(res?.data?.image);
        setUrl(temp);
        console.log(keyData);
        Object.keys(keyData).forEach((key) => {
            if (formik.initialValues.hasOwnProperty(key)) {
                formik.setFieldValue(key, keyData[key]);
            }
        });
    };
    useEffect(() => {
        getData();
    }, []);

    const getModel = async () => {
        const res = await handleGetRequest(`/models/${selectedManu}`);
        setModel(res?.data);
    };

    useEffect(() => {
        if (selectedManu) {
            getModel();
        }
    }, [selectedManu]);

    const handleEdit = () => {
        if (editable) {
            setEditable(false);
        } else {
            setEditable(true);
        }
    };
    const breadItems = [{ label: "Home" }, { label: "Vehicle Varients", url: "/addvarient" }];
    const home = { icon: "pi pi-home", url: "/" };

    const validationSchema = Yup.object().shape({
        title: Yup.string().required("This field is required"),
        createdAt: Yup.string().required("This field is required"),
        meta_title: Yup.string().required("This field is required"),
        meta_Description: Yup.string().required("This field is required"),
    });
    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            title: "",
            createdAt: "",
            meta_title: "",
            meta_Description: "",
            vehicle_id: "",
            manufacturer: "",
            model: "",
            image: "",
            year: "",
        },

        onSubmit: async (data) => {
            console.log(data);
            data.image = image;
            data.model = selectedModel;
            data.manufacturer = selectedManu;
            const res = await handlePutRequest(data, "/vehicle/edit");

            if (res?.success === true) {
                toast.success("vehicle varient edited");
            }
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const onHideManufacturerDetailsDialog = () => {
        setShowDialog(false);
    };
    const handleCancel = () => {
        history.push("/");
    };

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setImage(file.name);
        setUrl(res?.data?.url);
        formik.handleSubmit();
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);
    return (
        <>
            <Dialog visible={showDialog} header="Manufacturer Details" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <ManufacturerDetailsDialog onHideManufacturerDetailsDialog={onHideManufacturerDetailsDialog} />
            </Dialog>
            <div className="customer_header__">
                <div className="left___">
                    <h2>{manufacturer?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src={url} />
                    <div className="id_section">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <p>ID:</p>
                            <p>&nbsp;{id}</p>
                        </div>
                        <Dropzone onDrop={(acceptedFiles) => handleUpload(acceptedFiles[0])}>
                            {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p style={{ cursor: "pointer", fontSize: "25px" }}>
                                        <HiCamera />
                                    </p>
                                </div>
                            )}
                        </Dropzone>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                        Title
                                    </label>
                                    <InputText disabled={role == "calling" ? true : false} id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                                    {getFormErrorMessage("title")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Created At
                                    </label>
                                    <InputText id="createdAt" disabled={true} name="createdAt" value={formik.values.createdAt} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

                                    {getFormErrorMessage("createdAt")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Manufacturer
                                    </label>
                                    <select
                                        disabled={role == "calling" || role === "digital marketing" ? true : false}
                                        value={selectedManu}
                                        onChange={(e) => setSelectedManu(e.target.value)}
                                        style={{ width: "100%", marginTop: "10px", height: "35px", border: "1px solid #cecece", borderRadius: "6px" }}
                                    >
                                        <option selected disabled>
                                            Select manufacturer
                                        </option>
                                        {vehManufacture?.map((manu) => {
                                            return <option value={manu?._id}>{manu?.title}</option>;
                                        })}
                                    </select>

                                    {getFormErrorMessage("createdAt")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="year" className={classNames({ "p-error": isFormFieldValid("year") }, "Label__Text")}>
                                        Year
                                    </label>
                                    <InputText disabled={role == "calling" || role === "digital marketing" ? true : false} id="year" name="year" value={formik.values.year} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("year") }, "Input__Round")} />

                                    {getFormErrorMessage("year")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="meta_Description" className={classNames({ "p-error": isFormFieldValid("meta_Description") }, "Label__Text")}>
                                        Meta Description
                                    </label>
                                    <InputText
                                        disabled={role == "calling" || role === "manager" ? true : false}
                                        id="meta_Description"
                                        name="meta_Description"
                                        value={formik.values.meta_Description}
                                        onChange={formik.handleChange}
                                        className={classNames({ "p-invalid": isFormFieldValid("meta_Description") }, "Input__Round")}
                                    />

                                    {getFormErrorMessage("meta_Description")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                        Meta Title
                                    </label>
                                    <InputText
                                        disabled={role == "calling" || role === "manager" ? true : false}
                                        id="meta_title"
                                        name="meta_title"
                                        value={formik.values.meta_title}
                                        onChange={formik.handleChange}
                                        className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")}
                                    />

                                    {getFormErrorMessage("meta_title")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Model
                                    </label>
                                    <select
                                        disabled={role == "calling" || role === "digital marketing" ? true : false}
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        style={{ width: "100%", marginTop: "10px", height: "35px", border: "1px solid #cecece", borderRadius: "6px" }}
                                    >
                                        <option selected disabled>
                                            Select model
                                        </option>
                                        {model?.map((manu) => {
                                            return <option value={manu?._id}>{manu?.title}</option>;
                                        })}
                                    </select>

                                    {getFormErrorMessage("createdAt")}
                                </div>
                            </div>
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" onClick={handleCancel} />
                            <Button label="Update" className="Btn__Dark" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default VarientDetails;
