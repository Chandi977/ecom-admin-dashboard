import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const CustomerDialog = ({ onHideCustomerDialog, handlesuccess }) => {
    const [role, setRole] = useState();
    const [department, setDepartment] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            email_address: "",
            mobile_number: "",
            password: "",
            confirmPassword: "",
            role: "",
            user_id: "",
            department: "",
        },

        onSubmit: async (data) => {
            data.role = role;
            data.department = department;
            const res = dispatch(handlePostRequest(data, "/signup", true, true));
            handlesuccess();
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="user_id" className={classNames({ "p-error": isFormFieldValid("user_id") }, "Label__Text")}>
                                User ID
                            </label>
                            <InputText placeholder="PI-0102" id="user_id" name="user_id" value={formik.values.user_id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("user_id") }, "Input__Round")} />

                            {getFormErrorMessage("user_id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="first_name" className={classNames({ "p-error": isFormFieldValid("first_name") }, "Label__Text")}>
                                First Name
                            </label>
                            <InputText placeholder="John" id="first_name" name="first_name" required value={formik.values.first_name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("first_name") }, "Input__Round")} />

                            {getFormErrorMessage("first_name")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="last_name" className={classNames({ "p-error": isFormFieldValid("last_name") }, "Label__Text")}>
                                Last Name
                            </label>
                            <InputText placeholder="Doe" id="last_name" name="last_name" value={formik.values.last_name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("last_name") }, "Input__Round")} />

                            {getFormErrorMessage("last_name")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="email_address" className={classNames({ "p-error": isFormFieldValid("email_address") }, "Label__Text")}>
                                Email
                            </label>
                            <InputText placeholder="johndoe@gmail.com" type="email" id="email_address" name="email_address" value={formik.values.email_address} required onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("email_address") }, "Input__Round")} />

                            {getFormErrorMessage("email_address")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="mobile_number" className={classNames({ "p-error": isFormFieldValid("mobile_number") }, "Label__Text")}>
                                Contact No
                            </label>
                            <InputText
                                placeholder="9874563210"
                                maxLength={10}
                                minLength={10}
                                pattern="[0-9]*"
                                id="mobile_number"
                                name="mobile_number"
                                required
                                value={formik.values.mobile_number}
                                onChange={(e) => {
                                    const input = e.target.value;
                                    const numericInput = input.replace(/\D/g, ""); // Replace non-numeric characters with an empty string
                                    formik.handleChange({
                                        target: {
                                            name: "mobile_number",
                                            value: numericInput.slice(0, 10), // Limit the input to 10 characters
                                        },
                                    });
                                }}
                                className={classNames({ "p-invalid": isFormFieldValid("mobile_number") }, "Input__Round")}
                            />

                            {getFormErrorMessage("mobile_number")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field">
                            <label htmlFor="password" className={classNames({ "p-error": isFormFieldValid("password") }, "Label__Text")}>
                                Password
                            </label>
                            <InputText placeholder="......" type={showPassword ? "text" : "password"} id="password" name="password" required value={formik.values.password} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("password") }, "Input__Round")} />
                            <div style={{ cursor: "pointer" }}>
                                <i
                                    style={{
                                        position: "absolute",
                                        marginLeft: "320px",
                                        marginTop: "-24px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {showPassword ? <AiFillEye onClick={() => setShowPassword(!showPassword)} /> : <AiFillEyeInvisible onClick={() => setShowPassword(!showPassword)} />}
                                </i>
                            </div>
                            {getFormErrorMessage("password")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field" >
                            <label htmlFor="confirmPassword" className={classNames({ "p-error": isFormFieldValid("confirmPassword") }, "Label__Text")}>
                                Confirm Password
                            </label>
                            <InputText placeholder="......" type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" required value={formik.values.confirmPassword} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("confirmPassword") }, "Input__Round")} />
                            <div style={{ cursor: "pointer" }}>
                                <i
                                    style={{
                                        position: "absolute",
                                        marginLeft: "320px",
                                        marginTop: "-24px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {showPassword ? <AiFillEye onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : <AiFillEyeInvisible onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
                                </i>
                            </div>
                            {getFormErrorMessage("confirmPassword")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-6">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="icon" className={classNames("Label__Text")}>
                                Role
                            </label>
                            <select style={{ height: "35px", border: "1px solid #cecece", borderRadius: "5px" }} required onChange={(e) => setRole(e.target.value)}>
                                <option selected disabled>
                                    Please select role
                                </option>
                                <option value="admin">Admin</option>
                                <option value="digital marketing">Digital Marketing</option>
                                <option value="manager">Manager</option>
                                <option value="calling">Calling</option>
                            </select>
                        </div>
                    </div>
                    {/* <div className="p-field col-12 md:col-6">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="icon" className={classNames("Label__Text")}>
                                Department
                            </label>
                            <select style={{ height: "35px", border: "1px solid #cecece", borderRadius: "5px" }} onChange={(e) => setDepartment(e.target.value)}>
                                <option selected disabled>
                                    Please select department
                                </option>
                                <option value="marketing department">Marketing</option>
                                <option value="sales department">Sales</option>
                            </select>
                        </div>
                    </div> */}
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideCustomerDialog()} type="button" />
                    <Button label="Create" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default CustomerDialog;
