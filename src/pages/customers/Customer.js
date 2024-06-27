import React, { useState, useRef, useEffect } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import CustomerPasswordDialog from "../Admin/CustomerPasswordDialog";
import { Dialog } from "primereact/dialog";
import CustomerDialog from "../Admin/CustomerDialog";
import { useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { toast } from "react-toastify";

function Customer() {
    const dispatch = useDispatch();
    const [showDialog, setShowDialog] = useState(false);
    const [passwordDaialog, setPasswordDialog] = useState(false);
    const [user, setUser] = useState();
    const { id } = useParams();
    const [editable, setEditable] = useState(false);

    const getData = async (id) => {
        const result = await handleGetRequest(`/getuser/${id}`);
        setUser(result?.data);
    };

    useEffect(() => {
        getData(id);
    }, [id]);

    const breadItems = [{ label: "Home" }, { label: "Customers" }];
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const formik = useFormik({
        initialValues: {
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            email: user?.email_address ?? "",
            contactNo: user?.mobile_number ?? "",
            role: user?.role ?? "",
            createdOn: moment(user?.createdAt).format("DD/MM/YYYY") ?? "",
        },

        onSubmit: async (data) => {
            const dat = {
                first_name: data?.first_name,
                last_name: data?.last_name,
                email_address: data?.email_address,
                mobile_number: data?.contactNo,
                role: data?.role,
                id: user?._id,
            };
            const result = dispatch(handlePostRequest(dat, "/edituser", true, true));
            toast.success("user edited");
            getData(user?._id);
        },
        enableReinitialize: true,
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const onHideCustomerPasswordDialog = () => {
        setPasswordDialog(false);
    };

    const onHideCustomerDialog = () => {
        setShowDialog(false);
    };

    return (
        <>
            <Dialog visible={passwordDaialog} header="Customer-Change Password" style={{ width: "450px" }} onHide={() => setPasswordDialog(false)}>
                <CustomerPasswordDialog onHideCustomerPasswordDialog={onHideCustomerPasswordDialog} user={user?._id} />
            </Dialog>

            <Dialog visible={showDialog} header="Add Customer" style={{ width: "750px" }} onHide={() => setShowDialog(false)}>
                <CustomerDialog onHideCustomerDialog={onHideCustomerDialog} />
            </Dialog>

            <div className="customer_header__">
                <div className="left___">
                    <h2>
                        {user?.first_name} {user?.last_name}
                    </h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="middle__">
                    <Button label="Change Password" className="grey__button" onClick={() => setPasswordDialog(true)} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe4urDLOvXZ4vt6tMghlzqrsf-pyHsj8yGhrb-dgTvX2SiUfBonWjOKr0j716CLao-5DI&usqp=CAU" />
                    <div className="id_section">
                        <div>
                            <p>User ID</p>
                            <p>{user?._id?.substring(1, 5)}</p>
                        </div>
                        <div>
                            <Button label="Active" className="green_btn" />
                        </div>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div>
                                    <label htmlFor="first_name" className={classNames({ "p-error": isFormFieldValid("first_name") }, "Label__Text")}>
                                        First Name
                                    </label>
                                    <InputText id="first_name" name="first_name" value={formik.values.first_name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("first_name") }, "Input__Round")} />

                                    {getFormErrorMessage("first_name")}
                                </div>
                                <div>
                                    <label htmlFor="email" className={classNames({ "p-error": isFormFieldValid("email") }, "Label__Text")}>
                                        Email
                                    </label>
                                    <InputText id="email" name="email" value={formik.values.email} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("email") }, "Input__Round")} />

                                    {getFormErrorMessage("email")}
                                </div>
                                <div>
                                    <label htmlFor="contactNo" className={classNames({ "p-error": isFormFieldValid("contactNo") }, "Label__Text")}>
                                        Contact No.
                                    </label>
                                    <InputText id="contactNo" name="contactNo" value={formik.values.contactNo} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("contactNo") }, "Input__Round")} />

                                    {getFormErrorMessage("contactNo")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div>
                                    <label htmlFor="last_name" className={classNames({ "p-error": isFormFieldValid("last_name") }, "Label__Text")}>
                                        Last Name
                                    </label>
                                    <InputText id="name" name="name" value={formik.values.last_name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("last_name") }, "Input__Round")} />

                                    {getFormErrorMessage("last_name")}
                                </div>
                                <div>
                                    <label htmlFor="createdOn" className={classNames({ "p-error": isFormFieldValid("createdOn") }, "Label__Text")}>
                                        Created On
                                    </label>
                                    <InputText id="createdOn" name="createdOn" value={formik.values.createdOn} disabled={true} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdOn") }, "Input__Round")} />

                                    {getFormErrorMessage("createdOn")}
                                </div>
                                <div>
                                    <label htmlFor="role" className={classNames({ "p-error": isFormFieldValid("role") }, "Label__Text")}>
                                        Role
                                    </label>
                                    <InputText id="role" name="role" value={formik.values.role} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("role") }, "Input__Round")} />

                                    {getFormErrorMessage("role")}
                                </div>
                            </div>
                        </div>
                        <div className="Down__Btn">
                            <Button label="Edit" className="Btn__Dark" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Customer;
