import axios from "../config/axios";

// Lấy danh sách bài tập của instructor theo lớp
export const getClassExercises = async (classId) => {
  try {
    const response = await axios.get(`/exam/instructor/classes/${classId}/exercises`);
    return response.data;
  } catch (error) {
    console.error('Error fetching class exercises:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách bài tập');
  }
};

// Lấy kết quả bài tập của sinh viên
export const getExerciseResults = async (exerciseId) => {
  try {
    const response = await axios.get(`/exam/${exerciseId}/results`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercise results:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải kết quả bài tập');
  }
};
