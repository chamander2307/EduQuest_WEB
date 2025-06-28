import instance from "../config/axios";
import { jwtDecode } from "jwt-decode";
import { getVietnameseMessage } from "../constants/VietNameseStatus";
import { toast } from "react-toastify";

export const refreshToken = async () => {
  try {
    const response = await instance.post("/auth/refresh-token");
    const data = response.data;
    if (data?.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Làm mới token") ||
        "Làm mới token không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Làm mới token") ||
        "Làm mới token không thành công"
    );
  }
};

export const register = async (username, name, email, password, isTeacher) => {
  try {
    const response = await instance.post("/auth/register", {
      username,
      name,
      email,
      password,
      isTeacher,
    });
    const data = response.data;
    if (data?.code === 201) {
      return {
        user: data.data,
        message: getVietnameseMessage(data.code) || "Đăng ký thành công",
      };
    }
    throw new Error(
      getVietnameseMessage(data.code, "Đăng ký") || "Đăng ký không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Đăng ký") || "Đăng ký không thành công"
    );
  }
};

export const login = async (username, password) => {
  try {
    const response = await instance.post("/auth/login", { username, password });
    const data = response.data;
    if (data?.data?.accessToken) {
      console.log("Login response data:", data);
      const decoded = jwtDecode(data.data.accessToken);
      console.log("Decoded token:", decoded);
      if (decoded?.role === "ROLE_STUDENT") {
        toast.error(
          "Tài khoản của bạn không có quyền truy cập vào hệ thống này. Vui lòng đăng nhập bằng tài khoản giáo viên."
        );
        return null;
      } else {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        return data.data;
      }
    }
    throw new Error(
      getVietnameseMessage(data.code, "Đăng nhập") ||
        "Đăng nhập không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Đăng nhập") || "Đăng nhập không thành công"
    );
  }
};

export const logout = async () => {
  try {
    await instance.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Đăng xuất") || "Đăng xuất không thành công"
    );
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await instance.post("/auth/forgot-password", { email });
    const data = response.data;
    if (data?.success) {
      return data.message || "Yêu cầu đặt lại mật khẩu đã được gửi";
    }
    throw new Error(
      getVietnameseMessage(data.code, "Đặt lại mật khẩu") ||
        "Yêu cầu đặt lại mật khẩu không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Đặt lại mật khẩu") ||
        "Yêu cầu đặt lại mật khẩu không thành công"
    );
  }
};

export const verifyOtpForgotPassword = async (otp) => {
  try {
    const response = await instance.post("/auth/verify-otp-forgot-password", {
      otp,
    });
    const data = response.data;
    if (data?.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Xác thực OTP") ||
        "Xác thực OTP không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Xác thực OTP") ||
        "Xác thực OTP không thành công"
    );
  }
};

export const resetPassword = async (newPassword) => {
  try {
    const response = await instance.post("/auth/reset-password", {
      newPassword,
    });
    const data = response.data;
    if (data?.success) {
      return data.message || "Đặt lại mật khẩu thành công";
    }
    throw new Error(
      getVietnameseMessage(data.code, "Đặt lại mật khẩu") ||
        "Đặt lại mật khẩu không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Đặt lại mật khẩu") ||
        "Đặt lại mật khẩu không thành công"
    );
  }
};

export const verifyRegisterOtp = async (username, otp) => {
  try {
    const response = await instance.post("/auth/verify-otp", { username, otp });
    const data = response.data;
    if (data?.code === 200 && data?.data === true) {
      return data.message || "Xác thực OTP thành công";
    }
    throw new Error(
      getVietnameseMessage(data.code, "Xác thực OTP") ||
        "Xác thực OTP không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Xác thực OTP") ||
        "Xác thực OTP không thành công"
    );
  }
};

export const resendOtp = async (username) => {
  try {
    const response = await instance.post("/auth/resend-otp", { username });
    const data = response.data;
    if (data?.code === 200 && data?.data === true) {
      return data.message || "OTP đã được gửi lại";
    }
    throw new Error(
      getVietnameseMessage(data.code, "Gửi lại OTP") ||
        "Gửi lại OTP không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Gửi lại OTP") ||
        "Gửi lại OTP không thành công"
    );
  }
};
