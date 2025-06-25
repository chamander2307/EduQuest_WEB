import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const refreshToken = async () => {
  try {
    const response = await instance.post("/auth/refresh");
    const data = response.data;
    if (data?.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data.accessToken;
    } else {
      throw new Error(
        getVietnameseMessage(data.code) || "Làm mới token không thành công"
      );
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    throw new Error(
      getVietnameseMessage(error.response?.data?.code) ||
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
    console.log("Register response:", data);
    console.log("Translated message:", getVietnameseMessage(data.code));

    if (data?.code === 201) {
      // Đăng ký thành công, trả về dữ liệu người dùng và thông điệp
      const message = getVietnameseMessage(data.code) || "Đăng ký thành công";
      return { user: data.data, message };
    } else {
      // Đăng ký thất bại
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Đăng ký không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Register error:", error);
    throw new Error(message || "Đăng ký không thành công");
  }
};

export const login = async (username, password) => {
  try {
    const response = await instance.post("/auth/login", { username, password });
    const data = response.data;
    if (data?.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Đăng nhập không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Login error:", error);
    throw new Error(message || "Đăng nhập không thành công");
  }
};

export const logout = async () => {
  try {
    await instance.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Logout error:", message);
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await instance.post("/auth/forgot-password", { email });
    const data = response.data;
    if (data?.success) {
      return data.message || "Yêu cầu đặt lại mật khẩu đã được gửi";
    }
    const code = data.code;
    const message = getVietnameseMessage(code);
    throw new Error(message || "Yêu cầu đặt lại mật khẩu không thành công");
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Forgot password error:", error);
    throw new Error(message || "Yêu cầu đặt lại mật khẩu không thành công");
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
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Xác thực OTP không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Verify OTP error:", error);
    throw new Error(message || "Xác thực OTP không thành công");
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
    const code = data.code;
    const message = getVietnameseMessage(code);
    throw new Error(message || "Đặt lại mật khẩu không thành công");
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Reset password error:", error);
    throw new Error(message || "Đặt lại mật khẩu không thành công");
  }
};

export const verifyRegisterOtp = async (username, otp) => {
  try {
    const response = await instance.post("/auth/verify-otp", { username, otp });
    const data = response.data;
    console.log("Verify OTP response:", data);

    if (data?.code === 200 && data?.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Xác thực OTP không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Verify OTP error:", error);
    throw new Error(message || "Xác thực OTP không thành công");
  }
};

export const resendOtp = async () => {
  try {
    const response = await instance.post("/auth/resend-otp");
    const data = response.data;
    if (data?.success) {
      return data.message || "OTP đã được gửi lại";
    }
    const code = data.code;
    const message = getVietnameseMessage(code);
    throw new Error(message || "Gửi lại OTP không thành công");
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Resend OTP error:", error);
    throw new Error(message || "Gửi lại OTP không thành công");
  }
};
