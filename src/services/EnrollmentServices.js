import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";


export const getPendingEnrollments = async (classId) => {
  try {
    const response = await instance.get(`/enrollments/${classId}/pending-enrollments`);
    const data = response.data;
    if (data?.data) {
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Không lấy được danh sách đăng ký chờ");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Get pending enrollments error:", error);
    throw new Error(message || "Không lấy được danh sách đăng ký chờ");
  }
};

export const updateEnrollmentStatus = async (enrollmentId, status) => {
  try {
    const response = await instance.put("/enrollments/approve", {
      enrollmentId,
      status,
    });
    const data = response.data;
    if (data?.data) {
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Cập nhật trạng thái đăng ký không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Update enrollment status error:", error);
    throw new Error(message || "Cập nhật trạng thái đăng ký không thành công");
  }
};