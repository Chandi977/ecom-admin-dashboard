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
import RoleDashboard from "./pages/dashboards/RoleDashboard";
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
import Enquiries from "./pages/enquiries/Enquiries";
import LeadsCRM from "./pages/leads/LeadsCRM";
import LeadDetail from "./pages/leads/LeadDetail";
import Reviews from "./pages/reviews/Reviews";
import AllAdmin from "./pages/Admin/adminTable";
import PinCodes from "./pages/Pincode/pincode";
import PinCodeUpdate from "./pages/Pincode/pinCodeUpdate";
import Coupons from "./pages/Coupon/coupon";
import CouponUpdate from "./pages/Coupon/CouonUpdate";
import Analytics from "./pages/analytics/Analytics";
import DemandSignals from "./pages/analytics/DemandSignals";
import Notifications from "./pages/Notifications/Notifications";
import PromotionalEmail from "./pages/PromotionalEmail/PromotionalEmail";
import { clearAuthSession, getStoredAuthSession, isTokenExpired } from "./utils/authSession";
import { ADMIN_PANEL_ROLES } from "./rbac/permissions";
import { usePermissions } from "./hooks/usePermissions";

// Route role sets. `manager` is a full-access role, so it appears wherever
// `admin` does. Legacy `catalog-manager` keeps exactly the access it had.
const ROLES_PANEL = ADMIN_PANEL_ROLES; // every admin-panel role (the "/" dashboard)
const ROLES_FULL = ["admin", "manager"]; // staff accounts, marketing blasts, legacy pages
const ROLES_OPS = ["admin", "manager", "general", "catalog-manager"]; // operational + catalog write pages
const ROLES_CATALOG = ["admin", "manager", "general", "seo", "catalog-manager"]; // catalog/analytics pages the seo role also needs
const ROLES_MERCH = ["admin", "manager", "general"]; // coupons/deals — never granted to catalog-manager

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
    // Role + permissions come from the JWT-derived session (utils/authSession.js),
    // refined by GET /permissions/me — not from a raw localStorage read.
    const { role, canAny } = usePermissions();
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

    // Declarative menu, gated by permission rather than a hand-maintained role list.
    // `permissions` = show when the role holds ANY of them; omitted = every admin-panel role.
    // `legacyRoles` = escape hatch for pre-RBAC-v2 roles that have no permission
    // mirror (`digital marketing`) or that predate these permissions
    // (`catalog-manager` sees the operational pages it always saw). Never widens
    // access for admin/manager/general/seo.
    const MENU_MODEL = [
        { label: "Dashboard", icon: "pi pi-home", to: "/" },
        { label: "Users", icon: "pi pi-users", to: "/customers", permissions: ["customer:read"] },
        { label: "Admin", icon: "pi pi-user", to: "/admin", permissions: ["user:read", "user:write"] },
        // brand:write (not brand:read) — the seo role reads brands but has no page for them.
        { label: "Brands", icon: "pi pi-question", to: "/brands", permissions: ["brand:write"], legacyRoles: ["digital marketing"] },
        { label: "Category", icon: "pi pi-list", to: "/categories", permissions: ["category:read"], legacyRoles: ["digital marketing"] },
        { label: "Pincodes", icon: "pi pi-map-marker", to: "/pincode", permissions: ["pincode:write"], legacyRoles: ["catalog-manager"] },
        { label: "SubCategory", icon: "pi pi-server", to: "/subcategories", permissions: ["subcategory:read"] },
        { label: "Coupon", icon: "pi pi-tags", to: "/coupon", permissions: ["coupon:write"] },
        { label: "Product", icon: "pi pi-box", to: "/products", permissions: ["product:read"] },
        { label: "Orders", icon: "pi pi-shopping-cart", to: "/orders", permissions: ["order:read"] },
        { label: "Enquiries", icon: "pi pi-inbox", to: "/enquiries", permissions: ["lead:read", "contact:write"] },
        { label: "Leads CRM", icon: "pi pi-briefcase", to: "/leads", permissions: ["lead:read"] },
        { label: "Reviews", icon: "pi pi-star", to: "/reviews", permissions: ["review:read", "review:moderate"] },
        { label: "Notifications", icon: "pi pi-bell", to: "/notifications", permissions: ["notification:read"] },
        { label: "Promotional Email", icon: "pi pi-megaphone", to: "/promotional-email", permissions: ["marketing:write"] },
        { label: "Analytics", icon: "pi pi-chart-line", to: "/analytics", permissions: ["analytics:read"] },
        { label: "Demand Signals", icon: "pi pi-chart-bar", to: "/demand-signals", permissions: ["marketing:read"] },
    ];

    const isMenuItemVisible = (item) => {
        if (item.legacyRoles && item.legacyRoles.includes(role)) return true;
        // Ungated items are for the RBAC v2 panel roles only, so legacy roles keep
        // seeing exactly the items they see today.
        if (!item.permissions) return ROLES_PANEL.includes(role);
        return canAny(item.permissions);
    };

    const menu = [
        {
            items: MENU_MODEL.filter(isMenuItemVisible).map(({ permissions, legacyRoles, ...item }) => item),
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
                                {/* Dashboard - every admin-panel role, dispatched per role */}
                                <ProtectedRoute exact path="/" component={RoleDashboard} allowedRoles={ROLES_PANEL} />

                                {/* Customer Management - operations (seo has no business here) */}
                                <ProtectedRoute exact path="/customers" component={Customers} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/customer/:id" component={Customer} allowedRoles={ROLES_OPS} />

                                {/* Staff accounts - full-access roles only */}
                                <ProtectedRoute exact path="/admin" component={AllAdmin} allowedRoles={ROLES_FULL} />

                                {/* Content Management */}
                                <ProtectedRoute exact path="/brands" component={Brands} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/brand/:id" component={Brand} allowedRoles={ROLES_OPS} />
                                {/* seo may open categories/subcategories/products: the backend field-scopes its writes to SEO keys */}
                                <ProtectedRoute exact path="/categories" component={Categories} allowedRoles={ROLES_CATALOG} />
                                <ProtectedRoute exact path="/category/:id" component={Category} allowedRoles={ROLES_CATALOG} />

                                {/* Product Management */}
                                <ProtectedRoute exact path="/subcategories" component={SubCategories} allowedRoles={ROLES_CATALOG} />
                                <ProtectedRoute exact path="/subcategory/:id" component={SubCategory} allowedRoles={ROLES_CATALOG} />
                                <ProtectedRoute exact path="/products" component={Products} allowedRoles={ROLES_CATALOG} />
                                {/* Creating a product is out of the seo field scope */}
                                <ProtectedRoute exact path="/products/create" component={ProductCreate} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/product/:id" component={Product} allowedRoles={ROLES_CATALOG} />
                                <ProtectedRoute exact path="/deals" component={Deals} allowedRoles={ROLES_MERCH} requiredPermissions={["deal:write"]} />
                                <ProtectedRoute exact path="/deal/:id" component={Deal} allowedRoles={ROLES_MERCH} requiredPermissions={["deal:write"]} />

                                {/* Orders */}
                                <ProtectedRoute exact path="/orders" component={Orders} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/orderdetail/:id" component={OrderDetail} allowedRoles={ROLES_OPS} />

                                {/* Customer Data & Queries */}
                                <ProtectedRoute exact path="/enquiries" component={Enquiries} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/data/customer" component={Enquiries} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/data/contact" component={Enquiries} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/leads" component={LeadsCRM} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/leads/:id" component={LeadDetail} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/reviews" component={Reviews} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/custom-packaging" component={Enquiries} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/notify" component={Notifications} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/notifications" component={Notifications} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/promotional-email" component={PromotionalEmail} allowedRoles={ROLES_FULL} />

                                {/* Configuration */}
                                <ProtectedRoute exact path="/pincode" component={PinCodes} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/pincode/:id" component={PinCodeUpdate} allowedRoles={ROLES_OPS} />
                                <ProtectedRoute exact path="/coupon" component={Coupons} allowedRoles={ROLES_MERCH} requiredPermissions={["coupon:write"]} />
                                <ProtectedRoute exact path="/coupon/:id" component={CouponUpdate} allowedRoles={ROLES_MERCH} requiredPermissions={["coupon:write"]} />

                                {/* Analytics - includes seo (analytics:read) */}
                                <ProtectedRoute exact path="/analytics" component={Analytics} allowedRoles={ROLES_CATALOG} />
                                <ProtectedRoute exact path="/demand-signals" component={DemandSignals} allowedRoles={ROLES_FULL} />

                                {/* Legacy/Misc pages - full-access roles only */}
                                <ProtectedRoute exact path="/manage" component={Manage} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/logs" component={Logs} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/notices" component={Notices} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/loginhistory" component={LoginHistory} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/pages" component={StaticPages} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/features" component={Features} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/feature/:id" component={Feature} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/enquiry" component={Enquirey} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/enquireydetails/:id" component={EnquireyDetails} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/allStaticPages/:id" component={Pagedata} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/data" component={Warranty} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/privacypolicy" component={Pagedata} allowedRoles={ROLES_FULL} />
                                <ProtectedRoute exact path="/aboutus" component={Pagedata} allowedRoles={ROLES_FULL} />
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
