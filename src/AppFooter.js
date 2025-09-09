import React from "react";
import styles from "./styles/main.css";

export const AppFooter = (props) => {
    return (
        <div className="layout-footer">
            {/* <img src={props.layoutColorMode === 'light' ? 'assets/layout/images/logo-dark.svg' : 'assets/layout/images/logo-white.svg'} alt="Logo" height="20" className="mr-2" />
            by
            <span className="font-medium ml-2">PrimeReact</span> */}
            <p>
                ©2025 <span style={{ color: "#E92227" }}>Prem Industries India Limited</span> | All Rights Reserved
            </p>
            {/* <div className="footer_links">
                <p>
                    <a href="https://prempackaging.com/about-us" style={{ textDecoration: "none", color: "black" }}>
                        About
                    </a>{" "}
                </p>
                <p>
                    <a href="https://store.prempackaging.com/" style={{ textDecoration: "none", color: "black" }}>
                        Support
                    </a>{" "}
                </p>
                <p>
                    <a href="https://prempackaging.com/contact-us" style={{ textDecoration: "none", color: "black" }}>
                        Contact
                    </a>{" "}
                </p>
            </div> */}
        </div>
    );
};
