import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { BreadCrumb } from "primereact/breadcrumb";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { HiCamera } from "react-icons/hi";
import AddTyrePatternProfileDialog from "./AddTyrePatternProfileDialog";
import { Dialog } from "primereact/dialog";
import { handleGetRequest } from "../../services/GetTemplate";
import { useParams } from "react-router-dom";
import moment from "moment";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import Dropzone from "react-dropzone";
import { handlePostRequest } from "../../services/PostTemplate";
import { useDispatch } from "react-redux";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

function TyrePatternProfile() {
    const [des, setDes] = useState(true);
    const [warranty, setWarranty] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [pattern, setPattern] = useState();
    const [description, setDescription] = useState();
    const [warrantyCluase, setWarrantyClause] = useState();
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [text2, setText2] = useState(EditorState.createEmpty());
    const [brands, setBrands] = useState([]);
    const [selected, setSelected] = useState();
    const [image, setImage] = useState();
    const [url, setUrl] = useState();
    const [warrantyImage, setWarrantyImage] = useState();
    const [warrantyUrl, setWarrantyUrl] = useState();
    const [role, setRole] = useState();

    const breadItems = [{ label: "Home" }, { label: "Tyre Pattern" }, { label: pattern?.title }];
    const home = {
        icon: "pi pi-home",
        url: "/",
    };
    const { id } = useParams();
    const handleSelection = () => {
        if (des) {
            setDes(false);
            setWarranty(true);
        } else {
            setDes(true);
            setWarranty(false);
        }
    };

    const makecall = async (image) => {
        const result = await handleGetRequest(`/getImage?image=${image}`);
        return result?.data?.url;
    };

    const getData = async () => {
        const result = await handleGetRequest(`/pattern/${id}`);
        const results = await handleGetRequest("/getAll/Tyre/manufacturer");
        const temp = results?.data?.filter((x) => x?._id === result?.data?.manufacturer?._id);
        setBrands(results?.data);
        setSelected(temp?.[0]?._id);
        setPattern(result?.data);
        const contentBlock = htmlToDraft(result?.data?.description);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setText1(editorState);
        }
        const contentBlock2 = htmlToDraft(result?.data?.warranty_clause);
        if (contentBlock2) {
            const contentState = ContentState.createFromBlockArray(contentBlock2.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setText2(editorState);
        }
        setImage(result?.data?.Image);
        const temp1 = await makecall(result?.data?.Image);
        setUrl(temp1);
        setWarrantyImage(result?.data?.warranty_image);
        const temp2 = await makecall(result?.data?.warranty_image);
        setWarrantyUrl(temp2);
    };

    useEffect(() => {
        getData();
    }, [id]);
    const formik = useFormik({
        initialValues: {
            title: pattern?.title ?? "",
            createdOn: moment(pattern?.createdAt).format("DD/MM/YYYY") ?? "",
            manufacturer: pattern?.manufacturer?.title ?? "",
        },

        onSubmit: async (data) => {
            const dat = {
                id: id,
                title: data?.title,
                description: description,
                warranty_clause: warrantyCluase,
                manufacturer: selected,
                Image: image,
                warranty_image: warrantyImage,
            };
            const result = await handlePutRequest(dat, "/editPattern");
            if (result?.success) {
                toast.success("pattrn edited");
            }
        },
        enableReinitialize: true,
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const onHideTyrePatternProfileDialog = () => {
        setShowDialog(false);
    };
    const dispatch = useDispatch();

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setImage(file.name);
        setUrl(res?.data?.url);
        formik.handleSubmit();
    };

    const handleUploadWarranty = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setWarrantyImage(file.name);
        setWarrantyUrl(res?.data?.url);
        formik.handleSubmit();
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
        setWarrantyClause(temp);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    return (
        <>
            <Dialog visible={showDialog} header="Add Tyre Pattern Profile" style={{ width: "650px" }} onHide={() => setShowDialog(false)}>
                <AddTyrePatternProfileDialog onHideTyrePatternProfileDialog={onHideTyrePatternProfileDialog} />
            </Dialog>

            <div className="customer_header__">
                <div className="left___">
                    <h2>{pattern?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="details_div__">
                <div className="tyre_left">
                    <div className="badge_div">
                        <div className="__card">
                            <div>
                                <img src={url} style={{ width: "100%" }} />
                            </div>
                            <Dropzone onDrop={(acceptedFiles) => handleUpload(acceptedFiles[0])}>
                                {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <p>
                                            <HiCamera />
                                        </p>
                                    </div>
                                )}
                            </Dropzone>
                        </div>
                        <div className="__card">
                            <div>
                                <img src={warrantyUrl} style={{ width: "100%" }} />
                            </div>
                            <Dropzone onDrop={(acceptedFiles) => handleUploadWarranty(acceptedFiles[0])}>
                                {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <p>
                                            <HiCamera />
                                        </p>
                                    </div>
                                )}
                            </Dropzone>
                        </div>
                    </div>
                    <div className="id_section">
                        <div>
                            <p>ID:</p>
                            <p>&nbsp;{pattern?.id}</p>
                        </div>
                        <div>
                            <Button label="Active" className="green_btn"></Button>
                        </div>
                    </div>
                </div>
                <div className="tyre_right">
                    <div className="right_section" style={{ width: "100%" }}>
                        <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                            <div className="form__" style={{ width: "100%" }}>
                                <div className="form_left" style={{ width: "50%" }}>
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
                                        <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                            Title
                                        </label>
                                        <InputText disabled={role === "calling" ? true : false} id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                                        {getFormErrorMessage("name")}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
                                        <label htmlFor="createdOn" className={classNames({ "p-error": isFormFieldValid("createdOn") }, "Label__Text")}>
                                            Created On
                                        </label>
                                        <InputText disabled={true} id="createdOn" name="createdOn" value={formik.values.createdOn} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdOn") }, "Input__Round")} />

                                        {getFormErrorMessage("createdOn")}
                                    </div>
                                </div>
                                <div className="form_right">
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
                                        <label htmlFor="manufacturer" className={classNames({ "p-error": isFormFieldValid("manufacturer") }, "Label__Text")}>
                                            Tyre Manufacturer
                                        </label>
                                        <select disabled={role === "calling" || role === "digital marketing" ? true : false} className="select__" value={selected} onChange={(e) => setSelected(e.target.value)}>
                                            {brands?.map((brand, index) => {
                                                return <option value={brand?._id}>{brand?.title}</option>;
                                            })}
                                        </select>
                                        {getFormErrorMessage("manufacturer")}
                                    </div>
                                </div>
                            </div>

                            <div className="Down__Btn">
                                <Button label="Cancel" className="Btn__Transparent" />
                                <Button label="Edit" className="Btn__Dark" />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {role === "admin" || role === "manager" || role === "digital marketing" ? (
                <div className="selection_area">
                    <div className={des ? "selected" : "unselected"} onClick={handleSelection}>
                        <p>Description</p>
                    </div>
                    <div className={warranty ? "selected" : "unselected"} onClick={handleSelection}>
                        <p>Warranty Clause</p>
                    </div>
                </div>
            ) : null}
            {role === "admin" || role === "manager" || role === "digital marketing" ? (
                des ? (
                    <div className="des_div">
                        <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text1} onEditorStateChange={handleStateD} onContentStateChange={handlecontentD} />
                    </div>
                ) : (
                    <div className="des_div">
                        <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text2} onEditorStateChange={handleStateW} onContentStateChange={handlecontentW} />
                    </div>
                )
            ) : null}
        </>
    );
}

export default TyrePatternProfile;
