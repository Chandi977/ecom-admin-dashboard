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
import { ProductCreate } from "./features/products/ProductCreate";
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
import Analytics from "./pages/analytics/Analytics";
import DemandSignals from "./pages/analytics/DemandSignals";
import Notifications from "./pages/Notifications/Notifications";
import { clearAuthSession, getStoredAuthSession, isTokenExpired } from "./utils/authSession";

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
        const { token, role } = getStoredAuthSession();
        if (window.location.pathname !== "/auth" && (!token || isTokenExpired(token) || !role)) {
            clearAuthSession();
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

    // Declarative menu: each item lists the roles allowed to see it (empty = everyone).
    // `catalog-manager` has read-only access across the dashboard — can view all
    // operational pages but cannot create, edit, or delete any data.
    const MENU_MODEL = [
        { label: "Dashboard", icon: "pi pi-home", to: "/", roles: ["admin", "catalog-manager"] },
        { label: "Users", icon: "pi pi-users", to: "/customers", roles: ["admin", "catalog-manager"] },
        { label: "Admin", icon: "pi pi-user", to: "/admin", roles: ["admin"] },
        { label: "Brands", icon: "pi pi-question", to: "/brands", roles: ["admin", "digital marketing", "catalog-manager"] },
        { label: "Category", icon: "pi pi-list", to: "/categories", roles: ["admin", "digital marketing", "catalog-manager"] },
        { label: "Pincodes", icon: "pi pi-map-marker", to: "/pincode", roles: ["admin", "catalog-manager"] },
        { label: "SubCategory", icon: "pi pi-server", to: "/subcategories", roles: ["admin", "catalog-manager"] },
        { label: "Coupon", icon: "pi pi-tags", to: "/coupon", roles: ["admin"] },
        { label: "Product", icon: "pi pi-box", to: "/products", roles: ["admin", "catalog-manager"] },
        { label: "Orders", icon: "pi pi-shopping-cart", to: "/orders", roles: ["admin", "catalog-manager"] },
        { label: "Customers Query", icon: "pi pi-envelope", to: "/data/customer", roles: ["admin", "catalog-manager"] },
        { label: "Custom Packaging", icon: "pi pi-pencil", to: "/custom-packaging", roles: ["admin", "catalog-manager"] },
        { label: "Contact Form Main Website", icon: "pi pi-phone", to: "/data/contact", roles: ["admin", "catalog-manager"] },
        { label: "Notify", icon: "pi pi-pencil", to: "/notify", roles: ["admin", "catalog-manager"] },
        { label: "Notifications", icon: "pi pi-bell", to: "/notifications", roles: ["admin", "catalog-manager"] },
        { label: "Analytics", icon: "pi pi-chart-line", to: "/analytics", roles: ["admin"] },
        { label: "Demand Signals", icon: "pi pi-chart-bar", to: "/demand-signals", roles: ["admin"] },
    ];

    const menu = [
        {
            items: MENU_MODEL.filter((item) => item.roles.length === 0 || item.roles.includes(role)).map(({ roles, ...item }) => item),
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
                                {/* Dashboard - Admin / catalog-manager (read-only) */}
                                <ProtectedRoute exact path="/" component={Dashboard} allowedRoles={["admin", "catalog-manager"]} />
                                
                                {/* Customer Management - Admin / catalog-manager (read-only) */}
                                <ProtectedRoute exact path="/customers" component={Customers} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/customer/:id" component={Customer} allowedRoles={["admin", "catalog-manager"]} />

                                {/* Admin Management - Admin and Manager */}
                                <ProtectedRoute exact path="/admin" component={AllAdmin} allowedRoles={["admin"]} />

                                {/* Content Management - Admin and Digital Marketing */}
                                <ProtectedRoute exact path="/brands" component={Brands} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/brand/:id" component={Brand} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/categories" component={Categories} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/category/:id" component={Category} allowedRoles={["admin", "catalog-manager"]} />

                                {/* Product Management - Admin and Manager */}
                                <ProtectedRoute exact path="/subcategories" component={SubCategories} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/subcategory/:id" component={SubCategory} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/products" component={Products} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/products/create" component={ProductCreate} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/product/:id" component={Product} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/deals" component={Deals} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/deal/:id" component={Deal} allowedRoles={["admin"]} />

                                {/* Orders - Admin / catalog-manager (read-only) */}
                                <ProtectedRoute exact path="/orders" component={Orders} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/orderdetail/:id" component={OrderDetail} allowedRoles={["admin", "catalog-manager"]} />

                                {/* Customer Data & Queries - Admin / catalog-manager (read-only) */}
                                <ProtectedRoute exact path="/data/customer" component={CustomersData} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/data/contact" component={ContactData} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/custom-packaging" component={CustomPackaging} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/notify" component={NotifyData} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/notifications" component={Notifications} allowedRoles={["admin", "catalog-manager"]} />

                                {/* Configuration - Admin / catalog-manager (read-only) */}
                                <ProtectedRoute exact path="/pincode" component={PinCodes} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/pincode/:id" component={PinCodeUpdate} allowedRoles={["admin", "catalog-manager"]} />
                                <ProtectedRoute exact path="/coupon" component={Coupons} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/coupon/:id" component={CouponUpdate} allowedRoles={["admin"]} />

                                {/* Analytics - Admin only */}
                                <ProtectedRoute exact path="/analytics" component={Analytics} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/demand-signals" component={DemandSignals} allowedRoles={["admin"]} />

                                {/* Legacy/Misc pages - Admin only */}
                                <ProtectedRoute exact path="/manage" component={Manage} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/logs" component={Logs} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/notices" component={Notices} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/loginhistory" component={LoginHistory} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/pages" component={StaticPages} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/features" component={Features} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/feature/:id" component={Feature} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/enquiry" component={Enquirey} allowedRoles={["admin"]} />
                                <ProtectedRoute exact path="/enquireydetails/:id" component={EnquireyDetails} allowedRoles={["admin"]} />
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
