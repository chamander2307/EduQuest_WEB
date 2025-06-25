import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import {
  register,
  verifyRegisterOtp,
  resendOtp,
} from "../../services/AuthServices";
import { UserContext } from "../../contexts/InstructorContext";
import AuthLayout from "./AuthLayout";
import BackgroundImage from "../../assets/images/How_to_Motivate_Yourself_to_Study.webp";
import OtpInput from "../../components/OtpInput/OtpInput";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useContext(UserContext);

  const [step, setStep] = useState("register");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const validateInput = () => {
    if (!username || username.length < 3 || username.length > 50) {
      toast.error("Tên tài khoản phải từ 3 đến 50 ký tự", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }

    if (!name || name.length < 2 || name.length > 100) {
      toast.error("Họ và tên phải từ 2 đến 100 ký tự", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Email không hợp lệ", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      toast.error(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt, và tối thiểu 8 ký tự",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return false;
    }

    // Kiểm tra confirmPassword
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    try {
      await register(username, name, email, password, true);
      toast.success("Đăng ký thành công! Vui lòng nhập mã OTP.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setStep("otp");
    } catch (error) {
      toast.error(error.message || "Đăng ký không thành công", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const data = await verifyRegisterOtp(otp);
      const { accessToken, refreshToken, ...userInfo } = data;

      setUser({ ...userInfo, fullName: userInfo.name });
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
      await resendOtp();
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
      title={step === "register" ? "Đăng ký tài khoản" : "Xác thực OTP"}
      image={BackgroundImage}
    >
      <p className="auth__slogan">Hệ thống quản lý lớp học</p>

      {step === "register" ? (
        <form className="auth__form" onSubmit={handleRegister}>
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
            <i className="fa fa-user" />
            <input
              type="text"
              placeholder="Họ và tên"
              className="auth__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-icon">
            <i className="fa fa-envelope" />
            <input
              type="email"
              placeholder="Email"
              className="auth__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="input-icon">
            <i className="fa fa-lock" />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              className="auth__input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Đăng ký</button>
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

      {step === "register" && (
        <div className="auth__extra">
          <a href="/login">Đã có tài khoản? Đăng nhập</a>
        </div>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
