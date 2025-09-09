import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Route, useLocation } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

import { AppTopbar } from "./AppTopbar";
import { AppFooter } from "./AppFooter";
import { AppMenu } from "./AppMenu";
import { AppConfig } from "./AppConfig";
// import Login from "./pages/login/Login";

import PrimeReact from "primereact/api";
import { Tooltip } from "primereact/tooltip";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay";

import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "./assets/demo/flags/flags.css";
import "./assets/demo/Demos.scss";
import "./assets/layout/layout.scss";
import "./App.scss";
import Customers from "./pages/customers/Customers";
import Dashboard from "./components/Dashboard";
import Manage from "./pages/manage/Manage";
import Logs from "./pages/logs/Logs";
import Notices from "./pages/notices/Notices";
import LoginHistory from "./pages/loginHistory/LoginHistory";
import StaticPages from "./pages/staticPages/StaticPages";
import Features from "./pages/features/Features";
import Customer from "./pages/customers/Customer";
import Enquirey from "./pages/enquirey/Enquirey";
import EnquireyDetails from "./pages/enquirey/EnquireyDetails";
import Orders from "./pages/orders/Orders";
import OrderDetail from "./pages/orders/OrderDetail";
import Pagedata from "./pages/staticPages/Pagedata";
import Login from "./pages/auth/Login";
import Feature from "./pages/features/Feature";
import Warranty from "./pages/staticPages/AllStaticPages/warranty/Warranty";
import { useHistory } from "react-router-dom";
import Brands from "./pages/brands/Brands";
import Brand from "./pages/brands/Brand";
import Categories from "./pages/categories/Categories";
import Category from "./pages/categories/Category";
import SubCategories from "./pages/subCategories/SubCategories";
import SubCategory from "./pages/subCategories/SubCategory";
import Products from "./pages/products/Products";
import Product from "./pages/products/Product";
import Deals from "./pages/deals/Deals";
import Deal from "./pages/deals/Deal";
import CustomPackaging from "./pages/custom-packaging/customPackaging";
import CustomersData from "./pages/customer-query/customer";
import ContactData from "./pages/mainWebsiteContact/contact";
import NotifyData from "./pages/Notify/notify";
import AllAdmin from "./pages/Admin/adminTable";
import PinCodes from "./pages/Pincode/pincode";
import PinCodeUpdate from "./pages/Pincode/pinCodeUpdate";
import Coupons from "./pages/Coupon/coupon";
import CouponUpdate from "./pages/Coupon/CouonUpdate";

