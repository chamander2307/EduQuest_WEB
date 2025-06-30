import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./StudentManagementPage.css";
import { getInstructorClasses, getClassStudents } from "../../services/ClassServices";
import { updateEnrollmentStatus } from "../../services/EnrollmentServices";

const StudentManagementPage = () => {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, enrolled, rejected
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classId, setClassId] = useState(() => {
    // Lấy classId từ URL params nếu có
    const urlClassId = searchParams.get('classId');
    return urlClassId ? Number(urlClassId) : null;
  });
  const [error, setError] = useState(null);
  const [avatarErrors, setAvatarErrors] = useState({});

  // Helper functions để validate avatar URL
  const isValidAvatarUrl = (url) => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    if (url.trim() === "" || url === "null" || url === "undefined") return false;
    if (url.startsWith("http") || url.startsWith("/")) return true;
    return false;
  };

  // Lấy chữ cái đầu của tên người dùng cho avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "S";
  };

  // Handle avatar error
  const handleAvatarError = (studentId) => {
    setAvatarErrors(prev => ({
      ...prev,
      [studentId]: true
    }));
  };

  // Helper functions để transform dữ liệu API
  const mapEnrollmentStatus = (apiStatus) => {
    switch (apiStatus) {
      case 'PENDING': return 'pending';
      case 'ENROLLED': return 'enrolled';
      case 'REJECTED': return 'rejected';
      default: return 'pending';
    }
  };

  const transformApiData = (apiData) => {
    return apiData.map(item => ({
      id: item.studentId,
      studentId: item.studentCode,
      name: item.studentName,
      email: item.studentEmail,
      status: mapEnrollmentStatus(item.enrollmentStatus),
      registrationDate: item.enrolledAt,
      avatarUrl: item.avatarUrl, // Store original avatar URL
      enrollmentId: item.enrollmentId
    }));
  };

  // Load thông tin lớp học hiện tại
  const loadCurrentClass = async () => {
    if (!classId) return;
    
    try {
      const response = await getInstructorClasses();
      const currentClass = response.data?.find(cls => cls.id === classId);
      if (currentClass) {
        setCurrentClass(currentClass);
      }
    } catch (error) {
      console.error('Error loading current class:', error);
    }
  };

  // Load danh sách sinh viên
  const loadStudents = async () => {
    if (!classId) return;
    
    try {
      console.log('=== Loading Students ===');
      console.log('ClassId:', classId);
      setLoading(true);
      setError(null);
      setAvatarErrors({}); // Reset avatar errors when reloading
      
      const response = await getClassStudents(classId);
      const transformedData = transformApiData(response.data || []);
      
      setStudents(transformedData);
      toast.success(`Đã tải thành công ${transformedData.length} sinh viên`);
      
    } catch (error) {
      console.error('Error loading students:', error);
      setError(error.message);
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadCurrentClass();
      loadStudents();
    }
  }, [classId]);

  // Cập nhật classId khi URL params thay đổi
  useEffect(() => {
    const urlClassId = searchParams.get('classId');
    if (urlClassId && Number(urlClassId) !== classId) {
      setClassId(Number(urlClassId));
    }
  }, [searchParams]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "enrolled":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "enrolled":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesFilter = filter === "all" || student.status === filter;
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApproveStudent = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      
      if (!student?.enrollmentId) {
        toast.error("Không tìm thấy thông tin đăng ký");
        return;
      }

      if (student.status !== "pending") {
        toast.warning("Chỉ có thể duyệt sinh viên đang chờ duyệt!");
        return;
      }

      if (!window.confirm(`Bạn có chắc chắn muốn duyệt sinh viên "${student.name}" vào lớp?`)) {
        return;
      }

      // Gọi API để approve
      await updateEnrollmentStatus(student.enrollmentId, "ENROLLED");
      
      // Cập nhật state local
      setStudents(students.map(s => 
        s.id === studentId 
          ? { ...s, status: "enrolled" }
          : s
      ));
      
      toast.success(`Đã duyệt sinh viên ${student.name} thành công vào lớp!`);
    } catch (error) {
      console.error('Error approving student:', error);
      toast.error("Không thể duyệt sinh viên. Vui lòng thử lại!");
    }
  };

  const handleRejectStudent = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      
      if (!student?.enrollmentId) {
        toast.error("Không tìm thấy thông tin đăng ký");
        return;
      }

      if (student.status !== "pending") {
        toast.warning("Chỉ có thể từ chối sinh viên đang chờ duyệt!");
        return;
      }

      if (!window.confirm(`Bạn có chắc chắn muốn từ chối sinh viên "${student.name}"?`)) {
        return;
      }

      // Gọi API để reject
      await updateEnrollmentStatus(student.enrollmentId, "REJECTED");
      
      // Cập nhật state local
      setStudents(students.map(s => 
        s.id === studentId 
          ? { ...s, status: "rejected" }
          : s
      ));
      
      toast.warning(`Đã từ chối sinh viên ${student.name}!`);
    } catch (error) {
      console.error('Error rejecting student:', error);
      toast.error("Không thể từ chối sinh viên. Vui lòng thử lại!");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?")) {
      try {
        // Tạm thời chỉ xóa khỏi state local - có thể cần API riêng để xóa hoàn toàn
        setStudents(students.filter(s => s.id !== studentId));
        toast.success("Đã xóa sinh viên khỏi lớp!");
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error(error.message || "Không thể xóa sinh viên");
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedStudents.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sinh viên!");
      return;
    }
    
    // Lọc ra chỉ những sinh viên có status pending
    const pendingStudents = students.filter(s => 
      selectedStudents.includes(s.id) && s.status === "pending"
    );
    
    if (pendingStudents.length === 0) {
      toast.warning("Không có sinh viên nào đang chờ duyệt trong danh sách đã chọn!");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn duyệt ${pendingStudents.length} sinh viên vào lớp?`)) {
      return;
    }
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Gọi API duyệt từng sinh viên
      const promises = pendingStudents.map(async (student) => {
        try {
          await updateEnrollmentStatus(student.enrollmentId, "ENROLLED");
          successCount++;
          return { success: true, studentId: student.id };
        } catch (error) {
          console.error(`Error approving student ${student.name}:`, error);
          errorCount++;
          return { success: false, studentId: student.id, error: error.message };
        }
      });
      
      const results = await Promise.allSettled(promises);
      
      // Cập nhật state local cho những sinh viên được duyệt thành công
      const successfulIds = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value.studentId);
      
      setStudents(students.map(s => 
        successfulIds.includes(s.id)
          ? { ...s, status: "enrolled" }
          : s
      ));
      
      setSelectedStudents([]);
      
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Đã duyệt thành công ${successCount} sinh viên vào lớp!`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Đã duyệt ${successCount} sinh viên, ${errorCount} sinh viên gặp lỗi!`);
      } else {
        toast.error("Không thể duyệt sinh viên nào. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast.error("Lỗi hệ thống khi duyệt hàng loạt. Vui lòng thử lại!");
    }
  };

  const handleBulkReject = async () => {
    if (selectedStudents.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sinh viên!");
      return;
    }
    
    // Lọc ra chỉ những sinh viên có status pending
    const pendingStudents = students.filter(s => 
      selectedStudents.includes(s.id) && s.status === "pending"
    );
    
    if (pendingStudents.length === 0) {
      toast.warning("Không có sinh viên nào đang chờ duyệt trong danh sách đã chọn!");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn từ chối ${pendingStudents.length} sinh viên?`)) {
      return;
    }
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Gọi API từ chối từng sinh viên
      const promises = pendingStudents.map(async (student) => {
        try {
          await updateEnrollmentStatus(student.enrollmentId, "REJECTED");
          successCount++;
          return { success: true, studentId: student.id };
        } catch (error) {
          console.error(`Error rejecting student ${student.name}:`, error);
          errorCount++;
          return { success: false, studentId: student.id, error: error.message };
        }
      });
      
      const results = await Promise.allSettled(promises);
      
      // Cập nhật state local cho những sinh viên bị từ chối thành công
      const successfulIds = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value.studentId);
      
      setStudents(students.map(s => 
        successfulIds.includes(s.id)
          ? { ...s, status: "rejected" }
          : s
      ));
      
      setSelectedStudents([]);
      
      if (successCount > 0 && errorCount === 0) {
        toast.warning(`Đã từ chối ${successCount} sinh viên!`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Đã từ chối ${successCount} sinh viên, ${errorCount} sinh viên gặp lỗi!`);
      } else {
        toast.error("Không thể từ chối sinh viên nào. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      toast.error("Lỗi hệ thống khi từ chối hàng loạt. Vui lòng thử lại!");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sinh viên!");
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedStudents.length} sinh viên khỏi lớp?`)) {
      try {
        // Tạm thời chỉ xóa khỏi state local
        setStudents(students.filter(s => !selectedStudents.includes(s.id)));
        setSelectedStudents([]);
        toast.success(`Đã xóa ${selectedStudents.length} sinh viên khỏi lớp!`);
      } catch (error) {
        console.error('Error bulk deleting:', error);
        toast.error(error.message || "Không thể xóa hàng loạt");
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadStudents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Chưa chọn lớp học
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Vui lòng truy cập trang này thông qua danh sách lớp học để xem danh sách sinh viên.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Đang tải danh sách sinh viên...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
          Quản lý Sinh viên {currentClass ? `- ${currentClass.name}` : ''}
        </h1>
        <p className="text-gray-600">Xem, duyệt và quản lý danh sách sinh viên trong lớp</p>
      </div>



      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Chờ duyệt ({students.filter(s => s.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("enrolled")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "enrolled"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Đã duyệt ({students.filter(s => s.status === "enrolled").length})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Từ chối ({students.filter(s => s.status === "rejected").length})
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              Đã chọn {selectedStudents.length} sinh viên
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Duyệt tất cả
              </button>
              <button
                onClick={handleBulkReject}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                Từ chối tất cả
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  Trạng thái
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex-shrink-0">
                        {isValidAvatarUrl(student.avatarUrl) && !avatarErrors[student.id] ? (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        student.status
                      )}`}
                    >
                      {getStatusText(student.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(student.registrationDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {student.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveStudent(student.id)}
                            className="text-green-600 hover:text-green-900 transition"
                            title="Duyệt"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRejectStudent(student.id)}
                            className="text-yellow-600 hover:text-yellow-900 transition"
                            title="Từ chối"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Xóa"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sinh viên</h3>
            <p className="mt-1 text-sm text-gray-500">
              Không tìm thấy sinh viên nào phù hợp với bộ lọc hiện tại.
            </p>
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

export default StudentManagementPage;
