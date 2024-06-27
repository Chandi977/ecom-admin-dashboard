import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import AddFeatureDialog from "./AddFeatureDialog";
import AddTyreBrandDialog from "./AddTyreBrandDialog";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import Dropzone from "react-dropzone";
import { HiCamera } from "react-icons/hi";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

function TyreBrand() {
    const [showDialog, setShowDialog] = useState(false);
    const [showDialogBrand, setShowDialogBrand] = useState(false);
    const breadItems = [{ label: "Home" }, { label: "Tyre Brand" }];
    const home = { icon: "pi pi-home", url: "/" };
    const [des, setDes] = useState(true);
    const [feature, setfeature] = useState(false);
    const [tyre, setTyre] = useState(true);
    const [pattern, setPattern] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const [brandData, setBrandData] = useState();
    const [editable, setEditable] = useState(false);
    const history = useHistory();
    const { id } = useParams();
    const [description, setDesciption] = useState(EditorState.createEmpty());
    const [selectedFeature, setSelectedFeature] = useState([]);
    const [tyres, setTyres] = useState([]);
    const [image, setImage] = useState();
    const [url, setUrl] = useState();
    const [text1, setText1] = useState();
    const [role, setRole] = useState();

    const makecall = async (image) => {
        const result = await handleGetRequest(`/getImage?image=${image}`);
        return result?.data?.url;
    };

    const getDetails = async () => {
        const res = await handleGetRequest(`/tyre_manufacturer/${id}`);
        const tire = await handleGetRequest(`/tyres/manufacturer/${res?.data?._id}`);
        const keyData = res?.data;
        setBrandData(keyData);
        setTyres(tire?.data);
        setImage(res?.data?.image);
        const temp = await makecall(res?.data?.image);
        setUrl(temp);

        Object.keys(keyData).forEach((key) => {
            if (formik.initialValues.hasOwnProperty(key)) {
                formik.setFieldValue(key, keyData[key]);
            }
        });
    };
    useEffect(() => {
        getDetails();
    }, [id]);

    useEffect(() => {
        if (brandData) {
            const contentBlock = htmlToDraft(brandData?.description);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const editorState = EditorState.createWithContent(contentState);
                setDesciption(editorState);
            }
        }
    }, [brandData]);

    useEffect(() => {
        if (brandData) {
            const temp = [];
            brandData.features.forEach((feature) => {
                temp.push(feature?.feature?._id);
            });
            setSelectedFeature(temp);
        }
    }, [brandData]);

    const handleSelection = () => {
        if (des) {
            setDes(false);
            setfeature(true);
        } else {
            setDes(true);
            setfeature(false);
        }
    };
    const handleHeaderSelection = () => {
        if (tyre) {
            setTyre(false);
            setPattern(true);
        } else {
            setTyre(true);
            setPattern(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            title: "",
            createdAt: "",
            meta_Description: "",
            meta_title: "",
        },

        onSubmit: async (data) => {
            const dat = {
                id: brandData?.id,
                title: data?.title,
                meta_title: data?.meta_title,
                meta_Description: data?.meta_Description,
                description: text1,
                image: image,
            };
            const result = await handlePutRequest(dat, "/edit/tyre_manufacturer");
            console.log(result);
            if (result?.success) {
                getDetails();
                toast.success("tyre manufacturer edited");
            }
        },
    });

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };
    const menu = useRef(null);
    const handleActionButton = (e, rowdata) => {
        e.preventDefault();
        history.push(`/tyreprofile/${rowdata?.tyre_id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleActionButton(e, rowData)} aria-controls="popup_menu" aria-haspopup />
            </div>
        );
    };
    const onHideFeatureDialog = () => {
        setShowDialog(false);
    };

    const onHideTyreBrandDialog = () => {
        setShowDialogBrand(false);
    };
    const handleeditable = () => {
        if (editable) {
            setEditable(false);
        } else {
            setEditable(true);
        }
    };
    const handleCancel = () => {
        history.push("/tyrebrands");
    };

    const handleFeature = (id) => {
        let temp = selectedFeature;
        const index = selectedFeature.indexOf(id);
        if (index === -1) {
            temp.push(id);
        } else {
            const Te = temp.filter((x) => x !== id);
            temp = Te;
        }
        setSelectedFeature(temp);
        console.log(temp);
    };

    const handleFeatureDelete = async () => {
        const fetures = [];
        selectedFeature.forEach((fe) => {
            fetures.push({
                feature: fe,
            });
        });
        const data = {
            id: brandData?.id,
            features: fetures,
        };
        const result = await handlePutRequest(data, "/edit/tyre_manufacturer");
        if (result?.success) {
            getDetails();
        }
    };

    const handleSuccess = () => {
        getDetails();
        onHideFeatureDialog();
    };

    const hnaldePrice = (rowData) => {
        return <p>{rowData?.price?.default_price}</p>;
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

    const handleState = (editorState) => {
        setDesciption(editorState);
    };

    const handlecontent = (contentState) => {
        let temp = draftToHtml(contentState);
        setText1(temp);
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    return (
        <>
            <Dialog visible={showDialog} header="Add Feature" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <AddFeatureDialog onHideFeatureDialog={onHideFeatureDialog} brand={brandData} handleSuccess={handleSuccess} />
            </Dialog>
            <Dialog visible={showDialogBrand} header="Tyre Brand" style={{ width: "650px" }} onHide={() => setShowDialogBrand(false)}>
                <AddTyreBrandDialog onHideTyreBrandDialog={onHideTyreBrandDialog} />
            </Dialog>

            <div className="customer_header__">
                <div className="left___">
                    <h2>{brandData?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src={url} />
                    <div className="id_section">
                        <div style={{ display: "flex" }}>
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
                                    <InputText disabled={role === "calling" ? true : false} id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                                    {getFormErrorMessage("title")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Created On
                                    </label>
                                    <InputText disabled={true} id="createdAt" name="createdAt" value={formik.values.createdAt} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

                                    {getFormErrorMessage("createdAt")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="meta_Description" className={classNames({ "p-error": isFormFieldValid("meta_Description") }, "Label__Text")}>
                                        Meta Description
                                    </label>
                                    <InputText
                                        disabled={role === "calling" || role === "manager" ? true : false}
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
                                        disabled={role === "calling" || role === "manager" ? true : false}
                                        id="meta_title"
                                        name="meta_title"
                                        value={formik.values.meta_title}
                                        onChange={formik.handleChange}
                                        className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")}
                                    />

                                    {getFormErrorMessage("meta_title")}
                                </div>
                            </div>
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" onClick={handleCancel} />
                            <Button label="Update" className="Btn__Dark" type="submit" />
                        </div>
                    </form>
                </div>
            </div>

            <div className="selection_area">
                <div className={des ? "selected" : "unselected"} onClick={handleSelection}>
                    <p>Description</p>
                </div>
            </div>

            {role === "admin" || role === "manager" || role === "digital marketing" ? (
                <div className="des_div">
                    <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={description} onEditorStateChange={handleState} onContentStateChange={handlecontent} />
                </div>
            ) : null}
        </>
    );
}

export default TyreBrand;
