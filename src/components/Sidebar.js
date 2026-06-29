import React from "react";
import "../sass/components/sideBar.scss";
import { AiOutlineUser } from "react-icons/ai";
import { MdManageSearch } from "react-icons/md";
import { MdOutlineFeaturedPlayList } from "react-icons/md";
import { BsQuestionSquare } from "react-icons/bs";
import { MdOutlineRateReview } from "react-icons/md";
import { VscFeedback } from "react-icons/vsc";
import { FiShoppingCart } from "react-icons/fi";
import { AiOutlineDownload } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

function SideBar() {
  const navigate = useNavigate();
  const handleCustomers = () => {
    navigate("/customers");
  };
  const handleDashboard = () => {
    navigate("/");
  };
  const handleTransactions = () => {
    navigate("/transactions");
  };
  const handleReview = () => {
    navigate("/reviews");
  };
  const handleOrders = () => {
    navigate("/orders");
  };
  const handleFeedbacks = () => {
    navigate("/feedbacks");
  };
  const handleEnquirey = () => {
    navigate("/enquirey");
  };
  const handleBackup = () => {
    navigate("/backup");
  };
  const handleFeatures = () => {
    navigate("/features");
  };
  return (
    <div className="sideBar_main">
      <div>
        <div className="button_" onClick={handleDashboard}>
          <img src="https://res.cloudinary.com/dd77cqt5fs/image/upload/v1668414536/Vector_ivajja.svg" />
          <p>dashboard</p>
        </div>
      </div>
      <div>
        <div className="button_" onClick={handleCustomers}>
          <p>
            <AiOutlineUser />
          </p>
          <p>customers</p>
        </div>
      </div>
      <div>
        <select name="tyres" className="select__">
          <option>Tyre Brands</option>
          <option>Tyre Pattern</option>
          <option>Tyre</option>
        </select>
        <select name="vehicles" className="select__">
          <option>Vehicles</option>
        </select>
      </div>
      <div>
        <div className="flex__">
          <p>
            <MdManageSearch />
          </p>
          <select name="manage" className="select__">
            <option>Manage</option>
          </select>
        </div>
        <div className="button_" onClick={handleFeatures}>
          <p>
            <MdOutlineFeaturedPlayList />
          </p>
          <p>features</p>
        </div>
        <div className="button_" onClick={handleEnquirey}>
          <p>
            <BsQuestionSquare />
          </p>
          <p>enquiry</p>
        </div>
        <div className="button_" onClick={handleReview}>
          <p>
            <MdOutlineRateReview />
          </p>
          <p>review</p>
        </div>
        <div className="button_" onClick={handleFeedbacks}>
          <p>
            <VscFeedback />
          </p>
          <p>feedbacks</p>
        </div>
      </div>
      <div>
        <div className="button_" onClick={handleOrders}>
          <p>
            <FiShoppingCart />
          </p>
          <p>orders</p>
        </div>
        <div className="button_" onClick={handleTransactions}>
          <img src="https://res.cloudinary.com/dd77cqt5fs/image/upload/v1668417959/Group_31_ghqt5i.svg" />
          <p>transactions</p>
        </div>
      </div>
      <div>
        <div className="button_" onClick={handleBackup}>
          <p>
            <AiOutlineDownload />
          </p>
          <p>backup</p>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
