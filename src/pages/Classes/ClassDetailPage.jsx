import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPendingEnrollments,
  updateEnrollmentStatus,
} from "../../services/EnrollmentServices";
import "./ClassDetailPage.css";

const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingEnrollments = async () => {
      try {
        setLoading(true);
        const response = await getPendingEnrollments(classId);

        if (!Array.isArray(response)) {
          throw new Error("Dữ liệu đăng ký chờ không hợp lệ");
        }

        setPendingEnrollments(response);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đăng ký chờ:", err);
        toast.error(err.message || "Không thể tải danh sách đăng ký chờ");
        setPendingEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEnrollments();
  }, [classId]);

  const handleUpdateEnrollment = async (enrollmentId, status) => {
    try {
      setLoading(true);
      await updateEnrollmentStatus(enrollmentId, status);
      setPendingEnrollments(
        pendingEnrollments.filter(
          (enrollment) => enrollment.enrollmentId !== enrollmentId
        )
      );
      toast.success(
        `Đã ${
          status === "APPROVED" ? "chấp nhận" : "từ chối"
        } đăng ký thành công!`
      );
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật trạng thái đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Chi tiết lớp học</h1>
        <button
          onClick={() => navigate("/classes")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Quay lại
        </button>
      </div>

      {/* Danh sách học sinh chờ duyệt */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b text-gray-700">
          Danh sách học sinh chờ duyệt
        </h2>
        {loading && !pendingEnrollments.length ? (
          <div className="text-center p-4">Đang tải danh sách đăng ký...</div>
        ) : pendingEnrollments.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Chưa có học sinh nào chờ duyệt
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-left">
                  <th className="p-4 font-semibold">STT</th>
                  <th className="p-4 font-semibold">Tên học sinh</th>
                  <th className="p-4 font-semibold">Mã học sinh</th>
                  <th className="p-4 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingEnrollments.map((enrollment, index) => (
                  <tr
                    key={enrollment.enrollmentId}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{enrollment.studentName}</td>
                    <td className="p-4">{enrollment.studentCode}</td>
                    <td className="p-4 space-x-3">
                      <button
                        onClick={() =>
                          handleUpdateEnrollment(
                            enrollment.enrollmentId,
                            "ENROLLED"
                          )
                        }
                        className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                        disabled={loading}
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateEnrollment(
                            enrollment.enrollmentId,
                            "REJECTED"
                          )
                        }
                        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        disabled={loading}
                      >
                        Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default ClassDetailPage;
