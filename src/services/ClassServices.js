import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const getInstructorClasses = async () => {
  try {
    const response = await instance.get("/classes/instructors");
    const data = response.data;
    if (data?.data) {
      return data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Lấy danh sách lớp học") ||
        "Không lấy được danh sách lớp học"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách lớp học") ||
        "Không lấy được danh sách lớp học"
    );
  }
};

export const createClass = async (classData) => {
  try {
    const response = await instance.post("/classes/create", classData);
    const data = response.data;
    if (data?.data) {
      return data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Tạo lớp học") ||
        "Tạo lớp học không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Tạo lớp học") ||
        "Tạo lớp học không thành công"
    );
  }
};

export const getClassStudents = async (classId) => {
  try {
    const response = await instance.get(`/classes/${classId}/students`);
    const data = response.data;
    if (data?.data) {
      return data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Lấy danh sách sinh viên") ||
        "Không lấy được danh sách sinh viên"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách sinh viên") ||
        "Không lấy được danh sách sinh viên"
    );
  }
};

export const getClassesByInstructor = async () => {
  try {
    const response = await instance.get("/classes/instructors/simple");
    const data = response.data;
    if (data?.data) return data.data;
    throw new Error("Không lấy được danh sách lớp");
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Không lấy được danh sách lớp"
    );
  }
};
