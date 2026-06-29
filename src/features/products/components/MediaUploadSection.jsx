import React, { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { productService } from "../../../services/productService";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { toast } from "react-toastify";
import classNames from "classnames";

export const MediaUploadSection = () => {
    const { watch, setValue } = useFormContext();
    
    const thumbnail = watch("media.thumbnail") || "";
    const images = watch("media.images") || [];
    
    const [uploadProgress, setUploadProgress] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);

    const onDrop = useCallback(
        async (acceptedFiles) => {
            for (const file of acceptedFiles) {
                setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

                try {
                    const result = await productService.uploadImage(file, (percent) => {
                        setUploadProgress((prev) => ({ ...prev, [file.name]: percent }));
                    });

                    const updatedImages = [...images, result.key];
                    setValue("media.images", updatedImages, { shouldDirty: true, shouldValidate: true });

                    if (!thumbnail) {
                        setValue("media.thumbnail", result.key, { shouldDirty: true, shouldValidate: true });
                    }

                    setTimeout(() => {
                        setUploadProgress((prev) => {
                            const copy = { ...prev };
                            delete copy[file.name];
                            return copy;
                        });
                    }, 1000);
                } catch (error) {
                    toast.error(`Failed to upload ${file.name}: ${error.message}`);
                    setUploadProgress((prev) => {
                        const copy = { ...prev };
                        delete copy[file.name];
                        return copy;
                    });
                }
            }
        },
        [images, thumbnail, setValue]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".png", ".jpg", ".webp"],
        },
        multiple: true,
    });

    const handleDelete = (index) => {
        const keyToDelete = images[index];
        const updatedImages = images.filter((_, i) => i !== index);
        setValue("media.images", updatedImages, { shouldDirty: true, shouldValidate: true });

        if (thumbnail === keyToDelete) {
            setValue("media.thumbnail", updatedImages[0] || "", { shouldDirty: true, shouldValidate: true });
        }
    };

    const handleSetThumbnail = (key) => {
        setValue("media.thumbnail", key, { shouldDirty: true, shouldValidate: true });
        toast.info("Thumbnail updated!");
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const reordered = [...images];
        const [movedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(index, 0, movedItem);

        setValue("media.images", reordered, { shouldDirty: true });
        setDraggedIndex(null);
    };

    const resolveImgUrl = (key) => {
        if (!key) return "";
        if (key.startsWith("http")) return key;
        return `${import.meta.env.VITE_API_URL || "https://server.prempackaging.com/premind/api"}/getImage?image=${key}`;
    };

    return (
        <div style={{ padding: "1rem 0" }}>
            <div
                {...getRootProps()}
                className={classNames("flex flex-column align-items-center justify-content-center p-5 border-dashed border-2 border-round cursor-pointer transition-all", {
                    "surface-hover border-primary": isDragActive,
                    "border-300 surface-border": !isDragActive,
                })}
                style={{
                    backgroundColor: isDragActive ? "rgba(33, 150, 243, 0.04)" : "#fafafa",
                    borderColor: isDragActive ? "#2196F3" : "#cecece",
                    borderRadius: "8px",
                    textAlign: "center",
                    padding: "2rem",
                    marginBottom: "1.5rem",
                }}
            >
                <input {...getInputProps()} />
                <i className="pi pi-cloud-upload" style={{ fontSize: "2.5rem", color: "#6c757d", marginBottom: "1rem" }}></i>
                {isDragActive ? (
                    <p style={{ color: "#2196F3", fontWeight: 600 }}>Drop the files here...</p>
                ) : (
                    <div>
                        <p style={{ margin: 0, fontWeight: 500, color: "#495057" }}>
                            Drag & drop gallery images here, or <span style={{ color: "#2196F3", textDecoration: "underline" }}>browse files</span>
                        </p>
                        <small style={{ color: "#6c757d", display: "block", marginTop: "0.25rem" }}>
                            Supports PNG, JPG, JPEG, WEBP (Max 5MB per file)
                        </small>
                    </div>
                )}
            </div>

            {Object.keys(uploadProgress).length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                    <h5 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "0.5rem" }}>Uploading Files...</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {Object.entries(uploadProgress).map(([name, progress]) => (
                            <div key={name} style={{ background: "#fff", padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #e9ecef" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "12px" }}>
                                    <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>{name}</span>
                                    <span style={{ fontWeight: 600, color: "#2196F3" }}>{progress}%</span>
                                </div>
                                <ProgressBar value={progress} showValue={false} style={{ height: "6px" }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h5 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "0.75rem" }}>
                    Gallery & Ordering <small style={{ fontWeight: 400, color: "#6c757d" }}>(Drag cards to reorder. Star indicates Thumbnail)</small>
                </h5>

                {images.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", color: "#6c757d" }}>
                        <i className="pi pi-images" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
                        No images uploaded yet.
                    </div>
                ) : (
                    <div className="grid" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        {images.map((key, index) => {
                            const isThumbnail = thumbnail === key;
                            return (
                                <div
                                    key={key}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    style={{
                                        position: "relative",
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "8px",
                                        border: isThumbnail ? "2px solid #2196F3" : "1px solid #cecece",
                                        padding: "4px",
                                        background: "#fff",
                                        cursor: "grab",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                        transition: "all 0.2s ease-in-out",
                                    }}
                                    className="media-item-card"
                                >
                                    <img
                                        src={resolveImgUrl(key)}
                                        alt={`Product gallery ${index}`}
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "4px" }}
                                        onError={(e) => {
                                            e.target.src = `https://server.prempackaging.com/premind/api/getImage?image=${key}`;
                                        }}
                                    />

                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: "rgba(0,0,0,0.4)",
                                            opacity: 0,
                                            transition: "opacity 0.2s",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            padding: "6px",
                                        }}
                                        className="media-item-hover"
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                            <Button
                                                type="button"
                                                icon={isThumbnail ? "pi pi-star-fill" : "pi pi-star"}
                                                className={classNames("p-button-rounded p-button-sm", {
                                                    "p-button-warning": isThumbnail,
                                                    "p-button-secondary p-button-outlined": !isThumbnail,
                                                })}
                                                onClick={() => handleSetThumbnail(key)}
                                                style={{ width: "24px", height: "24px", padding: 0 }}
                                                tooltip={isThumbnail ? "Active Thumbnail" : "Set as Thumbnail"}
                                                tooltipOptions={{ position: "top" }}
                                            />
                                            <Button
                                                type="button"
                                                icon="pi pi-trash"
                                                className="p-button-rounded p-button-danger p-button-sm"
                                                onClick={() => handleDelete(index)}
                                                style={{ width: "24px", height: "24px", padding: 0 }}
                                            />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "center", color: "#fff" }}>
                                            <i className="pi pi-bars" style={{ fontSize: "14px" }}></i>
                                        </div>
                                    </div>
                                    
                                    {isThumbnail && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                left: "4px",
                                                background: "#FBC02D",
                                                color: "#fff",
                                                padding: "2px 4px",
                                                borderRadius: "4px",
                                                fontSize: "9px",
                                                fontWeight: 700,
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            PRIMARY
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                .media-item-card:hover .media-item-hover {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
};
