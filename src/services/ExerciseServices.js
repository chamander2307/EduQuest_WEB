import axios from "../config/axios";
import { mockStudentExerciseDetail } from "../pages/Exercise/data/mockData";

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

// Lấy chi tiết bài làm của sinh viên (sử dụng mock data)
export const getStudentExerciseDetail = async (participationId) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clone mock data và update participationId
    const responseData = {
      ...mockStudentExerciseDetail,
      data: {
        ...mockStudentExerciseDetail.data,
        participationId: parseInt(participationId)
      }
    };
    
    console.log('Using mock data for participationId:', participationId);
    return responseData;
  } catch (error) {
    console.error('Error with mock data:', error);
    throw new Error('Không thể tải chi tiết bài làm (mock data)');
  }
};
