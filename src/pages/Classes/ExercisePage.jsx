import React, { useState } from 'react';
import './ExercisePage.css';

const mockExercises = [
  {
    id: 1,
    name: 'Bài tập 1',
    instructor: 'Nguyễn Văn A',
    startAt: '2025-06-27T08:00',
    endAt: '2025-06-27T10:00',
    durationMinutes: 120,
    createdAt: '2025-06-20T09:00',
    updatedAt: '2025-06-25T10:00',
  },
  {
    id: 2,
    name: 'Bài tập 2',
    instructor: 'Trần Thị B',
    startAt: '2025-07-01T09:00',
    endAt: '2025-07-01T11:00',
    durationMinutes: 120,
    createdAt: '2025-06-22T09:00',
    updatedAt: '2025-06-26T10:00',
  },
];

const mockQuestions = [
  { id: 1, content: 'Câu hỏi 1' },
  { id: 2, content: 'Câu hỏi 2' },
  { id: 3, content: 'Câu hỏi 3' },
];

export default function ExercisePage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [form, setForm] = useState({
    name: '',
    startAt: '',
    endAt: '',
    durationMinutes: '',
  });

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionSelect = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleCreateExercise = (e) => {
    e.preventDefault();
    // TODO: Gửi dữ liệu lên backend để tạo bài tập mới
    setShowModal(false);
    setForm({ name: '', startAt: '', endAt: '', durationMinutes: '' });
    setSelectedQuestions([]);
  };

  return (
    <div className="exercise-page-container">
      <div className="exercise-header">
        <h2>Danh sách bài tập</h2>
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + Tạo bài tập mới
        </button>
      </div>
      <table className="exercise-table">
        <thead>
          <tr>
            <th>Tên bài tập</th>
            <th>Người tạo</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Thời lượng (phút)</th>
            <th>Số lượng câu hỏi</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {mockExercises.map((ex) => (
            <tr key={ex.id}>
              <td>{ex.name}</td>
              <td>{ex.instructor}</td>
              <td>{ex.startAt.replace('T', ' ')}</td>
              <td>{ex.endAt.replace('T', ' ')}</td>
              <td>{ex.durationMinutes}</td>
              <td>{ex.questionCount || 0}</td>
              <td>{ex.createdAt.replace('T', ' ')}</td>
              <td>{ex.updatedAt.replace('T', ' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Tạo bài tập mới</h3>
            <form onSubmit={handleCreateExercise} className="exercise-form">
              <label>
                Tên bài tập:
                <input name="name" value={form.name} onChange={handleInputChange} required />
              </label>
              <label>
                Bắt đầu:
                <input type="datetime-local" name="startAt" value={form.startAt} onChange={handleInputChange} required />
              </label>
              <label>
                Kết thúc:
                <input type="datetime-local" name="endAt" value={form.endAt} onChange={handleInputChange} required />
              </label>
              <label>
                Thời lượng (phút):
                <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleInputChange} required />
              </label>
              <div className="question-list">
                <span>Chọn câu hỏi:</span>
                {mockQuestions.map((q) => (
                  <label key={q.id} className="question-item">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q.id)}
                      onChange={() => handleQuestionSelect(q.id)}
                    />
                    {q.content}
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Tạo</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
