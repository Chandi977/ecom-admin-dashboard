import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "primereact/button";
import { useDispatch } from "react-redux";
import "./login.scss";
import classNames from "classnames";
import * as Yup from "yup";
import { useFormik } from "formik";
import { handlePostRequest } from "../../services/PostTemplate";
import { AuthSlice } from "../../redux/authSlice";
import Axios from "axios";

function Login() {
    const [ip, setIP] = useState("");

    //creating function to load ip address from the API
    const getData = async () => {
        const res = await Axios.get("https://geolocation-db.com/json/");
        console.log(res.data);
        setIP(res.data.IPv4);
    };

    useEffect(() => {
        getData();
    }, []);
    const [loading, setloading] = useState(false);
    const [loadingIcon, setloadingIcon] = useState("");
    const dispatch = useDispatch();

    let history = useHistory();

    const validationSchema = Yup.object().shape({
        email_address: Yup.string().required("This field is required."),
        password: Yup.string().required("This field is required."),
    });
    const formik = useFormik({
        validationSchema: validationSchema,
        initialValues: {
            email_address: "",
            password: "",
        },
        onSubmit: async (data) => {
            const res = await dispatch(handlePostRequest(data, "/signin", true, true));
            const userData = res?.data;
            if (res?.data?.user) {
                const dat = {
                    userIp: ip,
                    userAgent: window.navigator.userAgent,
                    type: "web",
                };
                console.log(dat);
                const rest = await dispatch(handlePostRequest(dat, "/addlog"));
                history.push("/");
                window.location.reload();
                dispatch(AuthSlice(userData));
            }
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };
    return (
        <div className="login_body">
            <div align="center" style={{ marginTop: "4%", marginBottom: "1%" }}>
                <h3 style={{ color: "#004890", fontWeight: "bold", textTransform: "uppercase" }}>Prem Industries</h3>
            </div>
            <div className="container" id="container">
                <div className="form-container sign-in-container">
                    <form action="#" className="login_form" onSubmit={formik.handleSubmit}>
                        <div className="p-mb-4">
                            <h1 className="login_h1">Login</h1>
                        </div>
                        <div className="p-mt-4">
                            <input id="email_address" className={classNames({ "p-invalid": isFormFieldValid("email_address") }, "login_input")} name="email_address" value={formik.values.email_address} placeholder="Enter email_address ID" onChange={formik.handleChange} type="text" />
                            {getFormErrorMessage("email_address")}

                            <input className={classNames({ "p-invalid": isFormFieldValid("password") }, "login_input")} name="password" placeholder="Enter Password" value={formik.values.password} onChange={formik.handleChange} type="password" />
                            {getFormErrorMessage("password")}

                            <div className="p-mt-2">
                                <Button className="login_button" label="Login" icon={loadingIcon || ""} iconPos="right" disabled={loading} />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-right">
                            <h1 className="login_h1">Welcome!</h1>
                            <p className="login_p">Please login to access Copart</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
