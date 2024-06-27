import React, { useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

function Manage() {
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const breadItems = [{ label: "Home" }, { label: "Manage" }];
    const [role, setRole] = useState();
    const history = useHistory();
    const handledClicked = () => {
        history.push("");
    };
    const handleLogs = () => {
        if (role === "admin") {
            history.push("/logs");
        } else {
            toast.info("You are not authorized to access this page");
        }
    };
    const handleNotice = () => {
        history.push("/notices");
    };
    const handleHistory = () => {
        if (role === "admin") {
            history.push("/history");
        } else {
            toast.info("You are not authorized to access this page");
        }
    };
    const handlePages = () => {
        history.push("/pages");
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Manage</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                {/* <div className="Top__Btn">
                    <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledClicked} className="Btn__DarkDelete" style={{ width: "240px" }} />
                </div> */}
            </div>
            <div className="grid_view">
                <div className="manage_card" onClick={handleLogs}>
                    <p>Logs</p>
                </div>
                <div className="manage_card" onClick={handleHistory}>
                    <p>Login History</p>
                </div>
                <div className="manage_card" onClick={handlePages}>
                    <p>Pages</p>
                </div>
                <div className="manage_card" onClick={handleNotice}>
                    <p>Banner</p>
                </div>
            </div>
        </>
    );
}

export default Manage;
