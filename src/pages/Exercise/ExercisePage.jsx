import React, { useState } from 'react';
import CreateExerciseModal from './CreateExerciseModal';
import ExerciseDetailPage from './ExerciseDetailPage';
import './ExercisePage.css';

// Dữ liệu câu hỏi mẫu
const mockQuestions = [
    { id: 1, content: 'Định nghĩa của thuật toán là gì?', answer: 'A', difficulty: 'easy' },
    { id: 2, content: 'Độ phức tạp thời gian trung bình của Quick Sort?', answer: 'B', difficulty: 'medium' },
    { id: 3, content: 'Khi nào sử dụng Linked List thay cho Array?', answer: 'C', difficulty: 'easy' },
    { id: 4, content: 'Hàm nào dùng để thêm phần tử vào đầu Stack?', answer: 'A', difficulty: 'easy' },
    { id: 5, content: 'Big O của tìm kiếm nhị phân là?', answer: 'B', difficulty: 'easy' },
    { id: 6, content: 'Điểm khác biệt giữa queue và stack?', answer: 'C', difficulty: 'medium' },
    { id: 7, content: 'Phép toán nào trên HashMap có độ phức tạp trung bình O(1)?', answer: 'B', difficulty: 'medium' },
    { id: 8, content: 'Bộ nhớ heap được dùng để làm gì?', answer: 'A', difficulty: 'easy' },
    { id: 9, content: 'Nguyên lý hoạt động của đệ quy?', answer: 'C', difficulty: 'medium' },
    { id: 10, content: 'Làm sao để tránh memory leak trong Java?', answer: 'A', difficulty: 'hard' },
    { id: 11, content: 'Cấu trúc dữ liệu nào tốt nhất cho việc tìm kiếm nhanh?', answer: 'B', difficulty: 'medium' },
    { id: 12, content: 'Thứ tự truy cập của breadth-first search (BFS)?', answer: 'A', difficulty: 'medium' },
    { id: 13, content: 'Heap min và heap max khác nhau thế nào?', answer: 'C', difficulty: 'easy' },
    { id: 14, content: 'Phép toán nào là đặc trưng của cây nhị phân tìm kiếm?', answer: 'B', difficulty: 'medium' },
    { id: 15, content: 'Dijkstra giải bài toán gì?', answer: 'A', difficulty: 'hard' },
    { id: 16, content: 'Thuật toán nào dùng để kiểm tra chu trình trong đồ thị?', answer: 'C', difficulty: 'hard' },
    { id: 17, content: 'Khi nào nên sử dụng Set thay cho List?', answer: 'B', difficulty: 'medium' },
    { id: 18, content: 'Tại sao phải sử dụng Index trong database?', answer: 'A', difficulty: 'medium' },
    { id: 19, content: 'Chức năng của garbage collector là gì?', answer: 'C', difficulty: 'easy' },
    { id: 20, content: 'Trie phù hợp với bài toán gì?', answer: 'B', difficulty: 'hard' },
];

// Dữ liệu bài tập mẫu – chứa 20 câu hỏi!
const mockExercises = [
    {
        id: 1,
        name: 'Bài tập 1',
        instructor: 'Nguyễn Văn A',
        classId: 1,
        className: 'Lớp 12A1',
        startAt: '2025-06-27T08:00',
        endAt: '2025-06-27T10:00',
        durationMinutes: 120,
        createdAt: '2025-06-20T09:00',
        updatedAt: '2025-06-25T10:00',
        questions: [...mockQuestions], // <- Lấy full 20 câu!
        studentCount: 15,
    },
];

const mockClasses = [
    { id: 1, name: 'Lớp 12A1' },
    { id: 2, name: 'Lớp 12A2' },
    { id: 3, name: 'Lớp 11B1' },
];

