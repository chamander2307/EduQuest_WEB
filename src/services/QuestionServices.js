import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

export const getQuestionsByInstructor = async () => {
  try {
    const response = await instance.get(`/questions/created-by-me`);
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Lấy danh sách câu hỏi") ||
        "Không lấy được danh sách câu hỏi"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách câu hỏi") ||
        "Không lấy được danh sách câu hỏi"
    );
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await instance.post(`/questions/create`, questionData);
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Tạo câu hỏi") ||
        "Tạo câu hỏi không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Tạo câu hỏi") ||
        "Tạo câu hỏi không thành công"
    );
  }
};

export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await instance.put(
      `/questions/update/${questionId}`,
      questionData
    );
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Cập nhật câu hỏi") ||
        "Cập nhật câu hỏi không thành công"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Cập nhật câu hỏi") ||
        "Cập nhật câu hỏi không thành công"
    );
  }
};
