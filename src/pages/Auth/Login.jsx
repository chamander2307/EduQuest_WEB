import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login } from "../../services/AuthServices";
import { UserContext } from "../../contexts/InstructorContext";
import AuthLayout from "./AuthLayout";
import BackgroundImage from "../../assets/images/How_to_Motivate_Yourself_to_Study.webp";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(username, password);
      const { accessToken, refreshToken, ...userInfo } = data;

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
      toast.error(error.message || "Đăng nhập không thành công", {
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
    <AuthLayout title="Đăng nhập giảng viên" image={BackgroundImage}>
      <p className="auth__slogan">Hệ thống quản lý lớp học</p>

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

      <div className="auth__extra">
        <a href="#">Quên mật khẩu?</a>
        <br></br>
        <span>Chưa có tài khoản? </span>
        <a href="/register">Đăng ký ngay</a>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
