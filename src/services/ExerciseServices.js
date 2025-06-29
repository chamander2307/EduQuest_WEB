import axios from "../config/axios";
import instance from "../config/axios";
import { getVietnameseMessage } from "../constants/VietNameseStatus";

// Lấy danh sách bài tập của instructor theo lớp
export const getClassExercises = async (classId) => {
  try {
    const response = await axios.get(`/exercises/instructor/classes/${classId}/exercises`);
    return response.data;
  } catch (error) {
    console.error('Error fetching class exercises:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách bài tập');
  }
};

// Lấy kết quả bài tập của sinh viên
export const getExerciseResults = async (exerciseId) => {
  try {
    const response = await axios.get(`/exercises/${exerciseId}/results`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercise results:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải kết quả bài tập');
  }
};

// Lấy chi tiết bài làm của sinh viên (chỉ gọi API thật, không dùng mock)
export const getStudentExerciseDetail = async (participationId, token) => {
  try {
    const response = await axios.get(`/participations/${participationId}/student-detail`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data: response.data.data };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || `Lỗi ${error.response.status}`);
    }
    throw new Error('Không thể kết nối đến server.');
  }
};

// Lấy danh sách bài tập của giáo viên đã tạo
export const getExercisesByInstructor = async () => {
  try {
    const response = await instance.get("/exercises");
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Lấy danh sách bài tập") ||
        "Không lấy được danh sách bài tập"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Lấy danh sách bài tập") ||
        "Không lấy được danh sách bài tập"
    );
  }
};

export const getExercisesByClass = async (classId) => {
  try {
    const res = await instance.get(`/exercises/class/${classId}`);
    if (res.data?.data) return res.data.data;
    throw new Error(getVietnameseMessage(res.data.code, "Lọc bài tập theo lớp"));
  } catch (err) {
    throw new Error(getVietnameseMessage(err.response?.data?.code, "Lọc bài tập theo lớp") || "Không lấy được bài tập theo lớp");
  }
};


export const getExerciseDetail = async (exerciseId) => {
  try {
    const response = await instance.get(`/exercises/detail/${exerciseId}`);
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error(
      getVietnameseMessage(data.code, "Lấy chi tiết bài tập") ||
      "Không lấy được chi tiết bài tập"
    );
  } catch (error) {
    const code = error.response?.data?.code;
    throw new Error(
      getVietnameseMessage(code, "Lấy chi tiết bài tập") ||
      "Không lấy được chi tiết bài tập"
    );
  }
};

export const createExercise = async (exerciseData) => {
  try {
    const body = {
      name: exerciseData.name,
      classId: exerciseData.classId,
      durationMinutes: Number(exerciseData.durationMinutes),
      startAt: exerciseData.startAt,
      endAt: exerciseData.endAt,
      questionIds: Array.isArray(exerciseData.questionIds) ? exerciseData.questionIds : [],
    };
    const response = await instance.post("/exercises", body);
    const data = response.data;
    if (data?.data) {
      return data.data;
    }
    throw new Error("Tạo bài tập không thành công");
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Tạo bài tập không thành công"
    );
  }
};

