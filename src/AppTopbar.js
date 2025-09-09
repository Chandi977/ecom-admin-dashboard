import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
import Pusher from "pusher-js";
import { handleGetRequest } from "./services/GetTemplate";
import { BsBellFill } from "react-icons/bs";
import moment from "moment";
import { useDispatch } from "react-redux";
import { handlePostRequest } from "./services/PostTemplate";

export const AppTopbar = (props) => {
    const [notifications, setNotifications] = useState([]);
    console.log(notifications);
    const name = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    const history = useHistory();
    const dispatch = useDispatch();
    const handleSignout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        history.push("/auth");
    };

    // const handleNotificationforUser = (not) => {
    //     const id = localStorage.getItem("id");
    //     const temp = not?.filter((item) => {
    //         return item.seen.some((ite) => {
    //             return ite.user === id && ite.seen === false;
    //         });
    //     });
    //     setNotifications(temp);
    // };

    // const getNotifications = async () => {
    //     const res = await handleGetRequest("/getNotifications");
    //     setNotifications(res?.data);
    //     console.log(res?.data);
    //     handleNotificationforUser(res?.data);
    // };

    // useEffect(() => {
    //     // Set up Pusher
    //     const pusher = new Pusher("79d34ccb7ea30ec8fdc4", {
    //         cluster: "ap2",
    //         encrypted: true,
    //     });

    //     getNotifications();

    //     // Subscribe to the 'new-order' channel
    //     const channel = pusher.subscribe("orders");
    //     channel.bind("new-order", (data) => {
    //         setNotifications((prevNotifications) => [...prevNotifications, data]);
    //     });

    //     return () => {
    //         // Unsubscribe from the channel when component unmounts
    //         channel.unbind("new-order");
    //         pusher.unsubscribe("orders");
    //     };
    // }, []);

    // const handleNotification = async (ite) => {
    //     const temp = notifications?.filter((item) => item._id === ite?._id);
    //     const temp2 = temp?.[0]?.seen;
    //     console.log(temp2);
    //     const temp3 = temp2?.map((item) => {
    //         if (item.user === localStorage.getItem("id")) {
    //             item.seen = true;
    //         }
    //         return item;
    //     });
    //     const data = {
    //         id: ite?._id,
    //         seen: temp3,
    //     };
    //     const res = await dispatch(handlePostRequest(data, "/editNotification", true, true));
    //     if (res !== "error") {
    //         getNotifications();
    //         history.push(ite?.link);
    //     }
    // };
    return (
        <>
            <Helmet>
                <link id="theme-link" rel="stylesheet" href="/assets/themes/lara-light-indigo/theme.css" />
            </Helmet>
            <div className="layout-topbar">
                <Link to="/" className="layout-topbar-logo">
                    {/* <img src={props.layoutColorMode === "light" ? "assets/layout/images/logo_zugaob.svg" : "assets/layout/images/logo_zugaob.svg"} alt="logo" /> */}
                    <img src="/images/prem.png" width={80} height={800}></img>
                </Link>

                <button type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={props.onMobileTopbarMenuClick}>
                    <i className="pi pi-ellipsis-v" />
                </button>
                <div className="search_div"></div>

                <ul className={classNames("layout-topbar-menu lg:flex origin-top", { "layout-topbar-menu-mobile-active": props.mobileTopbarMenuActive })}></ul>
                {/* <div className="not__div">
                    <i className="bell_icoona">
                        <BsBellFill />
                    </i>
                    {notifications?.length > 0 && <span className="new__dot">.</span>}
                    <div className="notification_dropDown">
                        {notifications?.slice(0, 5)?.map((item, index) => {
                            return (
                                <div className="notification__ineer" onClick={() => handleNotification(item)}>
                                    <div>
                                        <p>{item?.title}</p>
                                        <p>{moment(item?.createdAt).fromNow()}</p>
                                    </div>
                                    <p>{item?.body}</p>
                                </div>
                            );
                        })}
                    </div>
                </div> */}

                <div className="user_info shadow-lg" style={{ display: "flex", alignItems: "center", background: "#f6f8fa", borderRadius: "12px", padding: "10px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginLeft: "20px", minWidth: "220px" }}>
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="profile_img" style={{ width: 48, height: 48, borderRadius: "50%", marginRight: "14px", border: "2px solid #e3e3e3", background: "#fff" }} />
                    <div className="p_div" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <p style={{ margin: 0, fontSize: "1.05rem", color: "#222" }}>
                            <span style={{ color: "#888" }}>UID:</span> <b style={{ color: "#1976d2" }}>{name}</b>
                        </p>
                        <p style={{ margin: 0, fontSize: "0.98rem", color: "#222" }}>
                            <span style={{ color: "#888" }}>Role:</span> <b style={{ color: "#E92227" }}>{role}</b>
                        </p>
                    </div>
                </div>
                <div className="p-2 shadow-lg" style={{ marginLeft: "30px", cursor: "pointer", backgroundColor: "#E92227", color: "white", borderRadius: "12px" }} onClick={handleSignout}>
                    <b>
                        <span>Logout</span> <i className="pi pi-sign-out"></i>
                    </b>
                </div>
            </div>
        </>
    );
};
