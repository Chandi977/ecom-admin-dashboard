import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useHistory, useParams } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { handlePostRequest } from "../../services/PostTemplate";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import Axios from "axios";

function OrderDetail() {
    const [selectedRow, setselectedRow] = useState([]);
    const [displayModal, setDisplayModal] = useState(false);
    const [utrNumber, setUtrNumber] = useState(null);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [status, setStatus] = useState("");
    const home = { icon: "pi pi-home", url: "/" };
    const [resData, setResData] = useState([]);
    const [orderList, setOrderList] = useState([]);
    const [shippingDate, setShippingDate] = useState("");
    const [trackingId, setTrackingId] = useState("");
    const [deliveryPartner, setDeliveryPartner] = useState("");
    const [deliveredDate, setDeliveredDate] = useState("");
    const [role, setRole] = useState("");
    const breadItems = [{ label: "Home" }, { label: `Order ${resData?.orderId}` }];
    const history = useHistory();
    const { id } = useParams();
    const orderId = resData?._id;

    const getDatabyId = async () => {
        const res = await handleGetRequest(`/order/get/${id}`);
        console.log(res?.data);
        setResData(res?.data);
        setOrderList(res?.data?.items);
    };
    useEffect(() => {
        getDatabyId();
        console.log("45", orderList);
    }, []);

    useEffect(() => {
        setStatus(resData?.status);
    }, [resData]);

    const handledClicked = () => {
        history.push("");
    };
    const menu = useRef(null);
    const items = [
        {
            label: "Options",
            items: [
                {
                    label: "Delete",
                    icon: "pi pi-times",
                },
                {
                    label: "View Details",
                    icon: "pi pi-times",
                    url: "/orderdetail",
                },
            ],
        },
    ];

    const dateTemplate = (rowdata) => {
        return (
            <div>
                <p>
                    {moment(rowdata?.updatedAt).format("DD-MM-YY")} &nbsp; | &nbsp; {moment(rowdata?.updatedAt).format("hh:mm a")}
                </p>
            </div>
        );
    };

    const itemTemplate = (rowData) => {
        return (
            <p>
                {rowData?.product?.brand &&
                    (typeof rowData?.product?.brand === "string"
                        ? // If item.brand is a string
                          rowData?.product?.brand === "6557dbbc301ec4f2f4266107"
                            ? "flipkart"
                            : rowData?.product?.brand === "6557dbcc301ec4f2f426610b"
                            ? "myntra"
                            : rowData?.product?.brand === "6557dbad301ec4f2f4266103"
                            ? "amazon"
                            : rowData?.product?.brand === "6582c8580ab82549a084894f"
                            ? "ajio"
                            : rowData?.product?.brand === "6557dbf9301ec4f2f426611e"
                            ? "rollabel"
                            : rowData?.product?.brand === "6557dc10301ec4f2f4266122"
                            ? "pack-secure"
                            : rowData?.product?.brand === "6582c8750ab82549a0848953"
                            ? "PackPro"
                            : rowData?.product?.brand
                        : // If item.brand is an object, render a specific property (you can adjust this based on your data structure)
                          rowData?.product?.brand?.name)} {" "}
                {rowData?.product?.name}{" "}
            </p>
        );
    };

    const modelTemplate = (rowData) => {
        return <p>{rowData?.product?.model}</p>;
    };

    const packTemplate = (rowData) => {
        return <p>{rowData?.product?.packSize}</p>;
    };

    const handleCHange = async (value) => {
        setStatus(value);
        const data = {
            id: resData?._id,
            status: value,
        };
        const result = await handlePutRequest(data, "/order/update");
        if (result?.success) {
            toast.success("status changed.");
            getDatabyId();
        }
    };

    const handleShippingDateUpdate = async () => {
        const isValidDate = moment(shippingDate, "DD-MM-YYYY", true).isValid();

        if (!isValidDate) {
            console.error("Invalid date format. Please use DD-MM-YYYY.");
            toast.error(" Please use DD-MM-YYYY format.");
            return;
        }

        const data = {
            id: resData?._id,
            shippingDate: moment(shippingDate, "DD-MM-YYYY").format("DD-MM-YYYY"), // Format the date before sending it
            status: "Dispatched",
        };

        const result = await handlePutRequest(data, "/order/update/shipping");

        if (result?.success) {
            toast.success("Shipping date updated.");
            //   setShippingDate("");
            getDatabyId();
        }
    };

    const handleDeliveredDateUpdate = async () => {
        const isValidDate = moment(deliveredDate, "DD-MM-YYYY", true).isValid();

        if (!isValidDate) {
            //   console.error('Invalid date format. Please use DD-MM-YYYY.');
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
            // setShippingDate("");
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
            // setShippingDate("");
            getDatabyId();
        }
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);

    const handleVerifyClick = async () => {
        try {
            const response = await Axios.put("https://server.prempackaging.com/premind/api/order/update/payment/status", {
                _id: orderId,
                paymentStatus: "Payment Verified",
                status: "Payment Verified",
            });

            if (response.data.success) {
                toast.success("UTR verified successfully");
                setPaymentVerified(true);
                setDisplayModal(false);

                setTimeout(() => {
                    history.push("/orders");
                }, 500);
            } else {
                toast.error("UTR Verification Failed");
            }
        } catch (error) {
            console.error("Error while updating payment status:", error);
            // Handle errors appropriately
        }
    };

    const handleOpenModal = () => {
        setDisplayModal(true);
    };
    const onHide = () => {
        setDisplayModal(false);
    };
    return (
        <>
            <div className="Page__Header" style={{ marginTop: "40px" }}>
                <div>
                    <h2>Order&nbsp;#{resData?.orderId}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                {/* <div className="Top__Btn">
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledClicked} className="Btn__DarkDelete" style={{ width: "240px" }} />
                </div> */}
            </div>
            <div className="row__">
                <div className="col_left">
                    <p>Order ID:</p>
                    <p>{resData?.orderId}</p>
                </div>
                <div className="col_right">
                    <p>Total Cart Value:</p>
                    <p>₹{Math.round(resData?.totalCartValue)}</p>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>Order Date:</p>
                    <p>
                        {moment(resData?.createdAt).format("DD-MM-YYYY")} | {moment(resData?.createdAt).format("hh:mm a")}
                    </p>
                </div>
                <div className="col_right">
                    <p>Freight Charges:</p>
                    <p>₹{Math.round(resData?.shippingCost)}</p>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>Customer Name</p>
                    <p>{resData?.name}</p>
                </div>
                <div className="col_right">
                    <p>Taxes</p>
                    <p>₹{Math.round(resData?.totalOrderValue - resData?.totalCartValue - resData?.shippingCost)}</p>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>Address:</p>
                    <p>{resData?.address}</p>
                </div>
                <div className="col_right">
                    <p>Total Order Value:</p>
                    <p>₹{Math.round(resData?.totalOrderValue)}</p>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>City:</p>
                    <p>{resData?.town}</p>
                </div>
                <div className="col_right" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p>UTR Number </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", textAlign: "center", gap: "30px" }}>
                        <p style={{ fontSize: "16px", fontWeight: "bolder", paddingTop: "15px" }}>{resData?.utrNumber}</p>
                        <p>
                            {resData?.paymentStatus === "Payment Verified" ? (
                                <span style={{ fontWeight: "600", color: "#56aa25", fontSize: "16px" }}>Payment Verified</span>
                            ) : (
                                !paymentVerified && (
                                    <button style={{ backgroundColor: "#212529", color: "white", border: "none", paddingBlock: "5px", paddingInline: "5px" }} onClick={handleOpenModal}>
                                        Verify Payment
                                    </button>
                                )
                            )}
                        </p>{" "}
                    </div>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>State:</p>
                    <p>{resData?.state}</p>
                </div>
                <div className="col_right">
                    <p>Payment Status</p>
                    <p>{resData?.paymentStatus}</p>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>Pin Code: </p>
                    <p>{resData?.pincode}</p>
                </div>
                <div className="col_right">
                    {resData?.paymentStatus === "Not Paid" ? (
                        <>
                            <p>Payment Date</p>
                            <p>Payment Awaited</p>
                        </>
                    ) : (
                        <>
                            <p>Payment Date</p>
                            <p>
                                {moment(resData?.paymentDate).format("DD-MM-YYYY")} | {moment(resData?.paymentDate).format("hh:mm a")}
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>Phone No:</p>
                    <p>{resData?.user?.mobile_number}</p>
                </div>
                <div className="col_right" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ fontSize: "16px", lineHeight: "24px" }}>Shipped Date:</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", textAlign: "center", gap: "30px" }}>
                        {resData?.shippingDate ? (
                            <div>
                                <p style={{ fontSize: "16px", fontWeight: "600", lineHeight: "24px", color: "black" }}>{resData.shippingDate}</p>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", textAlign: "center", gap: "30px" }}>
                                    <input
                                        placeholder="(DD-MM-YYYY)"
                                        value={shippingDate}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 10) {
                                                setShippingDate(e.target.value);
                                            }
                                        }}
                                        style={{ padding: "5px" }}
                                    />
                                    <button type="submit" onClick={handleShippingDateUpdate}>
                                        Submit
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>Email:</p>
                    <p>{resData?.email}</p>
                </div>
                <div className="col_right" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ fontSize: "16px", lineHeight: "24px" }}>Tracking ID:</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", textAlign: "center", gap: "30px" }}>
                        {resData?.trackingId ? (
                            <div>
                                {/* Render shipping date */}
                                <p style={{ fontSize: "16px", fontWeight: "600", lineHeight: "24px", color: "black" }}>
                                    {resData.trackingId}-----{resData.deliveryPartner}
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // Handle form submission
                                    if (trackingId && deliveryPartner) {
                                        handleTrackingIdUpdate();
                                    } else {
                                        // Handle case where both inputs are required
                                        // You can display an error message or take appropriate action
                                        toast.error("Both Tracking ID and Delivery Partner are required.");
                                    }
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "10px" }}>
                                    <input
                                        placeholder="Enter Tracking Id"
                                        value={trackingId}
                                        onChange={(e) => {
                                            setTrackingId(e.target.value);
                                        }}
                                        style={{ padding: "5px" }}
                                    />
                                    <input
                                        placeholder="Enter Delivery Partner"
                                        value={deliveryPartner}
                                        onChange={(e) => {
                                            setDeliveryPartner(e.target.value);
                                        }}
                                        style={{ padding: "5px" }}
                                    />
                                    <button type="submit">Submit</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <div className="row__">
                <div className="col_left">
                    <p>GSTIN:</p>
                    <p>{resData?.gstin}</p>
                </div>
                <div className="col_right" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ fontSize: "16px", lineHeight: "24px" }}>Delivered Date:</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", textAlign: "center", gap: "30px" }}>
                        {resData?.deliveredDate ? (
                            <div>
                                {/* Render shipping date */}
                                <p style={{ fontSize: "16px", fontWeight: "600", lineHeight: "24px" }}>{resData.deliveredDate}</p>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // Handle form submission
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", textAlign: "center", gap: "30px" }}>
                                    <input
                                        placeholder="(DD-MM-YYYY)"
                                        value={deliveredDate}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 10) {
                                                setDeliveredDate(e.target.value);
                                            }
                                        }}
                                        style={{ padding: "5px" }}
                                    />
                                    <button type="submit" onClick={handleDeliveredDateUpdate}>
                                        Submit
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* <div className="row__">
                <div className="col_left">
                    <p>Address</p>
                    <p>
                        {resData?.address}, {resData?.town}, {resData?.state}- {resData?.pincode}
                    </p>
                </div>
                <div className="col_right">
                    <p>Delivery Status</p>
                    <select disabled={role === "calling" || role === "digital marketing" ? true : false} className="select" value={status} onChange={(e) => handleCHange(e.target.value)}>
                        <option value="placed" selected={status === "placed" ? true : false}>
                            Placed
                        </option>
                        <option selected={status === "pending" ? true : false} value="pending">
                            Pending
                        </option>
                        <option value="Dispatched" selected={status === "Dispatched" ? true : false}>
                            Processed
                        </option>
                        <option value="Delivered" selected={status === "Delivered" ? true : false}>
                            Delivered
                        </option>
                        <option value="cancelled" selected={status === "cancelled" ? true : false}>
                            Cancelled
                        </option>
                    </select>
                </div>
            </div> */}

            <div className="sub_header___">
                <div className="_btn_">
                    <div>
                        <p>Ordered Items</p>
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <DataTable
                            filterDisplay="row"
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={orderList}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column field="_id" header="ID" />
                            <Column header="Product Name" body={itemTemplate} style={{ textTransform: "capitalize", textAlign: "center" }}></Column>
                            <Column header="Model" body={modelTemplate} style={{ textTransform: "capitalize", textAlign: "center" }}></Column>
                            <Column field="packSize" header="Pack Size" style={{ textAlign: "center" }} />
                            <Column field="quantity" header="Quantity" style={{ textAlign: "center" }} />
                            <Column field="price" header="Price" />
                            <Column header="Created On" body={dateTemplate} />
                            {/* <Column header="Action" body={actionBodyTemplate} /> */}
                        </DataTable>
                    </div>
                </div>
            </div>

            <Dialog
                visible={displayModal}
                onHide={onHide}
                header="Verify Payment Modal"
                modal
                style={{ width: "50vw" }}
                footer={
                    <div>
                        <Button label="Verify Payment" className="p-button-success" onClick={handleVerifyClick} />
                        <Button label="Cancel" className="p-button-secondary" onClick={onHide} />
                    </div>
                }
            >
                
                <p>UTR Number: {resData?.utrNumber}</p>
                
            </Dialog>
        </>
    );
}

export default OrderDetail;
