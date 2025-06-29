import React, { useState, useMemo } from 'react';
import './CreateExerciseModal.css';

const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function getNowForInput() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join('-') + 'T' + [
    pad(now.getHours()),
    pad(now.getMinutes())
  ].join(':');
}

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
  const [formError, setFormError] = useState('');
  const [startAtError, setStartAtError] = useState('');
  const [durationError, setDurationError] = useState('');

  const nowString = getNowForInput();

  // Chuẩn hóa questions
  const normalizedQuestions = useMemo(
    () =>
      (questions || [])
        .filter(q => q.questionId !== undefined && q.questionId !== null)
        .map(q => ({
          ...q,
          id: q.questionId,
          difficulty: (q.difficulty ?? 'EASY').toUpperCase(),
        })),
    [questions]
  );

  // Lọc câu hỏi
  const filteredQuestions = useMemo(
    () =>
      normalizedQuestions.filter(
        q =>
          q.content.toLowerCase().includes(searchText.toLowerCase()) &&
          (difficultyFilter ? q.difficulty === difficultyFilter : true)
      ),
    [normalizedQuestions, searchText, difficultyFilter]
  );

  const handleInputChange = e => {
    setFormError('');
    setStartAtError('');
    setDurationError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (qId, checked) => {
    setSelectedQuestions(
      checked
        ? [...selectedQuestions, qId]
        : selectedQuestions.filter(id => id !== qId)
    );
  };

  const handleRemoveTag = id => {
    setSelectedQuestions(selectedQuestions.filter(qid => qid !== id));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setFormError('');
    setStartAtError('');
    setDurationError('');

    if (!form.classId || selectedQuestions.length === 0) return;
    if (!form.startAt || !form.endAt) return;

    const now = new Date();
    const start = new Date(form.startAt);
    const end = new Date(form.endAt);

    if (start.getTime() < now.getTime()) {
      setStartAtError('Không được chọn thời gian trong quá khứ!');
      return;
    }
    if (end <= start) {
      setFormError('Thời gian kết thúc phải SAU thời gian bắt đầu!');
      return;
    }

    const duration = Number(form.durationMinutes);
    if (isNaN(duration) || duration <= 0) {
      setDurationError('Thời lượng phải là số nguyên lớn hơn 0!');
      return;
    }

    onCreate({
      ...form,
      classId: Number(form.classId),
      durationMinutes: duration,
      questionIds: selectedQuestions,
    });
    setForm({ name: '', startAt: '', endAt: '', durationMinutes: '', classId: '' });
    setSelectedQuestions([]);
    setSearchText('');
    setDifficultyFilter('');
    setFormError('');
    setStartAtError('');
    setDurationError('');
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📝 Giao bài tập mới</h3>
        <form onSubmit={handleSubmit} className="exercise-form" noValidate>
          {/* Tên bài tập */}
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
              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                min={nowString}
                onChange={handleInputChange}
                required
              />
              {startAtError && (
                <div style={{ color: 'red', fontSize: 14, marginTop: 2 }}>
                  {startAtError}
                </div>
              )}
            </label>
            <label>
              Kết thúc:
              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                min={form.startAt ? form.startAt : nowString}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Thời lượng (phút):
              <input
                type="number"
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleInputChange}
                required
                min={1}
                step={1}
              />
              {durationError && (
                <div style={{ color: 'red', fontSize: 14, marginTop: 2 }}>
                  {durationError}
                </div>
              )}
            </label>
          </div>
          {/* Hiển thị lỗi form */}
          {formError && (
            <div style={{ color: 'red', marginBottom: 10 }}>{formError}</div>
          )}
          {/* Danh sách chọn câu hỏi */}
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
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
            <div className="question-grid-list">
              {filteredQuestions.length === 0 && (
                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Không có câu hỏi phù hợp.</div>
              )}
              {filteredQuestions.map(q => (
                <label
                  className={`question-card ${selectedQuestions.includes(q.id) ? "selected" : ""}`}
                  key={q.id}
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q.id)}
                    onChange={e => handleCheckboxChange(q.id, e.target.checked)}
                  />
                  <div className="card-content">
                    <div className="card-question">{q.content}</div>
                    <span className={`question-difficulty-tag diff-${q.difficulty}`}>
                      {DIFFICULTY_LABELS[q.difficulty]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {/* Tag các câu hỏi đã chọn */}
            <div className="selected-tags-container">
              {selectedQuestions.map(qId => {
                const q = normalizedQuestions.find(item => item.id === qId);
                if (!q) return null;
                return (
                  <span className="selected-tag" key={qId}>
                    {q.content}
                    <button
                      type="button"
                      className="remove-tag-btn"
                      title="Bỏ chọn"
                      onClick={() => handleRemoveTag(qId)}
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
