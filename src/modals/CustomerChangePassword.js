import React from "react";
import "../sass/modals/CustomerChangePassword.scss";

function CustomerChangePassword() {
  return (
    <div className="main">
      <div className="inner">
        <p>Customer-Change Password</p>
        <label>new password</label>
        <input type="password" />
        <label>confirm password</label>
        <input type="password" />
        <div className="btn_div">
          <button>cancel</button>
          <button>change</button>
        </div>
      </div>
    </div>
  );
}

export default CustomerChangePassword;
