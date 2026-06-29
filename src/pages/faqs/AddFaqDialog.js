import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";
import moment from "moment";

function AddFaqDialog(onHideFaq, onsuccess) {
    const [loading, setLoading] = useState();
    const [type, setType] = useState();
    const [faq, setFaq] = useState([]);
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            width: "",
            profile: "",
            rim_diameter: "",
            id: "",
        },

        onSubmit: async (data) => {
            setLoading(true);
            const dat = {
                width: data?.width,
                profile: data?.profile,
                rim_diameter: data?.rim_diameter,
                id: data?.id,
                faq: faq,
                homePage: type === "true" ? true : false,
            };
            // console.log(dat);
            const res = await dispatch(handlePostRequest(dat, "/addfaq", true, true));

            onsuccess();
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };
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

    const handleCancel = (e) => {
        e.preventDefault();
        onHideFaq();
    };
    return (
        <>
            <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="id" className={classNames({ "p-error": isFormFieldValid("id") }, "Label__Text")}>
                                Faq ID
                            </label>
                            <InputText placeholder="3342" id="id" name="id" value={formik.values.id} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("id") }, "Input__Round")} />

                            {getFormErrorMessage("id")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="width" className={classNames({ "p-error": isFormFieldValid("width") }, "Label__Text")}>
                                Tyre Width
                            </label>
                            <InputText placeholder="145" id="width" name="width" value={formik.values.width} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("width") }, "Input__Round")} />

                            {getFormErrorMessage("width")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="profile" className={classNames({ "p-error": isFormFieldValid("profile") }, "Label__Text")}>
                                Tyre Profile
                            </label>
                            <InputText placeholder="20" id="profile" name="profile" value={formik.values.profile} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("profile") }, "Input__Round")} />

                            {getFormErrorMessage("profile")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="rim_diameter" className={classNames({ "p-error": isFormFieldValid("rim_diameter") }, "Label__Text")}>
                                Rim Diameter
                            </label>
                            <InputText placeholder="12" id="rim_diameter" name="rim_diameter" value={formik.values.rim_diameter} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("rim_diameter") }, "Input__Round")} />

                            {getFormErrorMessage("rim_diameter")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field">
                            <label htmlFor="title" className={classNames({ "p-error": isFormFieldValid("title") }, "Label__Text")}>
                                Show on homepage
                            </label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="select__">
                                <option selected disabled>
                                    select visibility
                                </option>
                                <option value={true}>Yes</option>
                                <option value={false}>No</option>
                            </select>

                            {getFormErrorMessage("title")}
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
                                        <InputText id="question" name="question" placeholder="question" onChange={(e) => handleFaq(e.target.value, "question", index)} className={classNames("Input__Round")} />
                                        <InputText id="answer" name="answer" placeholder="answer" onChange={(e) => handleFaq(e.target.value, "answer", index)} className={classNames("Input__Round")} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Create" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AddFaqDialog;
