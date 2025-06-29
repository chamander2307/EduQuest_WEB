import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { UserContext } from "../../contexts/InstructorContext";
import Logo from "../../assets/images/Eduquest.svg";

const Header = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const userRef = useRef();

  const { isLogin, user, logout } = useContext(UserContext);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
     setAvatarError(false);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user?.avatarUrl]);
  const [avatarError, setAvatarError] = useState(false);
  const isValidAvatarUrl = (url) => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    if (url.trim() === "" || url === "null" || url === "undefined") return false;
    if (url.startsWith("http") || url.startsWith("/")) return true;
    return false;
  };
  const handleLogout = async () => {
    await logout();
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Lấy chữ cái đầu của tên người dùng cho avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "I";
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src={Logo} alt="Logo" className="logo-img" />
            <span className="logo-text">EduQuest</span>
          </Link>

          <nav className={`nav-combined ${isNavOpen ? "active" : ""}`}>
            <Link to="/classes" className="nav-item">
              Lớp học
            </Link>
            <Link to="/exercise-results" className="nav-item">
              Kết quả bài tập
            </Link>
            <Link to="/questions" className="nav-item">
              Câu hỏi
            </Link>
          </nav>
        </div>

        <div className="account-area">
          {isLogin ? (
            <div
              className="user-info username-hover"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              ref={userRef}
            >
              <div className="user-avatar">
                  {isValidAvatarUrl(user?.avatarUrl) && !avatarError ? (
                    <img
                      src={
                        user.avatarUrl.startsWith("http")
                          ? user.avatarUrl
                          : `http://localhost:8080${user.avatarUrl}`
                      }
                      alt=""
                      className="user-avatar-img"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="user-avatar-placeholder">
                      {getInitial(user?.fullName || "Instructor")}
                    </span>
                )}
              </div>
              <span className="username">{user?.fullName || "Instructor"}</span>
              {showUserDropdown && (
                <div className="dropdown-menu user-dropdown">
                  <Link to="/profile">Tài khoản</Link>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register" style={{ marginLeft: 12 }}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        <div className="hamburger" onClick={toggleNav}>
          ☰
        </div>
      </div>
    </header>
  );
};

export default Header;
