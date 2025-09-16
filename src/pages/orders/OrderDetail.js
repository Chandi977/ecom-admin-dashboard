import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory, useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import Axios from "axios";

function OrderDetail() {
    const [displayModal, setDisplayModal] = useState(false);
    const [paymentVerified, setPaymentVerified] = useState(false);

    const [resData, setResData] = useState([]);
    const [orderList, setOrderList] = useState([]);

    // inputs for conditional edits
    const [shippingDate, setShippingDate] = useState("");
    const [trackingId, setTrackingId] = useState("");
    const [deliveryPartner, setDeliveryPartner] = useState("");
    const [deliveredDate, setDeliveredDate] = useState("");

    const breadItems = [{ label: "Home" }, { label: `Order ${resData?.orderId}` }];
    const home = { icon: "pi pi-home", url: "/" };

    const history = useHistory();
    const { id } = useParams();
    const orderId = resData?._id;

    const getDatabyId = async () => {
        const res = await handleGetRequest(`/order/get/${id}`);
        setResData(res?.data);
        setOrderList(res?.data?.items);
    };

    useEffect(() => {
        getDatabyId();
    }, []);

    /* ---------- Update handlers (unchanged logic) ----------- */
    const handleShippingDateUpdate = async () => {
        const isValidDate = moment(shippingDate, "DD-MM-YYYY", true).isValid();
        if (!isValidDate) {
            toast.error("Please use DD-MM-YYYY format.");
            return;
        }
        const data = {
            id: resData?._id,
            shippingDate: moment(shippingDate, "DD-MM-YYYY").format("DD-MM-YYYY"),
            status: "Dispatched",
        };
        const result = await handlePutRequest(data, "/order/update/shipping");
        if (result?.success) {
            toast.success("Shipping date updated.");
            setShippingDate("");
            getDatabyId();
        }
    };

    const handleDeliveredDateUpdate = async () => {
        const isValidDate = moment(deliveredDate, "DD-MM-YYYY", true).isValid();
        if (!isValidDate) {
            toast.error("Please use DD-MM-YYYY format.");
            return;
        }
        const data = {
            id: resData?._id,
            deliveredDate: moment(deliveredDate, "DD-MM-YYYY").format("DD-MM-YYYY"),
            status: "Delivered",
        };
        const result = await handlePutRequest(data, "/order/update/delivered");
        if (result?.success) {
            toast.success("Delivered Date updated.");
            setDeliveredDate("");
            getDatabyId();
        }
    };

    const handleTrackingIdUpdate = async () => {
        if (!trackingId || !deliveryPartner) {
            toast.error("Both Tracking ID and Delivery Partner are required.");
            return;
        }
        const data = {
            id: resData?._id,
            trackingId,
            deliveryPartner,
        };
        const result = await handlePutRequest(data, "/order/update/tracking");
        if (result?.success) {
            toast.success("Tracking Id & Delivery Partner Updated.");
            setTrackingId("");
            setDeliveryPartner("");
            getDatabyId();
        }
    };

    const handleVerifyClick = async () => {
        try {
            const response = await Axios.put("https://server.prempackaging.com/premind/api/order/update/payment/status", { _id: orderId, paymentStatus: "Payment Verified", status: "Payment Verified" });
            if (response.data.success) {
                toast.success("UTR verified successfully");
                setPaymentVerified(true);
                setDisplayModal(false);
                setTimeout(() => history.push("/orders"), 500);
            } else {
                toast.error("UTR Verification Failed");
            }
        } catch (error) {
            console.error("Error while updating payment status:", error);
        }
    };

    return (
        <>
            {/* ================== Styles (UI only) ================== */}
            <style>{`
        .wrap{max-width:920px;margin:0 auto;padding:20px}
        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .title{font-size:28px;font-weight:800;color:#0f172a;margin:0}
        .p-breadcrumb{background:none;border:none;padding:0;color:#64748b}

        .bill{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,.05)}
        .bill__hd{padding:18px 20px;border-bottom:2px solid #e2e8f0;text-align:center}
        .bill__meta{font-size:14px;color:#475569;margin-top:6px}

        .section{padding:16px 20px}
        .section + .section{border-top:1px dashed #e2e8f0}
        .sec-title{font-size:25px;font-weight:800;color:#495057}

        .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        @media (max-width:720px){ .grid{grid-template-columns:1fr} }

        .label{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}
        .value{font-size:15px;font-weight:700;color:#1e293b;word-break:break-word}

        .totals{max-width:420px;margin-left:auto}
        .line{display:flex;justify-content:space-between;padding:6px 0;font-weight:600}
        .line.total{border-top:1px solid #cbd5e1;margin-top:6px;padding-top:8px;font-size:17px}

        .items{width:100%;border-collapse:collapse}
        .items th,.items td{padding:10px;border-bottom:1px dashed #e2e8f0}
        .items th{background:#f8fafc;font-size:12px;text-transform:uppercase;letter-spacing:.03em;color:#334155;text-align:left}
        .items td.right{text-align:right}

        .row-inline{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        input[type="text"]{background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;font-size:14px;color:#334155;width:170px}
        .btn{border-radius:8px;padding:8px 12px;background:#2563eb;color:#fff;font-weight:700;border:none;cursor:pointer}
        .btn.dark{background:#0f172a}
        .badge{display:inline-block;background:#e8f7ee;color:#15803d;border:1px solid #bbf7d0;padding:3px 8px;border-radius:999px;font-weight:800;font-size:12px}

        .foot{text-align:center;padding:14px 20px;color:#64748b;font-size:14px}
      `}</style>

            <div className="wrap">
                <div className="topbar">
                    <h2 className="title">
                        <span style={{ fontSize: "17px" }}>Order Number</span>
                        <span style={{ color: "#E92227" }}> #{resData?.orderId}</span>
                    </h2>
                    {/* <BreadCrumb model={breadItems} home={home} /> */}
                </div>

                <div className="bill">
                    {/* Header */}
                    <div className="bill__hd">
                        <div style={{ fontSize: 30, fontWeight: 800 }}>Tax Invoice / Receipt</div>
                        <div className="bill__meta">Placed on {moment(resData?.createdAt).format("DD-MM-YYYY | hh:mm a")}</div>
                    </div>

                    {/* Customer & Address */}
                    <div className="section">
                        <h2 className="sec-title pb-3">Customer & Address</h2>
                        <div className="grid">
                            <div>
                                <div className="label">Customer Name</div>
                                <div className="value">{resData?.name}</div>
                            </div>
                            <div>
                                <div className="label">Phone</div>
                                <div className="value">{resData?.user?.mobile_number}</div>
                            </div>
                            <div>
                                <div className="label">GSTIN</div>
                                <div className="value">{resData?.gstin}</div>
                            </div>
                            <div>
                                <div className="label">Email</div>
                                <div className="value">{resData?.email}</div>
                            </div>
                            <div>
                                <div className="label">State</div>
                                <div className="value">{resData?.state}</div>
                            </div>
                            <div>
                                <div className="label">Pin Code</div>
                                <div className="value">{resData?.pincode}</div>
                            </div>
                            <div>
                                <div className="label">City</div>
                                <div className="value">{resData?.town}</div>
                            </div>

                            <div>
                                <div className="label">Address</div>
                                <div className="value">{resData?.address}</div>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="section">
                        <h2 className="sec-title">Ordered Items</h2>
                        <table className="items">
                            <thead>
                                <tr>
                                    <th style={{ width: "44%" }}>Item Name</th>
                                    <th>Model</th>
                                    {/* <th>Pack</th> */}
                                    <th>Qty</th>
                                    <th className="right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderList?.map((item, i) => (
                                    <tr key={i}>
                                        <td>{item?.product?.name ? " " + item?.product?.name : ""}</td>
                                        <td>{item?.product?.model || "-"}</td>
                                        {/* <td>{item?.product?.packSize || "-"}</td> */}
                                        <td>{item?.quantity}</td>
                                        <td>₹{item?.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Billing Totals */}
                    <div className="section">
                        <h3 className="sec-title">Billing Details</h3>
                        <div>
                            <div className="line">
                                <span>Cart Value</span>
                                <span>₹{Math.round(resData?.totalCartValue)}</span>
                            </div>
                            <div className="line">
                                <span>Freight Charges</span>
                                <span>+ ₹{Math.round(resData?.shippingCost)}</span>
                            </div>
                            <div className="line">
                                <span>Taxes</span>
                                <span>+ ₹{Math.round(resData?.totalOrderValue - resData?.totalCartValue - resData?.shippingCost)}</span>
                            </div>
                            <div className="line total">
                                <span>Total Cost</span>
                                <span>
                                    <b>₹{Math.round(resData?.totalOrderValue)}</b>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Logistics (with conditional inputs) */}
                    <div className="section">
                        <h3 className="sec-title pb-3">Payment & Logistics</h3>

                        <div className="grid">
                            {/* <div>
                                <div className="label">UTR Number</div>
                                <div className="row-inline">
                                    <div className="value">{resData?.utrNumber || "-"}</div>
                                    {resData?.paymentStatus === "Payment Verified" ? (
                                        <span className="badge">Payment Verified</span>
                                    ) : (
                                        !paymentVerified && (
                                            <button className="btn dark" onClick={() => setDisplayModal(true)}>
                                                Verify Payment
                                            </button>
                                        )
                                    )}
                                </div>
                            </div> */}

                            <div>
                                <div className="label">Payment Status</div>
                                <div className="value">{resData?.paymentStatus}</div>
                            </div>

                            <div>
                                <div className="label">Payment Date</div>
                                <div className="value">{resData?.paymentStatus === "Not Paid" ? "Payment Awaited" : `${moment(resData?.paymentDate).format("DD-MM-YYYY")} | ${moment(resData?.paymentDate).format("hh:mm a")}`}</div>
                            </div>

                            {/* Tracking: show inputs if not filled */}
                            <div style={{ gridColumn: "span 2" }}>
                                <div className="label">Tracking</div>
                                {resData?.trackingId ? (
                                    <div className="value">
                                        {resData?.trackingId} — {resData?.deliveryPartner}
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleTrackingIdUpdate();
                                        }}
                                        className="row-inline"
                                    >
                                        <input type="text" placeholder="Enter Tracking Id" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} />
                                        <input type="text" placeholder="Enter Delivery Partner" value={deliveryPartner} onChange={(e) => setDeliveryPartner(e.target.value)} />
                                        <button className="btn" type="submit">
                                            Submit
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Shipped Date: show input if not filled */}
                            <div>
                                <div className="label">Shipped Date</div>
                                {resData?.shippingDate ? (
                                    <div className="value">{resData?.shippingDate}</div>
                                ) : (
                                    <div className="row-inline">
                                        <input type="text" placeholder="DD-MM-YYYY" value={shippingDate} onChange={(e) => e.target.value.length <= 10 && setShippingDate(e.target.value)} />
                                        <button className="btn" onClick={handleShippingDateUpdate}>
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Delivered Date: show input if not filled */}
                            <div>
                                <div className="label">Delivered Date</div>
                                {resData?.deliveredDate ? (
                                    <div className="value">{resData?.deliveredDate}</div>
                                ) : (
                                    <div className="row-inline">
                                        <input type="text" placeholder="DD-MM-YYYY" value={deliveredDate} onChange={(e) => e.target.value.length <= 10 && setDeliveredDate(e.target.value)} />
                                        <button className="btn" onClick={handleDeliveredDateUpdate}>
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    {/* <div className="foot">Thank you for your order! — Prem Industries</div> */}
                </div>
            </div>

            {/* Verify Payment Modal (unchanged behavior) */}
            <Dialog
                visible={displayModal}
                onHide={() => setDisplayModal(false)}
                header="Verify Payment"
                modal
                style={{ width: "50vw" }}
                footer={
                    <div>
                        <Button label="Verify Payment" className="p-button-success" onClick={handleVerifyClick} />
                        <Button label="Cancel" className="p-button-secondary" onClick={() => setDisplayModal(false)} />
                    </div>
                }
            >
                <p>UTR Number: {resData?.utrNumber}</p>
            </Dialog>
        </>
    );
}

export default OrderDetail;
