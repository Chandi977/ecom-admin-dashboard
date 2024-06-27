import React, { useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";

function EnquireyDetails() {
    const { id } = useParams();
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const breadItems = [{ label: "Home" }, { label: "Enquirey #123456" }];
    const [enquiry, setEnquiry] = useState();
    const history = useHistory();
    const handledClicked = () => {
        history.push("");
    };
    const getData = async () => {
        const result = await handleGetRequest(`/getEnquiryById/${id}`);
        setEnquiry(result?.data);
    };
    useEffect(() => {
        getData();
    }, []);
    return (
        <>
            <div className="Page__Header" style={{ marginTop: "40px" }}>
                <div>
                    <h2>Enquirey&nbsp;#{enquiry?.id}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="row__">
                <div className="col_left">
                    <p>id</p>
                    <p>{enquiry?.id}</p>
                </div>
                <div className="col_right">
                    <p>full name</p>
                    <p>{enquiry?.name}</p>
                </div>
            </div>
            <div className="row__">
                <div className="col_left">
                    <p>contact no.</p>
                    <p>{enquiry?.phone}</p>
                </div>
                <div className="col_right">
                    <p>Email</p>
                    <p>{enquiry?.email}</p>
                </div>
            </div>
            <div className="row__">
                <div className="col_left">
                    <p>Quantity</p>
                    <p>2</p>
                </div>
                <div className="col_right">
                    <p>Enquiry Details</p>
                    <p>
                        {enquiry?.product?.title} {enquiry?.product?.series} {enquiry?.product?.tyre_width}/{enquiry?.product?.tyre_profile} R{enquiry?.product?.rim_diameter}
                    </p>
                </div>
            </div>
            <div className="row__">
                <div className="col_left">
                    <p>Comment Enquiry</p>
                    <p>Tyres</p>
                </div>
                <div className="col_right">
                    <p>Created On</p>
                    <p>{moment(enquiry?.createdAt).format("YYYY-MM-DD hh:mm:ss A")}</p>
                </div>
            </div>
            <div className="row__">
                <div className="col_left">
                    <p>Type ID</p>
                    <p>View Tyre</p>
                </div>
                <div className="col_right">
                    <p>State ID</p>
                    <p>0</p>
                </div>
            </div>
        </>
    );
}

export default EnquireyDetails;
