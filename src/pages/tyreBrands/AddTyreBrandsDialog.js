import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import Select from "react-select";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

const AddTyreBrandsDialog = ({ onHideTyreBrandsDialog, onsuccess }) => {
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [description, setDesription] = useState();
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [images, setImages] = useState();
    const [urls, setUrls] = useState();
    const [features, setFeatures] = useState([]);
    const [feature, setFeature] = useState([]);

    const getData = async () => {
        const result = await handleGetRequest("/features");
        const temp = result?.data?.map((feature) => {
            return {
                label: feature?.title,
                value: feature?._id,
            };
        });
        setFeatures(temp);
    };

    useEffect(() => {
        getData();
    });

    const validationSchema = Yup.object().shape({
        title: Yup.string().required("This field is required"),
        id: Yup.string().required("This field is required"),
        meta_title: Yup.string().required("This field is required"),
        meta_Description: Yup.string().required("This field is required"),
    });
    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            title: "",
            image: "",
            description: "",
            id: "",
            meta_title: "",
            meta_Description: "",
            features: "",
        },

        onSubmit: async (data) => {
            data["description"] = description;
            data["image"] = images;
            const temp = feature?.map((fea) => {
                return {
                    feature: fea?.value,
                };
            });
            data["features"] = temp;
            setLoading(true);
            const res = await dispatch(handlePostRequest(data, "/add/Tyre/manufacturer", true, true));
            if (res?.success === true) {
                onsuccess();
            }
            console.log(data);
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
        setImages(file.name);
        setUrls(res?.data?.url);
    };

    const handleRemvoe = (index) => {
        setImages();
        setUrls();
    };

    const handleState = (editorState) => {
        setText1(editorState);
    };

    const handlecontent = (contentState) => {
        let temp = draftToHtml(contentState);
        setDesription(temp);
    };
    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Title
                            </label>
                            <InputText placeholder="test brand" id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                            {getFormErrorMessage("title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="id" className={classNames({ "p-error": isFormFieldValid("id") }, "Label__Text")}>
                                ID
                            </label>
                            <InputText placeholder="72736js" id="id" name="id" value={formik.values.id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("id") }, "Input__Round")} />

                            {getFormErrorMessage("id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                Meta-Title
                            </label>
                            <InputText placeholder="meta title" id="meta_title" name="meta_title" value={formik.values.meta_title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} />

                            {getFormErrorMessage("meta_title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_Description" className={classNames({ "p-error": isFormFieldValid("meta_Description") }, "Label__Text")}>
                                Meta-Description
                            </label>
                            <InputText placeholder="meta description" id="meta_Description" name="meta_Description" value={formik.values.meta_Description} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_Description") }, "Input__Round")} />

                            {getFormErrorMessage("meta_Description")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="image" className={classNames({ "p-error": isFormFieldValid("image") }, "Label__Text")}>
                                High Quality Image
                            </label>
                            <InputText type="file" id="image" name="image" onChange={(e) => handleUpload(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("image") }, "Input__RoundFile")} />

                            {getFormErrorMessage("image")}
                        </div>
                        {images && (
                            <div style={{ position: "relative" }}>
                                <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={urls}></img>
                                <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe()}></i>
                            </div>
                        )}
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                Description
                            </label>
                            <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text1} onEditorStateChange={handleState} onContentStateChange={handlecontent} />

                            {getFormErrorMessage("description")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideTyreBrandsDialog()} type="button" />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default AddTyreBrandsDialog;
