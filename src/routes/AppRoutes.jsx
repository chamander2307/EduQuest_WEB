import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../contexts/InstructorContext";

import LoginPage from "../pages/Auth/Login";
import RegisterPage from "../pages/Auth/Register";
import ClassManagementPage from "../pages/Classes/ClassManagementPage";
import ClassDetailPage from "../pages/Classes/ClassDetailPage";
import QuestionManagementPage from "../pages/Question/QuestionManagementPage";
import HomePage from "../pages/HomePage/HomePage";
import StudentManagementPage from "../pages/Students/StudentManagementPage";
import ExerciseResultsPage from "../pages/Exercise/ExerciseResultsPage";

const ProtectedRoute = ({ element }) => {
  const { isLogin, loading } = useContext(UserContext);

  if (loading) return <div>Đang tải...</div>;

  return isLogin ? element : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<HomePage />} />

      {/* Protected routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/classes"
        element={<ProtectedRoute element={<ClassManagementPage />} />}
      />
      <Route
        path="/classes/:classId"
        element={<ProtectedRoute element={<ClassDetailPage />} />}
      />
      <Route
        path="/questions"
        element={<ProtectedRoute element={<QuestionManagementPage />} />}
      />
      <Route
        path="/students"
        element={<ProtectedRoute element={<StudentManagementPage />} />}
      />
      <Route
        path="/exercise-results"
        element={<ProtectedRoute element={<ExerciseResultsPage />} />}
      />
    </Routes>
  );
};

export default AppRoutes;
