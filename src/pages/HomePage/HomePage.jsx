import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../../contexts/InstructorContext";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { isLogin } = useContext(UserContext);

  return (
    <div className="container mx-auto px-4">
      <section
        className="hero-section py-16 text-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://www.educatetogether.ie/app/uploads/2020/10/EthicalEducationUpdated.png')",
        }}
      >
        <div className="bg-black bg-opacity-50 py-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Hệ thống Quản lý Giáo dục Hiện đại
          </h1>
          <p className="text-xl text-white mb-6 max-w-2xl mx-auto">
            Dễ dàng quản lý lớp học, tạo câu hỏi trắc nghiệm, và duyệt học sinh
            với giao diện thân thiện.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(isLogin ? "/classes" : "/login")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
            >
              {isLogin ? "Quản lý ngay" : "Đăng nhập ngay"}
            </button>
            <button
              onClick={() => navigate(isLogin ? "/questions" : "/classes")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              {isLogin ? "Khám phá thêm" : "Tìm hiểu thêm"}
            </button>
          </div>
        </div>
      </section>

      <section className="features-section py-12">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Tính năng nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="feature-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-center">
            <img
              src="https://www.euroschoolindia.com/blogs/wp-content/uploads/2023/10/classroom-management-strategies-and-techniques.jpg"
              alt="Quản lý lớp học"
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Quản lý lớp học
            </h3>
            <p className="text-gray-500 mb-4">
              Tạo, quản lý, và theo dõi lớp học dễ dàng với các công cụ mạnh mẽ.
            </p>
            <button
              onClick={() => navigate("/classes")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isLogin ? "Truy cập ngay" : "Tìm hiểu thêm"}
            </button>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWBQGPeTtJ0LAHbZZ7-yyUQrI6Bw5Dkj2Y5A&s"
              alt="Quản lý câu hỏi"
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Quản lý câu hỏi
            </h3>
            <p className="text-gray-500 mb-4">
              Tạo và chỉnh sửa câu hỏi trắc nghiệm với các mức độ khó khác nhau.
            </p>
            <button
              onClick={() => navigate("/questions")}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              {isLogin ? "Truy cập ngay" : "Tìm hiểu thêm"}
            </button>
          </div>
          <div className="feature-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpyMsl16VlNh5GCWD7gWuusaTErWpKeXDymg&s"
              alt="Quản lý học sinh"
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Quản lý học sinh
            </h3>
            <p className="text-gray-500 mb-4">
              Quản lý và duyệt đăng ký học sinh nhanh chóng, hiệu quả.
            </p>
            <button
              onClick={() => navigate("/classes")}
              className="text-yellow-600 hover:text-yellow-800 font-medium"
            >
              {isLogin ? "Truy cập ngay" : "Tìm hiểu thêm"}
            </button>
          </div>
        </div>
      </section>

      <section className="about-section py-12 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Về hệ thống</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Hệ thống Quản lý Giáo dục được thiết kế để hỗ trợ giáo viên tối ưu hóa
          công việc giảng dạy, từ quản lý lớp học đến tạo bài kiểm tra và duyệt
          học sinh. Với giao diện thân thiện và các tính năng mạnh mẽ, chúng tôi
          giúp bạn tập trung vào việc truyền đạt kiến thức.
        </p>
        <button
          onClick={() => navigate(isLogin ? "/classes" : "/login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
        >
          {isLogin ? "Quản lý ngay" : "Bắt đầu ngay"}
        </button>
      </section>

      <footer className="footer py-6 bg-gray-800 text-white text-center">
        <p>© 2025 EduQuest - Hệ thống Quản lý Giáo dục. All rights reserved.</p>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default HomePage;
