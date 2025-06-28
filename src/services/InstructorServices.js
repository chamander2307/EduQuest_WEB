import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const updateInstructorProfile = async (profileData) => {
  try {
    const response = await instance.put("/update/profile", profileData);
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Cập nhật hồ sơ giảng viên") ||
        "Cập nhật thông tin giảng viên không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Cập nhật hồ sơ giảng viên") ||
        "Cập nhật thông tin giảng viên không thành công"
    );
  }
};

export const getInstructorProfile = async () => {
  try {
    const response = await instance.get("/Profile/me");
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Lấy hồ sơ giảng viên") ||
        "Không lấy được thông tin giảng viên"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Lấy hồ sơ giảng viên") ||
        "Không lấy được thông tin giảng viên"
    );
  }
};
