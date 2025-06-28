import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { UserContext } from "../../contexts/InstructorContext";
import { getStudentExerciseDetail } from "../../services/ExerciseServices";
import "react-toastify/dist/ReactToastify.css";
import "./StudentExerciseDetailPage.css";

const StudentExerciseDetailPage = () => {
  const { participationId } = useParams();
  const navigate = useNavigate();
  const { isLogin, loading: userLoading } = useContext(UserContext);
  
  const [exerciseDetail, setExerciseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication check
  useEffect(() => {
    if (!userLoading && !isLogin) {
      navigate("/login");
    }
  }, [isLogin, userLoading, navigate]);

  // Load exercise detail
  useEffect(() => {
    const loadExerciseDetail = async () => {
      if (!isLogin || !participationId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await getStudentExerciseDetail(participationId);
        setExerciseDetail(response.data);
      } catch (error) {
        console.error('Error loading exercise detail:', error);
        setError(error.message || 'Không thể tải chi tiết bài làm');
        toast.error(error.message || 'Không thể tải chi tiết bài làm');
      } finally {
        setLoading(false);
      }
    };

    loadExerciseDetail();
  }, [isLogin, participationId]);

  const getAnswerClass = (question, option) => {
    const isCorrect = option.optionId === question.correctOptionId;
    const isSelected = option.optionId === question.selectedOptionId;
    
    if (isSelected && isCorrect) {
      return "answer-correct-selected";
    } else if (isSelected && !isCorrect) {
      return "answer-wrong-selected";
    } else if (!isSelected && isCorrect) {
      return "answer-correct-unselected";
    }
    return "answer-default";
  };

  const getAnswerIcon = (question, option) => {
    const isCorrect = option.optionId === question.correctOptionId;
    const isSelected = option.optionId === question.selectedOptionId;
    
    if (isSelected && isCorrect) {
      return (
        <svg className="answer-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else if (isSelected && !isCorrect) {
      return (
        <svg className="answer-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    } else if (!isSelected && isCorrect) {
      return (
        <svg className="answer-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const formatDuration = (duration) => {
    if (!duration) return "Chưa hoàn thành";
    
    // If duration is a number (seconds)
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      // Format as mm:ss
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');
      
      return `${formattedMinutes}:${formattedSeconds}`;
    }
    
    // If it's already a string, check if it contains "minutes" and convert
    if (typeof duration === 'string' && duration.includes('minutes')) {
      const minutes = duration.match(/\d+/);
      if (minutes) {
        const totalMinutes = parseInt(minutes[0]);
        const formattedMinutes = totalMinutes.toString().padStart(2, '0');
        
        return `${formattedMinutes}:00`;
      }
    }
    
    return duration;
  };

  const getStudentInitials = (name) => {
    if (!name) return "?";
    const words = name.split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getScoreClass = (score) => {
    if (score === null || score === undefined) return "score-pending";
    if (score >= 8) return "score-excellent";
    if (score >= 6) return "score-good";
    return "score-average";
  };

  if (userLoading || loading) {
    return (
      <div className="student-exercise-detail-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="ml-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !exerciseDetail) {
    return (
      <div className="student-exercise-detail-page">
        <div className="error-container">
          <div className="error-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3>Không thể tải dữ liệu</h3>
          <p>{error || 'Không tìm thấy chi tiết bài làm'}</p>
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-exercise-detail-page">
      <div className="detail-container">
        {/* Header */}
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          
          <div className="header-content">
            <h1 className="exercise-title">{exerciseDetail.exerciseName}</h1>
            <p className="exercise-subtitle">Chi tiết bài làm của sinh viên</p>
          </div>
        </div>

        {/* Student Info */}
        <div className="student-info-card">
          <div className="student-avatar">
            {getStudentInitials(exerciseDetail.studentName)}
          </div>
          <div className="student-details">
            <h3>{exerciseDetail.studentName}</h3>
            <p>Mã sinh viên: {exerciseDetail.studentCode}</p>
            <p>Email: {exerciseDetail.studentEmail}</p>
          </div>
          <div className="student-stats">
            <div className="stat-item">
              <span className="stat-label">Điểm số:</span>
              <span className={`stat-value ${getScoreClass(exerciseDetail.score)}`}>
                {exerciseDetail.score !== null ? exerciseDetail.score.toFixed(1) : "Chưa có"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Câu đúng:</span>
              <span className="stat-value">
                {exerciseDetail.correctAnswers || 0}/{exerciseDetail.totalQuestions}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Thời gian bắt đầu:</span>
              <span className="stat-value">{formatDateTime(exerciseDetail.startedAt)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Thời gian nộp:</span>
              <span className="stat-value">{formatDateTime(exerciseDetail.submittedAt)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Thời lượng:</span>
              <span className="stat-value">{formatDuration(exerciseDetail.duration)}</span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="questions-section">
          <div className="section-header">
            <h2>Danh sách câu hỏi và đáp án</h2>
            <p>Xem chi tiết từng câu hỏi và đáp án đã chọn</p>
          </div>

          <div className="questions-grid">
            {exerciseDetail.questions?.map((question, index) => (
              <div key={question.questionId} className="question-card">
                <div className="question-header">
                  <span className="question-number">Câu {index + 1}</span>
                  <span className={`question-result ${question.selectedOptionId === question.correctOptionId ? 'correct' : 'incorrect'}`}>
                    {question.selectedOptionId === question.correctOptionId ? 'Đúng' : 'Sai'}
                  </span>
                </div>

                <div className="question-content">
                  <h4 className="question-text">{question.questionText}</h4>
                  
                  <div className="options-list">
                    {question.options?.map((option) => (
                      <div 
                        key={option.optionId}
                        className={`option-item ${getAnswerClass(question, option)}`}
                      >
                        <div className="option-icon">
                          {getAnswerIcon(question, option)}
                        </div>
                        <div className="option-text">
                          {option.optionText}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
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

export default StudentExerciseDetailPage;
