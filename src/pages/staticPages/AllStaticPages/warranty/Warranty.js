import React from "react";
import "./warranty.scss";

const Warranty = ({ data }) => {
    return (
        <>
            <div className="main">
                <p className="hding">Order & Refunds</p>
                <p className="heading">Areas of Delivery and Fitment</p>
                <ul>
                    <li>Tyrewaale provides you DOORSTEP TYRE FITTING all over Delhi-NCR.</li>
                    <li>We deliver tyres at your doorstep if you live in any part of India.</li>
                    <li>We are expanding our fitment services to other cities in India at the moment and in addition to that we will be adding locations for mobile tyre services soon.</li>
                </ul>
                <p className="heading">Service Charges</p>
                <p className="sub_text">We certainly believe in providing efficient, proactive and transparent services and hence there are no hidden costs or handling charges.</p>
                <ul>
                    <li>A fixed amount of fitment fee is charged on ordering 2 tyres (i.e ₹ 250/tyre inclusive of tyre balancing & fitment).</li>
                    <li>On ordering 3 or more tyres, you get to enjoy free fitment service and just pay for the tyres.</li>
                    <li>Delivery outside Delhi-NCR costs you only ₹ 250/tyre extra.</li>
                    <li>Orders with only a single tyre will only be delivered at your doorstep with an added convenience charge of ₹ 150/tyre in Delhi NCR (Fitment and Installation charges are borne by the consumer).</li>
                </ul>
                <p className="heading">Payments</p>
                <ul>
                    <li>When you opt for COD (Cash on Delivery)/ POD (Pay on Delivery) as your payment mode, you are required to make an initial payment of at least ₹500/- as a security fees.</li>
                    <li>This amount is later deducted from your overall bill at the time of delivery or is refunded (in case of cancellation of order which is to be done within 6 hours of your initial payment). The initial payment is also visible to you on the site when you checkout.</li>
                    <li>The amount can be paid by any Debit/Credit Card issued by Visa or Mastercard and are secured by a third-party payment gateway.</li>
                    <li>The balance bill has to be paid to our service crew member prior to the fitment and can be done through either Cash or Visa/Mastercard issued Debit or Credit Card or even through UPI.</li>
                    <li>Tyrewaale does not accept cheques or demand drafts and hence, we request you to keep yourself available with the required payment mode at the time of delivery.</li>
                </ul>
                <p className="heading">Service Appointment</p>
                <p className="sub_text">
                    After you are done with placing your order and execution of payment, our customer service team shall contact you for the confirmation of date and time of the service that you choose. Our crew member will get in touch with you before the delivery.<br></br>
                    Please go through these details before scheduling the visit:
                </p>
                <ul>
                    <li>
                        Please ensure that the location you chose on the delivery location tracker be correct, and the parking space has enough spare space for our service crew vehicle. In case, any former permission is required for vehicles to enter the premises, please obtain the permission before
                        hand.
                    </li>
                    <li>Please ensure that our service crew is allowed to work on your vehicle, including hoisting it on supports, clamps and jacks. Usually, Multi-level parking lots are not preferable for apt service.</li>
                    <li>Please keep yourself ready with your preferred payment method and enough fund for the bill.</li>
                    <li>You have the liberty to reschedule the appointment at most 2 times, provided you give us a call at least 6 hours before the scheduled time for servicing your vehicle.</li>
                </ul>
                <div className="flex__">
                    <div>
                        <p className="heading">Order Cancellation</p>
                        <p className="sub_text">Please ensure that if you wish to cancel an order for any unforeseen reasons, give us a call on our customer service contact for cancellation at least 12 hours prior to the scheduled time for service.</p>
                    </div>
                    <div>
                        <p className="heading">Refunding Process</p>
                        <p className="sub_text">For cancellations made 24 hours after the order is placed, we will deduct 3.5% of the total amount and rest will be refunded within 5-7 working days. If you cancel your order within 12 hours of order placement, your full payment will be refunded.</p>
                    </div>
                </div>
                <p className="heading">Refund Policy for Customers who are NOT based in Delhi-NCR</p>
                <ul>
                    <li>For cancellations made 24 hours after the order is placed, we will deduct 3.5% of the total amount and rest will be refunded within 5-7 working days.</li>
                    <li>In case the order is dispatched from our warehouses and then it is cancelled by your end, we will deduct 15% of total amount i.e restocking charges + 3.5 % service charges + shipping charges hence it will be borne by the customer.</li>
                    <li>The balance amount after deduction will be refunded within 5-7 working days after the tyres are received in our warehouse .</li>
                    <li>In case of returns, the amount will only be refunded if there is some genuine fault in our tyres or the tyres do not match the specifications of which you’ve placed the order on our website.</li>
                </ul>
                <p className="heading">Return Policy</p>
                <ul>
                    <li>
                        While we take utmost care of products that are being shipped to you, we highly recommend the customers to verify the products and its specifications such as size, date of manufacture, model ISI mark etc. immediately after the delivery. This will ensure your complete
                        satisfaction in the product before fitting it in your vehicle.
                    </li>
                    <li>
                        In case you are not satisfied with the tyre’s condition or if there is any discrepancy in the tyre, brand, model or manufacturing date, you are requested to let our service crew member know about this at the moment only and we shall be obliged to provide you the replacement
                        for that product. Please ensure that the issue you have faced is genuine to proceed with your replacement.
                    </li>
                    <li>
                        If your product is under the warranty period, you can avail a “service tyre” in lieu of its product for the time at Rs. 300-1000/tyre (depending on tyre type which will not include fitment and balancing of the service tyre and will only include delivery of the service tyre
                        and pick up of the defected tyres), for the convenience and use by the customer. Hence, establishing end to end customer service.
                    </li>
                    <li>
                        If your product gets replaced from the tyre manufacturer, service charge of Rs. 300-1000/ tyre ( depending on tyre type) shall be waived off and refunded as credit amount in your account within 5-6 working days. If during this time of use by the customer , the tyre gets
                        damaged, the customer will have to pay double the amount of tyre charged by us, in order to compensate the same.
                    </li>
                    <li>Please note that once the fitment of tyre is executed in your vehicle, we shall not be accepting any returns other than the warranty claims mentioned by the brand.</li>
                </ul>
                <p className="hding">Warranty</p>
                <p className="sub_text">All tyres available on tyrewaale.com come with their respective Manufacturer Warranty as per their policies.</p>
                <div className="flex__">
                    <div>
                        <p className="heading">Unconditional Warranty</p>
                        <ul>
                            <li>As name suggests, it’s unconditional, hence this warranty covers any damage that may happen to the tyre.</li>
                            <li>The tyre is replaced by the manufacturer itself only after the inspection according to the warranty policy of the company.</li>
                            <li>Customers get to enjoy Unconditional warranty up to 50% wear or for 2 years from date of purchase, whichever is earlier.</li>
                            <li>Customers are requested to refer to the warranty policy of manufacturing company of the tyre purchased in case of any discrepancies.</li>
                        </ul>
                    </div>
                    <div>
                        <p className="heading">Manufacturer Warranty</p>
                        <ul>
                            <li>Under this warranty, all manufacturing defects such as joint issues, thread issue etc. are fully covered.</li>
                            <li>In case of any defects, the tyre will be inspected by the manufacturing company and will be replaced by the same.</li>
                        </ul>
                    </div>
                </div>
                <p className="heading">Simple steps to claim your warranty</p>
                <ol className="ol_">
                    <li>First, you will need to contact tyrewaale.com with original bill/purchase invoice proof to initiate the process.</li>
                    <li>After that, you will need to provide claim adjustment details as demanded by tyrewaale.com via through your registered mail.</li>
                    <li>Then you can deliver the tyre to tyrewaale.com (freight cost will be borne by us).</li>
                    <li>Tyrewaale.com will hand over the claimed defected tyre to the Tyre Manufacturer for inspection and claim processing. Eligibility for coverage under the warranty will be decided by Manufacturer and not by tyrewaale.com.</li>
                    <li>Tyre manufacturers generally adjust claimed tyres on pro-rata basis. In other words, they calculate the amount to be compensated based on remaining tread depth measurement.</li>
                    <li>Claim rejected tyre remains the property of the customer. Tyrewaale.com will not be responsible/liable for loss or damage.</li>
                    <li>Claim approved tyre will become the property of the respective tyre manufacturer.</li>
                    <li>All applicable charges and taxes shall be borne by the customer.</li>
                    <li>
                        Any decision made by the respective tyre manufacturer regarding the claim will be sole and final.
                        <ul>
                            <li>Kindly understand that warranty is not given by Tyrewaale on any of the products available on its website tyrewaale.com</li>
                            <li>Warranties are decided and executed by the Manufacturer of respective product; as per their companies’ guidelines and policies.</li>
                            <li>Decision made by Manufacturers; regarding any claim will be sole and final.</li>
                            <li>Tyrewaale.com supports and assists you during your claim procedure.</li>
                        </ul>
                    </li>
                </ol>
                <p className="heading">Miscellaneous </p>
                <p className="sub_text">
                    This Website is intended exclusively for residents of India. The Company makes no representations that materials on this Website are appropriate or available for use in other locations. Those who choose to access this Website from other locations do so at their own risk and are
                    responsible for compliance with any and all local laws, if and to the extent local laws are applicable.<br></br>
                    The failure of the Company to exercise or enforce any right or provision of these Website Conditions will not constitute a waiver of such right or provision.<br></br>
                    The Company may perform any of its obligations or exercise any of its rights hereunder by itself or where applicable through any other persons (legal or otherwise) or entities.<br></br>
                    The Company may assign the Contract with you or sub-contract the whole, or any part thereof to any other person (legal or otherwise) or entity. Unless otherwise agreed in writing, you may not assign either the benefit or the burden of any contract with the Company.
                </p>
            </div>
        </>
    );
};

export default Warranty;
