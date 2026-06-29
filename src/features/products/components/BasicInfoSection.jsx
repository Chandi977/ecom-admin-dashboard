// cache buster: 12345
import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useBrands, useCategories, useSubCategories } from "../../../hooks/useProductQuery";
import { FormInputText, FormDropdown, FormCheckbox, FormInputTextArea, FormInputNumber } from "../../../components/FormControls";
import Editor from "../../../components/SafeRichTextEditor";
import { EditorState, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

const humanizeKey = (key) =>
    String(key)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

export const BasicInfoSection = () => {
    const { control, watch, setValue, getValues } = useFormContext();
    const { data: brands, isLoading: loadingBrands } = useBrands();
    const { data: categories, isLoading: loadingCategories } = useCategories();
    const { data: subCategories, isLoading: loadingSubCategories } = useSubCategories();

    const brandsList = useMemo(() => Array.isArray(brands) ? brands : [], [brands]);
    const categoriesList = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);
    const subCategoriesList = useMemo(() => Array.isArray(subCategories) ? subCategories : [], [subCategories]);

    const selectedCategoryId = watch("categoryId");
    const productName = watch("name");

    // The selected category is the single source for inherited "common fields"
    // (GST + common_attributes). The product inherits them unless it overrides.
    const selectedCategory = useMemo(
        () => categoriesList.find((c) => String(c._id) === String(selectedCategoryId)),
        [categoriesList, selectedCategoryId],
    );
    const inheritedGst = selectedCategory?.gst;
    const commonAttributes =
        selectedCategory && typeof selectedCategory.common_attributes === "object" && !Array.isArray(selectedCategory.common_attributes)
            ? selectedCategory.common_attributes
            : {};
    const commonAttributeKeys = Object.keys(commonAttributes);
    
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        if (!selectedCategoryId) {
            setFilteredSubCategories([]);
            return;
        }
        const filtered = subCategoriesList.filter((sub) => {
            if (!sub) return false;
            const subCatId = (sub.category && typeof sub.category === "object") ? sub.category._id : sub.category;
            return subCatId && String(subCatId) === String(selectedCategoryId);
        });
        setFilteredSubCategories(filtered);
    }, [selectedCategoryId, subCategoriesList]);

    // On edit, pre-fill common-field overrides from the product's OWN values, but
    // only for the keys this category declares as common. Fields the product did
    // not override stay blank so they keep inheriting. (__rawProduct is set by
    // ProductEdit and is absent when creating.)
    const rawProduct = watch("__rawProduct");
    useEffect(() => {
        if (!selectedCategory || !rawProduct) return;
        commonAttributeKeys.forEach((key) => {
            const current = getValues(`common_overrides.${key}`);
            const ownValue = rawProduct[key];
            if ((current === undefined || current === "") && ownValue !== undefined && ownValue !== null && ownValue !== "") {
                setValue(`common_overrides.${key}`, ownValue, { shouldDirty: false });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, rawProduct]);

    useEffect(() => {
        if (productName && !watch("slug")) {
            const autoSlug = productName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");
            setValue("slug", autoSlug, { shouldValidate: true });
        }
    }, [productName, setValue, watch]);

    const rawDescription = watch("description");
    const [editorInitialized, setEditorInitialized] = useState(false);

    useEffect(() => {
        if (rawDescription && !editorInitialized) {
            try {
                const contentBlock = htmlToDraft(rawDescription);
                if (contentBlock) {
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                    setEditorState(EditorState.createWithContent(contentState));
                }
            } catch (err) {
                console.error("Error parsing description html:", err);
            }
            setEditorInitialized(true);
        }
    }, [rawDescription, editorInitialized]);

    const handleEditorChange = (state) => {
        setEditorState(state);
        const html = draftToHtml(state.getCurrentContent());
        setValue("description", html, { shouldDirty: true });
    };

    return (
        <div className="p-fluid p-formgrid grid">
            <FormInputText
                name="name"
                label="Product Name"
                placeholder="e.g. Kraft Paper Bags"
                required
            />
            
            <FormInputText
                name="product_id"
                label="SKU / Product ID"
                placeholder="e.g. KPB-001"
                required
            />

            <FormInputText
                name="slug"
                label="Slug / SEO Route"
                placeholder="e.g. kraft-paper-bags-kpb-001"
                required
            />

            <FormDropdown
                name="brandId"
                label="Brand"
                options={brandsList}
                optionLabel="name"
                optionValue="_id"
                placeholder="Select Brand"
                loading={loadingBrands}
                required
            />

            <FormDropdown
                name="categoryId"
                label="Category"
                options={categoriesList}
                optionLabel="name"
                optionValue="_id"
                placeholder="Select Category"
                loading={loadingCategories}
                required
            />

            <FormDropdown
                name="subCategoryId"
                label="Sub-Category"
                options={filteredSubCategories}
                optionLabel="name"
                optionValue="_id"
                placeholder={selectedCategoryId ? "Select Sub-Category" : "Please select category first"}
                loading={loadingSubCategories}
                disabled={!selectedCategoryId}
            />

            <FormInputNumber
                name="gst"
                label="GST Rate (%)"
                placeholder={inheritedGst != null ? `${inheritedGst} (inherited)` : "Inherited from category"}
                min={0}
                max={100}
                description={
                    inheritedGst != null
                        ? `Inherited from category: ${inheritedGst}%. Leave blank to use it.`
                        : "Leave blank to inherit the category's GST."
                }
            />

            <FormInputText
                name="deliveryTime"
                label="Estimated Delivery Time"
                placeholder="e.g. 3-5 working days"
            />

            {commonAttributeKeys.length > 0 && (
                <div className="p-field col-12" style={{ marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                    <label className="Label__Text" style={{ display: "block", fontWeight: 600, color: "#2196F3" }}>
                        <i className="pi pi-sitemap" style={{ marginRight: "0.5rem" }}></i>
                        Common Fields (inherited from category)
                    </label>
                    <small className="p-text-secondary">
                        These are defined once on the category. Leave a field blank to inherit its value;
                        type only to override it for this product.
                    </small>
                </div>
            )}

            {commonAttributeKeys.map((key) => (
                <FormInputText
                    key={`common-${key}`}
                    name={`common_overrides.${key}`}
                    label={humanizeKey(key)}
                    placeholder={`${commonAttributes[key]} (inherited)`}
                />
            ))}

            <FormCheckbox
                name="top_product"
                label="Featured Top Product"
                description="Show this product in top merchandising grids"
            />

            <FormCheckbox
                name="deal_product"
                label="Deal of the Day"
                description="Mark this product as a special deal item"
            />

            <FormInputTextArea
                name="aboutItem"
                label="About Item / Highlights"
                placeholder="Bullet points or short key highlights about the item"
                rows={2}
            />

            <FormInputTextArea
                name="usage"
                label="Usage & Care Instructions"
                placeholder="e.g. Recommended for dry items, store in a cool place"
                rows={2}
            />

            <div className="p-field col-12" style={{ marginBottom: "1.5rem" }}>
                <label className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Detailed Product Description
                </label>
                <div style={{ border: "1px solid #cecece", borderRadius: "6px", overflow: "hidden", minHeight: "260px", background: "#fff" }}>
                    <Editor
                        editorStyle={{ height: "200px", padding: "0 10px" }}
                        editorState={editorState}
                        onEditorStateChange={handleEditorChange}
                    />
                </div>
            </div>
        </div>
    );
};
