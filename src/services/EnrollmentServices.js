import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const getPendingEnrollments = async (classId) => {
  try {
    const response = await instance.get(
      `/enrollments/${classId}/pending-enrollments`
    );
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Lấy danh sách đăng ký chờ") ||
        "Không lấy được danh sách đăng ký chờ"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách đăng ký chờ") ||
        "Không lấy được danh sách đăng ký chờ"
    );
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
    }
    throw new Error(
      getVietnameseMessage(data.code, "Cập nhật trạng thái đăng ký") ||
        "Cập nhật trạng thái đăng ký không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Cập nhật trạng thái đăng ký") ||
        "Cập nhật trạng thái đăng ký không thành công"
    );
  }
};

export const removeEnrollment = async (enrollmentId) => {
  try {
    const response = await instance.delete(
      `/enrollments/${enrollmentId}/remove`
    );
    const data = response.data;
    if (data?.data === true) {
      return (
        getVietnameseMessage(data.code, "Xoá đăng ký") ||
        "Xoá đăng ký thành công"
      );
    }
    throw new Error(
      getVietnameseMessage(data.code, "Xoá đăng ký") ||
        "Xoá đăng ký không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Xoá đăng ký") ||
        "Xoá đăng ký không thành công"
    );
  }
};
