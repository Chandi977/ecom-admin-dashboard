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
    const [selectedRow, setselectedRow] = useState([]);
    const [displayModal, setDisplayModal] = useState(false);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [resData, setResData] = useState([]);
    const [orderList, setOrderList] = useState([]);
    const [shippingDate, setShippingDate] = useState("");
    const [trackingId, setTrackingId] = useState("");
    const [deliveryPartner, setDeliveryPartner] = useState("");
    const [deliveredDate, setDeliveredDate] = useState("");
    const breadItems = [{ label: "Home" }, { label: `Order ${resData?.orderId}` }];
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

    const handleShippingDateUpdate = async () => {
        const isValidDate = moment(shippingDate, "DD-MM-YYYY", true).isValid();
        if (!isValidDate) {
            toast.error(" Please use DD-MM-YYYY format.");
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
            getDatabyId();
        }
    };

    const handleTrackingIdUpdate = async () => {
        const data = {
            id: resData?._id,
            trackingId: trackingId,
            deliveryPartner: deliveryPartner,
        };
        const result = await handlePutRequest(data, "/order/update/tracking");
        if (result?.success) {
            toast.success("Tracking Id & Delivery Partner Updated.");
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
            <style>{`
        .bill-container {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          padding: 24px;
          font-family: system-ui, sans-serif;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .bill-header {
          text-align: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .bill-header h2 { margin: 0; font-size: 28px; }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 20px 0 10px;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 4px;
        }
        .bill-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .bill-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .05em;
          color: #64748b;
        }
        .bill-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          word-break: break-word;
        }
        .item-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .item-table th, .item-table td {
          border-bottom: 1px dashed #e2e8f0;
          padding: 8px;
          text-align: left;
        }
        .item-table th {
          background: #f8fafc;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: .03em;
          color: #334155;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-weight: 600;
        }
        .bill-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #64748b;
        }
        .btn {border-radius:8px;padding:6px 10px;background:#2563eb;color:#fff;font-weight:600;border:none;cursor:pointer}
      `}</style>

            <div className="bill-container">
                <div className="bill-header">
                    <h2>Order #{resData?.orderId}</h2>
                    <div>{moment(resData?.createdAt).format("DD-MM-YYYY hh:mm a")}</div>
                </div>

                {/* Address Section */}
                <div className="section-title">Customer & Address</div>
                <div className="bill-grid">
                    <div>
                        <div className="bill-label">Customer Name</div>
                        <div className="bill-value">{resData?.name}</div>
                    </div>
                    <div>
                        <div className="bill-label">Phone</div>
                        <div className="bill-value">{resData?.user?.mobile_number}</div>
                    </div>
                    <div>
                        <div className="bill-label">Address</div>
                        <div className="bill-value">{resData?.address}</div>
                    </div>
                    <div>
                        <div className="bill-label">City</div>
                        <div className="bill-value">{resData?.town}</div>
                    </div>
                    <div>
                        <div className="bill-label">State</div>
                        <div className="bill-value">{resData?.state}</div>
                    </div>
                    <div>
                        <div className="bill-label">Pin Code</div>
                        <div className="bill-value">{resData?.pincode}</div>
                    </div>
                    <div>
                        <div className="bill-label">Email</div>
                        <div className="bill-value">{resData?.email}</div>
                    </div>
                    <div>
                        <div className="bill-label">GSTIN</div>
                        <div className="bill-value">{resData?.gstin}</div>
                    </div>
                </div>

                {/* Billing Section */}
                <div className="section-title">Billing Details</div>
                <div className="total-line">
                    <span>Cart Value</span>
                    <span>₹{Math.round(resData?.totalCartValue)}</span>
                </div>
                <div className="total-line">
                    <span>Freight Charges</span>
                    <span>₹{Math.round(resData?.shippingCost)}</span>
                </div>
                <div className="total-line">
                    <span>Taxes</span>
                    <span>₹{Math.round(resData?.totalOrderValue - resData?.totalCartValue - resData?.shippingCost)}</span>
                </div>
                <div className="total-line" style={{ borderTop: "1px solid #cbd5e1", marginTop: "8px" }}>
                    <span>Total</span>
                    <span>₹{Math.round(resData?.totalOrderValue)}</span>
                </div>

                {/* Payment Section */}
                <div className="section-title">Payment Info</div>
                <div className="bill-grid">
                    <div>
                        <div className="bill-label">UTR Number</div>
                        <div className="bill-value">{resData?.utrNumber || "-"}</div>
                    </div>
                    <div>
                        <div className="bill-label">Payment Status</div>
                        <div className="bill-value">{resData?.paymentStatus}</div>
                    </div>
                    <div>
                        <div className="bill-label">Payment Date</div>
                        <div className="bill-value">{resData?.paymentStatus === "Not Paid" ? "Payment Awaited" : `${moment(resData?.paymentDate).format("DD-MM-YYYY")} | ${moment(resData?.paymentDate).format("hh:mm a")}`}</div>
                    </div>
                    <div>
                        <div className="bill-label">Shipped Date</div>
                        <div className="bill-value">{resData?.shippingDate || "-"}</div>
                    </div>
                    <div>
                        <div className="bill-label">Tracking ID</div>
                        <div className="bill-value">{resData?.trackingId ? `${resData.trackingId} — ${resData.deliveryPartner}` : "-"}</div>
                    </div>
                    <div>
                        <div className="bill-label">Delivered Date</div>
                        <div className="bill-value">{resData?.deliveredDate || "-"}</div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="section-title">Items</div>
                <table className="item-table">
                    <thead>
                        <tr>
                            <th style={{ width: "50%" }}>Item</th>
                            <th>Model</th>
                            <th>Qty</th>
                            <th>Pack Size</th>
                            <th style={{ textAlign: "right" }}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderList?.map((item, i) => (
                            <tr key={i}>
                                <td>{item?.product?.name}</td>
                                <td>{item?.product?.model}</td>
                                <td>{item?.quantity}</td>
                                <td>{item?.product?.packSize}</td>
                                <td style={{ textAlign: "right" }}>₹{item?.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="bill-footer">Thank you for your order! — Prem Industries</div>
            </div>

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
