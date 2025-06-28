import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getInstructorProfile } from "../services/InstructorServices";
import { logout as performLogout } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Đưa init ra ngoài để dùng lại
  const init = async (withLoading = true) => {
    if (withLoading) setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      if (withLoading) setLoading(false);
      setUser(null);
      setIsLogin(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const profile = await getInstructorProfile();
      if (profile.role === "STUDENT") {
        setTimeout(() => {
          logout();
        }, 2000);
        return;
      }
      setUser({
        ...profile,
        id: decoded.sub,
        fullName: profile.name,
        avatarUrl:
          profile.avatarUrl ||
          `https://ui-avatars.com/api/?name=${profile.name}&background=random`,
      });
      setIsLogin(true);
    } catch (err) {
      console.error("Lỗi xác thực người dùng:", err);
      localStorage.removeItem("accessToken");
      setUser(null);
      setIsLogin(false);
      navigate("/login");
    } finally {
      if (withLoading) setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [navigate]);

  const refreshUser = async () => {
    await init(false);
  };

  const logout = async () => {
    try {
      await performLogout();
    } catch (e) {
      console.warn("Logout API failed, nhưng sẽ xóa local");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsLogin(false);
      navigate("/login");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLogin,
        loading,
        setUser,
        setIsLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};