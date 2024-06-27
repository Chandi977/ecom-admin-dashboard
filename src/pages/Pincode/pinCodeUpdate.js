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
import { Dropdown } from "primereact/dropdown";
import Dropzone from "react-dropzone";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import { HiCamera } from "react-icons/hi";

function PinCodeUpdate() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [pincode, setPincode] = useState(); // Number
    const [city, setCity] = useState(""); // String
    const [state, setState] = useState(""); // String
    const [oda, setOda] = useState(false); // Boolean
    const [upto10, setUpto10] = useState(); // Number
    const [upto20, setUpto20] = useState(); // Number
    const [upto30, setUpto30] = useState(); // Number
    const [above30, setAbove30] = useState(); // Number
    const [b2cZone, setB2cZone] = useState(""); // String
    const [b2bZone, setB2bZone] = useState(""); // String
    const dispatch = useDispatch();

    // const makecall = async (image) => {
    //     const result = await handleGetRequest(`/getImage?image=${image}`);
    //     return result?.data?.url;
    // };

    const getData = async () => {
        const res = await handleGetRequest(`/pincode/get/${id}`);
        setPincode(res?.data?.pincode);
        setCity(res?.data?.city);
        setState(res?.data?.state);
        setOda(res?.data?.oda);
        setUpto10(res?.data?.upto10);
        setUpto20(res?.data?.upto20);
        setUpto30(res?.data?.upto30);
        setAbove30(res?.data?.above30);
        setB2cZone(res?.data?.b2cZone);
        setB2bZone(res?.data?.b2bZone);
        setManufacturers(res?.data);
    };
    useEffect(() => {
        getData();
    }, []);

    const dropdownOptions = [
        { label: 'True', value: true },
        { label: 'False', value: false }
    ];

    const handleOdaChange = (e) => {
        setOda(e.value); 
    };

    const breadItems = [{ label: "Home" }, { label: "PinCode", url: "/pincode" }];
    const home = { icon: "pi pi-home", url: "/" };

    const formik = useFormik({
        initialValues: {
            pincode: 0,
            city: "",
            state: "",
            oda: false,
            upto10: 0,
            upto20: 0,
            upto30: 0,
            above30: 0,
            b2cZone: "",
            b2bZone: "",
        },

        onSubmit: async (data) => {
            const dat = {
                pincode: pincode,
                city: city,
                state: state,
                oda: oda,
                upto10: upto10,
                upto20: upto20,
                upto30: upto30,
                above30: above30,
                b2cZone: b2cZone,
                b2bZone: b2bZone,
                _id: id,
            };
            const res = await handlePutRequest(dat, "/pincode/update");
            if (res?.success === true) {
                toast.success("PinCode Updated Successfully");
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

    return (
        <>
            <div className="customer_header__">
                <div className="left___">
                    <h2>{manufacturer?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>

            <div className="customer_details_section_coupon">
                {/* <div className="left_section">
                    <img src={url} />
                    <div className="id_section">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <p>ID:</p>
                            <p>&nbsp;{brand_id}</p>
                        </div>
                        <Dropzone onDrop={(acceptedFiles) => handleUpload(acceptedFiles[0])}>
                            {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p style={{ cursor: "pointer", fontSize: "25px" }}>
                                        <HiCamera />
                                    </p>
                                </div>
                            )}
                        </Dropzone>
                    </div>
                </div> */}

                <div className="right_section">
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px", fontWeight: "600" }}>
                        {pincode} - {city} , {state}
                    </div>

                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="pincode" className={classNames({ "p-error": isFormFieldValid("pincode") }, "Label__Text")}>
                                        Pincode
                                    </label>
                                    <InputText id="width" name="title" value={pincode} onChange={(e) => setPincode(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("pincode") }, "Input__Round")} />

                                    {getFormErrorMessage("pincode")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="city" className={classNames({ "p-error": isFormFieldValid("city") }, "Label__Text")}>
                                        City
                                    </label>
                                    <InputText id="city" name="city" value={city} onChange={(e) => setCity(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("city") }, "Input__Round")} />

                                    {getFormErrorMessage("city")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="upto10" className={classNames({ "p-error": isFormFieldValid("upto10") }, "Label__Text")}>
                                        Upto10
                                    </label>
                                    <InputText id="upto10" name="upto10" value={upto10} onChange={(e) => setUpto10(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("upto10") }, "Input__Round")} />

                                    {getFormErrorMessage("upto10")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="upto30" className={classNames({ "p-error": isFormFieldValid("upto30") }, "Label__Text")}>
                                        Upto30
                                    </label>
                                    <InputText id="upto30" name="upto30" value={upto30} onChange={(e) => setUpto30(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("upto30") }, "Input__Round")} />

                                    {getFormErrorMessage("upto30")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="b2cZone" className={classNames({ "p-error": isFormFieldValid("b2cZone") }, "Label__Text")}>
                                        B2C Zone
                                    </label>
                                    <InputText id="b2cZone" name="b2cZone" value={b2cZone} onChange={(e) => setB2cZone(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("b2cZone") }, "Input__Round")} />

                                    {getFormErrorMessage("b2cZone")}
                                </div>
                            </div>

                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="state" className={classNames({ "p-error": isFormFieldValid("state") }, "Label__Text")}>
                                        State
                                    </label>
                                    <InputText id="state" name="state" value={state} onChange={(e) => setState(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("state") }, "Input__Round")} />

                                    {getFormErrorMessage("state")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="oda" className={classNames({ "p-error": isFormFieldValid("oda") }, "Label__Text")}>
                                        ODA
                                    </label>
                                    <Dropdown id="oda" name="oda" value={oda} options={dropdownOptions} onChange={handleOdaChange} placeholder="Select an option" className={classNames({ "p-invalid": isFormFieldValid("oda") }, "Input__Round")} />
                                    {getFormErrorMessage("oda")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="upto20" className={classNames({ "p-error": isFormFieldValid("upto20") }, "Label__Text")}>
                                        Upto20
                                    </label>
                                    <InputText id="upto20" name="upto20" value={upto20} onChange={(e) => setUpto20(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("upto20") }, "Input__Round")} />

                                    {getFormErrorMessage("upto20")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="above30" className={classNames({ "p-error": isFormFieldValid("above30") }, "Label__Text")}>
                                        Above30
                                    </label>
                                    <InputText id="above30" name="above30" value={above30} onChange={(e) => setAbove30(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("above30") }, "Input__Round")} />

                                    {getFormErrorMessage("above30")}
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="b2bZone" className={classNames({ "p-error": isFormFieldValid("b2bZone") }, "Label__Text")}>
                                        B2B Zone
                                    </label>
                                    <InputText id="b2bZone" name="b2bZone" value={b2bZone} onChange={(e) => setB2bZone(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("b2Zone") }, "Input__Round")} />

                                    {getFormErrorMessage("b2bZone")}
                                </div>
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

export default PinCodeUpdate;
