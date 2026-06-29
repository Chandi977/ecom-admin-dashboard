import React from "react";
import "../sass/modals/addCustomer.scss";

function AddCustomer() {
  return (
    <div className="addCustomer_main">
      <div className="customer_inner">
        <p>add customer</p>
        <div>
          <div>
            <label>first name</label>
            <input />
            <label>email</label>
            <input type="email" />
            <label>password</label>
            <input type="password" />
            <label>select a profile photo</label>
            <input type="file" />
          </div>
          <div>
            <label>last name</label>
            <input />
            <label>contact number</label>
            <input />
            <label>confirm password</label>
            <input type="password" />
          </div>
        </div>
        <div className="btn_div">
          <button>cancel</button>
          <button>create</button>
        </div>
      </div>
    </div>
  );
}

export default AddCustomer;
