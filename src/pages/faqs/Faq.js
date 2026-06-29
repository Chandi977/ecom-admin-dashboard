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

function Faq() {
    const [manufacturer, setManufacturers] = useState();
    const history = useHistory();
    const { id } = useParams();
    const [homepage, setHomePAge] = useState();
    const [faq, setFaq] = useState([]);
    const [width, setWidth] = useState();
    const [profile, setProfile] = useState();
    const [rim_diameter, setRimDimater] = useState();

    const getData = async () => {
        const res = await handleGetRequest(`/getSingleFaq/${id}`);
        setHomePAge(res?.data?.homePage);
        setFaq(res?.data?.faq);
        setWidth(res?.data?.width);
        setProfile(res?.data?.profile);
        setRimDimater(res?.data?.rim_diameter);

        setManufacturers(res?.data);
    };
    useEffect(() => {
        getData();
    }, []);

    const breadItems = [{ label: "Home" }, { label: "Faqs", url: "/faqs" }];
    const home = { icon: "pi pi-home", url: "/" };

    const addFaq = () => {
        setFaq([
            ...faq,
            {
                question: "",
                answer: "",
            },
        ]);
    };

    const handleFaq = (value, names, index) => {
        const temp = faq;
        temp[index][names] = value;
        setFaq(temp);
    };

    const formik = useFormik({
        initialValues: {
            width: "",
            profile: "",
            rim_diameter: "",
            createdAt: "",
        },

        onSubmit: async (data) => {
            const dat = {
                width: width,
                profile: profile,
                rim_diameter: rim_diameter,
                faq: faq,
                homePage: homepage === "true" ? true : false,
                id: id,
            };
            const res = await handlePutRequest(dat, "/editFaq");
            if (res?.success === true) {
                toast.success("deal edited");
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
            <div className="customer_details_section">
                <div className="left_section">
                    <img src="" />
                    <div className="id_section">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <p>ID:</p>
                            <p>&nbsp;{id}</p>
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
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="width" className={classNames({ "p-error": isFormFieldValid("width") }, "Label__Text")}>
                                        Tyre width
                                    </label>
                                    <InputText id="width" name="title" value={width} onChange={(e) => setWidth(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("width") }, "Input__Round")} />

                                    {getFormErrorMessage("width")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="profile" className={classNames({ "p-error": isFormFieldValid("profile") }, "Label__Text")}>
                                        Tyre profile
                                    </label>
                                    <InputText id="profile" name="title" value={profile} onChange={(e) => setProfile(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("profile") }, "Input__Round")} />

                                    {getFormErrorMessage("profile")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Created At
                                    </label>
                                    <InputText id="createdAt" disabled={true} name="createdAt" value={formik.values.createdAt} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdAt") }, "Input__Round")} />

                                    {getFormErrorMessage("createdAt")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="rim_diameter" className={classNames({ "p-error": isFormFieldValid("rim_diameter") }, "Label__Text")}>
                                        Rim diameter
                                    </label>
                                    <InputText id="rim_diameter" name="title" value={rim_diameter} onChange={(e) => setRimDimater(e.target.value)} className={classNames({ "p-invalid": isFormFieldValid("rim_diameter") }, "Input__Round")} />

                                    {getFormErrorMessage("rim_diameter")}
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <label htmlFor="createdAt" className={classNames({ "p-error": isFormFieldValid("createdAt") }, "Label__Text")}>
                                        Tyre
                                    </label>
                                    <select value={homepage} onChange={(e) => setHomePAge(e.target.value)} className="select__">
                                        <option selected disabled>
                                            select visibility
                                        </option>
                                        <option value={true}>Yes</option>
                                        <option value={false}>No</option>
                                    </select>
                                    {getFormErrorMessage("createdAt")}
                                </div>
                            </div>
                        </div>
                        <div className="p-field col-12 md:col-12">
                            <div className="p-field">
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <label htmlFor="description" className={classNames({ "p-error": isFormFieldValid("description") }, "Label__Text")}>
                                        Faq
                                    </label>
                                    <Button label="Add Faq" style={{ width: "100px", height: "35px" }} onClick={() => addFaq()} type="button"></Button>
                                </div>
                                {faq?.map((fa, index) => {
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
                                            <InputText id="question" name="question" defaultValue={fa?.question} placeholder="question" onChange={(e) => handleFaq(e.target.value, "question", index)} className={classNames("Input__Round")} />
                                            <InputText id="answer" name="answer" defaultValue={fa?.answer} placeholder="answer" onChange={(e) => handleFaq(e.target.value, "answer", index)} className={classNames("Input__Round")} />
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

export default Faq;
