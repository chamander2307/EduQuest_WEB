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
