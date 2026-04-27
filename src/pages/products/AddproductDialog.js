import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { handleGetRequest } from "../../services/GetTemplate";
import Editor from "../../components/SafeRichTextEditor";
import { EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { toast } from "react-toastify";
import { createOverviewField, mergeOverviewFieldsWithTemplate, normalizeOverviewFields, slugifyOverviewFieldKey } from "../../utils/overviewFields";

function AddproductDialog({ onsuccess }) {
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [description, setDescription] = useState("");
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [price, setPrice] = useState([]);
    const [images, setImages] = useState([]);
    const [urls, setUrls] = useState([]);
    const [overviewFields, setOverviewFields] = useState([]);

    const getData = useCallback(async () => {
        const [cat, subcat, brand] = await Promise.all([handleGetRequest("/category/all"), handleGetRequest("/subcategory/all"), handleGetRequest("/brand/all")]);
        setCategories(cat?.data || []);
        setSubCategories(subcat?.data || []);
        setBrands(brand?.data || []);
    }, []);

    const addPrice = () => {
        setPrice([
            ...price,
            {
                number: "",
                MRP: "",
                SP: "",
                pack_weight: "",
                stock_quantity: "",
            },
        ]);
    };

    const handlePrice = (value, names, index) => {
        const temp = [...price];
        temp[index][names] = value;
        setPrice(temp);
    };

    useEffect(() => {
        getData();
    }, [getData]);

    const handleSubCategory = useCallback(
        async (id) => {
            const temp = subCategories?.filter((item) => String(item.category) === String(id));
            setFilteredSubCategories(temp);
        },
        [subCategories],
    );

    useEffect(() => {
        if (selectedCategory) {
            handleSubCategory(selectedCategory);
        }
    }, [selectedCategory, handleSubCategory]);

    useEffect(() => {
        if (!selectedCategory) {
            return;
        }

        const selectedCategoryData = categories.find((item) => item?._id === selectedCategory);
        const templateFields = selectedCategoryData?.overview_fields || [];
        setOverviewFields((prev) => mergeOverviewFieldsWithTemplate(templateFields, prev));
    }, [selectedCategory, categories]);

    const toNumber = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };

    const normalizePriceList = () =>
        price
            .filter((p) => p?.number || p?.MRP || p?.SP || p?.pack_weight || p?.stock_quantity)
            .map((p) => ({
                number: toNumber(p.number),
                MRP: toNumber(p.MRP),
                SP: toNumber(p.SP),
                pack_weight: toNumber(p.pack_weight),
                stock_quantity: toNumber(p.stock_quantity),
            }));

    const formik = useFormik({
        initialValues: {
            name: "",
            brand: "",
            product_id: "",
            meta_title: "",
            meta_description: "",
            size_inch: "",
            size_mm: "",
            flap_mm: "",
            thickness: "",
            pouch_weight: "",
            material: "",
            hsn_code: "",
            price: "",
            gst: "",
            gusset: "",
            print: "",
            label_in_roll: "",
            core_size: "",
            color: "",
            length: "",
            width: "",
            breadth_inch: "",
            breadth_mm: "",
            height_inch: "",
            height_mm: "",
            category: "",
            sub_category: "",
            model: "",
            description: "",
            priceList: "",
            length_inch: "",
            length_mm: "",
            deal_product: "",
            top_products: "",
            aboutItem: "",
            slug: "",
        },

        onSubmit: async (data) => {
            if (!data.slug.trim()) {
                toast.error("Slug is required");
                return;
            }
            if (!selectedBrand) {
                toast.error("Brand is required");
                return;
            }
            if (!selectedCategory) {
                toast.error("Category is required");
                return;
            }

            const imu = images?.map((ima) => {
                return {
                    image: ima,
                };
            });
            const priceList = normalizePriceList();
            const brandId = selectedBrand?._id || selectedBrand;
            const categoryId = selectedCategory?._id || selectedCategory;
            const subCategoryId = selectedSubCategory?._id || selectedSubCategory || "";
            const dat = {
                name: data?.name,
                brand: brandId ? String(brandId) : "",
                product_id: data?.product_id,
                meta_title: data?.meta_title,
                meta_description: data?.meta_description,
                size_inch: data?.size_inch,
                size_mm: data?.size_mm,
                flap_mm: data?.flap_mm,
                thickness: data?.thickness,
                pouch_weight: data?.pouch_weight,
                material: data?.material,
                hsn_code: data?.hsn_code,
                priceList,
                gst: toNumber(data?.gst),
                gusset: data?.gusset,
                print: data?.print,
                label_in_roll: toNumber(data?.label_in_roll),
                core_size: toNumber(data?.core_size),
                color: data?.color,
                length: toNumber(data?.length),
                width: toNumber(data?.width),
                breadth_inch: toNumber(data?.breadth_inch),
                breadth_mm: toNumber(data?.breadth_mm),
                height_inch: toNumber(data?.height_inch),
                height_mm: toNumber(data?.height_mm),
                category: categoryId ? String(categoryId) : "",
                price: toNumber(data?.price),
                model: data?.model,
                slug: data?.slug,
                description: description,
                length_inch: toNumber(data?.length_inch),
                length_mm: toNumber(data?.length_mm),
                aboutItem: data?.aboutItem,
                images: imu,
                overview_fields: normalizeOverviewFields(overviewFields, { includeValue: true }),
            };
            if (subCategoryId) {
                dat.sub_category = String(subCategoryId);
            }
            console.log(dat);
            const res = await dispatch(handlePostRequest(dat, "/product/create", true, true));
            onsuccess();
            console.log(dat);
        },
    });

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const handleStateD = (editorState) => {
        setText1(editorState);
    };

    const handlecontentD = (contentState) => {
        let temp = draftToHtml(contentState);
        setDescription(temp);
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

    const handleOverviewFieldChange = (index, field, value) => {
        setOverviewFields((prev) =>
            prev.map((item, itemIndex) => {
                if (itemIndex !== index) {
                    return item;
                }

                if (field === "label") {
                    return {
                        ...item,
                        label: value,
                        key: item.key || slugifyOverviewFieldKey(value),
                    };
                }

                return {
                    ...item,
                    [field]: value,
                };
            }),
        );
    };

    const handleAddOverviewField = () => {
        setOverviewFields((prev) => [...prev, createOverviewField()]);
    };

    const handleRemoveOverviewField = (index) => {
        setOverviewFields((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    {/* BRAND */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                Brand*
                            </label>
                            <select style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }} required value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                                <option value="" disabled>
                                    Please select the brand
                                </option>
                                {brands?.map((item) => {
                                    return (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    );
                                })}
                            </select>
                            {getFormErrorMessage("name")}
                        </div>
                    </div>

                    {/*CATEGORY  */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                Category*
                            </label>
                            <select style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }} required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="" disabled>
                                    Please select the category
                                </option>
                                {categories?.map((item) => {
                                    return (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    );
                                })}
                            </select>
                            {getFormErrorMessage("name")}
                        </div>
                    </div>

                    {filteredSubCategories?.length > 0 && (
                        <div className="p-field col-12 md:col-12">
                            <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                                <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                    Sub Category*
                                </label>
                                <select style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }} required value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
                                    <option value="" disabled>
                                        Please select the sub-category
                                    </option>
                                    {filteredSubCategories?.map((item) => {
                                        return (
                                            <option key={item._id} value={item._id}>
                                                {item.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {getFormErrorMessage("name")}
                            </div>
                        </div>
                    )}

                    {/* PRODUCT NAME */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                Product Name*
                            </label>
                            <InputText placeholder="Paper bags" id="name" name="name" value={formik.values.name} required onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                            {getFormErrorMessage("name")}
                        </div>
                    </div>

                    {/* PRODUCT MODEL */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="model" className={classNames({ "p-error": isFormFieldValid("model") }, "Label__Text")}>
                                Product Model*
                            </label>
                            <InputText placeholder="PJ01" id="model" name="model" value={formik.values.model} required onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("model") }, "Input__Round")} />

                            {getFormErrorMessage("model")}
                        </div>
                    </div>

                    {/* PRODUCT ID */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="product_id" className={classNames({ "p-error": isFormFieldValid("product_id") }, "Label__Text")}>
                                Product ID*
                            </label>
                            <InputText placeholder="PI-01" id="product_id" name="product_id" value={formik.values.product_id} required onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("product_id") }, "Input__Round")} />

                            {getFormErrorMessage("product_id")}
                        </div>
                    </div>

                    {/* PRODUCT ROTE/SLUG */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="slug" className={classNames({ "p-error": isFormFieldValid("slug") }, "Label__Text")}>
                                Slug/Route*
                            </label>
                            <InputText placeholder="Brown-flipkart-Corrugated-Box-D0-5.5*3.6*1.6-inches" id="slug" name="slug" value={formik.values.slug} required onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("slug") }, "Input__Round")} />

                            {getFormErrorMessage("model")}
                        </div>
                    </div>

                    {/* IMAGES */}
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="images" className={classNames({ "p-error": isFormFieldValid("images") }, "Label__Text")}>
                                Image*
                            </label>
                            <InputText type="file" id="images" name="images" required onChange={(e) => handleUpload(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("images") }, "Input__RoundFile")} />

                            {getFormErrorMessage("images")}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", columnGap: "10px", rowGap: "10px", marginTop: "10px" }}>
                            {urls?.map((url, index) => {
                                return (
                                    <div style={{ position: "relative" }} key={index}>
                                        <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={url} alt="Product preview"></img>
                                        <i className="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe(index)}></i>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SIZE IN INCHES */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="size_inch" className={classNames({ "p-error": isFormFieldValid("size_inch") }, "Label__Text")}>
                                Size in inches
                            </label>
                            <InputText placeholder="7.1x11.4" id="size_inch" name="size_inch" value={formik.values.size_inch} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("size_inch") }, "Input__Round")} />

                            {getFormErrorMessage("size_inch")}
                        </div>
                    </div>

                    {/* SIZE IN MM */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="size_mm" className={classNames({ "p-error": isFormFieldValid("size_mm") }, "Label__Text")}>
                                Size in mm
                            </label>
                            <InputText placeholder="7.1x11.4" id="size_mm" name="size_mm" value={formik.values.size_mm} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("size_mm") }, "Input__Round")} />

                            {getFormErrorMessage("size_mm")}
                        </div>
                    </div>

                    {/* PRODUCT MATERIAL */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="material" className={classNames({ "p-error": isFormFieldValid("material") }, "Label__Text")}>
                                Material of product
                            </label>
                            <InputText placeholder="imported virgin kraft paper" id="material" name="material" value={formik.values.material} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("material") }, "Input__Round")} />

                            {getFormErrorMessage("material")}
                        </div>
                    </div>

                    {/* HSN CODE */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="hsn_code" className={classNames({ "p-error": isFormFieldValid("hsn_code") }, "Label__Text")}>
                                HSN code
                            </label>
                            <InputText placeholder="48173010" id="hsn_code" name="hsn_code" value={formik.values.hsn_code} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("hsn_code") }, "Input__Round")} />

                            {getFormErrorMessage("hsn_code")}
                        </div>
                    </div>

                    {/*PRODUCT PRICE*/}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                    Price List
                                </label>
                                <Button label="Add Price" style={{ width: "150px", height: "35px" }} onClick={() => addPrice()} type="button"></Button>
                            </div>
                            {price?.map((fa, index) => {
                                return (
                                    <div
                                        key={`price-${index}`}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            rowGap: "10px",
                                            marginTop: "10px",
                                            borderBottom: "1px solid #cecece",
                                            padding: "10px 0px",
                                        }}
                                    >
                                        <InputText id="number" name="number" placeholder="Number of Items" onChange={(e) => handlePrice(e.target.value, "number", index)} className={classNames("Input__Round")} />
                                        <InputText id="pack_weight" name="pack_weight" placeholder="Pack Weight in kg (1.5)" onChange={(e) => handlePrice(e.target.value, "pack_weight", index)} className={classNames("Input__Round")} />
                                        <InputText id="stock_quantity" name="stock_quantity" placeholder="Stock quantity" onChange={(e) => handlePrice(e.target.value, "stock_quantity", index)} className={classNames("Input__Round")} />
                                        <InputText id="MRP" name="MRP" placeholder="MRP" onChange={(e) => handlePrice(e.target.value, "MRP", index)} className={classNames("Input__Round")} />
                                        <InputText id="SP" name="SP" placeholder="Selling Price" onChange={(e) => handlePrice(e.target.value, "SP", index)} className={classNames("Input__Round")} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* META TITLE */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                Meta Title
                            </label>
                            <InputText placeholder="Meta Title" id="meta_title" name="meta_title" value={formik.values.meta_title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} />

                            {getFormErrorMessage("meta_title")}
                        </div>
                    </div>

                    {/* META DESCRIPTION */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="meta_description" className={classNames({ "p-error": isFormFieldValid("meta_description") }, "Label__Text")}>
                                Meta Description
                            </label>
                            <InputText placeholder="Meta Description" id="meta_description" name="meta_description" value={formik.values.meta_description} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_description") }, "Input__Round")} />

                            {getFormErrorMessage("meta_description")}
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                Description
                            </label>
                            <Editor editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }} editorState={text1} onEditorStateChange={handleStateD} onContentStateChange={handlecontentD} />

                            {getFormErrorMessage("description")}
                        </div>
                    </div>

                    {/* ABOUT THE ITEM */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="aboutItem" className={classNames({ "p-error": isFormFieldValid("aboutItem") }, "Label__Text")}>
                                About the Item*
                            </label>
                            <InputText placeholder="About the product" id="aboutItem" name="aboutItem" value={formik.values.aboutItem} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("aboutItem") }, "Input__Round")} />

                            {getFormErrorMessage("aboutItem")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label className="Label__Text">Quick Overview Values</label>
                                <Button type="button" label="Add Row" onClick={handleAddOverviewField} style={{ width: "140px", height: "35px" }} />
                            </div>
                            <small>Category fields are loaded automatically. You can edit labels and values per product.</small>
                            {overviewFields.map((field, index) => (
                                <div key={field.key || `overview-field-${index}`} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <InputText placeholder="Label" value={field.label} onChange={(e) => handleOverviewFieldChange(index, "label", e.target.value)} className="Input__Round" />
                                    <InputText placeholder="Value" value={field.value || ""} onChange={(e) => handleOverviewFieldChange(index, "value", e.target.value)} className="Input__Round" />
                                    <Button type="button" label="Remove" className="p-button-danger" onClick={() => handleRemoveOverviewField(index)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/*LENGTH IN METERS */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="length" className={classNames({ "p-error": isFormFieldValid("length") }, "Label__Text")}>
                                Length
                            </label>
                            <InputText placeholder="50" id="length" name="length" value={formik.values.length} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("length") }, "Input__Round")} />

                            {getFormErrorMessage("length")}
                        </div>
                    </div>

                    {/* LENGTH IN INCHES */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="length_inch" className={classNames({ "p-error": isFormFieldValid("length_inch") }, "Label__Text")}>
                                Length in inch
                            </label>
                            <InputText placeholder="50" id="length_inch" name="length_inch" value={formik.values.length_inch} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("length_inch") }, "Input__Round")} />

                            {getFormErrorMessage("length_inch")}
                        </div>
                    </div>

                    {/* LENGTH IN MM*/}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="length_mm" className={classNames({ "p-error": isFormFieldValid("length_mm") }, "Label__Text")}>
                                Length in mm
                            </label>
                            <InputText placeholder="50" id="length_mm" name="length_mm" value={formik.values.length_mm} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("length_mm") }, "Input__Round")} />

                            {getFormErrorMessage("length_mm")}
                        </div>
                    </div>

                    {/* BREADTH */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="width" className={classNames({ "p-error": isFormFieldValid("width") }, "Label__Text")}>
                                Breadth
                            </label>
                            <InputText placeholder="50" id="width" name="width" value={formik.values.width} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("width") }, "Input__Round")} />

                            {getFormErrorMessage("width")}
                        </div>
                    </div>

                    {/* BREADTH IN INCHES */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="breadth_inch" className={classNames({ "p-error": isFormFieldValid("breadth_inch") }, "Label__Text")}>
                                Breadth in inch
                            </label>
                            <InputText placeholder="3.6" id="breadth_inch" name="breadth_inch" value={formik.values.breadth_inch} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("breadth_inch") }, "Input__Round")} />

                            {getFormErrorMessage("breadth_inch")}
                        </div>
                    </div>

                    {/* BREADTH IN MM */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="breadth_mm" className={classNames({ "p-error": isFormFieldValid("breadth_mm") }, "Label__Text")}>
                                Breadth in mm
                            </label>
                            <InputText placeholder="3.6" id="breadth_mm" name="breadth_mm" value={formik.values.breadth_mm} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("breadth_mm") }, "Input__Round")} />

                            {getFormErrorMessage("breadth_mm")}
                        </div>
                    </div>

                    {/* HEIGHT IN INCHES */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="height_inch" className={classNames({ "p-error": isFormFieldValid("height_inch") }, "Label__Text")}>
                                Height in inch
                            </label>
                            <InputText placeholder="3.6" id="height_inch" name="height_inch" value={formik.values.height_inch} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("height_inch") }, "Input__Round")} />

                            {getFormErrorMessage("height_inch")}
                        </div>
                    </div>

                    {/* HEIGHT IN MM */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="height_mm" className={classNames({ "p-error": isFormFieldValid("height_mm") }, "Label__Text")}>
                                Height in mm
                            </label>
                            <InputText placeholder="3.6" id="height_mm" name="height_mm" value={formik.values.height_mm} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("height_mm") }, "Input__Round")} />

                            {getFormErrorMessage("height_mm")}
                        </div>
                    </div>

                    {/* FLAP IN MM */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="flap_mm" className={classNames({ "p-error": isFormFieldValid("flap_mm") }, "Label__Text")}>
                                Flap in mm
                            </label>
                            <InputText placeholder="50" id="flap_mm" name="flap_mm" value={formik.values.flap_mm} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("flap_mm") }, "Input__Round")} />

                            {getFormErrorMessage("flap_mm")}
                        </div>
                    </div>

                    {/* THICKNESS */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="thickness" className={classNames({ "p-error": isFormFieldValid("thickness") }, "Label__Text")}>
                                Thickness
                            </label>
                            <InputText placeholder="50" id="thickness" name="thickness" value={formik.values.thickness} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("thickness") }, "Input__Round")} />

                            {getFormErrorMessage("thickness")}
                        </div>
                    </div>

                    {/* WEIGHT */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="pouch_weight" className={classNames({ "p-error": isFormFieldValid("pouch_weight") }, "Label__Text")}>
                                Weight of Item
                            </label>
                            <InputText placeholder="aprox 9gms" id="pouch_weight" name="pouch_weight" value={formik.values.pouch_weight} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("pouch_weight") }, "Input__Round")} />

                            {getFormErrorMessage("pouch_weight")}
                        </div>
                    </div>

                    {/* GUSSET */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="gusset" className={classNames({ "p-error": isFormFieldValid("gusset") }, "Label__Text")}>
                                Gusset
                            </label>
                            <InputText placeholder="0" id="gusset" name="gusset" value={formik.values.gusset} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("gusset") }, "Input__Round")} />

                            {getFormErrorMessage("gusset")}
                        </div>
                    </div>

                    {/* PRINT */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="print" className={classNames({ "p-error": isFormFieldValid("print") }, "Label__Text")}>
                                Print
                            </label>
                            <InputText placeholder="unprinted" id="print" name="print" value={formik.values.print} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("print") }, "Input__Round")} />

                            {getFormErrorMessage("print")}
                        </div>
                    </div>

                    {/* NO. OF LABELS */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="label_in_roll" className={classNames({ "p-error": isFormFieldValid("label_in_roll") }, "Label__Text")}>
                                Number of labels in roll
                            </label>
                            <InputText placeholder="20" id="label_in_roll" name="label_in_roll" value={formik.values.label_in_roll} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("label_in_roll") }, "Input__Round")} />

                            {getFormErrorMessage("label_in_roll")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="core_size" className={classNames({ "p-error": isFormFieldValid("core_size") }, "Label__Text")}>
                                Core size in inch
                            </label>
                            <InputText placeholder="3" id="core_size" name="core_size" value={formik.values.core_size} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("core_size") }, "Input__Round")} />

                            {getFormErrorMessage("core_size")}
                        </div>
                    </div>

                    {/* COLOR */}
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="color" className={classNames({ "p-error": isFormFieldValid("color") }, "Label__Text")}>
                                Color
                            </label>
                            <InputText placeholder="red" id="color" name="color" value={formik.values.color} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("color") }, "Input__Round")} />

                            {getFormErrorMessage("color")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Create Product" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AddproductDialog;