// Chuyển đổi để truyền qua trang chi tiết
function convertExerciseForDetail(ex) {
    // Tạo đáp án mẫu thực tế đa dạng cho từng câu hỏi
    const questionAnswerMap = {
        1: [
            { label: 'A', text: 'Tập hợp các bước giải quyết bài toán theo trình tự xác định.', isCorrect: ex.questions[0]?.answer === 'A' },
            { label: 'B', text: 'Chỉ là một chương trình máy tính.', isCorrect: ex.questions[0]?.answer === 'B' },
            { label: 'C', text: 'Một cách để lưu trữ dữ liệu.', isCorrect: ex.questions[0]?.answer === 'C' },
            { label: 'D', text: 'Không câu nào đúng.', isCorrect: ex.questions[0]?.answer === 'D' }
        ],
        2: [
            { label: 'A', text: 'O(n^2)', isCorrect: ex.questions[1]?.answer === 'A' },
            { label: 'B', text: 'O(n log n)', isCorrect: ex.questions[1]?.answer === 'B' },
            { label: 'C', text: 'O(log n)', isCorrect: ex.questions[1]?.answer === 'C' }
        ],
        3: [
            { label: 'A', text: 'Khi cần truy cập phần tử liên tiếp nhanh.', isCorrect: ex.questions[2]?.answer === 'A' },
            { label: 'B', text: 'Khi cần chèn/xóa phần tử thường xuyên và không cần truy cập ngẫu nhiên.', isCorrect: ex.questions[2]?.answer === 'B' },
            { label: 'C', text: 'Khi mảng có kích thước cố định.', isCorrect: ex.questions[2]?.answer === 'C' },
            { label: 'D', text: 'Khi không cần lưu trữ dữ liệu.', isCorrect: ex.questions[2]?.answer === 'D' }
        ],
        4: [
            { label: 'A', text: 'push()', isCorrect: ex.questions[3]?.answer === 'A' },
            { label: 'B', text: 'enqueue()', isCorrect: ex.questions[3]?.answer === 'B' },
            { label: 'C', text: 'insert()', isCorrect: ex.questions[3]?.answer === 'C' },
        ],
        5: [
            { label: 'A', text: 'O(n)', isCorrect: ex.questions[4]?.answer === 'A' },
            { label: 'B', text: 'O(log n)', isCorrect: ex.questions[4]?.answer === 'B' },
            { label: 'C', text: 'O(n^2)', isCorrect: ex.questions[4]?.answer === 'C' },
        ],
        // ... bạn có thể thêm đáp án mẫu cho các câu khác tương tự
    };
    return {
        ...ex,
        questions: ex.questions.map((q, idx) => ({
            id: q.id,
            content: q.content,
            options: (questionAnswerMap[q.id] || [
                { label: 'A', text: 'Đáp án A', isCorrect: q.answer === 'A' },
                { label: 'B', text: 'Đáp án B', isCorrect: q.answer === 'B' },
                { label: 'C', text: 'Đáp án C', isCorrect: q.answer === 'C' },
                { label: 'D', text: 'Đáp án D', isCorrect: q.answer === 'D' }
            ])
        }))
    };
}

export default function ExercisePage() {
    const [showModal, setShowModal] = useState(false);
    const [exercises, setExercises] = useState(mockExercises);
    const [searchClass, setSearchClass] = useState('');
    const [selectedExercise, setSelectedExercise] = useState(null);

    const handleCreateExercise = (data) => {
        const classObj = mockClasses.find(cl => String(cl.id) === String(data.classId));
        setExercises([
            ...exercises,
            {
                id: exercises.length + 1,
                name: data.name,
                instructor: 'Bạn',
                classId: data.classId,
                className: classObj ? classObj.name : '',
                startAt: data.startAt,
                endAt: data.endAt,
                durationMinutes: data.durationMinutes,
                createdAt: new Date().toISOString().slice(0, 16),
                updatedAt: new Date().toISOString().slice(0, 16),
                questions: mockQuestions.filter(q => data.questions.includes(q.id)),
                studentCount: Math.floor(Math.random() * 30) + 1,
            },
        ]);
        setShowModal(false);
    };

    const filteredExercises = searchClass
        ? exercises.filter(ex => String(ex.classId) === String(searchClass))
        : exercises;

    return (
        <div className="exercise-page-container">
            <div className="exercise-header">
                <h2>Danh sách bài tập</h2>
                <div>
                    <select
                        value={searchClass}
                        onChange={e => setSearchClass(e.target.value)}
                        style={{ marginRight: 12, padding: '0.4rem 1rem', borderRadius: 6 }}
                    >
                        <option value="">Tất cả lớp</option>
                        {mockClasses.map(cl => (
                            <option key={cl.id} value={cl.id}>{cl.name}</option>
                        ))}
                    </select>
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        Giao bài tập
                    </button>
                </div>
            </div>
            <table className="exercise-table">
                <thead>
                    <tr>
                        <th>Tên bài tập</th>
                        <th>Lớp</th>
                        <th>Thời lượng (phút)</th>
                        <th>Số lượng câu hỏi</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredExercises.map((ex) => {
                        // Xác định trạng thái bài tập
                        const now = new Date();
                        const start = new Date(ex.startAt);
                        const end = new Date(ex.endAt);
                        let status = 'Chưa bắt đầu';
                        let statusClass = 'chua';
                        if (now >= start && now <= end) {
                            status = 'Đang diễn ra';
                            statusClass = 'dang';
                        } else if (now > end) {
                            status = 'Đã kết thúc';
                            statusClass = 'ketthuc';
                        }
                        return (
                            <tr key={ex.id}>
                                <td>{ex.name}</td>
                                <td>{ex.className}</td>
                                <td>{ex.durationMinutes}</td>
                                <td>{ex.questions.length}</td>
                                <td>
                                    {ex.createdAt
                                        ? new Date(ex.createdAt).toLocaleDateString('vi-VN')
                                        : ''}
                                </td>
                                <td><span className={`status ${statusClass}`}>{status}</span></td>
                                <td>
                                    <button
                                        className="create-btn"
                                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.95rem' }}
                                        onClick={() => setSelectedExercise(ex)}
                                    >
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <CreateExerciseModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onCreate={handleCreateExercise}
                questions={mockQuestions}
                classes={mockClasses}
            />

            {/* Modal overlay chi tiết bài tập */}
            {selectedExercise && (
                <div className="exercise-detail-modal-overlay">
                    <div className="exercise-detail-modal-content">
                        <ExerciseDetailPage
                            exercise={convertExerciseForDetail(selectedExercise)}
                            onClose={() => setSelectedExercise(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
