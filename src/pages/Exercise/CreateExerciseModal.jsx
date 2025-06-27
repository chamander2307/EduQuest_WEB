import React, { useState } from 'react';
import './CreateExerciseModal.css';

const DIFFICULTY_LABELS = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

export default function CreateExerciseModal({
  show,
  onClose,
  onCreate,
  questions,
  classes,
}) {
  const [form, setForm] = useState({
    name: '',
    startAt: '',
    endAt: '',
    durationMinutes: '',
    classId: '',
  });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (qId, checked) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, qId]);
    } else {
      setSelectedQuestions(selectedQuestions.filter(id => id !== qId));
    }
  };

  const handleRemoveTag = (id) => {
    setSelectedQuestions(selectedQuestions.filter(qid => qid !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.classId) return;
    onCreate({ ...form, questions: selectedQuestions });
    setForm({ name: '', startAt: '', endAt: '', durationMinutes: '', classId: '' });
    setSelectedQuestions([]);
    setSearchText('');
    setDifficultyFilter('');
  };

  if (!show) return null;

  const filteredQuestions = questions.filter(q => {
    const textMatch = q.content.toLowerCase().includes(searchText.toLowerCase());
    const difficultyMatch = difficultyFilter ? q.difficulty === difficultyFilter : true;
    return textMatch && difficultyMatch;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📝 Giao bài tập mới</h3>
        <form onSubmit={handleSubmit} className="exercise-form">
          {/* Tên bài tập: search bar full width, riêng dòng */}
          <div className="exercise-title-group">
            <label htmlFor="exercise-title" className="exercise-title-label">
              Tên bài tập:
            </label>
            <input
              id="exercise-title"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
              placeholder="Nhập tên bài tập..."
              autoComplete="off"
              className="question-search-input exercise-title-input"
            />
          </div>

          {/* 2 hàng 2 cột: lớp - bắt đầu - kết thúc - thời lượng */}
          <div className="exercise-form-fields">
            <label>
              Lớp:
              <select name="classId" value={form.classId} onChange={handleInputChange} required>
                <option value="">-- Chọn lớp --</option>
                {classes.map(cl => (
                  <option key={cl.id} value={cl.id}>{cl.name}</option>
                ))}
              </select>
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
          </div>

          <div className="question-list">
            <span>Chọn các câu hỏi:</span>
            <div className="question-search-filter">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên câu hỏi..."
                className="question-search-input"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <select
                className="question-difficulty-select"
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
              >
                <option value="">Tất cả độ khó</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
            <div className="question-grid-list">
              {filteredQuestions.length === 0 && (
                <div style={{color:'#6b7280', fontStyle:'italic'}}>Không có câu hỏi phù hợp.</div>
              )}
              {filteredQuestions.map(q => (
                <label className={`question-card ${selectedQuestions.includes(q.id) ? "selected" : ""}`} key={q.id}>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q.id)}
                    onChange={e => handleCheckboxChange(q.id, e.target.checked)}
                  />
                  <div className="card-content">
                    <div className="card-question">{q.content}</div>
                    <span className={`question-difficulty-tag diff-${q.difficulty || 'easy'}`}>
                      {DIFFICULTY_LABELS[q.difficulty] || ''}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="selected-tags-container">
              {selectedQuestions.map(qId => {
                const q = questions.find(item => item.id === qId);
                if (!q) return null;
                return (
                  <span className="selected-tag" key={q.id}>
                    {q.content}
                    <button
                      type="button"
                      className="remove-tag-btn"
                      title="Bỏ chọn"
                      onClick={() => handleRemoveTag(q.id)}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit" className="save-btn">Giao</button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
