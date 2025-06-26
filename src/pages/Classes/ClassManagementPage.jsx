import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/InstructorContext";
import {
  getInstructorClasses,
  createClass,
} from "../../services/ClassServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ClassManagementPage.css";

const ClassManagementPage = () => {
  const { isLogin, loading: userLoading } = useContext(UserContext);
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoading && !isLogin) {
      navigate("/login");
    }
  }, [isLogin, userLoading, navigate]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!isLogin) return;
      try {
        setLoading(true);
        const response = await getInstructorClasses();
        const mappedClasses = response.data.map((cls) => ({
          id: cls.classId,
          className: cls.className,
          classCode: cls.classCode,
          createdAt: new Date(cls.createdAt).toLocaleDateString("vi-VN"),
          numberOfStudents: cls.numberOfStudents,
        }));
        setClasses(mappedClasses);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [isLogin]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className.trim()) {
      toast.error("Tên lớp học không được để trống");
      return;
    }

    try {
      setLoading(true);
      const response = await createClass({ className });
      const newClass = {
        id: response.id,
        className: response.name,
        classCode: response.classCode,
        createdAt: new Date().toLocaleDateString("vi-VN"),
        numberOfStudents: 0,
      };
      setClasses([...classes, newClass]);
      setClassName("");
      setShowModal(false);
      toast.success("Tạo lớp học thành công!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm("Bạn có chắc muốn xóa lớp học này?")) {
      try {
        setLoading(true);
        setClasses(classes.filter((cls) => cls.id !== classId));
        toast.success("Xóa lớp học thành công!");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (userLoading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản trị lớp học</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Tạo lớp học mới
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="form-container bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Tạo lớp học mới
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="className">
                  Tên lớp học
                </label>
                <input
                  type="text"
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Toán học cao cấp 4"
                  disabled={loading}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="submit-button flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  disabled={loading}
                >
                  {loading ? "Đang tạo..." : "Tạo lớp học"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b text-gray-700">
          Danh sách lớp học
        </h2>
        {loading && !classes.length ? (
          <div className="text-center p-4">Đang tải danh sách lớp học...</div>
        ) : classes.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Chưa có lớp học nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-left">
                  <th className="p-4 font-semibold">STT</th>
                  <th className="p-4 font-semibold">Tên lớp học</th>
                  <th className="p-4 font-semibold">Mã lớp</th>
                  <th className="p-4 font-semibold">Ngày tạo</th>
                  <th className="p-4 font-semibold">Số học viên</th>
                  <th className="p-4 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, index) => (
                  <tr
                    key={cls.id}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{cls.className}</td>
                    <td className="p-4">{cls.classCode}</td>
                    <td className="p-4">{cls.createdAt}</td>
                    <td className="p-4">{cls.numberOfStudents}</td>
                    <td className="p-4 space-x-3">
                      <button
                        onClick={() => navigate(`/students?classId=${cls.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManagementPage;
