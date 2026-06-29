import React from "react";
import "../sass/components/header.scss";

const Header = () => {
    return (
        <div className="hdr_main">
            <div className="logo__">
                <img src="https://res.cloudinary.com/dd77cqt5fs/image/upload/v1664795515/logo_smaller_c8osen.svg" />
            </div>
            <div className="last__">
                <img src="https://res.cloudinary.com/dd77cqt5fs/image/upload/v1668409277/notif_paozd0.svg" />
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSdpyXOok1h3bju_d-AoNMkyYoKiFBUHxz3w&usqp=CAU" />
                <div>
                    <p>Robert Hawkins</p>
                    <p>Administrator</p>
                </div>
            </div>
        </div>
    );
};
export default Header;
