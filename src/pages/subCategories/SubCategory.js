import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import { CommonAttributesEditor, pairsToAttributes, attributesToPairs } from "../../components/CategoryAttributesEditor";
import Axios from "axios";
import { DEV } from "../../services/constants";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const getId = (value) => (typeof value === "object" ? value?._id : value);
const displayValue = (value) => (value !== undefined && value !== null && value !== "" ? value : "--");

function SubCategory() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [role, setRole] = useState("");

    useEffect(() => {
        setRole(localStorage.getItem("role"));
    }, []);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [gst, setGst] = useState("");
    const [hsn_code, setHsnCode] = useState("");
    const [sac_code, setSacCode] = useState("");
    const [tax_category, setTaxCategory] = useState("Goods");
    const [delivery_time, setDeliveryTime] = useState("");
    const [attributePairs, setAttributePairs] = useState([]);
    const [subCategoryProducts, setSubCategoryProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const categoryLookup = useMemo(() => {
        return categories.reduce((acc, category) => {
            if (category?._id) acc[category._id] = category.name;
            return acc;
        }, {});
    }, [categories]);

    const brandLookup = useMemo(() => {
        return brands.reduce((acc, brand) => {
            if (brand?._id) acc[brand._id] = brand.name;
            return acc;
        }, {});
    }, [brands]);

    const fetchProducts = useCallback(async (payload) => {
        const productsRes = await Axios.post(
            `${DEV}/product/filter`,
            {
                ...payload,
                includeMeta: true,
                limit: -1,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
                params: {
                    populate: true,
                },
            },
        );

        return productsRes?.data?.data || [];
    }, []);

    const findLegacyCategoryMatch = useCallback((subCategory, categoryList) => {
        const subName = normalizeText(subCategory?.name);
        const subSlug = normalizeText(subCategory?.slug);
        const currentParentId = String(getId(subCategory?.category) || "");

        return categoryList.find((category) => {
            const categoryId = String(category?._id || "");
            if (categoryId && categoryId === currentParentId) return false;
            return normalizeText(category?.name) === subName || normalizeText(category?.slug) === subSlug;
        });
    }, []);

    const fetchSubCategoryProducts = useCallback(async (subCategory, categoryList = []) => {
        if (!subCategory?._id) {
            setSubCategoryProducts([]);
            return;
        }

        setProductsLoading(true);
        try {
            const linkedProducts = await fetchProducts({ subcategory: subCategory._id });
            if (linkedProducts.length > 0) {
                setSubCategoryProducts(linkedProducts);
                return;
            }

            const legacyCategory = findLegacyCategoryMatch(subCategory, categoryList);
            if (!legacyCategory?._id) {
                setSubCategoryProducts([]);
                return;
            }

            const legacyProducts = await fetchProducts({ category: legacyCategory._id });
            setSubCategoryProducts(legacyProducts);
        } catch (error) {
            setSubCategoryProducts([]);
            toast.warn(error?.response?.data?.message || "Unable to load products for this subcategory.");
        } finally {
            setProductsLoading(false);
        }
    }, [fetchProducts, findLegacyCategoryMatch]);

    const updateLoadedProductsFromClient = useCallback(async (productFields) => {
        const productIds = subCategoryProducts.map((product) => product?._id).filter(Boolean);
        if (!productIds.length || Object.keys(productFields).length === 0) return 0;

        const results = await Promise.allSettled(
            productIds.map((productId) =>
                Axios.put(
                    `${DEV}/product/update`,
                    { id: productId, ...productFields },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            ...getAuthHeader(),
                        },
                    },
                ),
            ),
        );

        return results.filter((result) => result.status === "fulfilled" && result.value?.data?.success).length;
    }, [subCategoryProducts]);

    const getData = useCallback(async () => {
        const res = await handleGetRequest(`/subcategory/get/${id}`);
        const sub = res?.data;
        setName(sub?.name ?? "");
        setSlug(sub?.slug ?? "");
        setGst(sub?.gst !== undefined && sub?.gst !== null ? sub.gst : "");
        setHsnCode(sub?.hsn_code ?? "");
        setSacCode(sub?.sac_code ?? "");
        setTaxCategory(sub?.tax_category ?? "Goods");
        setDeliveryTime(sub?.delivery_time ?? "");

        const commonAttrs = sub?.common_attributes || {};
        setAttributePairs(attributesToPairs(commonAttrs));

        const [result, brandResult] = await Promise.all([
            handleGetRequest("/category/all"),
            handleGetRequest("/brand/all"),
        ]);
        const categoryList = Array.isArray(result?.data) ? result.data : [];
        const brandList = Array.isArray(brandResult?.data) ? brandResult.data : [];
        setCategories(categoryList);
        setBrands(brandList);
        setSelectedCategory(sub?.category?._id || sub?.category || "");

        setManufacturers(sub);
        fetchSubCategoryProducts(sub, categoryList);
    }, [fetchSubCategoryProducts, id]);
    useEffect(() => {
        getData();
    }, [getData]);

    const breadItems = [{ label: "Home" }, { label: "SubCategories", url: "/subcategories" }];
    const home = { icon: "pi pi-home", url: "/" };

    const formik = useFormik({
        initialValues: {
            name: "",
            slug: "",
        },

        onSubmit: async (data) => {
            const dat = {
                name: name,
                slug: slug,
                id: id,
                category: selectedCategory,
                gst: gst !== "" && gst !== null ? Number(gst) : undefined,
                hsn_code: hsn_code.trim() || undefined,
                sac_code: sac_code.trim() || undefined,
                tax_category: tax_category.trim() || undefined,
                delivery_time: delivery_time.trim() || undefined,
                common_attributes: pairsToAttributes(attributePairs),
            };
            const res = await handlePutRequest(dat, "/subcategory/update");
            if (res?.success === true) {
                const productFields = {
                    ...(gst !== "" && gst !== null ? { gst: Number(gst) } : {}),
                    ...(hsn_code.trim() ? { hsn_code: hsn_code.trim() } : {}),
                    ...(sac_code.trim() ? { sac_code: sac_code.trim() } : {}),
                    ...(tax_category.trim() ? { tax_category: tax_category.trim() } : {}),
                    ...(delivery_time.trim() ? { delivery_time: delivery_time.trim() } : {}),
                };
                const backendUpdatedCount = res?.data?.productsUpdated;
                const updatedCount = backendUpdatedCount !== undefined
                    ? backendUpdatedCount
                    : await updateLoadedProductsFromClient(productFields);
                const updatedSubCategory = {
                    ...manufacturer,
                    _id: id,
                    name,
                    slug,
                    category: selectedCategory,
                    gst: gst !== "" && gst !== null ? Number(gst) : undefined,
                    hsn_code,
                    sac_code,
                    tax_category,
                    delivery_time,
                };
                setManufacturers(updatedSubCategory);
                await fetchSubCategoryProducts(updatedSubCategory, categories);
                toast.success(
                    updatedCount !== undefined
                        ? `Subcategory edited. ${updatedCount} products updated.`
                        : "subcategory edited",
                );
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

    const handleCreateProduct = () => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set("categoryId", selectedCategory);
        if (id) params.set("subCategoryId", id);
        const query = params.toString();
        history.push(`/products/create${query ? `?${query}` : ""}`);
    };

    const thumbnailTemplate = (rowData) => {
        const thumbnailKey = rowData?.media?.thumbnail || rowData?.images?.[0]?.image || rowData?.images?.[0];
        if (!thumbnailKey) return <i className="pi pi-image" style={{ fontSize: "1.5rem", color: "#b0b3bb" }}></i>;

        const imgUrl = String(thumbnailKey).startsWith("http")
            ? thumbnailKey
            : `${DEV}/getImage?image=${thumbnailKey}`;

        return (
            <img
                src={imgUrl}
                alt={rowData?.name || "Product"}
                style={{ width: "34px", height: "34px", objectFit: "contain", borderRadius: "4px", border: "1px solid #dee2e6" }}
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />
        );
    };

    const productCategoryTemplate = (rowData) => {
        const category = rowData?.category;
        const categoryName = typeof category === "object" ? category?.name : categoryLookup[category] || category;
        return <span>{displayValue(categoryName)}</span>;
    };

    const productBrandTemplate = (rowData) => {
        const brand = rowData?.brand;
        const brandName = typeof brand === "object" ? brand?.name : brandLookup[brand] || brand;
        return <span>{displayValue(brandName)}</span>;
    };

    const productGstTemplate = (rowData) => {
        const gstValue = rowData?.gst;
        if (gstValue === undefined || gstValue === null || gstValue === "") return <span>--</span>;
        const numericGst = Number(gstValue);
        if (Number.isNaN(numericGst)) return <span>{gstValue}</span>;
        return <span>{numericGst > 0 && numericGst <= 1 ? numericGst * 100 : numericGst}%</span>;
    };

    const productHsnTemplate = (rowData) => <span>{displayValue(rowData?.hsn_code)}</span>;

    const productSizeTemplate = (rowData) => <span>{displayValue(rowData?.size_inch || rowData?.size_mm)}</span>;

    const productColorTemplate = (rowData) => <span>{displayValue(rowData?.color)}</span>;

    const productDeliveryTemplate = (rowData) => <span>{displayValue(rowData?.delivery_time)}</span>;

    const productMrpTemplate = (rowData) => {
        const firstTier = rowData?.priceList?.[0] || rowData?.pricing?.priceList?.[0] || {};
        const mrp = firstTier.MRP ?? firstTier.mrp ?? firstTier.original_price ?? firstTier.originalPrice ?? rowData?.MRP ?? rowData?.mrp;
        return <span>{mrp != null ? `Rs. ${mrp}` : "--"}</span>;
    };

    const productSpTemplate = (rowData) => {
        const firstTier = rowData?.priceList?.[0] || rowData?.pricing?.priceList?.[0] || {};
        const sp = firstTier.SP ?? firstTier.sp ?? firstTier.price ?? firstTier.sellingPrice ?? rowData?.SP ?? rowData?.sp ?? rowData?.price;
        return <span>{sp != null ? `Rs. ${sp}` : "--"}</span>;
    };

    const productActionTemplate = (rowData) => (
        role === "admin" || role === "catalog-manager" ? (
        <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text p-button-sm"
            onClick={() => history.push(`/product/${rowData._id}`)}
            tooltip="Edit Product"
            tooltipOptions={{ position: "bottom" }}
            type="button"
        />
        ) : null
    );

    return (
        <>
            <style>{`
                .subcategory-edit-layout {
                    display: grid;
                    grid-template-columns: minmax(260px, 0.85fr) minmax(0, 5fr);
                    gap: 18px;
                    align-items: start;
                }
                .subcategory-header-content {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .subcategory-header-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .subcategory-edit-layout .left_section,
                .subcategory-edit-layout .right_section {
                    width: 100%;
                    min-width: 0;
                }
                .subcategory-form-panel {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 14px;
                    background: #fff;
                }
                .subcategory-form-panel .form__ {
                    display: block;
                    margin-bottom: 16px;
                }
                .subcategory-form-panel .form_left,
                .subcategory-form-panel .form_right {
                    width: 100%;
                }
                .subcategory-form-panel .form_left > div,
                .subcategory-form-panel .form_right > div {
                    margin-top: 10px;
                }
                .subcategory-form-panel .subcategory-config-grid {
                    grid-template-columns: 1fr;
                    gap: 14px;
                }
                .subcategory-form-panel .card {
                    padding: 1rem !important;
                }
                .subcategory-form-panel .card > div > div:first-child {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 10px;
                }
                .subcategory-form-panel .card > div > div:first-child .p-button {
                    width: 100% !important;
                    max-width: 180px;
                }
                .subcategory-form-panel small {
                    line-height: 1.35;
                }
                .subcategory-products-panel {
                    padding: 0;
                    border: none;
                    background: transparent;
                }
                .subcategory-products-panel .card {
                    padding: 0.75rem !important;
                }
                .subcategory-products-panel .p-datatable {
                    width: 100%;
                }
                .subcategory-products-panel .p-datatable-table {
                    width: 100%;
                    min-width: 1180px;
                    table-layout: fixed;
                }
                .subcategory-products-panel .p-datatable-thead > tr > th,
                .subcategory-products-panel .p-datatable-tbody > tr > td {
                    padding: 0.55rem 0.65rem;
                    white-space: normal;
                    vertical-align: middle;
                    line-height: 1.25;
                }
                .subcategory-products-panel .p-datatable-wrapper {
                    max-height: calc(100vh - 205px);
                    overflow: auto;
                }
                @media (max-width: 1100px) {
                    .subcategory-edit-layout {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            <div className="customer_header__">
                <div className="left___ subcategory-header-content">
                    <h2>{manufacturer?.title}</h2>
                    <div className="subcategory-header-row">
                        <BreadCrumb model={breadItems} home={home} />
                    </div>
                </div>
            </div>
            <div className="customer_details_section subcategory-edit-layout">
                <div className="left_section subcategory-form-panel">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Slug
                                    </label>
                                    <InputText id="createdAt" disabled={true} name="createdAt" value={slug} onChange={(e) => setSlug(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

                                    {getFormErrorMessage("createdAt")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="profile" className={classNames({ "p-error": isFormFieldValid("profile") }, "Label__Text")}>
                                        Name
                                    </label>
                                    <InputText id="profile" name="title" value={name} onChange={(e) => setName(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("profile") }, "Input__Round")} />

                                    {getFormErrorMessage("profile")}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", marginTop: "10px" }}>
                                    <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                        Category
                                    </label>
                                    <select style={{ marginTop: "10px", height: "30px", border: "1px solid #cecece", borderRadius: "6px" }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                        <option value="" disabled>
                                            Please select category
                                        </option>
                                        {categories?.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                    {getFormErrorMessage("name")}
                                </div>
                            </div>
                        </div>

                        {/* Tax and Fulfillment Sections */}
                        <div className="subcategory-config-grid" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
                            {/* Tax Configuration Card */}
                            <div className="card" style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid #dee2e6", margin: 0 }}>
                                <h5 style={{ fontWeight: 600, color: "#182C5A", marginBottom: "1.25rem", marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "16px" }}>
                                    <i className="pi pi-percentage" style={{ fontSize: "1.1rem" }}></i> Tax Configuration
                                </h5>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div>
                                        <label htmlFor="subcategory_gst" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            GST Rate (%)
                                        </label>
                                        <InputText id="subcategory_gst" type="number" value={gst} onChange={(e) => setGst(e.target.value)} placeholder="Inherit from Category" className="Input__Round" />
                                    </div>
                                    <div>
                                        <label htmlFor="subcategory_hsn" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            HSN Code
                                        </label>
                                        <InputText id="subcategory_hsn" value={hsn_code} onChange={(e) => setHsnCode(e.target.value)} placeholder="Inherit from Category" className="Input__Round" />
                                    </div>
                                    <div>
                                        <label htmlFor="subcategory_sac" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            SAC Code
                                        </label>
                                        <InputText id="subcategory_sac" value={sac_code} onChange={(e) => setSacCode(e.target.value)} placeholder="Inherit from Category" className="Input__Round" />
                                    </div>
                                    <div>
                                        <label htmlFor="subcategory_tax_cat" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            Tax Category
                                        </label>
                                        <Dropdown id="subcategory_tax_cat" value={tax_category} options={[{ label: "Goods", value: "Goods" }, { label: "Services", value: "Services" }]} onChange={(e) => setTaxCategory(e.value)} placeholder="Select Tax Category" className="Input__Round" />
                                    </div>
                                </div>
                            </div>

                            {/* Fulfillment Configuration Card */}
                            <div className="card" style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid #dee2e6", margin: 0 }}>
                                <h5 style={{ fontWeight: 600, color: "#22C55E", marginBottom: "1.25rem", marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "16px" }}>
                                    <i className="pi pi-truck" style={{ fontSize: "1.1rem" }}></i> Fulfillment Configuration
                                </h5>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div>
                                        <label htmlFor="subcategory_delivery" className="Label__Text" style={{ display: "block", marginBottom: "4px" }}>
                                            Estimated Delivery Time
                                        </label>
                                        <InputText id="subcategory_delivery" value={delivery_time} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="e.g. 3-5 business days" className="Input__Round" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Common Attributes Section */}
                        <div style={{ marginTop: "20px" }}>
                            <div className="card" style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid #dee2e6", margin: 0 }}>
                                <CommonAttributesEditor value={attributePairs} onChange={setAttributePairs} />
                            </div>
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" onClick={handleCancel} type="button" />
                            {role === "admin" || role === "catalog-manager" && <Button label="Update" className="Btn__Dark" type="submit" />}
                        </div>
                    </form>
                </div>
                <div className="right_section subcategory-products-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", gap: "12px", flexWrap: "wrap" }}>
                        <h5 style={{ margin: 0, fontWeight: 600, color: "#182C5A", fontSize: "16px" }}>Products</h5>
                        {role === "admin" || role === "catalog-manager" && (
                        <Button
                            label="Create Product"
                            icon="pi pi-plus"
                            className="Btn__Dark"
                            type="button"
                            onClick={handleCreateProduct}
                        />
                        )}
                    </div>
                    <div className="card" style={{ marginTop: 0, borderRadius: "8px", border: "1px solid #dee2e6" }}>
                        <DataTable
                            value={subCategoryProducts}
                            loading={productsLoading}
                            scrollable
                            scrollHeight="calc(100vh - 205px)"
                            responsiveLayout="scroll"
                            emptyMessage="No products found for this subcategory."
                            className="p-datatable-striped"
                        >
                            <Column header="Img" body={thumbnailTemplate} style={{ width: "56px" }} />
                            <Column field="product_id" header="SKU/ID" style={{ width: "70px", fontWeight: 600 }} />
                            <Column field="name" header="Name" style={{ width: "120px", textTransform: "capitalize" }} />
                            <Column field="model" header="Model" style={{ width: "70px" }} />
                            <Column header="Brand Name" body={productBrandTemplate} style={{ width: "110px" }} />
                            <Column header="Category Name" body={productCategoryTemplate} style={{ width: "120px" }} />
                            <Column header="Size" body={productSizeTemplate} style={{ width: "105px" }} />
                            <Column header="Color" body={productColorTemplate} style={{ width: "78px" }} />
                            <Column header="GST" body={productGstTemplate} style={{ width: "60px" }} />
                            <Column header="HSN Code" body={productHsnTemplate} style={{ width: "92px" }} />
                            <Column header="MRP" body={productMrpTemplate} style={{ width: "86px" }} />
                            <Column header="SP" body={productSpTemplate} style={{ width: "82px" }} />
                            <Column header="Delivery" body={productDeliveryTemplate} style={{ width: "115px" }} />
                            <Column header="Edit" body={productActionTemplate} style={{ width: "56px", textAlign: "center" }} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SubCategory;
