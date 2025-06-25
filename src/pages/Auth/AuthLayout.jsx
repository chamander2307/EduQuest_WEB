import React from "react";
import "./Login.css";
import Logo from "./Logo.jsx";

const AuthLayout = ({ children, title, image }) => {
  return (
    <>
      <div className="auth auth--split">
        <div
          className="auth__left"
          style={{
            backgroundImage: `url(${image || "/images/login-bg.png"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "60%",
            height: "100vh",
          }}
        ></div>

        <div className="auth__right" style={{ width: "40%" }}>
          <div className="auth__form-box">
            <div className="auth__logo-wrapper">
              <Logo />
            </div>
            {title && <h2 className="auth__title">{title}</h2>}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
