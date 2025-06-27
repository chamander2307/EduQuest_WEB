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

  // Hàm này dùng để đồng bộ lại user sau khi cập nhật profile
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        setIsLogin(false);
        return;
      }
      const decoded = jwtDecode(token);
      const profile = await getInstructorProfile();
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
      setUser(null);
      setIsLogin(false);
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
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
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

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
