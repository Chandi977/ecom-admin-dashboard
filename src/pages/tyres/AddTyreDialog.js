import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import Select from "react-select";
import { cities } from "../../assets/data/cities";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";

const AddTyreDialog = ({ onHideTyreDialog, handlesuccess }) => {
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [text2, setText2] = useState(EditorState.createEmpty());
    const [text3, setText3] = useState(EditorState.createEmpty());
    const [text4, setText4] = useState(EditorState.createEmpty());
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    const [brands, setBrands] = useState([]);
    const [patterns, setPattern] = useState([]);
    const [Vehicles, setVehicles] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState();
    const [selectedPattern, setSelectedPattern] = useState();
    const [type, setType] = useState();
    const [availability, setAvailablitiy] = useState();
    const [description, setDescription] = useState();
    const [productD, setProdcutD] = useState();
    const [warranty, setWarranty] = useState();
    const [faq, setFaq] = useState([]);
    const [benefits, setBenefits] = useState();
    const [priceList, satPriceList] = useState([]);
    const [delivery, setDelivery] = useState();
    const [features, setFeatures] = useState([]);
    const [seelctedFeature, setSelectedFeature] = useState();
    const [images, setImages] = useState([]);
    const [urls, setUrls] = useState([]);
    const [selectedVehicles, setSelectedVehicles] = useState([]);

    const getData = async () => {
        const brand = await handleGetRequest("/TotalManufacturers");
        const pattern = await handleGetRequest("/all/Patterns");

        setBrands(brand?.data);
        setPattern(pattern?.data);
    };
    useEffect(() => {
        getData();
    }, []);

    const getDat = async () => {
        const result = await handleGetRequest("/features");
        const fe = result?.data?.map((fer) => {
            return {
                label: fer?.title,
                value: fer?._id,
            };
        });
        setFeatures(fe);
    };

    useEffect(() => {
        getDat();
    }, []);

    const getVehicle = async () => {
        const vehicle = await handleGetRequest(`/vehicle/getAll`);
        const temp = vehicle?.data?.map((element) => {
            return {
                label: `${element?.manufacturer?.title} ${element?.model?.title} ${element?.title}`,
                value: element?._id,
            };
        });
        setVehicles(temp);
    };

    useEffect(() => {
        getVehicle();
    }, []);

    const validationSchema = Yup.object().shape({
        title: Yup.string().required("This field is required"),
        meta_title: Yup.string().required("This field is required"),
        meta_Description: Yup.string().required("This field is required"),
        tyre_id: Yup.string().required("This field is required"),
        price: Yup.string().required("This field is required"),
        tyre_width: Yup.string().required("This field is required"),
        tyre_height: Yup.string().required("This field is required"),
        discount: Yup.string().required("This field is required"),
        rim_diameter: Yup.string().required("This field is required"),
        load_index: Yup.string().required("This field is required"),
        tubeless: Yup.string().required("This field is required"),
        tyre_profile: Yup.string().required("This field is required"),
    });
    console.log("validated schema - ", validationSchema);
    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            tyre_id: "",
            title: "",
            price: "",
            tyre_width: "",
            tyre_height: "",
            discount: "",
            rim_diameter: "",
            load_index: "",
            pattern: "",
            tubeless: "Y",
            meta_title: "",
            meta_Description: "",
            tyre_profile: "",
            feature_offer: "",
            images: "",
            cash_On_Delivery: "",
            series: "",
            number_of_tyres: "",
        },

        onSubmit: async (data) => {
            setLoading(true);
            const veh = selectedVehicles?.map((vehi) => {
                return {
                    vehicle: vehi?.value,
                };
            });

            const featu = seelctedFeature?.map((few) => {
                return {
                    feature: few?.value,
                };
            });
            const imu = images?.map((ima) => {
                return {
                    image: ima,
                };
            });
            console.log("Req body data - ", data);
            const dat = {
                tyre_id: parseInt(data?.tyre_id),
                tyre_width: parseInt(data?.tyre_width),
                tyre_height: parseInt(data?.tyre_height),
                tyre_profile: parseInt(data?.tyre_profile),
                rim_diameter: parseInt(data?.rim_diameter),
                tyre_manufacturer: selectedBrand,
                title: data?.title,
                description: description,
                pattern: selectedPattern,
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
                availability: availability === "true" ? true : false,
                cash_On_Delivery: delivery === "true" ? true : false,
                features: featu,
                discount: parseInt(data?.discount),
                images: imu,
                number_of_tyres: parseInt(data?.number_of_tyres),
            };
            const res = await dispatch(handlePostRequest(dat, "/addTyre", true, true));
            if (res !== "error") {
                handlesuccess();
            }
            console.log(dat);
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
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
    const addPriceList = () => {
        satPriceList([
            ...priceList,
            {
                amount: "",
                city: "",
            },
        ]);
    };

    const handleFaq = (value, names, index) => {
        const temp = faq;
        temp[index][names] = value;
        setFaq(temp);
    };
    const handlePriceList = (value, names, index) => {
        const temp = priceList;
        if (names === "amount") {
            temp[index][names] = parseInt(value);
        } else {
            temp[index][names] = value;
        }
        satPriceList(temp);
    };
    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        setImages([...images, file.name]);
        setUrls([...urls, res?.data?.url]);
    };
    const handleRemvoe = (index) => {
        const temp = images;
        const temp2 = urls;
        var spliced1 = temp.splice(index, 1);
        var spliced2 = temp2.splice(index, 1);
        const filtered = temp.filter((x) => x !== spliced1);
        const filtered2 = temp2.filter((x) => x !== spliced2);
        setImages(filtered);
        setUrls(filtered2);
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
    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="tyre_id" className={classNames({ "p-error": isFormFieldValid("tyre_id") }, "Label__Text")}>
                                Tyre ID
                            </label>
                            <InputText
                                id="tyre_id"
                                name="tyre_id"
                                value={formik.values.tyre_id}
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                                onChange={formik.handleChange}
                                className={classNames({ "p-invalid": isFormFieldValid("tyre_id") }, "Input__Round")}
                                placeholder="76767"
                            />

                            {getFormErrorMessage("tyre_id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="number_of_tyres" className={classNames({ "p-error": isFormFieldValid("number_of_tyres") }, "Label__Text")}>
                                Number of Tyres
                            </label>
                            <InputText placeholder="3" id="number_of_tyres" name="number_of_tyres" value={formik.values.number_of_tyres} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("number_of_tyres") }, "Input__Round")} />

                            {getFormErrorMessage("number_of_tyres")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Title
                            </label>
                            <InputText placeholder="new tyre" id="title" name="title" value={formik.values.title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("title") }, "Input__Round")} />

                            {getFormErrorMessage("title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="tyre_width" className={classNames({ "p-error": isFormFieldValid("tyre_width") }, "Label__Text")}>
                                Tyre Width
                            </label>
                            <InputText
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                                id="tyre_width"
                                name="tyre_width"
                                value={formik.values.tyre_width}
                                onChange={formik.handleChange}
                                className={classNames({ "p-invalid": isFormFieldValid("tyre_width") }, "Input__Round")}
                                placeholder="145"
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
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                                id="tyre_profile"
                                name="tyre_profile"
                                value={formik.values.tyre_profile}
                                onChange={formik.handleChange}
                                className={classNames({ "p-invalid": isFormFieldValid("tyre_profile") }, "Input__Round")}
                                placeholder="20"
                            />

                            {getFormErrorMessage("tyre_profile")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="tyre_height" className={classNames({ "p-error": isFormFieldValid("tyre_height") }, "Label__Text")}>
                                Speed Rating
                            </label>
                            <InputText placeholder="ss333" id="tyre_height" name="tyre_height" value={formik.values.tyre_height} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("tyre_height") }, "Input__Round")} />

                            {getFormErrorMessage("tyre_height")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="discount" className={classNames({ "p-error": isFormFieldValid("discount") }, "Label__Text")}>
                                Discount(%)
                            </label>
                            <InputText placeholder="20" id="discount" name="discount" value={formik.values.discount} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("discount") }, "Input__Round")} />

                            {getFormErrorMessage("discount")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="rim_diameter" className={classNames({ "p-error": isFormFieldValid("rim_diameter") }, "Label__Text")}>
                                Rim Diameter In Inches
                            </label>
                            <InputText
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                                id="rim_diameter"
                                name="rim_diameter"
                                value={formik.values.rim_diameter}
                                onChange={formik.handleChange}
                                className={classNames({ "p-invalid": isFormFieldValid("rim_diameter") }, "Input__Round")}
                                placeholder="12"
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
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                                id="load_index"
                                name="load_index"
                                value={formik.values.load_index}
                                onChange={formik.handleChange}
                                className={classNames({ "p-invalid": isFormFieldValid("load_index") }, "Input__Round")}
                                placeholder="20"
                            />

                            {getFormErrorMessage("load_index")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="tyre_manufacturer" className={classNames({ "p-error": isFormFieldValid("tyre_manufacturer") }, "Label__Text")}>
                                Tyre Manufacturer
                            </label>
                            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="select__">
                                <option selected disabled>
                                    select Tyre manufacturer
                                </option>
                                {brands?.map((brand, index) => {
                                    return <option value={brand?._id}>{brand?.title}</option>;
                                })}
                            </select>

                            {getFormErrorMessage("tyre_manufacturer")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="pattern" className={classNames({ "p-error": isFormFieldValid("pattern") }, "Label__Text")}>
                                Tyre Pattern
                            </label>
                            {/* <InputText id="pattern" name="pattern" value={formik.values.pattern} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("pattern") }, "Input__Round")} /> */}
                            <select value={selectedPattern} onChange={(e) => setSelectedPattern(e.target.value)} className="select__">
                                <option selected disabled>
                                    select Tyre pattern
                                </option>
                                {patterns?.map((brand, index) => {
                                    return <option value={brand?._id}>{brand?.title}</option>;
                                })}
                            </select>
                            {getFormErrorMessage("pattern")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="tyre_type" className={classNames({ "p-error": isFormFieldValid("tyre_type") }, "Label__Text")}>
                                Tyre Type
                            </label>
                            {/* <InputText id="tyre_type" name="tyre_type" value={formik.values.tyre_type} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("tyre_type") }, "Input__Round")} /> */}
                            <select value={type} onChange={(e) => setType(e.target.value)} className="select__">
                                <option selected disabled>
                                    select tyre type
                                </option>
                                <option value="featured">featured</option>
                                <option value="economy">economy</option>
                                <option value="premium">premium</option>
                            </select>
                            {getFormErrorMessage("tyre_type")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="compatible_vehicles" className={classNames({ "p-error": isFormFieldValid("compatible_vehicles") }, "Label__Text")}>
                                Compatible Vehicles
                            </label>
                            {/* <InputText id="compatible_vehicles" name="compatible_vehicles" value={formik.values.compatible_vehicles} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("compatible_vehicles") }, "Input__Round")} /> */}
                            <Select options={Vehicles} isMulti={true} onChange={setSelectedVehicles} className="select__"></Select>
                            {getFormErrorMessage("compatible_vehicles")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="images" className={classNames({ "p-error": isFormFieldValid("images") }, "Label__Text")}>
                                Image
                            </label>
                            <InputText type="file" id="images" name="images" value={formik.values.images} onChange={(e) => handleUpload(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("images") }, "Input__RoundFile")} />

                            {getFormErrorMessage("images")}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", columnGap: "10px", rowGap: "10px", marginTop: "10px" }}>
                            {urls?.map((url, index) => {
                                return (
                                    <div style={{ position: "relative" }} key={index}>
                                        <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={url}></img>
                                        <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe(index)}></i>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="delivery" className={classNames({ "p-error": isFormFieldValid("delivery") }, "Label__Text")}>
                                Cash on Delivery
                            </label>
                            {/* <InputText id="availability" name="availability" value={formik.values.availability} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("availability") }, "Input__RoundFile")} /> */}
                            <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className="select__">
                                <option selected disabled>
                                    select availability
                                </option>
                                <option value={true}>yes</option>
                                <option value={false}>No</option>
                            </select>
                            {getFormErrorMessage("cash_On_Delivery")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="availability" className={classNames({ "p-error": isFormFieldValid("availability") }, "Label__Text")}>
                                Availability
                            </label>
                            {/* <InputText id="availability" name="availability" value={formik.values.availability} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("availability") }, "Input__RoundFile")} /> */}
                            <select value={availability} onChange={(e) => setAvailablitiy(e.target.value)} className="select__">
                                <option selected disabled>
                                    select availability
                                </option>
                                <option value={true}>yes</option>
                                <option value={false}>out of stock</option>
                            </select>
                            {getFormErrorMessage("availability")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                Meta-Title
                            </label>
                            <InputText placeholder="meta title" id="meta_title" name="meta_title" value={formik.values.meta_title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} />

                            {getFormErrorMessage("meta_title")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="meta_Description" className={classNames({ "p-error": isFormFieldValid("meta_Description") }, "Label__Text")}>
                                Meta-Description
                            </label>
                            <InputText placeholder="meta description" id="meta_Description" name="meta_Description" value={formik.values.meta_Description} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_Description") }, "Input__Round")} />

                            {getFormErrorMessage("meta_Description")}
                        </div>
                    </div>

                    <div className="p-field p-col-12 md:col-6">
                        <label htmlFor="tubeless" className="Label__Text" style={{ paddingBottom: "5px" }}>
                            Tubeless
                        </label>
                        <div className="Radio__Btn">
                            <div className="p-field-radiobutton">
                                <RadioButton inputId="tubeless" name="tubeless" value={"Y"} onChange={formik.handleChange} checked={formik.values.tubeless === "Y"} />
                                <label htmlFor="tubeless">Yes</label>
                            </div>
                            <div className="p-field-radiobutton">
                                <RadioButton inputId="tubeless" name="tubeless" value={"N"} onChange={formik.handleChange} checked={formik.values.tubeless === "N"} />
                                <label htmlFor="tubeless">No</label>
                            </div>
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="tyre_id" className={classNames({ "p-error": isFormFieldValid("tyre_id") }, "Label__Text")}>
                                Features
                            </label>
                            <Select options={features} value={seelctedFeature} onChange={setSelectedFeature} isMulti={true} className="select__"></Select>

                            {getFormErrorMessage("tyre_id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="price" className={classNames({ "p-error": isFormFieldValid("price") }, "Label__Text")}>
                                Default Price
                            </label>
                            <InputText placeholder="29000" id="price" name="price" value={formik.values.price} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("price") }, "Input__Round")} />

                            {getFormErrorMessage("price")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                    Price List
                                </label>
                                <Button label="Add City" onClick={() => addPriceList()} style={{ height: "35px", width: "100px" }} type="button"></Button>
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
                                        <InputText id="question" name="question" placeholder="price" onChange={(e) => handlePriceList(e.target.value, "amount", index)} className={classNames("Input__Round")} />
                                        <select onChange={(e) => handlePriceList(e.target.value, "city", index)} className="select__">
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

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                Description
                            </label>
                            <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text1} onEditorStateChange={handleStateD} onContentStateChange={handlecontentD} />

                            {getFormErrorMessage("description")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                Warranty Clause
                            </label>
                            <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text2} onEditorStateChange={handleStateW} onContentStateChange={handlecontentW} />
                        </div>
                    </div>
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
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                    Faq
                                </label>
                                <Button label="Add Faq" style={{ width: "100px", height: "35px" }} onClick={() => addFaq()} type="button"></Button>
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
                                        <InputText id="question" name="question" placeholder="question" onChange={(e) => handleFaq(e.target.value, "question", index)} className={classNames("Input__Round")} />
                                        <InputText id="answer" name="answer" placeholder="answer" onChange={(e) => handleFaq(e.target.value, "answer", index)} className={classNames("Input__Round")} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideTyreDialog()} type="button" />
                    <Button label="Create" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
};

export default AddTyreDialog;
