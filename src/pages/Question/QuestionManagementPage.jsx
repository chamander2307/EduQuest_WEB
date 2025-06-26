import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getQuestionsByInstructor,
  createQuestion,
  updateQuestion,
} from "../../services/QuestionServices";
import "./QuestionManagementPage.css";

const QuestionManagementPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    difficulty: "EASY",
    answers: [
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ],
  });
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await getQuestionsByInstructor();
        if (!Array.isArray(response)) {
          throw new Error("Dữ liệu câu hỏi không hợp lệ");
        }
        setQuestions(response);
        setFilteredQuestions(response);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách câu hỏi:", err);
        setQuestions([]);
        setFilteredQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let result = [...questions];

    if (filterDifficulty !== "ALL") {
      result = result.filter((q) => q.difficulty === filterDifficulty);
    }

    if (searchTerm.trim()) {
      result = result.filter((q) =>
        q.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(result);
  }, [filterDifficulty, searchTerm, questions]);

  const openModal = (question = null) => {
    if (question) {
      setIsEditMode(true);
      setCurrentQuestion(question);
      setFormData({
        content: question.content,
        difficulty: question.difficulty,
        answers: question.answers.map((ans) => ({
          content: ans.content,
          isCorrect: false,
        })),
      });
    } else {
      setIsEditMode(false);
      setCurrentQuestion(null);
      setFormData({
        content: "",
        difficulty: "EASY",
        answers: [
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
        ],
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...formData.answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
    setFormData((prev) => ({ ...prev, answers: updatedAnswers }));
  };

  const addAnswer = () => {
    setFormData((prev) => ({
      ...prev,
      answers: [...prev.answers, { content: "", isCorrect: false }],
    }));
  };

  const removeAnswer = (index) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Nội dung câu hỏi không được để trống");
      return;
    }
    if (formData.answers.length < 2) {
      toast.error("Phải có ít nhất 2 đáp án");
      return;
    }
    if (!formData.answers.some((ans) => ans.isCorrect)) {
      toast.error("Phải có ít nhất 1 đáp án đúng");
      return;
    }

    try {
      setLoading(true);
      const questionData = {
        content: formData.content,
        difficulty: formData.difficulty,
        answers: formData.answers.map((ans) => ({
          content: ans.content,
          isCorrect: ans.isCorrect,
        })),
      };

      let response;
      if (isEditMode) {
        response = await updateQuestion(currentQuestion.id, questionData);
        setQuestions(
          questions.map((q) => (q.id === currentQuestion.id ? response : q))
        );
        toast.success("Cập nhật câu hỏi thành công!");
      } else {
        response = await createQuestion(questionData);
        setQuestions([...questions, response]);
        toast.success("Tạo câu hỏi thành công!");
      }

      setShowModal(false);
      setFormData({
        content: "",
        difficulty: "EASY",
        answers: [
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
        ],
      });
    } catch (err) {
      toast.error(err.message || "Không thể lưu câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      try {
        setLoading(true);
        setQuestions(questions.filter((q) => q.id !== questionId));
        setFilteredQuestions(
          filteredQuestions.filter((q) => q.id !== questionId)
        );
        toast.success("Xóa câu hỏi thành công!");
      } catch (err) {
        toast.error(err.message || "Không thể xóa câu hỏi");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản trị câu hỏi</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Tạo câu hỏi mới
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-gray-700 mb-2" htmlFor="searchTerm">
            Tìm kiếm câu hỏi
          </label>
          <input
            id="searchTerm"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập nội dung câu hỏi..."
          />
        </div>
        <div className="flex-1">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="filterDifficulty"
          >
            Lọc theo độ khó
          </label>
          <select
            id="filterDifficulty"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả</option>
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="form-container bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {isEditMode ? "Sửa câu hỏi" : "Tạo câu hỏi mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="content">
                  Nội dung câu hỏi
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Thủ đô của Pháp là gì?"
                  rows="4"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="difficulty"
                >
                  Độ khó
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleFormChange}
                  className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Đáp án</label>
                {formData.answers.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={answer.content}
                      onChange={(e) =>
                        handleAnswerChange(index, "content", e.target.value)
                      }
                      className="input-field flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Đáp án ${index + 1}`}
                      disabled={loading}
                    />
                    <input
                      type="checkbox"
                      checked={answer.isCorrect}
                      onChange={(e) =>
                        handleAnswerChange(index, "isCorrect", e.target.checked)
                      }
                      className="h-5 w-5"
                      disabled={loading}
                    />
                    <label className="text-gray-700">Đúng</label>
                    {formData.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAnswer}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  Thêm đáp án
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="submit-button flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  disabled={loading}
                >
                  {loading
                    ? "Đang lưu..."
                    : isEditMode
                    ? "Cập nhật"
                    : "Tạo câu hỏi"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                  disabled={loading}
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
          Danh sách câu hỏi
        </h2>
        {loading && !filteredQuestions.length ? (
          <div className="text-center p-4">Đang tải danh sách câu hỏi...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Chưa có câu hỏi nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-left">
                  <th className="p-4 font-semibold">STT</th>
                  <th className="p-4 font-semibold">Nội dung câu hỏi</th>
                  <th className="p-4 font-semibold">Độ khó</th>
                  <th className="p-4 font-semibold">Ngày tạo</th>
                  <th className="p-4 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{question.content}</td>
                    <td className="p-4">
                      {question.difficulty === "EASY"
                        ? "Dễ"
                        : question.difficulty === "MEDIUM"
                        ? "Trung bình"
                        : "Khó"}
                    </td>
                    <td className="p-4">
                      {new Date(question.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 space-x-3">
                      <button
                        onClick={() => openModal(question)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(index)}
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

      {/* ToastContainer */}
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

export default QuestionManagementPage;
