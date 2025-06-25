import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const updateInstructorProfile = async (profileData) => {
  try {
    const response = await instance.put("/update/me", profileData);
    const data = response.data;
    if (data?.data) {
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(
        message || "Cập nhật thông tin giảng viên không thành công"
      );
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Update instructor profile error:", error);
    throw new Error(
      message || "Cập nhật thông tin giảng viên không thành công"
    );
  }
};
export const getInstructorProfile = async () => {
  try {
    const response = await instance.get("/Profile/me");
    const data = response.data;
    if (data?.data) {
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Không lấy được thông tin giảng viên");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Get instructor profile error:", error);
    throw new Error(message || "Không lấy được thông tin giảng viên");
  }
};
