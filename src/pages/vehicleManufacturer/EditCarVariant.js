import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { handleGetRequest } from "../../services/GetTemplate";
import { useParams } from "react-router-dom";

function EditCarVariant() {
    const [image, setImage] = useState();
    const [url, setUrl] = useState();
    const { id } = useParams();

    const breadItems = [{ label: "Home" }, { label: "Car Brands" }];
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const handledClicked = () => {
        return null;
    };

    const makecall = async (image) => {
        const result = await handleGetRequest(`/getImage?image=${image}`);
        return result?.data?.url;
    };

    const getData = async () => {
        const result = await handleGetRequest(`/vehicle/${id}`);
    };
    useEffect(() => {
        getData();
    }, []);
    const values = [
        {
            label: "New",
            values: "New",
        },
        {
            label: "Old",
            values: "Old",
        },
    ];
    const formik = useFormik({
        initialValues: {
            name: "",
            createdOn: "",
            createdBy: "",
            state: "",
            manufacturer: "",
        },

        onSubmit: async (data) => {
            console.log(data);
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };
    return (
        <>
            <div className="customer_header__">
                <div className="left___">
                    <h2>Mercedes- S500</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>

                <div className="Top__Btn">
                    <Button label="Edit Modal" iconPos="right" onClick={handledClicked} className="Btn__Dark" style={{ height: "40px" }} />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledClicked} className="Btn__DarkDelete" style={{ width: "240px" }} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe4urDLOvXZ4vt6tMghlzqrsf-pyHsj8yGhrb-dgTvX2SiUfBonWjOKr0j716CLao-5DI&usqp=CAU" />
                    <div className="id_section">
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <p>ID:</p>
                            <p>&nbsp;6681</p>
                        </div>
                        <div>
                            <Button label="Active" className="green_btn"></Button>
                        </div>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div>
                                    <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                        Title
                                    </label>
                                    <InputText id="name" name="name" value={formik.values.name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                                    {getFormErrorMessage("name")}
                                </div>

                                <div>
                                    <label htmlFor="createdOn" className={classNames({ "p-error": isFormFieldValid("createdOn") }, "Label__Text")}>
                                        Created On
                                    </label>
                                    <InputText id="createdOn" name="createdOn" value={formik.values.createdOn} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdOn") }, "Input__Round")} />

                                    {getFormErrorMessage("createdOn")}
                                </div>
                                <div>
                                    <label htmlFor="createdBy" className={classNames({ "p-error": isFormFieldValid("createdBy") }, "Label__Text")}>
                                        Created By
                                    </label>
                                    <InputText id="createdBy" name="createdBy" value={formik.values.createdBy} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdBy") }, "Input__Round")} />

                                    {getFormErrorMessage("createdBy")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div>
                                    <label htmlFor="manufacturer" className={classNames({ "p-error": isFormFieldValid("manufacturer") }, "Label__Text")}>
                                        Manufacturer
                                    </label>
                                    <InputText id="manufacturer" name="manufacturer" value={formik.values.manufacturer} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("manufacturer") }, "Input__Round")} />

                                    {getFormErrorMessage("manufacturer")}
                                </div>
                                <div>
                                    <label htmlFor="createdOn" className={classNames({ "p-error": isFormFieldValid("createdOn") }, "Label__Text")}>
                                        Updated On
                                    </label>
                                    <InputText id="createdOn" name="createdOn" value={formik.values.createdOn} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdOn") }, "Input__Round")} />

                                    {getFormErrorMessage("createdOn")}
                                </div>
                                <div>
                                    <label htmlFor="state" className={classNames({ "p-error": isFormFieldValid("state") }, "Label__Text")}>
                                        Change State
                                    </label>
                                    <Dropdown id="state" placeholder="Select State" optionLabel="state" name="state" optionValue="state" options={values} className="Dropdown__Round" />

                                    {getFormErrorMessage("state")}
                                </div>
                            </div>
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" />
                            <Button label="Create" className="Btn__Dark" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditCarVariant;
