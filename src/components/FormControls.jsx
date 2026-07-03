import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import classNames from "classnames";

export const FormInputText = ({
    name,
    label,
    placeholder,
    className,
    disabled,
    required,
    description,
}) => {
    const { control } = useFormContext();

    return (
        <div className={classNames("p-field col-12 md:col-6", className)} style={{ marginBottom: "1rem" }}>
            <label htmlFor={name} className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {label} {required && <span className="p-error">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <>
                        <InputText
                            id={name}
                            {...field}
                            value={field.value ?? ""}
                            disabled={disabled}
                            placeholder={placeholder}
                            className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                            style={{ width: "100%", height: "38px", borderRadius: "6px" }}
                        />
                        {fieldState.error && (
                            <small className="p-error" style={{ display: "block", marginTop: "0.25rem" }}>
                                {fieldState.error.message}
                            </small>
                        )}
                        {description && !fieldState.error && (
                            <small className="p-text-secondary" style={{ display: "block", marginTop: "0.25rem" }}>
                                {description}
                            </small>
                        )}
                    </>
                )}
            />
        </div>
    );
};

export const FormInputTextArea = ({
    name,
    label,
    placeholder,
    className,
    disabled,
    required,
    description,
    rows = 3,
}) => {
    const { control } = useFormContext();

    return (
        <div className={classNames("p-field col-12", className)} style={{ marginBottom: "1rem" }}>
            <label htmlFor={name} className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {label} {required && <span className="p-error">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <>
                        <InputTextarea
                            id={name}
                            {...field}
                            value={field.value ?? ""}
                            rows={rows}
                            disabled={disabled}
                            placeholder={placeholder}
                            className={classNames({ "p-invalid": fieldState.invalid })}
                            style={{ width: "100%", borderRadius: "6px" }}
                        />
                        {fieldState.error && (
                            <small className="p-error" style={{ display: "block", marginTop: "0.25rem" }}>
                                {fieldState.error.message}
                            </small>
                        )}
                        {description && !fieldState.error && (
                            <small className="p-text-secondary" style={{ display: "block", marginTop: "0.25rem" }}>
                                {description}
                            </small>
                        )}
                    </>
                )}
            />
        </div>
    );
};

export const FormInputNumber = ({
    name,
    label,
    placeholder,
    className,
    disabled,
    required,
    description,
    min,
    max,
    step,
}) => {
    const { control } = useFormContext();

    return (
        <div className={classNames("p-field col-12 md:col-6", className)} style={{ marginBottom: "1rem" }}>
            <label htmlFor={name} className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {label} {required && <span className="p-error">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <>
                        <InputText
                            id={name}
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            min={min}
                            max={max}
                            step={step || "any"}
                            disabled={disabled}
                            placeholder={placeholder}
                            onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : Number(val));
                            }}
                            className={classNames({ "p-invalid": fieldState.invalid }, "Input__Round")}
                            style={{ width: "100%", height: "38px", borderRadius: "6px" }}
                        />
                        {fieldState.error && (
                            <small className="p-error" style={{ display: "block", marginTop: "0.25rem" }}>
                                {fieldState.error.message}
                            </small>
                        )}
                        {description && !fieldState.error && (
                            <small className="p-text-secondary" style={{ display: "block", marginTop: "0.25rem" }}>
                                {description}
                            </small>
                        )}
                    </>
                )}
            />
        </div>
    );
};

export const FormDropdown = ({
    name,
    label,
    options,
    optionLabel = "label",
    optionValue = "value",
    placeholder,
    className,
    disabled,
    required,
    description,
    loading = false,
}) => {
    const { control } = useFormContext();

    return (
        <div className={classNames("p-field col-12 md:col-6", className)} style={{ marginBottom: "1rem" }}>
            <label htmlFor={name} className="Label__Text" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                {label} {required && <span className="p-error">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <>
                        <Dropdown
                            id={name}
                            value={field.value}
                            options={options}
                            optionLabel={optionLabel}
                            optionValue={optionValue}
                            placeholder={loading ? "Loading options..." : placeholder}
                            disabled={disabled || loading}
                            onChange={(e) => field.onChange(e.value)}
                            className={classNames({ "p-invalid": fieldState.invalid })}
                            style={{ width: "100%", height: "38px", borderRadius: "6px", display: "flex", alignItems: "center" }}
                        />
                        {fieldState.error && (
                            <small className="p-error" style={{ display: "block", marginTop: "0.25rem" }}>
                                {fieldState.error.message}
                            </small>
                        )}
                        {description && !fieldState.error && (
                            <small className="p-text-secondary" style={{ display: "block", marginTop: "0.25rem" }}>
                                {description}
                            </small>
                        )}
                    </>
                )}
            />
        </div>
    );
};

export const FormCheckbox = ({
    name,
    label,
    className,
    disabled,
    description,
}) => {
    const { control } = useFormContext();

    return (
        <div className={classNames("p-field col-12 md:col-6", className)} style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="flex align-items-center" style={{ display: "flex", alignItems: "center", minHeight: "38px" }}>
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            inputId={name}
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.checked)}
                            disabled={disabled}
                            style={{ marginRight: "0.5rem" }}
                        />
                    )}
                />
                <label htmlFor={name} className="Label__Text" style={{ cursor: "pointer", fontWeight: 500 }}>
                    {label}
                </label>
            </div>
            {description && (
                <small className="p-text-secondary" style={{ display: "block", marginTop: "0.25rem", paddingLeft: "1.75rem" }}>
                    {description}
                </small>
            )}
        </div>
    );
};
