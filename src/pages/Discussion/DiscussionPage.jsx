import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDiscussionsByExercise,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
} from "../../services/DiscussionService";
import { getUserIdFromToken } from "../../utils/jwt";
import "./DiscussionPage.css";

export default function DiscussionPage() {
  const { exerciseId } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [inputContent, setInputContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!exerciseId) return;
    setLoading(true);
    getDiscussionsByExercise(exerciseId)
      .then(data =>
        setDiscussions(
          data.map(d => ({
            ...d,
            isMine: userId === d.createdById,
            creator: { name: d.createdByName, avatar: d.avatarUrl },
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [exerciseId, userId]);

  function renderAvatar(user) {
    if (user.avatar)
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="user-avatar"
          style={{ objectFit: "cover" }}
        />
      );
    return (
      <div className="user-avatar placeholder-avatar">
        {user.name?.trim().charAt(0).toUpperCase()}
      </div>
    );
  }

  async function handleSubmit() {
    const content = inputContent.trim();
    if (!content) return;
    try {
      setLoading(true);
      if (editId) {
        await updateDiscussion(editId, content);
        setDiscussions(ds =>
          ds.map(d =>
            d.id === editId ? { ...d, content } : d
          )
        );
      } else {
        const newDiscussion = await createDiscussion(exerciseId, content);
        setDiscussions(ds => [
          {
            ...newDiscussion,
            isMine: true,
            creator: { name: newDiscussion.createdByName, avatar: newDiscussion.avatarUrl },
          },
          ...ds,
        ]);
      }
      setInputContent("");
      setEditId(null);
      setShowInput(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa thảo luận này?")) return;
    try {
      setLoading(true);
      await deleteDiscussion(id);
      setDiscussions(ds => ds.filter(d => d.id !== id));
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(d) {
    setShowInput(true);
    setEditId(d.id);
    setInputContent(d.content);
  }

  function handleClickDiscussion(d) {
    // Chuyển sang trang comment, truyền object discussion qua location.state
    navigate(`/discussions/${exerciseId}/${d.id}`, { state: d });
  }

  return (
    <div className="discussion-base-container">
      <div className="discussion-base-header">
        <h3>Thảo luận của bài tập</h3>
        <button
          className="add-discussion-btn"
          onClick={() => {
            setShowInput(true);
            setEditId(null);
            setInputContent("");
          }}
        >
          <FiPlus size={21} style={{ marginRight: 7 }} />
          Thêm thảo luận
        </button>
      </div>

      {showInput && (
        <div className="discussion-input-row">
          <textarea
            className="discussion-input"
            rows={3}
            placeholder="Nhập nội dung thảo luận..."
            value={inputContent}
            onChange={e => setInputContent(e.target.value)}
            autoFocus
          />
          <button className="send-btn" onClick={handleSubmit} disabled={loading}>
            {editId ? "Cập nhật" : "Gửi"}
          </button>
          <button
            className="cancel-btn"
            onClick={() => {
              setShowInput(false);
              setEditId(null);
              setInputContent("");
            }}
          >
            Hủy
          </button>
        </div>
      )}

      <div className="discussion-list">
        {loading && <div className="empty-state">Đang tải...</div>}
        {!loading && discussions.length === 0 && (
          <div className="empty-state">Chưa có thảo luận nào</div>
        )}
        {discussions.map(d => (
          <div
            key={d.id}
            className="discussion-item"
            onClick={e => {
              if (
                e.target.closest(".edit-btn") ||
                e.target.closest(".delete-btn")
              )
                return;
              handleClickDiscussion(d);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="discussion-avatar">
              {renderAvatar(d.creator)}
            </div>
            <div className="discussion-main">
              <div className="discussion-header">
                <span className="creator-name">{d.creator.name}</span>
                <span className="created-at">
                  {new Date(d.createdAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
                {d.isMine && (
                  <>
                    <button
                      className="edit-btn"
                      title="Sửa"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(d);
                      }}
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      title="Xóa"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(d.id);
                      }}
                    >
                      <FiTrash2 size={17} />
                    </button>
                  </>
                )}
              </div>
              <div className="discussion-content">{d.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
