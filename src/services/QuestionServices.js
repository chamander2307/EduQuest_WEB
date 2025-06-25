import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const getQuestionsByInstructor = async () => {
  try {
    const response = await instance.get(`/questions/created-by-me`);
    const data = response.data;
    if (data?.data) {
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Không lấy được danh sách câu hỏi");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Get questions by instructor error:", error);
    throw new Error(message || "Không lấy được danh sách câu hỏi");
  }
};
export const createQuestion = async (questionData) => {
  try {
    const response = await instance.post(`/questions/create`, questionData);
    const data = response.data;
    if (data?.data) {
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Tạo câu hỏi không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Create question error:", error);
    throw new Error(message || "Tạo câu hỏi không thành công");
  }
};
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await instance.put(
      `/questions/${questionId}`,
      questionData
    );
    const data = response.data;
    if (data?.data) {
      return data.data;
    } else {
      const code = data.code;
      const message = getVietnameseMessage(code);
      throw new Error(message || "Cập nhật câu hỏi không thành công");
    }
  } catch (error) {
    const code = error.response?.data?.code;
    const message = getVietnameseMessage(code);
    console.error("Update question error:", error);
    throw new Error(message || "Cập nhật câu hỏi không thành công");
  }
};
