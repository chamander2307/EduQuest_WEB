import React, { useState, useEffect } from 'react';
import CreateExerciseModal from './CreateExerciseModal';
import ExerciseDetailPage from './ExerciseDetailPage';
import { FiMessageSquare } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getExercisesByInstructor,
    getExercisesByClass,         // <- thêm mới
    createExercise,
    getExerciseDetail
} from '../../services/ExerciseServices';
import { getClassesByInstructor } from '../../services/ClassServices';
import { getQuestionsByInstructor } from '../../services/QuestionServices';
import './ExercisePage.css';

export default function ExercisePage() {
    const [showModal, setShowModal] = useState(false);
    const [exercises, setExercises] = useState([]);
    const [classes, setClasses] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchClass, setSearchClass] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null);
    const navigate = useNavigate();

    // Lấy tất cả bài tập, lớp và câu hỏi ban đầu
    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [exData, clData, qData] = await Promise.all([
                getExercisesByInstructor(),
                getClassesByInstructor(),
                getQuestionsByInstructor()
            ]);
            setExercises(exData);
            setClasses(clData);
            setQuestions(qData);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Không thể lấy dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    // Lấy bài tập khi chọn lớp (lọc bằng API)
    const handleFilterClass = async (classId) => {
        setSearchClass(classId);
        setLoading(true);
        try {
            if (!classId) {
                // Nếu chọn tất cả lớp
                const data = await getExercisesByInstructor();
                setExercises(data);
            } else {
                // Lấy theo lớp được chọn
                const data = await getExercisesByClass(classId);
                setExercises(data);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Không lấy được bài tập theo lớp");
        } finally {
            setLoading(false);
        }
    };

    // Tạo bài tập mới
    const handleCreateExercise = async (exerciseData) => {
        try {
            setLoading(true);
            await createExercise(exerciseData);
            toast.success('Tạo bài tập thành công!');
            setShowModal(false);
            // reload lại filter nếu đang chọn filter, nếu không thì load lại tất cả
            if (searchClass) {
                await handleFilterClass(searchClass);
            } else {
                await fetchAll();
            }
        } catch (err) {
            toast.error(err.message || "Tạo bài tập không thành công");
        } finally {
            setLoading(false);
        }
    };

    // Xem chi tiết bài tập
    const handleShowDetail = async (exerciseId) => {
        setDetailLoading(true);
        try {
            const data = await getExerciseDetail(exerciseId);
            setSelectedExerciseDetail(data);
        } catch (err) {
            toast.error(err.message || "Không lấy được chi tiết bài tập");
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="exercise-page-container">
            <div className="exercise-header">
                <h2>Danh sách bài tập</h2>
                <div>
                    <select
                        value={searchClass}
                        onChange={e => handleFilterClass(e.target.value)}
                        style={{ marginRight: 12, padding: '0.4rem 1rem', borderRadius: 6 }}
                    >
                        <option value="">Tất cả lớp</option>
                        {classes.map(cl => (
                            <option key={cl.id} value={cl.id}>{cl.name}</option>
                        ))}
                    </select>
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        Giao bài tập
                    </button>
                </div>
            </div>
            {loading ? (
                <div style={{ padding: 24, textAlign: 'center' }}>Đang tải danh sách bài tập...</div>
            ) : (
                <table className="exercise-table">
                    <thead>
                        <tr>
                            <th>Tên bài tập</th>
                            <th>Lớp</th>
                            <th>Thời lượng (phút)</th>
                            <th>Số lượng câu hỏi</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exercises.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center' }}>Chưa có bài tập nào</td>
                            </tr>
                        ) : (
                            exercises.map((ex) => {
                                let status = "Chưa bắt đầu";
                                let statusClass = "chua";
                                if (ex.status === "Ongoing") {
                                    status = "Đang diễn ra"; statusClass = "dang";
                                } else if (ex.status === "Ended") {
                                    status = "Đã kết thúc"; statusClass = "ketthuc";
                                }
                                return (
                                    <tr key={ex.id}>
                                        <td>{ex.name}</td>
                                        <td>{ex.className}</td>
                                        <td>{ex.durationMinutes}</td>
                                        <td>{ex.questionCount}</td>
                                        <td>
                                            {ex.createdAt
                                                ? new Date(ex.createdAt).toLocaleDateString('vi-VN')
                                                : ''}
                                        </td>
                                        <td><span className={`status ${statusClass}`}>{status}</span></td>
                                        <td>
                                            <div className="exercise-action-group">
                                                <button
                                                    className="action-btn detail-btn"
                                                    onClick={() => handleShowDetail(ex.id)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                                <button
                                                    className="action-btn discuss-btn"
                                                    onClick={() => navigate(`/discussions/${ex.id}`)}
                                                    title="Thảo luận"
                                                >
                                                    <FiMessageSquare size={17} style={{ marginRight: 3 }} />
                                                    Thảo luận
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            )}

            {/* Modal tạo bài tập mới */}
            <CreateExerciseModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onCreate={handleCreateExercise}
                questions={questions}
                classes={classes}
            />

            {/* Modal chi tiết bài tập */}
            {detailLoading && (
                <div className="exercise-detail-modal-overlay">
                    <div className="exercise-detail-modal-content" style={{ textAlign: "center", padding: 40 }}>
                        <span>Đang tải chi tiết bài tập...</span>
                    </div>
                </div>
            )}
            {selectedExerciseDetail && !detailLoading && (
                <div className="exercise-detail-modal-overlay">
                    <div className="exercise-detail-modal-content">
                        <ExerciseDetailPage
                            exercise={selectedExerciseDetail}
                            onClose={() => setSelectedExerciseDetail(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
