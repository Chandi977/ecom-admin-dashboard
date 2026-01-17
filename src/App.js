import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Route, useLocation } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

import { AppTopbar } from "./AppTopbar";
import { AppFooter } from "./AppFooter";
import { AppMenu } from "./AppMenu";
import { AppConfig } from "./AppConfig";
import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./pages/login/Login";

import PrimeReact from "primereact/api";
import { Tooltip } from "primereact/tooltip";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const history = useHistory();
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
    PrimeReact.ripple = true;
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
            history.push("/auth");
        }
    }, [history]);

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
        if (role === "manager" || role === "admin") {
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
                                {/* Dashboard - Admin only */}
                                <ProtectedRoute exact path="/" component={Dashboard} allowedRoles={["admin"]} />

                                {/* Customer Management - Admin and Manager */}
                                <ProtectedRoute exact path="/customers" component={Customers} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/customer/:id" component={Customer} allowedRoles={["admin", "manager"]} />

                                {/* Admin Management - Admin and Manager */}
                                <ProtectedRoute exact path="/admin" component={AllAdmin} allowedRoles={["admin", "manager"]} />

                                {/* Content Management - Admin and Digital Marketing */}
                                <ProtectedRoute exact path="/brands" component={Brands} allowedRoles={["admin", "digital marketing"]} />
                                <ProtectedRoute exact path="/brand/:id" component={Brand} allowedRoles={["admin", "digital marketing"]} />
                                <ProtectedRoute exact path="/categories" component={Categories} allowedRoles={["admin", "digital marketing"]} />
                                <ProtectedRoute exact path="/category/:id" component={Category} allowedRoles={["admin", "digital marketing"]} />

                                {/* Product Management - Admin and Manager */}
                                <ProtectedRoute exact path="/subcategories" component={SubCategories} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/subcategory/:id" component={SubCategory} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/products" component={Products} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/product/:id" component={Product} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/deals" component={Deals} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/deal/:id" component={Deal} allowedRoles={["admin", "manager"]} />

                                {/* Orders - All authenticated users */}
                                <ProtectedRoute exact path="/orders" component={Orders} allowedRoles={[]} />
                                <ProtectedRoute exact path="/orderdetail/:id" component={OrderDetail} allowedRoles={[]} />

                                {/* Customer Data & Queries - Admin and Manager */}
                                <ProtectedRoute exact path="/data/customer" component={CustomersData} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/data/contact" component={ContactData} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/custom-packaging" component={CustomPackaging} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/notify" component={NotifyData} allowedRoles={["admin", "manager"]} />

                                {/* Configuration - Admin and Manager */}
                                <ProtectedRoute exact path="/pincode" component={PinCodes} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/pincode/:id" component={PinCodeUpdate} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/coupon" component={Coupons} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/coupon/:id" component={CouponUpdate} allowedRoles={["admin", "manager"]} />

                                {/* Legacy/Misc pages - Admin only */}
                                <ProtectedRoute exact path="/manage" component={Manage} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/logs" component={Logs} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/notices" component={Notices} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/loginhistory" component={LoginHistory} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/pages" component={StaticPages} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/features" component={Features} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/feature/:id" component={Feature} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/enquiry" component={Enquirey} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/enquireydetails/:id" component={EnquireyDetails} allowedRoles={["admin", "manager"]} />
                                <ProtectedRoute exact path="/allStaticPages/:id" component={Pagedata} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/data" component={Warranty} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/privacypolicy" component={Pagedata} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/aboutus" component={Pagedata} allowedRoles={["admin"]} />
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
