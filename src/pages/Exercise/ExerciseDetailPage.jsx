import React from 'react';
import { FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import './ExerciseDetailPage.css';

export default function ExerciseDetailPage({ exercise, onClose }) {
    if (!exercise) return null;

    const questions = Array.isArray(exercise.questions) ? exercise.questions : [];

    return (
        <div className="diagram-detail-modal">
            <div className="diagram-detail-header">
                <h2>{exercise.name}</h2>
                <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
            <div className="diagram-meta-row">
                <div className="diagram-meta-box">
                    <b>Lớp:</b> {exercise.className}
                </div>
                <div className="diagram-meta-box">
                    <b>Thời lượng:</b> {exercise.durationMinutes} phút
                </div>
                <div className="diagram-meta-box">
                    <b>Thời gian:</b> {(exercise.startAt ?? '').replace('T', ' ')} - {(exercise.endAt ?? '').replace('T', ' ')}
                </div>
                <div className="diagram-meta-box">
                    <b>Đã làm:</b> {exercise.submittedStudentCount ?? exercise.studentCount ?? 0} Sinh viên
                </div>
            </div>
            <div className="diagram-questions-wrapper">
                <div className="diagram-questions-flow grid-2-cols">
                    {questions.map((q, idx) => (
                        <div className="diagram-question-step" key={q.id}>
                            <div className="diagram-step-header">
                                <div className="diagram-step-circle">{idx + 1}</div>
                                <div className="diagram-step-title">{q.content}</div>
                            </div>
                            <div className="diagram-answers-branch">
                                {/* Nếu là câu trắc nghiệm có options */}
                                {Array.isArray(q.options) && q.options.length > 0 && (
                                    q.options.map((opt) => (
                                        <div className={`diagram-answer-item${opt.isCorrect ? ' correct' : ''}`} key={opt.label}>
                                            <FiChevronRight size={16} style={{marginRight: 6, color: '#64748b'}} />
                                            <span>{opt.label}. {opt.text}</span>
                                            {opt.isCorrect && <FiCheckCircle size={18} color="#22c55e" style={{marginLeft: 6}} />}
                                        </div>
                                    ))
                                )}
                                {/* Nếu là câu tự luận hoặc kiểu khác có answers */}
                                {(!q.options || q.options.length === 0) && Array.isArray(q.answers) && (
                                    q.answers.map((ans) => (
                                        <div
                                            className={`diagram-answer-item${ans.isCorrect ? ' correct' : ''}`}
                                            key={ans.id}
                                        >
                                            <FiChevronRight size={16} style={{ marginRight: 6, color: '#64748b' }} />
                                            <span>{ans.content}</span>
                                            {ans.isCorrect && (
                                                <FiCheckCircle size={18} color="#22c55e" style={{ marginLeft: 6 }} />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
