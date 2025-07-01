import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./StudentManagementPage.css";
import {
  getInstructorClasses,
  getClassStudents,
} from "../../services/ClassServices";
import {
  updateEnrollmentStatus,
  removeEnrollment,
} from "../../services/EnrollmentServices";
import { getVietnameseMessage } from "../../constants/VietNameseStatus";

const StudentManagementPage = () => {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPending, setSelectedPending] = useState([]);
  const [selectedEnrolled, setSelectedEnrolled] = useState([]);
  const [classId, setClassId] = useState(() => {
    const urlClassId = searchParams.get("classId");
    return urlClassId ? Number(urlClassId) : null;
  });
  const [error, setError] = useState(null);
  const [avatarErrors, setAvatarErrors] = useState({});

  const errorHandledRef = useRef({
    classes: false,
    students: false,
    approve: {},
    reject: {},
    delete: {},
    bulkApprove: false,
    bulkReject: false,
    bulkDelete: false,
  });

  const isValidAvatarUrl = (url) => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    if (url.trim() === "" || url === "null" || url === "undefined")
      return false;
    if (url.startsWith("http") || url.startsWith("/")) return true;
    return false;
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "S";
  };

  const handleAvatarError = (studentId) => {
    setAvatarErrors((prev) => ({
      ...prev,
      [studentId]: true,
    }));
  };

  const mapEnrollmentStatus = (apiStatus) => {
    switch (apiStatus) {
      case "PENDING":
        return "pending";
      case "ENROLLED":
        return "enrolled";
      default:
        return null; // Loại bỏ các trạng thái khác
    }
  };

  const transformApiData = (apiData) => {
    return apiData
      .map((item) => ({
        id: item.studentId,
        studentId: item.studentCode,
        name: item.studentName,
        email: item.studentEmail,
        status: mapEnrollmentStatus(item.enrollmentStatus),
        registrationDate: item.enrolledAt,
        avatarUrl: item.avatarUrl,
        enrollmentId: item.enrollmentId,
      }))
      .filter((item) => item.status); // Chỉ giữ PENDING và ENROLLED
  };

  const loadCurrentClass = async () => {
    if (!classId) return;

    try {
      const response = await getInstructorClasses();
      const currentClass = response.data?.find((cls) => cls.id === classId);
      if (currentClass) {
        setCurrentClass(currentClass);
      }
      errorHandledRef.current.classes = false;
    } catch (error) {
      if (!errorHandledRef.current.classes) {
        console.log("Error handled in loadCurrentClass:", error.message);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Không thể tải thông tin lớp học";
        toast.error(errorMessage, {
          toastId: `error-current-class-${
            error.response?.data?.code || error.message
          }`,
        });
        errorHandledRef.current.classes = true;
      }
    }
  };

  const loadStudents = async () => {
    if (!classId) return;

    try {
      console.log("=== Loading Students ===");
      console.log("ClassId:", classId);
      setLoading(true);
      setError(null);
      setAvatarErrors({});

      const response = await getClassStudents(classId);
      const transformedData = transformApiData(response.data || []);

      setStudents(transformedData);
      errorHandledRef.current.students = false;
      toast.success(`Đã tải ${transformedData.length} sinh viên thành công!`, {
        toastId: `success-students-${classId}`,
      });
    } catch (error) {
      if (!errorHandledRef.current.students) {
        console.log("Error handled in loadStudents:", error.message);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Không thể tải danh sách sinh viên";
        setError(errorMessage);
        toast.error(errorMessage, {
          toastId: `error-students-${
            error.response?.data?.code || error.message
          }`,
        });
        errorHandledRef.current.students = true;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      errorHandledRef.current = {
        classes: false,
        students: false,
        approve: {},
        reject: {},
        delete: {},
        bulkApprove: false,
        bulkReject: false,
        bulkDelete: false,
      };
      loadCurrentClass();
      loadStudents();
    }
  }, [classId]);

  useEffect(() => {
    const urlClassId = searchParams.get("classId");
    if (urlClassId && Number(urlClassId) !== classId) {
      setClassId(Number(urlClassId));
    }
  }, [searchParams]);

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "enrolled":
        return "Đã tham gia";
      default:
        return "Không xác định";
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student?.enrollmentId) {
        toast.error("Không tìm thấy thông tin đăng ký!", {
          toastId: "error-approve-missing-enrollment",
        });
        return;
      }
      if (
        !window.confirm(`Bạn có muốn duyệt "${student.name}" vào lớp không?`)
      ) {
        return;
      }
      await updateEnrollmentStatus(student.enrollmentId, "ENROLLED");
      setStudents(
        students.map((s) =>
          s.id === studentId ? { ...s, status: "enrolled" } : s
        )
      );
      toast.success(`Đã duyệt ${student.name} vào lớp thành công!`, {
        toastId: `success-approve-${studentId}`,
      });
      errorHandledRef.current.approve[studentId] = false;
    } catch (error) {
      if (!errorHandledRef.current.approve[studentId]) {
        console.error("Error approving student:", error);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Không thể duyệt sinh viên. Vui lòng thử lại!";
        toast.error(errorMessage, {
          toastId: `error-approve-${
            error.response?.data?.code || error.message
          }-${studentId}`,
        });
        errorHandledRef.current.approve[studentId] = true;
      }
    }
  };

  const handleRejectStudent = async (studentId) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student?.enrollmentId) {
        toast.error("Không tìm thấy thông tin đăng ký!", {
          toastId: "error-reject-missing-enrollment",
        });
        return;
      }
      if (!window.confirm(`Bạn có muốn từ chối "${student.name}" không?`)) {
        return;
      }
      await updateEnrollmentStatus(student.enrollmentId, "REJECTED");
      setStudents(students.filter((s) => s.id !== studentId));
      toast.success(`Đã từ chối ${student.name} thành công!`, {
        toastId: `success-reject-${studentId}`,
      });
      errorHandledRef.current.reject[studentId] = false;
    } catch (error) {
      if (!errorHandledRef.current.reject[studentId]) {
        console.error("Error rejecting student:", error);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Không thể từ chối sinh viên. Vui lòng thử lại!";
        toast.error(errorMessage, {
          toastId: `error-reject-${
            error.response?.data?.code || error.message
          }-${studentId}`,
        });
        errorHandledRef.current.reject[studentId] = true;
      }
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student?.enrollmentId) {
        toast.error("Không tìm thấy thông tin đăng ký!", {
          toastId: "error-delete-missing-enrollment",
        });
        return;
      }
      if (
        !window.confirm(`Bạn có muốn xóa "${student.name}" khỏi lớp không?`)
      ) {
        return;
      }
      await removeEnrollment(student.enrollmentId);
      setStudents(students.filter((s) => s.id !== studentId));
      toast.success(`Đã xóa ${student.name} khỏi lớp thành công!`, {
        toastId: `success-delete-${studentId}`,
      });
      errorHandledRef.current.delete[studentId] = false;
    } catch (error) {
      if (!errorHandledRef.current.delete[studentId]) {
        console.error("Error deleting student:", error);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Không thể xóa sinh viên. Vui lòng thử lại!";
        toast.error(errorMessage, {
          toastId: `error-delete-${
            error.response?.data?.code || error.message
          }-${studentId}`,
        });
        errorHandledRef.current.delete[studentId] = true;
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPending.length === 0) {
      toast.warning("Hãy chọn ít nhất một sinh viên!", {
        toastId: "warning-bulk-approve-empty",
      });
      return;
    }
    const pendingStudents = students.filter((s) =>
      selectedPending.includes(s.id)
    );
    if (
      !window.confirm(
        `Bạn có muốn duyệt ${pendingStudents.length} sinh viên vào lớp không?`
      )
    ) {
      return;
    }
    try {
      let successCount = 0;
      let errorCount = 0;
      const promises = pendingStudents.map(async (student) => {
        try {
          await updateEnrollmentStatus(student.enrollmentId, "ENROLLED");
          successCount++;
          return { success: true, studentId: student.id };
        } catch (error) {
          console.error(`Error approving student ${student.name}:`, error);
          errorCount++;
          return {
            success: false,
            studentId: student.id,
            error: error.message,
          };
        }
      });
      const results = await Promise.allSettled(promises);
      const successfulIds = results
        .filter(
          (result) => result.status === "fulfilled" && result.value.success
        )
        .map((result) => result.value.studentId);
      setStudents(
        students.map((s) =>
          successfulIds.includes(s.id) ? { ...s, status: "enrolled" } : s
        )
      );
      setSelectedPending([]);
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Đã duyệt ${successCount} sinh viên thành công!`, {
          toastId: "success-bulk-approve-all",
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(
          `Đã duyệt ${successCount} sinh viên, ${errorCount} sinh viên gặp lỗi!`,
          {
            toastId: "warning-bulk-approve-partial",
          }
        );
      } else {
        toast.error("Không thể duyệt sinh viên nào. Vui lòng thử lại!", {
          toastId: "error-bulk-approve-none",
        });
      }
      errorHandledRef.current.bulkApprove = false;
    } catch (error) {
      if (!errorHandledRef.current.bulkApprove) {
        console.error("Error bulk approving:", error);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Lỗi khi duyệt hàng loạt. Vui lòng thử lại!";
        toast.error(errorMessage, {
          toastId: `error-bulk-approve-${
            error.response?.data?.code || error.message
          }`,
        });
        errorHandledRef.current.bulkApprove = true;
      }
    }
  };

  const handleBulkReject = async () => {
    if (selectedPending.length === 0) {
      toast.warning("Hãy chọn ít nhất một sinh viên!", {
        toastId: "warning-bulk-reject-empty",
      });
      return;
    }
    const pendingStudents = students.filter((s) =>
      selectedPending.includes(s.id)
    );
    if (
      !window.confirm(
        `Bạn có muốn từ chối ${pendingStudents.length} sinh viên không?`
      )
    ) {
      return;
    }
    try {
      let successCount = 0;
      let errorCount = 0;
      const promises = pendingStudents.map(async (student) => {
        try {
          await updateEnrollmentStatus(student.enrollmentId, "REJECTED");
          successCount++;
          return { success: true, studentId: student.id };
        } catch (error) {
          console.error(`Error rejecting student ${student.name}:`, error);
          errorCount++;
          return {
            success: false,
            studentId: student.id,
            error: error.message,
          };
        }
      });
      const results = await Promise.allSettled(promises);
      const successfulIds = results
        .filter(
          (result) => result.status === "fulfilled" && result.value.success
        )
        .map((result) => result.value.studentId);
      setStudents(students.filter((s) => !successfulIds.includes(s.id)));
      setSelectedPending([]);
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Đã từ chối ${successCount} sinh viên thành công!`, {
          toastId: "success-bulk-reject-all",
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(
          `Đã từ chối ${successCount} sinh viên, ${errorCount} sinh viên gặp lỗi!`,
          {
            toastId: "warning-bulk-reject-partial",
          }
        );
      } else {
        toast.error("Không thể từ chối sinh viên nào. Vui lòng thử lại!", {
          toastId: "error-bulk-reject-none",
        });
      }
      errorHandledRef.current.bulkReject = false;
    } catch (error) {
      if (!errorHandledRef.current.bulkReject) {
        console.error("Error bulk rejecting:", error);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Lỗi khi từ chối hàng loạt. Vui lòng thử lại!";
        toast.error(errorMessage, {
          toastId: `error-bulk-reject-${
            error.response?.data?.code || error.message
          }`,
        });
        errorHandledRef.current.bulkReject = true;
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEnrolled.length === 0) {
      toast.warning("Hãy chọn ít nhất một sinh viên!", {
        toastId: "warning-bulk-delete-empty",
      });
      return;
    }
    const enrolledStudents = students.filter((s) =>
      selectedEnrolled.includes(s.id)
    );
    if (
      !window.confirm(
        `Bạn có muốn xóa ${enrolledStudents.length} sinh viên khỏi lớp không?`
      )
    ) {
      return;
    }
    try {
      let successCount = 0;
      let errorCount = 0;
      const promises = enrolledStudents.map(async (student) => {
        try {
          await removeEnrollment(student.enrollmentId);
          successCount++;
          return { success: true, studentId: student.id };
        } catch (error) {
          console.error(`Error deleting student ${student.name}:`, error);
          errorCount++;
          return {
            success: false,
            studentId: student.id,
            error: error.message,
          };
        }
      });
      const results = await Promise.allSettled(promises);
      const successfulIds = results
        .filter(
          (result) => result.status === "fulfilled" && result.value.success
        )
        .map((result) => result.value.studentId);
      setStudents(students.filter((s) => !successfulIds.includes(s.id)));
      setSelectedEnrolled([]);
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Đã xóa ${successCount} sinh viên khỏi lớp thành công!`, {
          toastId: "success-bulk-delete-all",
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(
          `Đã xóa ${successCount} sinh viên, ${errorCount} sinh viên gặp lỗi!`,
          {
            toastId: "warning-bulk-delete-partial",
          }
        );
      } else {
        toast.error("Không thể xóa sinh viên nào. Vui lòng thử lại!", {
          toastId: "error-bulk-delete-none",
        });
      }
      errorHandledRef.current.bulkDelete = false;
    } catch (error) {
      if (!errorHandledRef.current.bulkDelete) {
        console.error("Error bulk deleting:", error);
        const errorMessage = error.response?.data?.code
          ? getVietnameseMessage(error.response.data.code)
          : error.message || "Lỗi khi xóa hàng loạt. Vui lòng thử lại!";
        toast.error(errorMessage, {
          toastId: `error-bulk-delete-${
            error.response?.data?.code || error.message
          }`,
        });
        errorHandledRef.current.bulkDelete = true;
      }
    }
  };

  const handleSelectPending = (studentId) => {
    setSelectedPending((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectEnrolled = (studentId) => {
    setSelectedEnrolled((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllPending = (students) => {
    if (selectedPending.length === students.length) {
      setSelectedPending([]);
    } else {
      setSelectedPending(students.map((s) => s.id));
    }
  };

  const handleSelectAllEnrolled = (students) => {
    if (selectedEnrolled.length === students.length) {
      setSelectedEnrolled([]);
    } else {
      setSelectedEnrolled(students.map((s) => s.id));
    }
  };

  const pendingStudents = students
    .filter((s) => s.status === "pending")
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const enrolledStudents = students
    .filter((s) => s.status === "enrolled")
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const renderTable = (
    title,
    data,
    isPending,
    selected,
    handleSelect,
    handleSelectAll,
    actionButtons
  ) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        <input
          type="text"
          placeholder="Tìm kiếm sinh viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {loading && !data.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có sinh viên
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isPending
              ? "Chưa có sinh viên nào chờ duyệt."
              : "Chưa có sinh viên nào tham gia."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === data.length && data.length > 0}
                    onChange={() => handleSelectAll(data)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sinh viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã SV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gmail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đăng ký
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(student.id)}
                      onChange={() => handleSelect(student.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex-shrink-0">
                        {isValidAvatarUrl(student.avatarUrl) &&
                        !avatarErrors[student.id] ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              student.avatarUrl.startsWith("http")
                                ? student.avatarUrl
                                : `http://localhost:8080${student.avatarUrl}`
                            }
                            alt={student.name}
                            onError={() => handleAvatarError(student.id)}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {getInitial(student.name)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(student.registrationDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {actionButtons(student)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selected.length > 1 && (
            <div className="p-4 bg-blue-50 flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                Đã chọn {selected.length} sinh viên
              </span>
              <div className="flex gap-2">
                {isPending ? (
                  <>
                    <button
                      onClick={handleBulkApprove}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      Duyệt tất cả
                    </button>
                    <button
                      onClick={handleBulkReject}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      disabled={loading}
                    >
                      Từ chối tất cả
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    disabled={loading}
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const pendingActionButtons = (student) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleApproveStudent(student.id)}
        className="text-green-600 hover:text-green-900 transition"
        title="Duyệt"
        disabled={loading}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
      <button
        onClick={() => handleRejectStudent(student.id)}
        className="text-red-600 hover:text-red-900 transition"
        title="Từ chối"
        disabled={loading}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );

  const enrolledActionButtons = (student) => (
    <button
      onClick={() => handleDeleteStudent(student.id)}
      className="text-red-600 hover:text-red-900 transition"
      title="Xóa khỏi lớp học"
      disabled={loading}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );

  if (!classId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Chưa chọn lớp học
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Vui lòng chọn một lớp học từ danh sách để xem sinh viên.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Có lỗi xảy ra
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadStudents}
                  className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quản lý sinh viên {currentClass ? `- ${currentClass.name}` : ""}
        </h1>
        <p className="text-gray-600">
          Xem và quản lý danh sách sinh viên trong lớp
        </p>
      </div>

      {renderTable(
        "Danh sách sinh viên chờ duyệt",
        pendingStudents,
        true,
        selectedPending,
        handleSelectPending,
        handleSelectAllPending,
        pendingActionButtons
      )}
      {renderTable(
        "Danh sách sinh viên đã tham gia",
        enrolledStudents,
        false,
        selectedEnrolled,
        handleSelectEnrolled,
        handleSelectAllEnrolled,
        enrolledActionButtons
      )}

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

export default StudentManagementPage;
