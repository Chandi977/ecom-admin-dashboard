import React, { useState } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText  } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "../../services/PostTemplate";

// pincode,
//     city,
//     oda,
//     upto10,
//     upto20,
//     upto30,
//     above30,
//     b2cZone,
//     b2bZone,

function AddPincodeDialog({ onsuccess }) {
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();
    

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
            setLoading(true);
            const dat = {
                pincode: parseInt(data.pincode),
                city: data.city,
                state: data.state,
                oda: data.oda,
                upto10: parseInt(data.upto10),
                upto20: parseInt(data.upto20),
                upto30: parseInt(data.upto30),
                above30: parseInt(data.above30),
                b2cZone: data.b2cZone,
                b2bZone: data.b2bZone,
            };
            const res = await dispatch(handlePostRequest(dat, "/freight/create", true, true));
            onsuccess();
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
                            <label htmlFor="pincode" className={classNames({ "p-error": isFormFieldValid("pincode") }, "Label__Text")}>
                                Pincode
                            </label>
                            <InputText placeholder="400001" id="pincode" name="pincode" value={formik.values.pincode} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("pincode") }, "Input__Round")} />

                            {getFormErrorMessage("pincode")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:12">
                        <div className="p-field">
                            <label htmlFor="state" className={classNames({ "p-error": isFormFieldValid("state") }, "Label__Text")}>
                                State
                            </label>
                            <InputText placeholder="Maharashtra" id="state" name="state" value={formik.values.state} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("state") }, "Input__Round")} />

                            {getFormErrorMessage("state")}
                        </div>
                    </div>
                    <div className="p-field col-12 md:12">
                        <div className="p-field">
                            <label htmlFor="city" className={classNames({ "p-error": isFormFieldValid("city") }, "Label__Text")}>
                                City
                            </label>
                            <InputText placeholder="Mumbai" id="city" name="city" value={formik.values.city} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("city") }, "Input__Round")} />

                            {getFormErrorMessage("city")}
                        </div>
                    </div>
                    
                    <div className="p-field col-12 md-12">
                        <div className="p-field">
                            <label htmlFor="upto10" className={classNames({ "p-error": isFormFieldValid("upto10") }, "Label__Text")}>
                                Up to 10
                            </label>
                            <InputText placeholder="0" id="upto10" name="upto10" value={formik.values.upto10} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("upto10") }, "Input__Round")} />

                            {getFormErrorMessage("upto10")}
                        </div>
                    </div>
                    <div className="p-field col-12 md-12">
                        <div className="p-field">
                            <label htmlFor="upto20" className={classNames({ "p-error": isFormFieldValid("upto20") }, "Label__Text")}>
                                Up to 20
                            </label>
                            <InputText placeholder="0" id="upto20" name="upto20" value={formik.values.upto20} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("upto20") }, "Input__Round")} />

                            {getFormErrorMessage("upto20")}
                        </div>
                    </div>
                    <div className="p-field col-12 md-12">
                        <div className="p-field">
                            <label htmlFor="upto30" className={classNames({ "p-error": isFormFieldValid("upto30") }, "Label__Text")}>
                                Up to 30
                            </label>
                            <InputText placeholder="0" id="upto30" name="upto30" value={formik.values.upto30} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("upto30") }, "Input__Round")} />

                            {getFormErrorMessage("upto30")}
                        </div>
                    </div>
                    <div className="p-field col-12 md-12">
                        <div className="p-field">
                            <label htmlFor="above30" className={classNames({ "p-error": isFormFieldValid("above30") }, "Label__Text")}>
                                Above 30
                            </label>
                            <InputText placeholder="0" id="above30" name="above30" value={formik.values.above30} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("above30") }, "Input__Round")} />

                            {getFormErrorMessage("above30")}
                        </div>
                    </div>
                    <div className="p-field col-12 md-12">
                        <div className="p-field">
                            <label htmlFor="b2cZone" className={classNames({ "p-error": isFormFieldValid("b2cZone") }, "Label__Text")}>
                                B2C Zone
                            </label>
                            <InputText placeholder="Zone A" id="b2cZone" name="b2cZone" value={formik.values.b2cZone} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("b2cZone") }, "Input__Round")} />

                            {getFormErrorMessage("b2cZone")}
                        </div>
                    </div>
                    <div className="p-field col-12 md-12">
                        <div className="p-field">
                            <label htmlFor="b2bZone" className={classNames({ "p-error": isFormFieldValid("b2bZone") }, "Label__Text")}>
                                B2B Zone
                            </label>
                            <br/>
                            <InputText style={{marginTop:"10px"}} placeholder="Zone X" id="b2bZone" name="b2bZone" value={formik.values.b2bZone} onChange={formik.handleChange} required className={classNames({ "p-invalid": isFormFieldValid("b2bZone") }, "Input__Round")} />

                            {getFormErrorMessage("b2bZone")}
                        </div>
                    </div>

                    <div className="p-field col-12 md:6">
                        <div className="p-field">
                            <label htmlFor="oda" className="Label__Text">
                                ODA
                            </label>
                            <InputSwitch id="oda" name="oda" checked={formik.values.oda} onChange={formik.handleChange} className="p-inputswitch-sm" />

                            {/* No error message for boolean fields */}
                        </div>
                    </div>

                </div>
                <div className="Down__Btn">
                    <Button label="Create Brand" className="Btn__Dark" type="submit" />
                </div>
            </form>
        </>
    );
}

export default AddPincodeDialog;
