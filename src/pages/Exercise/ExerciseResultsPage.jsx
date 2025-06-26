import React, { useState, useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { UserContext } from "../../contexts/InstructorContext";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./ExerciseResultsPage.css";
import { getInstructorClasses } from "../../services/ClassServices";
import { getClassExercises, getExerciseResults } from "../../services/ExerciseServices";

const ExerciseResultsPage = () => {
  const { isLogin, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  
  // State management
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseResults, setExerciseResults] = useState(null);
  const [loading, setLoading] = useState({
    classes: false,
    exercises: false,
    results: false
  });
  const [error, setError] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!userLoading && !isLogin) {
      navigate("/login");
    }
  }, [isLogin, userLoading, navigate]);

  // Load instructor classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!isLogin) return;
      
      try {
        setLoading(prev => ({ ...prev, classes: true }));
        setError(null);
        
        const response = await getInstructorClasses();
        const mappedClasses = response.data.map((cls) => ({
          id: cls.classId,
          name: cls.className,
          code: cls.classCode,
          numberOfStudents: cls.numberOfStudents,
        }));
        
        setClasses(mappedClasses);
        
        // Auto-select first class if available
        if (mappedClasses.length > 0) {
          setSelectedClassId(mappedClasses[0].id);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        setError('Không thể tải danh sách lớp học');
        toast.error('Không thể tải danh sách lớp học');
      } finally {
        setLoading(prev => ({ ...prev, classes: false }));
      }
    };

    loadClasses();
  }, [isLogin]);

  // Load exercises when class is selected
  useEffect(() => {
    const loadExercises = async () => {
      if (!selectedClassId) {
        setExercises([]);
        setSelectedExercise(null);
        setExerciseResults(null);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, exercises: true }));
        setError(null);
        
        const response = await getClassExercises(selectedClassId);
        setExercises(response.data || []);
        
        // Reset selected exercise and results
        setSelectedExercise(null);
        setExerciseResults(null);
        
        if (response.data && response.data.length > 0) {
          toast.success(`Đã tải ${response.data.length} bài tập`);
        }
      } catch (error) {
        console.error('Error loading exercises:', error);
        setError('Không thể tải danh sách bài tập');
        toast.error('Không thể tải danh sách bài tập');
        setExercises([]);
      } finally {
        setLoading(prev => ({ ...prev, exercises: false }));
      }
    };

    loadExercises();
  }, [selectedClassId]);

  // Load exercise results
  const loadExerciseResults = async (exerciseId) => {
    try {
      setLoading(prev => ({ ...prev, results: true }));
      setError(null);
      
      const response = await getExerciseResults(exerciseId);
      setExerciseResults(response.data);
      
      const exercise = exercises.find(ex => ex.exerciseId === exerciseId);
      setSelectedExercise(exercise);
      
      toast.success(`Đã tải kết quả bài tập "${exercise?.exerciseName}"`);
    } catch (error) {
      console.error('Error loading exercise results:', error);
      setError('Không thể tải kết quả bài tập');
      toast.error('Không thể tải kết quả bài tập');
      setExerciseResults(null);
    } finally {
      setLoading(prev => ({ ...prev, results: false }));
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "status-active";
      case "UPCOMING":
        return "status-upcoming";
      case "EXPIRED":
        return "status-expired";
      default:
        return "status-expired";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "EXPIRED":
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const getScoreClass = (score) => {
    if (score === null || score === undefined) return "score-pending";
    if (score >= 8) return "score-excellent";
    if (score >= 6) return "score-good";
    return "score-average";
  };

  const getStudentInitials = (name) => {
    if (!name) return "?";
    const words = name.split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const formatDuration = (startedAt, submittedAt) => {
    if (!startedAt || !submittedAt) return "-";
    
    const start = new Date(startedAt);
    const end = new Date(submittedAt);
    const diffInMinutes = Math.floor((end - start) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const getStatusIndicatorClass = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "status-submitted";
      case "IN_PROGRESS":
        return "status-in-progress";
      case "TIMEOUT":
        return "status-timeout";
      default:
        return "status-pending";
    }
  };

  const getStatusIndicatorText = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "Đã nộp";
      case "IN_PROGRESS":
        return "Đang làm";
      case "TIMEOUT":
        return "Hết giờ";
      default:
        return "Chưa xác định";
    }
  };

  if (userLoading) {
    return (
      <div className="exercise-results-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="ml-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-results-page">
      <div className="exercise-results-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Kết Quả Bài Tập</h1>
          <p className="page-subtitle">
            Xem và quản lý kết quả làm bài của sinh viên theo từng bài tập
          </p>
        </div>

        {/* Class Selector */}
        <div className="class-selector">
          <div className="class-selector-header">
            <h2 className="class-selector-title">Chọn lớp học</h2>
          </div>
          
          {loading.classes ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="no-data">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3>Không có lớp học nào</h3>
              <p>Bạn chưa có lớp học nào để xem kết quả bài tập.</p>
            </div>
          ) : (
            <div className="class-grid">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className={`class-card ${selectedClassId === classItem.id ? 'selected' : ''}`}
                  onClick={() => setSelectedClassId(classItem.id)}
                >
                  <div className="class-name">{classItem.name}</div>
                  <div className="class-code">Mã lớp: {classItem.code}</div>
                  <div className="class-code">{classItem.numberOfStudents} sinh viên</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercises Section */}
        {selectedClassId && (
          <div className="exercises-section">
            <div className="section-header">
              <h2 className="section-title">Danh sách bài tập</h2>
              <p>Chọn bài tập để xem kết quả chi tiết</p>
            </div>
            
            {loading.exercises ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : exercises.length === 0 ? (
              <div className="no-data">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>Không có bài tập nào</h3>
                <p>Lớp học này chưa có bài tập nào.</p>
              </div>
            ) : (
              <div className="exercises-grid">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.exerciseId}
                    className={`exercise-card ${selectedExercise?.exerciseId === exercise.exerciseId ? 'selected' : ''}`}
                    onClick={() => loadExerciseResults(exercise.exerciseId)}
                  >
                    <div className="exercise-name">{exercise.exerciseName}</div>
                    
                    <div className="exercise-meta">
                      <span className={`status-badge ${getStatusColor(exercise.status)}`}>
                        {getStatusText(exercise.status)}
                      </span>
                    </div>
                    
                    <div className="exercise-stats">
                      <div className="stat-item">
                        <span>Câu hỏi:</span>
                        <strong>{exercise.totalQuestions}</strong>
                      </div>
                      <div className="stat-item">
                        <span>Tham gia:</span>
                        <strong>{exercise.totalParticipants}</strong>
                      </div>
                      <div className="stat-item">
                        <span>Đã nộp:</span>
                        <strong>{exercise.submittedCount}</strong>
                      </div>
                      <div className="stat-item">
                        <span>Đang làm:</span>
                        <strong>{exercise.inProgressCount}</strong>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      Tạo lúc: {formatDateTime(exercise.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {selectedExercise && (
          <div className="results-section">
            <div className="results-header">
              <div>
                <h2 className="results-title">
                  Kết quả: {exerciseResults?.exerciseName || selectedExercise.exerciseName}
                </h2>
                {exerciseResults && (
                  <div className="results-summary">
                    <span>Tổng câu hỏi: <strong>{exerciseResults.totalQuestions}</strong></span>
                    <span>Tổng sinh viên: <strong>{exerciseResults.totalParticipants}</strong></span>
                    <span>Đã nộp bài: <strong>{exerciseResults.studentResults?.filter(r => r.status === 'SUBMITTED').length || 0}</strong></span>
                    <span>Đang làm bài: <strong>{exerciseResults.studentResults?.filter(r => r.status === 'IN_PROGRESS').length || 0}</strong></span>
                  </div>
                )}
              </div>
            </div>
            
            {loading.results ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : exerciseResults?.studentResults?.length === 0 ? (
              <div className="no-data">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3>Chưa có sinh viên nào tham gia</h3>
                <p>Bài tập này chưa có sinh viên nào tham gia.</p>
              </div>
            ) : exerciseResults ? (
              <div className="overflow-x-auto">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      <th>Điểm số</th>
                      <th>Câu đúng</th>
                      <th>Trạng thái</th>
                      <th>Thời gian bắt đầu</th>
                      <th>Thời gian nộp</th>
                      <th>Thời lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exerciseResults.studentResults.map((result) => (
                      <tr key={result.participationId}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar">
                              {getStudentInitials(result.studentName)}
                            </div>
                            <div className="student-details">
                              <h4>{result.studentName}</h4>
                              <p>{result.studentCode}</p>
                              <p>{result.studentEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`score-display ${getScoreClass(result.score)}`}>
                            {result.score !== null ? result.score.toFixed(1) : "-"}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '500' }}>
                            {result.correctAnswers !== null ? 
                              `${result.correctAnswers}/${result.totalQuestions}` : 
                              "-"
                            }
                          </span>
                        </td>
                        <td>
                          <span className={`status-indicator ${getStatusIndicatorClass(result.status)}`}>
                            {getStatusIndicatorText(result.status)}
                          </span>
                        </td>
                        <td>{formatDateTime(result.startedAt)}</td>
                        <td>{formatDateTime(result.submittedAt)}</td>
                        <td>
                          <span className="duration-display">
                            {result.duration || formatDuration(result.startedAt, result.submittedAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-display">
            <strong>Lỗi:</strong> {error}
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

export default ExerciseResultsPage;
