import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import {
  login,
  verifyRegisterOtp,
  resendOtp,
} from "../../services/AuthServices";
import { UserContext } from "../../contexts/InstructorContext";
import AuthLayout from "./AuthLayout";
import BackgroundImage from "../../assets/images/How_to_Motivate_Yourself_to_Study.webp";
import { toast } from "react-toastify";
import OtpInput from "../../components/OtpInput/OtpInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useContext(UserContext);

  const [step, setStep] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(username, password);
      if(data === null) {
        return;
      }
      console.log("Đăng nhập thành công:", data);
      const {  ...userInfo } = data;
      console.log("Đăng nhập thành công:", data);

      setUser(userInfo);
      setIsLogin(true);

      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate("/classes");
    } catch (error) {
      if (error.message === "Người dùng chưa được xác thực") {
        console.log("Chuyển sang bước OTP");
        toast.info("Vui lòng nhập mã OTP để xác thực.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setStep("otp");
        // Gọi resendOtp ngay khi hiển thị giao diện OTP
        try {
          await resendOtp(username);
          toast.success("OTP đã được gửi!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } catch (resendError) {
          toast.error(resendError.message || "Gửi OTP không thành công", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else {
        toast.error(error.message || "Đăng nhập không thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const data = await verifyRegisterOtp(username, otp);
      const {  ...userInfo } = data;

      setUser(userInfo);
      setIsLogin(true);

      toast.success("Xác thực OTP thành công! Chào mừng bạn!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate("/classes");
    } catch (error) {
      toast.error(error.message || "Xác thực OTP không thành công", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(username);
      toast.success("OTP đã được gửi lại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error(error.message || "Gửi lại OTP không thành công", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <AuthLayout
      title={step === "login" ? "Đăng nhập giảng viên" : "Xác thực OTP"}
      image={BackgroundImage}
    >
      <p className="auth__slogan">Hệ thống quản lý lớp học</p>

      {step === "login" ? (
        <form className="auth__form" onSubmit={handleLogin}>
          <div className="input-icon">
            <i className="fa fa-user" />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="auth__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-icon">
            <i className="fa fa-lock" />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="auth__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Đăng nhập</button>
        </form>
      ) : (
        <>
          <OtpInput
            value={otp}
            onChange={setOtp}
            onSubmit={handleVerifyOtp}
            title="Nhập mã OTP"
          />
          <div className="auth__extra">
            <button
              type="button"
              className="resend-otp"
              onClick={handleResendOtp}
            >
              Gửi lại OTP
            </button>
          </div>
        </>
      )}

      {step === "login" && (
        <div className="auth__extra">
          <a href="#">Quên mật khẩu?</a>
          <br />
          <span>Chưa có tài khoản? </span>
          <a href="/register">Đăng ký ngay</a>
        </div>
      )}
    </AuthLayout>
  );
};

export default LoginPage;
