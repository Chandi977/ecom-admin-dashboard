import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

const AddTyrePatternDialog = ({ onHideTyrePatternDialog, handleSuccess }) => {
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [text2, setText2] = useState(EditorState.createEmpty());
    const dispatch = useDispatch();
    const [brands, setBrands] = useState([]);
    const [manu, setManu] = useState();
    const [image, setImage] = useState();
    const [url, setUrl] = useState();
    const [warrantyImage, setWarrantyImage] = useState();
    const [warrantyUrl, setWarrantyUrl] = useState();
    const [description, setDescription] = useState();
    const [warrantyClause, setWarrantyCaluse] = useState();

    const getData = async () => {
        const result = await handleGetRequest("/TotalManufacturers");
        setBrands(result?.data);
    };

    useEffect(() => {
        getData();
    }, []);

    const formik = useFormik({
        initialValues: {
            title: "",
            manufacturer: null,
            Image: "",
            warranty_image: "",
            warranty_clause: "",
            description: "",
            id: "",
        },

        onSubmit: async (data) => {
            const dat = {
                id: data?.id,
                manufacturer: manu,
                Image: image,
                warranty_image: warrantyImage,
                warranty_clause: warrantyClause,
                description: description,
                title: data?.title,
            };
            const result = await dispatch(handlePostRequest(dat, "/add/pattern", true, true));
            if (result !== "error") {
                handleSuccess();
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

    const handleUploadWarranty = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setWarrantyImage(file.name);
        setWarrantyUrl(res?.data?.url);
    };

    const handleRemvoeWarranty = (index) => {
        setWarrantyImage();
        setWarrantyUrl();
    };

    const handleStateD = (editorState) => {
        setText1(editorState);
    };

    const handlecontentD = (contentState) => {
        let temp = draftToHtml(contentState);
        setDescription(temp);
    };
    const handleStateW = (editorState) => {
        setText2(editorState);
    };

    const handlecontentW = (contentState) => {
        let temp = draftToHtml(contentState);
        setWarrantyCaluse(temp);
    };
    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="id" className={classNames({ "p-error": isFormFieldValid("id") }, "Label__Text")}>
                                ID
                            </label>
                            <InputText placeholder="8973487" id="id" name="id" value={formik.values.id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("id") }, "Input__Round")} />

                            {getFormErrorMessage("id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Title
                            </label>
                            <InputText placeholder="test pattern" id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                            {getFormErrorMessage("title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="manufacturer" className={classNames({ "p-error": isFormFieldValid("manufacturer") }, "Label__Text")}>
                                Tyre Manufacturer
                            </label>
                            {/* <InputText id="manufacturer" name="manufacturer" value={formik.values.manufacturer} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("manufacturer") }, "Input__Round")} /> */}
                            <select onChange={(e) => setManu(e.target.value)} className="select__">
                                <option selected disabled>
                                    Select tyre manufacturer
                                </option>
                                {brands?.map((brand) => {
                                    return <option value={brand?._id}>{brand?.title}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="patternImage" className={classNames({ "p-error": isFormFieldValid("patternImage") }, "Label__Text")}>
                                Pattern Image
                            </label>
                            <InputText type="file" id="patternImage" name="patternImage" onChange={(e) => handleUpload(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("patternImage") }, "Input__RoundFile")} />

                            {getFormErrorMessage("patternImage")}
                        </div>
                        {image && (
                            <div style={{ position: "relative" }}>
                                <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={url}></img>
                                <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe()}></i>
                            </div>
                        )}
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="warrentyImage" className={classNames({ "p-error": isFormFieldValid("warrentyImage") }, "Label__Text")}>
                                Warranty Image
                            </label>
                            <InputText type="file" id="warrentyImage" name="warrentyImage" onChange={(e) => handleUploadWarranty(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("warrentyImage") }, "Input__RoundFile")} />

                            {getFormErrorMessage("warrentyImage")}
                        </div>
                        {warrantyImage && (
                            <div style={{ position: "relative" }}>
                                <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={warrantyUrl}></img>
                                <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoeWarranty()}></i>
                            </div>
                        )}
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="warrenty_clouse" className={classNames({ "p-error": isFormFieldValid("warrentyClouse") }, "Label__Text")}>
                                Warranty Clause
                            </label>
                            <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text2} onEditorStateChange={handleStateW} onContentStateChange={handlecontentW} />

                            {getFormErrorMessage("warrenty_clause")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                Description
                            </label>
                            <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text1} onEditorStateChange={handleStateD} onContentStateChange={handlecontentD} />

                            {getFormErrorMessage("description")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideTyrePatternDialog()} type="button" />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default AddTyrePatternDialog;
