import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import { RadioButton } from "primereact/radiobutton";
import Select from "react-select";
import AddFeatureDialog from "./AddFeatureDialog";
import { handlePutRequest } from "../../services/PutTemplate";
import { cities } from "../../assets/data/cities";
import { toast } from "react-toastify";
import { handlePostRequest } from "../../services/PostTemplate";
import { useDispatch } from "react-redux";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

function TyreProfile() {
    const [showDialog, setShowDialog] = useState(false);
    const breadItems = [{ label: "Home" }, { label: "Tyre Brand" }];
    const home = { icon: "pi pi-home", url: "/" };
    const [des, setDes] = useState(true);
    const [tyre, setTyre] = useState(true);
    const [pattern, setPattern] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const [tyreData, setTyreData] = useState();
    const [type, setType] = useState();
    const [vehicle, setVehicle] = useState([]);
    const [delivery, setDelivery] = useState();
    const [availability, setAvailablity] = useState();
    const [brand, setBrand] = useState();
    const [patter, setPatter] = useState();
    const [brands, setBrands] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [vehicl, setvehicles] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState([]);
    const [productD, setProdcutD] = useState();
    const [warranty, setWarranty] = useState();
    const [benefits, setBenefits] = useState();
    const [description, setDescription] = useState();
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [text2, setText2] = useState(EditorState.createEmpty());
    const [text3, setText3] = useState(EditorState.createEmpty());
    const [text4, setText4] = useState(EditorState.createEmpty());
    const [fearues, setFeatures] = useState([]);
    const [priceList, setPriceList] = useState([]);
    const [faq, setFaq] = useState([]);
    const [images, setImages] = useState([]);
    const [Url, setUrl] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [role, setRole] = useState();

    console.log(availability, delivery);

    const { id } = useParams();

    const makecall = async (image) => {
        const result = await handleGetRequest(`/getImage?image=${image}`);
        return result?.data?.url;
    };

    const processimages = async (images) => {
        let result;
        let temp = images;
        for (let i = 0; i < images?.length; i++) {
            result = await makecall(images[i]);
            temp[i] = result;
        }
        return temp;
    };

    const getData = async () => {
        const res = await handleGetRequest(`/tyre/${id}`);
        const result = await handleGetRequest("/features");
        const fe = result?.data?.map((f) => {
            return f?._id;
        });
        setFeatures(fe);
        console.log(res?.data?.tyre);
        setTyreData(res?.data?.tyre);
        setType(res?.data?.tyre?.tyre_type);
        setBrand(res?.data?.tyre?.tyre_manufacturer?._id);
        setPatter(res?.data?.tyre?.pattern?._id);
        setDelivery(res?.data?.tyre?.cash_On_Delivery);
        setReviews(res?.data?.tyre?.reviews);
        const contentBlock = htmlToDraft(res?.data?.tyre?.description);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setText1(editorState);
        }
        const contentBlock2 = htmlToDraft(res?.data?.tyre?.warranty_clause);
        if (contentBlock2) {
            const contentState = ContentState.createFromBlockArray(contentBlock2.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setText2(editorState);
        }
        const contentBlock3 = htmlToDraft(res?.data?.tyre?.product_description);
        if (contentBlock3) {
            const contentState = ContentState.createFromBlockArray(contentBlock3.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setText3(editorState);
        }
        const contentBlock4 = htmlToDraft(res?.data?.tyre?.feature_offer);
        if (contentBlock4) {
            const contentState = ContentState.createFromBlockArray(contentBlock4.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setText4(editorState);
        }
        setPriceList(res?.data?.tyre?.price?.price_list);
        setFaq(res?.data?.tyre?.faq);
        const ima = res?.data?.tyre?.images?.map((im) => {
            return im?.image;
        });
        const resa = await processimages(ima);
        setImages(resa);
        const temp = res?.data?.tyre?.compatible_vehicles.map((element) => {
            return {
                label: `${element?.vehicle?.manufacturer?.title} ${element?.vehicle?.model?.title} ${element?.vehicle?.title}`,
                value: element?.vehicle?._id,
            };
        });
        setVehicle(temp);
        setAvailablity(res?.data?.tyre?.availability);
        const temps = res?.data?.tyre?.images?.map((im) => {
            return im?.image;
        });
        setUrl(temps);
    };
    useEffect(() => {
        getData();
    }, [id]);

    const getDat = async () => {
        const bran = await handleGetRequest("/getAll/Tyre/manufacturer");
        const patten = await handleGetRequest("/all/Patterns");
        const vehicle = await handleGetRequest(`/vehicle/getAll`);
        const temp = vehicle?.data?.map((element) => {
            return {
                label: `${element?.manufacturer?.title} ${element?.model?.title} ${element?.title}`,
                value: element?._id,
            };
        });
        setvehicles(temp);
        setBrands(bran?.data);
        setPatterns(patten?.data);
    };

    useEffect(() => {
        getDat();
    }, []);
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
            tyre_id: tyreData?.tyre_id ?? "",
            title: tyreData?.title ?? "",
            price: tyreData?.price?.default_price ?? 0,
            tyre_width: tyreData?.tyre_width ?? "",
            tyre_height: tyreData?.tyre_height ?? "",
            discount: tyreData?.discount ?? "",
            rim_diameter: tyreData?.rim_diameter ?? "",
            load_index: tyreData?.load_index ?? "",
            tyre_manufacturer: "",
            vehicleManufacturer: "",
            pattern: "",
            tubeless: tyreData?.tubeless === "true" ? "Y" : "N",
            meta_title: tyreData?.meta_title ?? "",
            meta_Description: tyreData?.meta_Description ?? "",
            tyre_profile: tyreData?.tyre_profile ?? "",
            tyre_type: "",
            feature_offer: "",
            images: "",
            cash_On_Delivery: "",
            availability: "",
            series: tyreData?.series ?? "",
            compatible_vehicles: "",
            number_of_tyres: "",
        },
        enableReinitialize: true,

        onSubmit: async (data) => {
            const veh = vehicle?.map((vehi) => {
                return {
                    vehicle: vehi?.value,
                };
            });
            const imu = Url?.map((im) => {
                return {
                    image: im,
                };
            });
            const dat = {
                tyre_id: parseInt(data?.tyre_id),
                tyre_width: parseInt(data?.tyre_width),
                tyre_height: parseInt(data?.tyre_height),
                tyre_profile: parseInt(data?.tyre_profile),
                rim_diameter: parseInt(data?.rim_diameter),
                tyre_manufacturer: brand,
                title: data?.title,
                description: description,
                pattern: patter,
                tyre_type: type,
                load_index: data?.load_index,
                tubeless: data?.tubeless === "N" ? false : true,
                series: data?.series,
                feature_offer: benefits,
                product_description: productD,
                warranty_clause: warranty,
                compatible_vehicles: veh,
                meta_title: data?.meta_title,
                meta_Description: data?.meta_Description,
                faq: faq,
                default_price: data?.price,
                price_list: priceList,
                availability: availability,
                cash_On_Delivery: delivery,
                discount: parseInt(data?.discount),
                images: imu,
                number_of_tyres: parseInt(data?.number_of_tyres),
            };
            const result = await handlePutRequest(dat, "/editTyre");
            if (result?.success) {
                toast.success("tyre edited");
                getData();
            }
        },
    });

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };
    const history = useHistory();
    const menu = useRef(null);
    const handleRoute = (e, rowData) => {
        e.preventDefault();
        history.push(`/modeldetails/${rowData?.vehicle?.model?.id}`);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(e) => handleRoute(e, rowData)} aria-controls="popup_menu" aria-haspopup />
            </div>
        );
    };
    const onHideFeatureDialog = () => {
        setShowDialog(false);
    };
    const vehicleModal = (rowData) => {
        return rowData?.vehicle?.model?.title;
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
        fearues.forEach((fe) => {
            if (selectedFeature.includes(fe)) {
            } else {
                fetures.push({
                    feature: fe,
                });
            }
        });

        const data = {
            tyre_id: tyreData?.tyre_id,
            features: fetures,
            default_price: tyreData?.price?.default_price,
            price_list: tyreData?.price?.price_list,
        };
        const result = await handlePutRequest(data, "/editTyre");
        if (result?.success) {
            getData();
        }
    };

    const handleSuccess = () => {
        onHideFeatureDialog();
        getData();
    };

    const addPriceList = () => {
        setPriceList([
            ...priceList,
            {
                amount: "",
                city: "",
            },
        ]);
    };

    const addFaq = () => {
        setFaq([
            ...faq,
            {
                question: "",
                answer: "",
            },
        ]);
    };

    const handlePriceList = (value, names, index) => {
        const temp = priceList;
        if (names === "amount") {
            temp[index][names] = parseInt(value);
        } else {
            temp[index][names] = value;
        }
        setPriceList(temp);
    };

    const handleFaq = (value, names, index) => {
        const temp = faq;
        temp[index][names] = value;
        setFaq(temp);
    };
    const dispatch = useDispatch();

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setImages([...images, res?.data?.url]);
        setUrl([...Url, file.name]);
    };

    const handleRemvoe = (index) => {
        const temp = Url;
        const temp2 = images;
        var spliced1 = temp.splice(index, 1);
        var spliced2 = temp2.splice(index, 1);
        const filtered = temp.filter((x) => x !== spliced1);
        const filtered2 = temp2.filter((x) => x !== spliced2);
        setImages(filtered2);
        setUrl(filtered);
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
        setWarranty(temp);
    };

    const handleStatePD = (editorState) => {
        setText3(editorState);
    };

    const handlecontentPD = (contentState) => {
        let temp = draftToHtml(contentState);
        setProdcutD(temp);
    };

    const handleStateB = (editorState) => {
        setText4(editorState);
    };

    const handlecontentB = (contentState) => {
        let temp = draftToHtml(contentState);
        setBenefits(temp);
    };

    const handleReviewChange = async (rowData, value) => {
        const index = reviews?.map((x) => x.name).indexOf(rowData?.name);
        const rev = reviews;
        rev[index].status = value;
        const data = {
            id: tyreData?._id,
            reviews: rev,
        };
        const result = await handlePutRequest(data, "/changeReviewStatus");
        if (result?.success) {
            getData();
        }
    };

    const ReviewSection = (rowData) => {
        return (
            <select defaultValue={rowData?.status} style={{ width: "100px", height: "30px", borderRadius: "10px" }} onChange={(e) => handleReviewChange(rowData, e.target.value)}>
                <option value="pending">pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        );
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    console.log(reviews);
    return (
        <>
            <Dialog visible={showDialog} header="Add Tyre Profile" style={{ width: "650px" }} onHide={() => setShowDialog(false)}>
                <AddFeatureDialog onHideFeatureDialog={onHideFeatureDialog} brand={tyreData} handleSuccess={handleSuccess} />
            </Dialog>

            <div className="customer_header__">
                <div className="left___">
                    <h2>{tyreData?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src={images?.[0]} />
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
                        <div>
                            <Button label="Active" className="green_btn"></Button>
                        </div>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                            Title
                                        </label>
                                        <InputText disabled={role === "calling" ? true : false} id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                                        {getFormErrorMessage("title")}
                                    </div>
                                </div>

                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="price" className={classNames({ "p-error": isFormFieldValid("price") }, "Label__Text")}>
                                            Price
                                        </label>
                                        <InputText disabled={role === "calling" || role === "digital marketing" ? true : false} id="price" name="price" value={formik.values.price} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("price") }, "Input__Round")} />

                                        {getFormErrorMessage("price")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="tyre_width" className={classNames({ "p-error": isFormFieldValid("tyre_width") }, "Label__Text")}>
                                            Tyre Width
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            id="tyre_width"
                                            name="tyre_width"
                                            value={formik.values.tyre_width}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("tyre_width") }, "Input__Round")}
                                        />

                                        {getFormErrorMessage("tyre_width")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="tyre_profile" className={classNames({ "p-error": isFormFieldValid("tyre_profile") }, "Label__Text")}>
                                            Tyre Profile
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            id="tyre_profile"
                                            name="tyre_profile"
                                            value={formik.values.tyre_profile}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("tyre_profile") }, "Input__Round")}
                                        />

                                        {getFormErrorMessage("tyre_profile")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="tyre_height" className={classNames({ "p-error": isFormFieldValid("tyre_height") }, "Label__Text")}>
                                            Speed Rating
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            id="tyre_height"
                                            name="tyre_height"
                                            value={formik.values.tyre_height}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("tyre_height") }, "Input__Round")}
                                        />

                                        {getFormErrorMessage("tyre_height")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="discount" className={classNames({ "p-error": isFormFieldValid("discount") }, "Label__Text")}>
                                            Discount(%)
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            id="discount"
                                            name="discount"
                                            value={formik.values.discount}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("discount") }, "Input__Round")}
                                        />

                                        {getFormErrorMessage("discount")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="rim_diameter" className={classNames({ "p-error": isFormFieldValid("rim_diameter") }, "Label__Text")}>
                                            Rim Diameter In Inches
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            id="rim_diameter"
                                            name="rim_diameter"
                                            value={formik.values.rim_diameter}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("rim_diameter") }, "Input__Round")}
                                        />

                                        {getFormErrorMessage("rim_diameter")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="load_index" className={classNames({ "p-error": isFormFieldValid("load_index") }, "Label__Text")}>
                                            Load Index
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            id="load_index"
                                            name="load_index"
                                            value={formik.values.load_index}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("load_index") }, "Input__Round")}
                                        />

                                        {getFormErrorMessage("load_index")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="tyre_manufacturer" className={classNames({ "p-error": isFormFieldValid("tyre_manufacturer") }, "Label__Text")}>
                                            Tyre Manufacturer
                                        </label>
                                        <select className="select__" value={brand} onChange={(e) => setBrand(e.target.value)} disabled={role === "calling" || role === "digital marketing" ? true : false}>
                                            {brands?.map((bran) => {
                                                return (
                                                    <option value={bran?._id} selected={brand === bran?._id ? true : false}>
                                                        {bran?.title}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        {getFormErrorMessage("tyre_manufacturer")}
                                    </div>
                                </div>

                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="pattern" className={classNames({ "p-error": isFormFieldValid("pattern") }, "Label__Text")} disabled={role === "calling" || role === "digital marketing" ? true : false}>
                                            Tyre Pattern
                                        </label>
                                        <select disabled={role === "calling" || role === "digital marketing" ? true : false} className="select__" value={patter} onChange={(e) => setPatter(e.target.value)}>
                                            {patterns?.map((bran) => {
                                                return (
                                                    <option value={bran?._id} selected={patter === bran?._id ? true : false}>
                                                        {bran?.title}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {getFormErrorMessage("pattern")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="number_of_tyres" className={classNames({ "p-error": isFormFieldValid("number_of_tyres") }, "Label__Text")}>
                                            Number Of Tyres
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            id="number_of_tyres"
                                            name="number_of_tyres"
                                            value={formik.values.number_of_tyres}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("number_of_tyres") }, "Input__Round")}
                                        />

                                        {getFormErrorMessage("number_of_tyres")}
                                    </div>
                                </div>
                            </div>
                            <div className="form_right">
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="tyre_type" className={classNames({ "p-error": isFormFieldValid("tyre_type") }, "Label__Text")}>
                                            Tyre Type
                                        </label>
                                        <select disabled={role === "calling" || role === "digital marketing" ? true : false} className="select__" value={type} onChange={(e) => setType(e.target.value)}>
                                            <option value="featured" selected={type === "featured" ? true : false}>
                                                featured
                                            </option>
                                            <option value="economy" selected={type === "economy" ? true : false}>
                                                economy
                                            </option>
                                            <option value="premium" selected={type === "premium" ? true : false}>
                                                premium
                                            </option>
                                        </select>
                                        {getFormErrorMessage("tyre_type")}
                                    </div>
                                </div>
                                {role === "admin" || role === "manager" ? (
                                    <div className="p-field col-12 md:col-6" style={{ height: "auto" }}>
                                        <div className="p-field" style={{ height: "auto" }}>
                                            <label htmlFor="compatible_vehicles" className={classNames({ "p-error": isFormFieldValid("compatible_vehicles") }, "Label__Text")}>
                                                Compatible Vehicles
                                            </label>
                                            <Select disabled={role === "calling" || role === "digital marketing" ? true : false} className="select__" options={vehicl} value={vehicle} onChange={setVehicle} isMulti={true}></Select>
                                            {getFormErrorMessage("compatible_vehicles")}
                                        </div>
                                    </div>
                                ) : null}
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field" style={{ display: "flex", flexDirection: "column", marginTop: "20px" }}>
                                        <label htmlFor="images" className={classNames({ "p-error": isFormFieldValid("images") }, "Label__Text")}>
                                            Images
                                        </label>
                                        <InputText
                                            disabled={role === "calling" || role === "digital marketing" ? true : false}
                                            type="file"
                                            id="images"
                                            name="images"
                                            value={formik.values.images}
                                            onChange={(e) => handleUpload(e.target.files[0])}
                                            className={classNames({ "p-invalid": isFormFieldValid("images") }, "Input__RoundFile")}
                                        />
                                        <div
                                            style={{
                                                display: "flex",
                                                columnGap: "10px",
                                                marginTop: "20px",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {role === "admin" || role === "manager"
                                                ? images?.map((img, index) => {
                                                      return (
                                                          <div style={{ position: "relative" }} key={index}>
                                                              <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={img}></img>
                                                              <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe(index)}></i>
                                                          </div>
                                                      );
                                                  })
                                                : null}
                                        </div>

                                        {getFormErrorMessage("images")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="cash_On_Delivery" className={classNames({ "p-error": isFormFieldValid("cash_On_Delivery") }, "Label__Text")}>
                                            Cash on Delivery
                                        </label>
                                        <select disabled={role === "calling" || role === "digital marketing" ? true : false} className="select__" value={delivery} onChange={(e) => setDelivery(e.target?.value === "true" ? true : false)}>
                                            <option value={true} selected={delivery === true ? true : false}>
                                                yes
                                            </option>
                                            <option value={false} selected={delivery === true ? true : false}>
                                                no
                                            </option>
                                        </select>
                                        {getFormErrorMessage("cash_On_Delivery")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="availability" className={classNames({ "p-error": isFormFieldValid("availability") }, "Label__Text")}>
                                            Availability
                                        </label>
                                        <select disabled={role === "calling" || role === "digital marketing" ? true : false} className="select__" value={availability} onChange={(e) => setAvailablity(e.target?.value === "true" ? true : false)}>
                                            <option value={true} selected={availability === true ? true : false}>
                                                yes
                                            </option>
                                            <option value={false} selected={availability === true ? true : false}>
                                                out of stock
                                            </option>
                                        </select>
                                        {getFormErrorMessage("availability")}
                                    </div>
                                </div>
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                            Meta-Title
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
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field">
                                        <label htmlFor="meta_Description" className={classNames({ "p-error": isFormFieldValid("meta_Description") }, "Label__Text")}>
                                            Meta-Description
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
                                </div>
                                <div className="field___">
                                    <label htmlFor="tubeless" className="Label__Text" style={{ paddingBottom: "5px", marginRight: "auto" }}>
                                        Tubeless
                                    </label>
                                    <div className="Radio__Btn">
                                        <div className="p-field-radiobutton">
                                            <RadioButton disabled={role === "calling" || role === "digital marketing" ? true : false} inputId="tubeless" name="tubeless" value={"Y"} onChange={formik.handleChange} checked={formik.values.tubeless === "Y"} />
                                            <label htmlFor="tubeless">Yes</label>
                                        </div>
                                        <div className="p-field-radiobutton">
                                            <RadioButton disabled={role === "calling" || role === "digital marketing" ? true : false} inputId="tubeless" name="tubeless" value={"N"} onChange={formik.handleChange} checked={formik.values.tubeless === "N"} />
                                            <label htmlFor="tubeless">No</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="field___">
                            <div className="p-field">
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                        Price List
                                    </label>
                                    <Button disabled={role === "calling" || role === "digital marketing" ? true : false} label="Add City" onClick={() => addPriceList()} style={{ height: "35px", width: "100px" }} type="button"></Button>
                                </div>
                                {priceList?.map((fa, index) => {
                                    return (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                rowGap: "10px",
                                                marginTop: "10px",
                                                borderBottom: "1px solid #cecece",
                                                padding: "10px 0px",
                                            }}
                                        >
                                            <InputText disabled={role === "calling" || role === "digital marketing" ? true : false} id="question" name="question" defaultValue={fa?.amount} onChange={(e) => handlePriceList(e.target.value, "amount", index)} className={classNames("Input__Round")} />
                                            <select disabled={role === "calling" || role === "digital marketing" ? true : false} defaultValue={fa?.city} onChange={(e) => handlePriceList(e.target.value, "city", index)} className="select__">
                                                <option selected disabled>
                                                    Select city
                                                </option>
                                                {cities?.map((city) => {
                                                    return <option value={city}>{city}</option>;
                                                })}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="field___" style={{ marginTop: "20px" }}>
                            <div className="p-field">
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                        Faq
                                    </label>
                                    <Button disabled={role === "calling" || role === "manager" ? true : false} label="Add Faq" style={{ width: "100px", height: "35px" }} onClick={() => addFaq()} type="button"></Button>
                                </div>
                                {faq?.map((fa, index) => {
                                    return (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                rowGap: "10px",
                                                marginTop: "10px",
                                                borderBottom: "1px solid #cecece",
                                                padding: "10px 0px",
                                            }}
                                        >
                                            <InputText disabled={role === "calling" || role === "manager" ? true : false} id="question" defaultValue={fa?.question} name="question" onChange={(e) => handleFaq(e.target.value, "question", index)} className={classNames("Input__Round")} />
                                            <InputText disabled={role === "calling" || role === "manager" ? true : false} id="answer" name="answer" defaultValue={fa?.answer} onChange={(e) => handleFaq(e.target.value, "answer", index)} className={classNames("Input__Round")} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" />
                            <Button label="Update" className="Btn__Dark" type="submit" />
                        </div>
                    </form>
                </div>
            </div>
            <div className="description_area">
                <div className="left__">
                    {role === "admin" || role === "manager" || role === "digital marketing" ? (
                        <div className="p-field col-12 md:col-12">
                            <div className="p-field">
                                <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                    Description
                                </label>
                                <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text1} onEditorStateChange={handleStateD} onContentStateChange={handlecontentD} />

                                {getFormErrorMessage("description")}
                            </div>
                        </div>
                    ) : null}
                    {role === "admin" || role === "manager" || role === "digital marketing" ? (
                        <div className="p-field col-12 md:col-12">
                            <div className="p-field">
                                <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                    Warranty Clause
                                </label>
                                <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text2} onEditorStateChange={handleStateW} onContentStateChange={handlecontentW} />
                            </div>
                        </div>
                    ) : null}
                </div>
                {role === "admin" || role === "manager" || role === "digital marketing" ? (
                    <div className="right__">
                        <div className="p-field col-12 md:col-12">
                            <div className="p-field">
                                <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                    Product Description
                                </label>
                                <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text3} onEditorStateChange={handleStatePD} onContentStateChange={handlecontentPD} />
                            </div>
                        </div>
                        <div className="p-field col-12 md:col-12">
                            <div className="p-field">
                                <label htmlFor="features" className={classNames({ "p-error": isFormFieldValid("features") }, "Label__Text")}>
                                    Features and Benefits
                                </label>
                                <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text4} onEditorStateChange={handleStateB} onContentStateChange={handlecontentB} />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
            {role === "admin" || role === "manager" ? (
                <div className="selection_area">
                    <div className={tyre ? "selected" : "unselected"} onClick={handleHeaderSelection}>
                        <p>Vehicle Model</p>
                    </div>
                    <div className={pattern ? "selected" : "unselected"} onClick={handleHeaderSelection}>
                        <p>Features</p>
                    </div>
                </div>
            ) : null}
            {role === "admin" || role === "manager" ? (
                tyre ? (
                    <div className="grid">
                        <div className="col-12">
                            <div className="card">
                                <DataTable
                                    filterDisplay="row"
                                    paginator
                                    rows={5}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                                    emptyMessage="No List found."
                                    responsiveLayout="scroll"
                                    value={tyreData?.compatible_vehicles}
                                    selection={selectedRow}
                                    onSelectionChange={(e) => setselectedRow(e.value)}
                                >
                                    <Column selectionMode="multiple" style={{ width: "3em" }} />
                                    <Column filter body={vehicleModal} header="Name" />
                                    <Column header="Action" body={actionBodyTemplate} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="features_div">
                        <div className="Page__Header">
                            <div>
                                <h4>Features</h4>
                            </div>
                            <div className="Top__Btn">
                                <Button label="Add" icon="pi pi-plus" iconPos="right" className="Btn__DarkAdd" style={{ width: "240px" }} onClick={() => setShowDialog(true)} />
                                <Button icon="pi pi-trash" iconPos="right" onClick={handleFeatureDelete} className="Btn__DarkDelete" style={{ width: "240px" }} />
                            </div>
                        </div>
                        <div className="cards__div2">
                            {tyreData?.features?.map((feature, index) => {
                                return (
                                    <div key={index}>
                                        <input type="checkbox" onClick={() => handleFeature(feature?.feature?._id)} />
                                        <img src={feature?.feature?.image} style={{ width: "130px", height: "110px" }}></img>
                                        <p>{feature?.feature?.title}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            ) : null}
            {role === "admin" || role === "manager" ? (
                <div className="selection_area">
                    <div className={tyre ? "selected" : "unselected"} onClick={handleHeaderSelection}>
                        <p>Reviews</p>
                    </div>
                </div>
            ) : null}
            {role === "admin" || role === "manager" ? (
                <div className="grid">
                    <div className="col-12">
                        <div className="card">
                            <DataTable
                                filterDisplay="row"
                                paginator
                                rows={5}
                                rowsPerPageOptions={[5, 10, 25]}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                                emptyMessage="No List found."
                                responsiveLayout="scroll"
                                value={reviews}
                            >
                                <Column field="name" header="User" />
                                <Column field="title" header="Title" />
                                <Column field="rating" header="Rating" />
                                <Column field="description" header="Comment" />
                                <Column body={ReviewSection} header="Status" />
                            </DataTable>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default TyreProfile;
