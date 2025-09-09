import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";

function Product() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [category_id, setCategoryId] = useState();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [buyItWith, setBuyItWith] = useState([]);
    const [updatedBuyItWith, setUpdatedBuyItWith] = useState([]);
    const [updatedRelatedProducts, setUpdatedRelatedProduct] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const [selectedSubCategory, setSelectedSubCategory] = useState();
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState();
    const [price, setPrice] = useState([]);
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [description, setDescription] = useState();
    const [images, setImages] = useState([]);
    const [Url, setUrl] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedProductsRP, setSelectedProductsRP] = useState([]);
    const [selectedProductIdsRP, setSelectedProductIdsRP] = useState([]);

    const dispatch = useDispatch();

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
        const res = await handleGetRequest(`/product/single/${id}`);
        setSelectedBrand(res?.data?.brand);
        setSelectedCategory(res?.data?.category);
        setSelectedSubCategory(res?.data?.subcategory);
        setBuyItWith(res?.data?.buyItWith);
        setRelatedProducts(res?.data?.relatedProducts);
        console.log("65", buyItWith);
        setPrice(res?.data?.priceList);
        setSelectedProductIds(res?.data?.buyItWith);
        setSelectedProductIdsRP(res?.data?.relatedProducts);
        if (res?.data?.description) {
            const contentBlock = htmlToDraft(res?.data?.description);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const editorState = EditorState.createWithContent(contentState);
                setText1(editorState);
            }
        }

        setManufacturers(res?.data);

        const cat = await handleGetRequest("/category/all");
        const subcat = await handleGetRequest("/subcategory/all");
        const brand = await handleGetRequest("/brand/all");
        const products = await handleGetRequest("/product/all");

        setProducts(products?.data);
        console.log("Product Details: ", products);
        setCategories(cat?.data);
        setSubCategories(subcat?.data);
        setBrands(brand?.data);
        const ima = res?.data?.images?.map((im) => {
            return im?.image;
        });
        const t = await processimages(ima);
        setImages(t);
        const temp1 = res?.data?.images?.map((item) => {
            return item?.image;
        });
        setUrl(temp1);
    };
    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        if (buyItWith && buyItWith.length > 0) {
            const productIds = buyItWith.map((product) => product._id);
            fetchBuyItWithDetails(productIds);
        }
    }, [buyItWith]);

    useEffect(() => {
        if (relatedProducts && relatedProducts.length > 0) {
            const productIds = relatedProducts.map((product) => product._id);
            fetchBuyItWithDetailsRP(productIds);
        }
    }, [relatedProducts]);

    // Function to fetch details of a single product
    const fetchProductDetails = async (productId) => {
        const res = await handleGetRequest(`/product/single/${productId}`);
        return res?.data;
    };

    // Function to fetch details of Buy It With products
    const fetchBuyItWithDetails = async (productIds) => {
        const productDetails = await Promise.all(productIds.map(fetchProductDetails));
        setBuyItWith(productDetails);
    };

    const fetchBuyItWithDetailsRP = async (productIds) => {
        const productDetails = await Promise.all(productIds.map(fetchProductDetails));
        setRelatedProducts(productDetails);
    };

    const handleSelection = (selectedProduct) => {
        if (selectedProductIds.length < 3 && !selectedProductIds.some((item) => item._id === selectedProduct._id)) {
            const updatedSelectedProductIds = [...selectedProductIds, selectedProduct];
            setSelectedProductIds(updatedSelectedProductIds);
            setUpdatedBuyItWith([...updatedBuyItWith, selectedProduct]);
            // Update formik state with selected product IDs
            formik.setFieldValue("buyItWith", updatedSelectedProductIds);
        }
    };

    const handleSelectionRP = (selectedProductRP) => {
        if (selectedProductIdsRP.length < 10 && !selectedProductIdsRP.some((item) => item._id === selectedProductRP._id)) {
            const updatedSelectedProductIdsRP = [...selectedProductIdsRP, selectedProductRP];
            setSelectedProductIdsRP(updatedSelectedProductIdsRP);
            setUpdatedRelatedProduct([...updatedRelatedProducts, selectedProductRP]);
            // Update formik state with selected product IDs
            formik.setFieldValue("relatedProducts", updatedSelectedProductIdsRP);
        }
    };

    const handleRemoveSelectedProduct = (index) => {
        const temp = [...selectedProductIds];
        temp.splice(index, 1);
        setSelectedProductIds(temp);

        const tempUpdatedBuyItWith = [...updatedBuyItWith];
        tempUpdatedBuyItWith.splice(index, 1);
        setUpdatedBuyItWith(tempUpdatedBuyItWith);
        toast.success("Please click on Update below to confirm changes.");
    };

    const handleRemoveSelectedProductRP = (index) => {
        const temp = [...selectedProductIdsRP];
        temp.splice(index, 1);
        setSelectedProductIdsRP(temp);

        const tempUpdatedRelatedProduct = [...updatedRelatedProducts];
        tempUpdatedRelatedProduct.splice(index, 1);
        setUpdatedRelatedProduct(tempUpdatedRelatedProduct);
        toast.success("Please click on Update below to confirm changes.");
    };

    const handleRemoveAllProducts = () => {
        setSelectedProductIdsRP([]);
        toast.success("All products have been removed. Please click on Update below to confirm changes.");
    };

    const handleRemoveAllBuyItWithProducts = () => {
        setSelectedProductIds([]);
        toast.success("All products have been removed. Please click on Update below to confirm changes.");
    };

    const onSubmit = async (values) => {
        const data = { ...values };
        data.buyItWith = selectedProductIds; // Update 'buyItWith' field in form data with selectedProductIds

        const res = await handlePutRequest(data, "/product/update");
        if (res?.success === true) {
            toast.success("Product Details Edited");
        }
    };

    const breadItems = [
        { label: "Home", url: "/" },
        { label: "Products", url: "/products" },
    ];
    const home = { icon: "pi pi-home", url: "/" };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: manufacturer?.name,
            brand: "",
            product_id: manufacturer?.product_id ? manufacturer?.product_id : "",
            meta_title: manufacturer?.meta_title ? manufacturer?.meta_title : "",
            meta_description: manufacturer?.meta_description ? manufacturer?.meta_description : "",
            size_inch: manufacturer?.size_inch ? manufacturer?.size_inch : "",
            size_mm: manufacturer?.size_mm ? manufacturer?.size_mm : "",
            flap_mm: manufacturer?.flap_mm ? manufacturer?.flap_mm : "",
            thickness: manufacturer?.thickness ? manufacturer?.thickness : "",
            thickness_micron: manufacturer?.thickness_micron ? manufacturer?.thickness_micron : "",
            pouch_weight: manufacturer?.pouch_weight ? manufacturer?.pouch_weight : "",
            material: manufacturer?.material ? manufacturer?.material : "",
            delivery_time: manufacturer?.delivery_time ? manufacturer?.delivery_time : "",
            hsn_code: manufacturer?.hsn_code ? manufacturer?.hsn_code : "",
            price: manufacturer?.price ? manufacturer?.price : "",
            gst: manufacturer?.gst ? manufacturer?.gst : "",
            gusset: manufacturer?.gusset ? manufacturer?.gusset : "",
            print: manufacturer?.print ? manufacturer?.print : "",
            label_in_roll: manufacturer?.label_in_roll ? manufacturer?.label_in_roll : "",
            color: manufacturer?.color ? manufacturer?.color : "",
            aboutItem: manufacturer?.aboutItem ? manufacturer?.aboutItem : "",
            length: manufacturer?.length ? manufacturer?.length : "",
            length_inch: manufacturer?.length_inch ? manufacturer?.length_inch : "",
            length_mm: manufacturer?.length_mm ? manufacturer?.length_mm : "",
            width: manufacturer?.width ? manufacturer?.width : "",
            breadth_inch: manufacturer?.breadth_inch ? manufacturer?.breadth_inch : "",
            breadth_mm: manufacturer?.breadth_mm ? manufacturer?.breadth_mm : "",
            height_inch: manufacturer?.height_inch ? manufacturer?.height_inch : "",
            height_mm: manufacturer?.height_mm ? manufacturer?.height_mm : "",
            category: "",
            sub_category: "",
            model: manufacturer?.model ? manufacturer?.model : "",
            slug: manufacturer?.slug ? manufacturer?.slug : "",
            description: "",
            priceList: "",
            top_product: manufacturer?.top_product || false,
            deal_product: manufacturer?.deal_product || false,
            buyItWith: manufacturer?.buyItWith ? manufacturer?.buyItWith : [],
            relatedProducts: manufacturer?.relatedProducts ? manufacturer?.relatedProducts : [],
        },
        onsubmit,

        onSubmit: async (data) => {
            console.log("DATA SEND: ", data);
            const imu = Url?.map((im) => {
                return {
                    image: im,
                };
            });
            const dat = {
                id: id,
                name: data?.name,
                brand: selectedBrand,
                product_id: data?.product_id,
                meta_title: data?.meta_title,
                meta_description: data?.meta_description,
                size_inch: data?.size_inch,
                size_mm: data?.size_mm,
                flap_mm: data?.flap_mm,
                thickness: data?.thickness,
                thickness_micron: data?.thickness_micron,
                pouch_weight: data?.pouch_weight,
                material: data?.material,
                delivery_time: data?.delivery_time,
                hsn_code: data?.hsn_code,
                price: data?.price,
                gst: data?.gst,
                gusset: data?.gusset,
                print: data?.print,
                label_in_roll: data?.label_in_roll,
                color: data?.color,
                length: data?.length,
                length_inch: data?.length_inch,
                length_mm: data?.length_mm,
                width: data?.width,
                breadth_inch: data?.breadth_inch,
                breadth_mm: data?.breadth_mm,
                height_inch: data?.height_inch,
                height_mm: data?.height_mm,
                category: selectedCategory,
                sub_category: selectedSubCategory,
                aboutItem: data?.aboutItem,
                model: data?.model,
                slug: data?.slug,
                description: description,
                priceList: price,
                images: imu,
                top_product: data?.top_product,
                deal_product: data?.deal_product,
                buyItWith: selectedProductIds,
                relatedProducts: selectedProductIdsRP,
            };
            const res = await handlePutRequest(dat, "/product/update");
            if (res?.success === true) {
                toast.success("Product Details Edited");
            }
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const handleCancel = () => {
        history.push("/");
    };

    const addPrice = () => {
        setPrice([
            ...price,
            {
                number: 0, // Assuming 'number' is of type number
                MRP: 0, // Assuming 'MRP' is of type number
                SP: 0, // Assuming 'SP' is of type number
                pack_weight: 0, // Assuming 'pack_weight' is of type number
                stock_quantity: 0, // Assuming 'stock_quantity' is of type number
            },
        ]);
    };

    const handlePrice = (value, names, index) => {
        // Clone the original array to avoid mutating state directly
        const temp = [...price];

        // Convert the input value to a number using parseFloat
        temp[index][names] = parseFloat(value);

        // Update the state with the modified array
        setPrice(temp);
    };

    useEffect(() => {
        getData();
    }, []);

    const handleSubCategory = async (id) => {
        const temp = subCategories?.filter((item) => item.category === id);
        setFilteredSubCategories(temp);
    };

    useEffect(() => {
        if (selectedCategory) {
            handleSubCategory(selectedCategory);
        }
    }, [selectedCategory]);

    const handleStateD = (editorState) => {
        setText1(editorState);
    };

    const handlecontentD = (contentState) => {
        let temp = draftToHtml(contentState);
        temp = `<div style="font-family: 'Montserrat', sans-serif;">${temp}</div>`;
        setDescription(temp);
    };

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await dispatch(handlePostRequest(form, "/uploadImage", true, true));
        console.log("Image Upload Response: ", res);
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

    const handleRemovePrice = (index) => {
        const newPrice = [...price];
        newPrice.splice(index, 1);
        setPrice(newPrice);
    };

    return (
        <>
            <div className="customer_header__">
                <div className="left___">
                    <h2>{manufacturer?.title}</h2>
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
                            <p>&nbsp;{category_id}</p>
                        </div>
                        <div>
                            <Button label="Active" className="green_btn"></Button>
                        </div>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div style={{ textAlign: "center", textTransform: "capitalize", fontSize: "24px", fontWeight: "600" }}>
                            <u>
                                {manufacturer?.brand?.name} {manufacturer?.name} {manufacturer?.model}{" "}
                            </u>
                        </div>

                        <div className="form__">
                            <div className="form_left">
                                {/* TOP PRODUCT */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="top_product" className={classNames({ "p-error": isFormFieldValid("product_id") }, "Label__Text")}>
                                            Top Product
                                        </label>
                                        <select
                                            id="top_product"
                                            name="top_product"
                                            style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }}
                                            value={formik.values.top_product}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("top_product") }, "Input__Round")}
                                        >
                                            <option value={true}>True</option>
                                            <option value={false}>False</option>
                                        </select>

                                        {getFormErrorMessage("top_product")}
                                    </div>
                                </div>
                                {/* BRAND */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                                        <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                            Brand
                                        </label>
                                        <select style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }} value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                                            <option selected disabled>
                                                Please select the brand
                                            </option>
                                            {brands?.map((item) => {
                                                return <option value={item._id}>{item.name}</option>;
                                            })}
                                        </select>
                                        {getFormErrorMessage("name")}
                                    </div>
                                </div>

                                {/* CATEGORY */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                                        <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                            Category
                                        </label>
                                        <select style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                            <option selected disabled>
                                                Please select the category
                                            </option>
                                            {categories?.map((item) => {
                                                return <option value={item._id}>{item.name}</option>;
                                            })}
                                        </select>
                                        {getFormErrorMessage("name")}
                                    </div>
                                </div>

                                {filteredSubCategories?.length > 0 && (
                                    <div className="p-field col-12 md:col-12">
                                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                                            <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                                Sub Category
                                            </label>
                                            <select style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }} value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
                                                <option selected disabled>
                                                    Please select the sub-category
                                                </option>
                                                {filteredSubCategories?.map((item) => {
                                                    return <option value={item._id}>{item.name}</option>;
                                                })}
                                            </select>
                                            {getFormErrorMessage("name")}
                                        </div>
                                    </div>
                                )}

                                {/* PRODUCT MODEL */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="model" className={classNames({ "p-error": isFormFieldValid("model") }, "Label__Text")}>
                                            Product Model
                                        </label>
                                        <InputText placeholder="pm1" id="model" name="model" value={formik.values.model} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("model") }, "Input__Round")} />

                                        {getFormErrorMessage("model")}
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

                                {/* MATERIAL OF PRODUCT */}
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

                                {/* META TITLE */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="meta_title" className={classNames({ "p-error": isFormFieldValid("meta_title") }, "Label__Text")}>
                                            Meta Title
                                        </label>
                                        <InputText placeholder="meta Title" id="meta_title" name="meta_title" value={formik.values.meta_title} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_title") }, "Input__Round")} />

                                        {getFormErrorMessage("meta_title")}
                                    </div>
                                </div>

                                {/* LENGTH IN METERS */}
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
                                        <label htmlFor="length_inch" className={classNames({ "p-error": isFormFieldValid("length_mm") }, "Label__Text")}>
                                            Length in Inches
                                        </label>
                                        <InputText placeholder="50" id="length_inch" name="length_inch" value={formik.values.length_inch} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("length_inch") }, "Input__Round")} />

                                        {getFormErrorMessage("length_inch")}
                                    </div>
                                </div>

                                {/* LENGTH IN MM */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="length_mm" className={classNames({ "p-error": isFormFieldValid("length_mm") }, "Label__Text")}>
                                            Length in mm
                                        </label>
                                        <InputText placeholder="50" id="length_mm" name="length_mm" value={formik.values.length_mm} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("length_mm") }, "Input__Round")} />

                                        {getFormErrorMessage("length_mm")}
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

                                {/* NuUMBER OF LABELS */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="label_in_roll" className={classNames({ "p-error": isFormFieldValid("label_in_roll") }, "Label__Text")}>
                                            Number of labels in role
                                        </label>
                                        <InputText placeholder="20" id="label_in_roll" name="label_in_roll" value={formik.values.label_in_roll} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("label_in_roll") }, "Input__Round")} />

                                        {getFormErrorMessage("label_in_roll")}
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

                                {/* IMAGE */}
                                <div className="p-field col-12 md:col-6">
                                    <div className="p-field" style={{ display: "flex", flexDirection: "column", marginTop: "20px" }}>
                                        <label htmlFor="images" className={classNames({ "p-error": isFormFieldValid("images") }, "Label__Text")}>
                                            Images
                                        </label>
                                        <InputText type="file" id="images" name="images" value={formik.values.images} onChange={(e) => handleUpload(e.target.files[0])} className={classNames({ "p-invalid": isFormFieldValid("images") }, "Input__RoundFile")} />
                                        <div
                                            style={{
                                                display: "flex",
                                                columnGap: "10px",
                                                marginTop: "20px",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {images?.map((img, index) => {
                                                return (
                                                    <div style={{ position: "relative" }} key={index}>
                                                        <img style={{ width: "50px", height: "50px", border: "1px solid #cecece", borderRadius: "6px" }} src={img}></img>
                                                        <i class="pi pi-times-circle" style={{ position: "absolute", zIndex: "2", color: "red", marginLeft: "-15px", cursor: "pointer" }} onClick={() => handleRemvoe(index)}></i>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {getFormErrorMessage("images")}
                                    </div>
                                </div>

                                {/* BUY IT WITH */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                                        <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")} style={{ marginBottom: "10px", fontWeight: "700" }}>
                                            Buy It With (Only 3 Products)
                                        </label>

                                        {/* Display selected product names */}

                                        {buyItWith && buyItWith.length > 0 && buyItWith.length < 3 ? (
                                            <>
                                                <div>
                                                    <span style={{ fontWeight: "600" }}>Selected Products:</span>
                                                    <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                                                        {buyItWith.map((selectedProduct, index) => (
                                                            <li style={{ marginBottom: "5px" }}>
                                                                <div key={index}>
                                                                    {selectedProduct.brand?.name} {selectedProduct.name} {selectedProduct.model}{" "}
                                                                    <button type="button" onClick={() => handleRemoveSelectedProduct(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                        <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                    <span style={{ fontWeight: "600" }}>New Selected Products:</span>
                                                    <ol style={{ marginLeft: "20px", marginTop: "10px", marginBottom: "10px" }}>
                                                        {Array.isArray(updatedBuyItWith) &&
                                                            updatedBuyItWith.map((selectedProduct1, index) => (
                                                                <li key={index}>
                                                                    <div>
                                                                        {selectedProduct1?.brand?.name} {selectedProduct1.name} {selectedProduct1.model}{" "}
                                                                        <button type="button" onClick={() => handleRemoveSelectedProduct(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                            <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                    </ol>
                                                </div>

                                                <div className="dropdown">
                                                    <label htmlFor="product-dropdown" style={{ fontWeight: "600" }}>
                                                        Add Products:
                                                    </label>
                                                    <select
                                                        id="product-dropdown"
                                                        style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }}
                                                        disabled={selectedProductIds.length >= 3}
                                                        onChange={(e) => handleSelection(products.find((product) => product._id === e.target.value))}
                                                    >
                                                        <option value="">Select a product</option>
                                                        {products.map((product) => (
                                                            <option key={product._id} value={product._id}>
                                                                {product?.brand?.name} {product.name} {product.model}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        ) : buyItWith && buyItWith.length === 3 ? (
                                            <div>
                                                <label style={{ marginLeft: "20px" }}>Selected Products:</label>
                                                <ol style={{ marginLeft: "20px", marginTop: "5px" }}>
                                                    {buyItWith.map((selectedProduct, index) => (
                                                        <li key={index} style={{ marginBottom: "5px" }}>
                                                            <div key={index} className="selected-product" style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                                                                {selectedProduct?.brand?.name} {selectedProduct.name} {selectedProduct.model}
                                                                <button type="button" onClick={() => handleRemoveSelectedProduct(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                    <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ol>
                                                <button type="button" onClick={() => handleRemoveAllBuyItWithProducts()} style={{ backgroundColor: "#4f46e5", textAlign: "center", padding: "10px", color: "white", border: "none" }}>
                                                    Remove All
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="selected-products">
                                                    <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                                                        {selectedProductIds.map((selectedProduct, index) => (
                                                            <li key={index}>
                                                                <div className="selected-product" style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                                                                    {selectedProduct?.brand?.name} {selectedProduct.name} {selectedProduct.model}
                                                                    <button type="button" onClick={() => handleRemoveSelectedProduct(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                        <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                                <select
                                                    style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }}
                                                    disabled={selectedProductIds.length >= 3}
                                                    value={selectedProducts}
                                                    onChange={(e) => handleSelection(products.find((item) => item._id === e.target.value))}
                                                >
                                                    <option selected>Please select the products</option>
                                                    {products?.map((item) => (
                                                        <option key={item._id} value={item._id} style={{ textTransform: "capitalize" }}>
                                                            {item?.brand?.name} {item.name} {item.model}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}

                                        {getFormErrorMessage("name")}
                                    </div>
                                </div>
                            </div>
                            <div className="form_right">
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="deal_product" className={classNames({ "p-error": isFormFieldValid("deal_product") }, "Label__Text")}>
                                            Deal Product
                                        </label>
                                        <select
                                            placeholder="3342"
                                            id="deal_product"
                                            style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }}
                                            name="deal_product"
                                            value={formik.values.deal_product}
                                            onChange={formik.handleChange}
                                            className={classNames({ "p-invalid": isFormFieldValid("deal_product") }, "Input__Round")}
                                        >
                                            <option value={true}>True</option>
                                            <option value={false}>False</option>
                                        </select>
                                        {getFormErrorMessage("deal_product")}
                                    </div>
                                </div>
                                {/* PRODUCT NAME */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                            Product Name
                                        </label>
                                        <InputText placeholder="Paper bags" id="name" name="name" value={formik.values.name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                                        {getFormErrorMessage("name")}
                                    </div>
                                </div>

                                {/* PRODUCT ID */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="product_id" className={classNames({ "p-error": isFormFieldValid("product_id") }, "Label__Text")}>
                                            Product ID
                                        </label>
                                        <InputText placeholder="3342" id="product_id" name="product_id" value={formik.values.product_id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("product_id") }, "Input__Round")} />

                                        {getFormErrorMessage("product_id")}
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

                                {/* DELIVERY TIME */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="delivery_time" className={classNames({ "p-error": isFormFieldValid("delivery_time") }, "Label__Text")}>
                                            Delivery Time
                                        </label>
                                        <InputText placeholder="2-4 days" id="delivery_time" name="delivery_time" value={formik.values.delivery_time} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("delivery_time") }, "Input__Round")} />

                                        {getFormErrorMessage("delivery_time")}
                                    </div>
                                </div>

                                {/* SLUG/ROUTE */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="slug" className={classNames({ "p-error": isFormFieldValid("slug") }, "Label__Text")}>
                                            Slug/Route
                                        </label>
                                        <InputText placeholder="pm1" id="slug" name="slug" value={formik.values.slug} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("slug") }, "Input__Round")} />

                                        {getFormErrorMessage("model")}
                                    </div>
                                </div>

                                {/* META DESCRIPTION  */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="meta_description" className={classNames({ "p-error": isFormFieldValid("meta_description") }, "Label__Text")}>
                                            Meta Description
                                        </label>
                                        <InputText placeholder="Meta Description" id="meta_description" name="meta_description" value={formik.values.meta_description} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("meta_description") }, "Input__Round")} />

                                        {getFormErrorMessage("meta_description")}
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

                                {/* PRINT */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="print" className={classNames({ "p-error": isFormFieldValid("print") }, "Label__Text")}>
                                            Print
                                        </label>
                                        <InputText placeholder="un-printed" id="print" name="print" value={formik.values.print} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("print") }, "Input__Round")} />

                                        {getFormErrorMessage("print")}
                                    </div>
                                </div>

                                {/* ABOUT ITEM */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="aboutItem" className={classNames({ "p-error": isFormFieldValid("aboutItem") }, "Label__Text")}>
                                            About Item
                                        </label>
                                        <InputText placeholder="Product" id="aboutItem" name="aboutItem" value={formik.values.aboutItem} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("aboutItem") }, "Input__Round")} />

                                        {getFormErrorMessage("aboutItem")}
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

                                {/* THICKNESS IN MICRON */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="thickness_micron" className={classNames({ "p-error": isFormFieldValid("thickness_micron") }, "Label__Text")}>
                                            Thickness(micron)
                                        </label>
                                        <InputText placeholder="50" id="thickness_micron" name="thickness_micron" value={formik.values.thickness_micron} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("thickness_micron") }, "Input__Round")} />

                                        {getFormErrorMessage("thickness_micron")}
                                    </div>
                                </div>

                                {/* WEIGHT */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field">
                                        <label htmlFor="pouch_weight" className={classNames({ "p-error": isFormFieldValid("pouch_weight") }, "Label__Text")}>
                                            Weight of pouch
                                        </label>
                                        <InputText placeholder="aprox 9gms" id="pouch_weight" name="pouch_weight" value={formik.values.pouch_weight} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("pouch_weight") }, "Input__Round")} />

                                        {getFormErrorMessage("pouch_weight")}
                                    </div>
                                </div>

                                {/* RELATED PRODUCTS */}
                                <div className="p-field col-12 md:col-12">
                                    <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                                        <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")} style={{ marginBottom: "10px" }}>
                                            Related Products (Maximum 10 Products)
                                        </label>

                                        {/* Display selected product names */}

                                        {relatedProducts && relatedProducts.length > 0 && relatedProducts.length < 10 ? (
                                            <>
                                                <div>
                                                    <span style={{ fontWeight: "600" }}>Selected Products:</span>
                                                    <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                                                        {relatedProducts.map((selectedProduct, index) => (
                                                            <li style={{ marginBottom: "5px" }}>
                                                                <div key={index}>
                                                                    {selectedProduct.brand?.name} {selectedProduct.name} {selectedProduct.model}{" "}
                                                                    <button type="button" onClick={() => handleRemoveSelectedProductRP(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                        <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                    <span style={{ fontWeight: "600" }}>New Selected Products:</span>
                                                    <ol style={{ marginLeft: "20px", marginTop: "10px", marginBottom: "10px" }}>
                                                        {Array.isArray(updatedRelatedProducts) &&
                                                            updatedRelatedProducts.map((selectedProduct1, index) => (
                                                                <li key={index}>
                                                                    <div>
                                                                        {selectedProduct1?.brand?.name} {selectedProduct1.name} {selectedProduct1.model}{" "}
                                                                        <button type="button" onClick={() => handleRemoveSelectedProductRP(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                            <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                    </ol>
                                                </div>

                                                <div className="dropdown">
                                                    <label htmlFor="product-dropdown" style={{ fontWeight: "600" }}>
                                                        Add Products:
                                                    </label>
                                                    <select
                                                        id="product-dropdown"
                                                        style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }}
                                                        disabled={selectedProductIdsRP.length >= 10}
                                                        onChange={(e) => handleSelectionRP(products.find((product) => product._id === e.target.value))}
                                                    >
                                                        <option value="">Select a product</option>
                                                        {products.map((product) => (
                                                            <option key={product._id} value={product._id}>
                                                                {product?.brand?.name} {product.name} {product.model}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        ) : relatedProducts && relatedProducts.length === 10 ? (
                                            <div>
                                                <label style={{ marginLeft: "20px" }} l>
                                                    Selected Products:
                                                </label>
                                                <ol style={{ marginLeft: "20px", marginTop: "5px" }}>
                                                    {relatedProducts.map((selectedProduct, index) => (
                                                        <li key={index} style={{ marginBottom: "5px" }}>
                                                            <div key={index} className="selected-product" style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                                                                {selectedProduct?.brand?.name} {selectedProduct?.name} {selectedProduct?.model}
                                                                <button type="button" onClick={() => handleRemoveSelectedProductRP(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                    <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ol>

                                                <button type="button" onClick={() => handleRemoveAllProducts()} style={{ backgroundColor: "#4f46e5", textAlign: "center", padding: "10px", color: "white", border: "none" }}>
                                                    Remove All
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="selected-products">
                                                    <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                                                        {selectedProductIdsRP.map((selectedProduct, index) => (
                                                            <li>
                                                                <div key={index} className="selected-product" style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                                                                    {selectedProduct?.brand?.name} {selectedProduct.name} {selectedProduct.model}
                                                                    <button type="button" onClick={() => handleRemoveSelectedProductRP(index)} style={{ borderRadius: "100%", backgroundColor: "white" }}>
                                                                        <i className="pi pi-times" style={{ padding: "3px", color: "black", fontSize: "10px" }}></i>
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>

                                                <select
                                                    style={{ marginTop: "10px", height: "35px", borderRadius: "6px", border: "1px solid #cecece" }}
                                                    disabled={selectedProductIdsRP.length >= 10}
                                                    value={selectedProductsRP}
                                                    onChange={(e) => handleSelectionRP(products.find((item) => item._id === e.target.value))}
                                                >
                                                    <option selected>Please select the products</option>
                                                    {products?.map((item) => (
                                                        <option key={item._id} value={item._id} style={{ textTransform: "capitalize" }}>
                                                            {item?.brand?.name} {item.name} {item.model}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}

                                        {getFormErrorMessage("name")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-field col-12 md:col-12">
                            <div className="p-field">
                                <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                    Description
                                </label>
                                <Editor
                                    editorStyle={{ border: "1px solid #cecece", height: "250px", width: "100%" }}
                                    toolbar={{
                                        options: ["inline", "blockType", "fontSize", "fontFamily", "list", "textAlign", "link", "history"],
                                        fontSize: {
                                            options: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 60, 72, 96],
                                        },
                                        fontFamily: {
                                            options: ["Arial", "Georgia", "Impact", "Tahoma", "Times New Roman", "Verdana", "Montserrat"],
                                        },
                                    }}
                                    editorState={text1}
                                    onEditorStateChange={handleStateD}
                                    onContentStateChange={handlecontentD}
                                />

                                {getFormErrorMessage("description")}
                            </div>
                        </div>

                        <div className="p-field col-12 md:col-12">
                            <div className="p-field">
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                        Price
                                    </label>
                                    <Button label="Add Price" style={{ width: "150px", height: "35px" }} onClick={() => addPrice()} type="button"></Button>
                                </div>
                                {price?.map((fa, index) => {
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
                                            <div>
                                                <label>Number of items</label>
                                                <InputText id="number" name="number" placeholder={fa?.number} onChange={(e) => handlePrice(e.target.value, "number", index)} className={classNames("Input__Round")} />
                                            </div>

                                            <div>
                                                <label>Pack Weight(kg)</label>
                                                <InputText id="pack_weight" name="pack_weight" placeholder={fa?.pack_weight} onChange={(e) => handlePrice(e.target.value, "pack_weight", index)} className={classNames("Input__Round")} />
                                            </div>

                                            <div>
                                                <label>Stock</label>
                                                <InputText id="stock_quantity" name="stock_quantity" placeholder={fa?.stock_quantity} onChange={(e) => handlePrice(e.target.value, "stock_quantity", index)} className={classNames("Input__Round")} />
                                            </div>

                                            <div>
                                                <label>MRP</label>
                                                <InputText id="MRP" name="MRP" placeholder={fa?.MRP} onChange={(e) => handlePrice(e.target.value, "MRP", index)} className={classNames("Input__Round")} />
                                            </div>
                                            <div>
                                                <label>SP</label>
                                                <InputText id="SP" name="SP" placeholder={fa?.SP} onChange={(e) => handlePrice(e.target.value, "SP", index)} className={classNames("Input__Round")} />
                                            </div>
                                            <Button type="button" label="Remove" onClick={() => handleRemovePrice(index)} />
                                        </div>
                                    );
                                })}
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

export default Product;
