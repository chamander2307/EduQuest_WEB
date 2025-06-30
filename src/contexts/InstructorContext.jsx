import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getInstructorProfile } from "../services/InstructorServices";
import {
  logout as performLogout,
  refreshToken,
} from "../services/AuthServices";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const init = async (withLoading = true) => {
    if (withLoading) setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    const refreshTokenValue = localStorage.getItem("refreshToken");

    // Nếu không có accessToken nhưng có refreshToken, thử làm mới
    if (!accessToken && refreshTokenValue) {
      try {
        console.log("Thử làm mới token vì không có accessToken");
        const tokenData = await refreshToken();
        if (tokenData?.accessToken) {
          localStorage.setItem("accessToken", tokenData.accessToken);
          const decoded = jwtDecode(tokenData.accessToken);
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
        } else {
          throw new Error("Không nhận được accessToken mới");
        }
      } catch (err) {
        console.error("Lỗi làm mới token:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setIsLogin(false);
        navigate("/login");
      } finally {
        if (withLoading) setLoading(false);
      }
      return;
    }

    // Nếu có accessToken, tiếp tục như trước
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
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
        localStorage.removeItem("refreshToken");
        setUser(null);
        setIsLogin(false);
        navigate("/login");
      } finally {
        if (withLoading) setLoading(false);
      }
    } else {
      // Nếu không có cả accessToken và refreshToken
      if (withLoading) setLoading(false);
      setUser(null);
      setIsLogin(false);
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
    // eslint-disable-next-line no-unused-vars
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
