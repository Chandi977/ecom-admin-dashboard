import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { handleGetRequest } from "../../services/GetTemplate";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";

const ModalDialog = ({ onsuccess, onHideVehicleManufacturer }) => {
    const [manufacturers, setManufacturers] = useState([]);
    const [selected, setSelected] = useState();
    const [image, setImage] = useState();
    const [url, setUrl] = useState();

    const getData = async () => {
        const result = await handleGetRequest("/getAll/Vehicle/manufacturer");
        setManufacturers(result?.data);
    };
    useEffect(() => {
        getData();
    }, []);
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            id: "",
            title: "",
            image: "",
            meta_title: "",
            meta_Description: "",
            manufacturer: "",
        },

        onSubmit: async (data) => {
            const dat = {
                id: data?.id,
                title: data?.title,
                meta_title: data?.meta_title,
                meta_Description: data?.meta_Description,
                manufacturer: selected,
                image: image,
            };
            const res = await dispatch(handlePostRequest(dat, "/add/vehicle_model", true, true));
            if (res !== "error") {
                onsuccess();
            }
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setImage(file.name);
        setUrl(res?.data?.url);
    };

    const handleRemvoe = (index) => {
        setImage();
        setUrl();
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="id" className={classNames({ "p-error": isFormFieldValid("id") }, "Label__Text")}>
                                Model ID
                            </label>
                            <InputText placeholder="447474" id="id" name="id" value={formik.values.id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("id") }, "Input__Round")} />

                            {getFormErrorMessage("id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Title
                            </label>
                            <InputText placeholder="test model" id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                            {getFormErrorMessage("title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="manufacturer" className={classNames({ "p-error": isFormFieldValid("manufacturer") }, "Label__Text")}>
                                Vehicle Manufacturer
                            </label>
                            <div>
                                <select style={{ width: "100%", marginTop: "10px", height: "35px", border: "1px solid #cecece", borderRadius: "6px" }} value={selected} onChange={(e) => setSelected(e.target.value)}>
                                    <option selected disabled>
                                        Select vehicle manufacturer
                                    </option>
                                    {manufacturers?.map((manu) => {
                                        return <option value={manu?._id}>{manu?.title}</option>;
                                    })}
                                </select>
                            </div>
                            {getFormErrorMessage("manufacturer")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                Meta Title
                            </label>
                            <InputText placeholder="meta title" id="meta_title" name="meta_title" value={formik.values.meta_title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} />

                            {getFormErrorMessage("meta_title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_Description" className={classNames({ "p-error": isFormFieldValid("meta_Description") }, "Label__Text")}>
                                Meta Description
                            </label>
                            <InputText placeholder="meta description" id="meta_Description" name="meta_Description" value={formik.values.meta_Description} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_Description") }, "Input__Round")} />

                            {getFormErrorMessage("meta_Description")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="image" className={classNames({ "p-error": isFormFieldValid("image") }, "Label__Text")}>
                                image
                            </label>
                            <InputText type="file" id="image" name="image" onChange={(e) => handleUpload(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("image") }, "Input__RoundFile")} />

                            {getFormErrorMessage("image")}
                        </div>
                        {image && (
                            <div style={{ position: "relative" }}>
                                <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={url}></img>
                                <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe()}></i>
                            </div>
                        )}
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideVehicleManufacturer()} type="button" />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default ModalDialog;
