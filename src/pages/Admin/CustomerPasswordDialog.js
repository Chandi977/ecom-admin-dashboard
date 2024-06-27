import React from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { toast } from "react-toastify";

const CustomerPasswordDialog = ({ onHideCustomerPasswordDialog, user }) => {
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: "",
        },

        onSubmit: async (data) => {
            if (data?.newPassword !== data?.confirmPassword) {
                toast.warning("password and confirm passsword must match");
            } else {
                const dat = {
                    id: user,
                    password: data?.newPassword,
                };
                const result = dispatch(handlePostRequest(dat, "/adminPass", true, true));
                toast.success("password edited");
                onHideCustomerPasswordDialog();
            }
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
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="newPassword" className={classNames({ "p-error": isFormFieldValid("newPassword") }, "Label__Text")}>
                                New Password
                            </label>
                            <InputText id="newPassword" name="newPassword" value={formik.values.newPassword} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("newPassword") }, "Input__Round")} />

                            {getFormErrorMessage("newPassword")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="confirmPassword" className={classNames({ "p-error": isFormFieldValid("confirmPassword") }, "Label__Text")}>
                                Confirm Password
                            </label>
                            <InputText id="confirmPassword" name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("confirmPassword") }, "Input__Round")} />

                            {getFormErrorMessage("confirmPassword")}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideCustomerPasswordDialog()} type="button" />
                    <Button label="Change" className="Btn__Dark" />
                </div>
            </form>
        </>
    );
};

export default CustomerPasswordDialog;