const App = () => {
    const naviagte = useHistory();
    const [layoutMode, setLayoutMode] = useState("static");
    const [layoutColorMode, setLayoutColorMode] = useState("light");
    const [inputStyle, setInputStyle] = useState("outlined");
    const [ripple, setRipple] = useState(true);
    const [staticMenuInactive, setStaticMenuInactive] = useState(false);
    const [overlayMenuActive, setOverlayMenuActive] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false);
    const copyTooltipRef = useRef();
    const location = useLocation();
    const [role, setRole] = useState();
    require("dotenv").config();
    PrimeReact.ripple = true;
    let key = localStorage.getItem("token");
    let menuClick = false;
    let mobileTopbarMenuClick = false;

    useEffect(() => {
        if (mobileMenuActive) {
            addClass(document.body, "body-overflow-hidden");
        } else {
            removeClass(document.body, "body-overflow-hidden");
        }
    }, [mobileMenuActive]);

    useEffect(() => {
        let token = localStorage.getItem("token");
        if (!token) {
            naviagte.push("/auth");
        }
    }, []);

    useEffect(() => {
        copyTooltipRef && copyTooltipRef.current && copyTooltipRef.current.updateTargetEvents();
    }, [location]);

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    };

    const onRipple = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    };

    const onLayoutModeChange = (mode) => {
        setLayoutMode(mode);
    };

    const onColorModeChange = (mode) => {
        setLayoutColorMode(mode);
    };

    const onWrapperClick = (event) => {
        if (!menuClick) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }

        if (!mobileTopbarMenuClick) {
            setMobileTopbarMenuActive(false);
        }

        mobileTopbarMenuClick = false;
        menuClick = false;
    };

    const onToggleMenuClick = (event) => {
        menuClick = true;

        if (isDesktop()) {
            if (layoutMode === "overlay") {
                if (mobileMenuActive === true) {
                    setOverlayMenuActive(true);
                }

                setOverlayMenuActive((prevState) => !prevState);
                setMobileMenuActive(false);
            } else if (layoutMode === "static") {
                setStaticMenuInactive((prevState) => !prevState);
            }
        } else {
            setMobileMenuActive((prevState) => !prevState);
        }

        event.preventDefault();
    };

    const onSidebarClick = () => {
        menuClick = true;
    };

    const onMobileTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        setMobileTopbarMenuActive((prevState) => !prevState);
        event.preventDefault();
    };

    const onMobileSubTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        event.preventDefault();
    };

    const onMenuItemClick = (event) => {
        if (!event.item.items) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }
    };
    const isDesktop = () => {
        return window.innerWidth >= 992;
    };

    const addClass = (element, className) => {
        if (element.classList) element.classList.add(className);
        else element.className += " " + className;
    };

    const removeClass = (element, className) => {
        if (element.classList) element.classList.remove(className);
        else element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };

    const wrapperClass = classNames("layout-wrapper", {
        "layout-overlay": layoutMode === "overlay",
        "layout-static": layoutMode === "static",
        "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
        "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
        "layout-mobile-sidebar-active": mobileMenuActive,
        "p-input-filled": inputStyle === "filled",
        "p-ripple-disabled": ripple === false,
        "layout-theme-light": layoutColorMode === "light",
    });

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    const getCustomer = () => {
        if (role == "manager" || role === "admin") {
            return [{ label: "Users", icon: "pi pi-users", to: "/customers" }];
        }
    };

    const getAdmin = () => {
        if (role === "manager" || role === "admin") {
            return [{ label: "Admin", icon: "pi pi-user", to: "/admin" }];
        }
    };

    const getFaq = () => {
        if (role === "admin" || role === "digital marketing") {
            return [{ label: "Brands", icon: "pi pi-question", to: "/brands" }];
        }
    };

    const getManage = () => {
        if (role === "admin" || role === "digital marketing") {
            return [{ label: "Category", icon: "pi pi-list", to: "/categories" }];
        }
    };

    const getFeatures = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "SubCategory", icon: "pi pi-server", to: "/subcategories" }];
        }
    };
    const getEnquiry = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "Product", icon: "pi pi-box", to: "/products" }];
        }
    };
    const getCustomerDeatil = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "Customers Query", icon: "pi pi-envelope", to: "/data/customer" }];
        }
    };

    const getCoupon = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "Coupon", icon: "pi pi-tags", to: "/coupon" }];
        }
    };

    const getContact = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "Contact Form Main Website", icon: "pi pi-phone", to: "/data/contact" }];
        }
    };
    const getCustomPAckagingFormData = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "Custom Packaging", icon: "pi pi-pencil", to: "/custom-packaging" }];
        }
    };

    const getNotify = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "Notify", icon: "pi pi-pencil", to: "/notify" }];
        }
    };

    const getPinCode = () => {
        if (role === "admin" || role === "manager") {
            return [{ label: "Pincodes", icon: "pi pi-map-marker", to: "/pincode" }];
        }
    };

    const menu = [
        {
            ...(role === "admin" && { items: [{ label: "Dashboard", icon: "pi pi-home", to: "/" }] }),
        },
        {
            items: getCustomer(),
        },
        {
            items: getAdmin(),
        },
        {
            items: getFaq(),
        },
        {
            items: getManage(),
        },
        {
            items: getPinCode(),
        },
        {
            items: getFeatures(),
        },
        {
            items: getCoupon(),
        },
        {
            items: getEnquiry(),
        },
        // {
        //     items: getOffers(),
        // },
        {
            items: [{ label: "Orders", icon: "pi pi-shopping-cart", to: "/orders" }],
        },
        {
            items: getCustomerDeatil(),
        },
        {
            items: getCustomPAckagingFormData(),
        },
        {
            items: getContact(),
        },
        {
            items: getNotify(),
        },
    ];

    return (
        <div className={wrapperClass} onClick={onWrapperClick}>
            <ToastContainer />
            <Tooltip ref={copyTooltipRef} target=".block-action-copy" position="bottom" content="Copied to clipboard" event="focus" />

            <>
                {window.location.pathname === "/auth" ? (
                    <Route exact path="/auth" component={Login} />
                ) : (
                    <>
                        <AppTopbar onToggleMenuClick={onToggleMenuClick} layoutColorMode={layoutColorMode} mobileTopbarMenuActive={mobileTopbarMenuActive} onMobileTopbarMenuClick={onMobileTopbarMenuClick} onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick} />
                        <div className="layout-sidebar" onClick={onSidebarClick}>
                            <AppMenu model={menu} onMenuItemClick={onMenuItemClick} layoutColorMode={layoutColorMode} />
                        </div>
                        <div className="layout-main-container" style={{ backgroundColor: "#F6F8FA" }}>
                            <div className="layout-main">
                                {<Route exact path="/customers" component={Customers} />}
                                {<Route exact path="/" component={Dashboard} />}
                                {<Route exact path="/manage" component={Manage} />}
                                {<Route exact path="/logs" component={Logs} />}
                                {<Route exact path="/notices" component={Notices} />}
                                {<Route exact path="/loginhistory" component={LoginHistory} />}
                                {<Route exact path="/pages" component={StaticPages} />}
                                {<Route exact path="/features" component={Features} />}
                                {<Route exact path="/feature/:id" component={Feature} />}
                                {<Route exact path="/customer/:id" component={Customer} />}
                                {<Route exact path="/enquiry" component={Enquirey} />}
                                {<Route exact path="/enquireydetails/:id" component={EnquireyDetails} />}
                                {<Route exact path="/orders" component={Orders} />}
                                {<Route exact path="/orderdetail/:id" component={OrderDetail} />}
                                {<Route exact path="/allStaticPages/:id" component={Pagedata} />}
                                {<Route exact path="/data" component={Warranty} />}
                                {<Route exact path="/privacypolicy" component={Pagedata} />}
                                {<Route exact path="/aboutus" component={Pagedata} />}
                                {<Route exact path="/brands" component={Brands} />}
                                {<Route exact path="/categories" component={Categories} />}
                                {<Route exact path="/subcategories" component={SubCategories} />}
                                {<Route exact path="/products" component={Products} />}
                                {<Route exact path="/deals" component={Deals} />}
                                {<Route exact path="/brand/:id" component={Brand} />}
                                {<Route exact path="/deal/:id" component={Deal} />}
                                {<Route exact path="/category/:id" component={Category} />}
                                {<Route exact path="/subcategory/:id" component={SubCategory} />}
                                {<Route exact path="/product/:id" component={Product} />}
                                {<Route exact path="/custom-packaging" component={CustomPackaging} />}
                                {<Route exact path="/data/customer" component={CustomersData} />}
                                {<Route exact path="/data/contact" component={ContactData} />}
                                {<Route exact path="/notify" component={NotifyData} />}
                                {<Route exact path="/admin" component={AllAdmin} />}
                                {<Route exact path="/pincode" component={PinCodes} />}
                                {<Route exact path="/pincode/:id" component={PinCodeUpdate} />}
                                {<Route exact path="/coupon" component={Coupons} />}
                                {<Route exact path="/coupon/:id" component={CouponUpdate} />}
                            </div>
                            <AppFooter layoutColorMode={layoutColorMode} />
                        </div>
                    </>
                )}
            </>

            <AppConfig rippleEffect={ripple} onRippleEffect={onRipple} inputStyle={inputStyle} onInputStyleChange={onInputStyleChange} layoutMode={layoutMode} onLayoutModeChange={onLayoutModeChange} layoutColorMode={layoutColorMode} onColorModeChange={onColorModeChange} />

            <CSSTransition classNames="layout-mask" timeout={{ enter: 200, exit: 200 }} in={mobileMenuActive} unmountOnExit>
                <div className="layout-mask p-component-overlay"></div>
            </CSSTransition>
        </div>
    );
};

export default App;
