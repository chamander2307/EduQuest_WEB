import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const getInstructorClasses = async () => {
  try {
    const response = await instance.get("/classes/instructors");
    const data = response.data;
    if (data?.data) {
      return data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Không lấy được danh sách lớp học");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Get instructor classes error:", error);
    throw new Error(message || "Không lấy được danh sách lớp học");
  }
};

export const createClass = async (classData) => {
  try {
    const response = await instance.post("/classes/create", classData);
    const data = response.data;
    if (data?.data) {
      return data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Tạo lớp học không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Create class error:", error);
    throw new Error(message || "Tạo lớp học không thành công");
  }
};
