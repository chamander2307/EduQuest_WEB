import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiThumbsUp } from "react-icons/fi";
import { getCommentsByDiscussion, getDiscussionsByExercise } from "../../services/DiscussionService";
import { getUserIdFromToken } from "../../utils/jwt";
import { connectSocket, disconnectSocket } from "../../utils/DiscussionSocket";
import "./DiscussionCommentPage.css";

export default function DiscussionCommentPage() {
  const { discussionId, exerciseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [discussion, setDiscussion] = useState(location.state || null);
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [showTimeId, setShowTimeId] = useState(null);
  const stompRef = useRef(null);
  const userId = getUserIdFromToken();

  // Nếu thiếu discussion, tự fetch lại theo id
  useEffect(() => {
    if (!discussion && exerciseId) {
      getDiscussionsByExercise(exerciseId).then(ds => {
        const d = ds.find(x => String(x.id) === String(discussionId));
        if (d) setDiscussion(d);
      });
    }
    // eslint-disable-next-line
  }, [exerciseId, discussionId, discussion]);

  // Load comment & connect WebSocket
   useEffect(() => {
    if (!discussionId) return;
    getCommentsByDiscussion(discussionId).then(apiComments => {
      setComments(
        apiComments.map(c => ({
          id: c.id,
          author: { name: c.createdByName, avatar: c.createdByAvatar },
          content: c.content,
          createdAt: c.createdAt,
          likeCount: c.voteCount || 0,
          isMine: userId === c.createdBy,
        }))
      );
    });

    connectSocket(client => {
      stompRef.current = client;
      client.subscribe(`/topic/discussion/${discussionId}`, msg => {
        const body = JSON.parse(msg.body);
        if (body.content) {
          setComments(prev => [
            ...prev,
            {
              id: body.id,
              author: { name: body.createdByName, avatar: body.createdByAvatar },
              content: body.content,
              createdAt: body.createdAt,
              likeCount: body.voteCount || 0,
              isMine: userId === body.createdBy,
            },
          ]);
        } else if (
          body.likeCount !== undefined &&
          body.discussionCommentId !== undefined
        ) {
          setComments(prev =>
            prev.map(c =>
              c.id === body.discussionCommentId
                ? { ...c, likeCount: body.likeCount }
                : c
            )
          );
        }
      });
    });
    return () => {
      disconnectSocket();
    };
  }, [discussionId, userId]);

  // Gửi bình luận
  const handleSend = () => {
    if (!input.trim() || !stompRef.current) return;
    stompRef.current.publish({
      destination: "/app/discussion.comment",
      body: JSON.stringify({ discussionId: Number(discussionId), content: input, createdBy: userId }),
    });
    setInput("");
  };

  // Like bình luận
  const handleLike = (commentId) => {
    if (!stompRef.current) return;
    stompRef.current.publish({
      destination: "/app/discussion.like",
      body: JSON.stringify({ discussionCommentId: commentId, isUpvote: true }),
    });
  };

  return (
    <div className="discussion-comment-message">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="chat-title">
          {discussion?.content || "Chi tiết thảo luận"}
        </div>
      </div>
      <div className="chat-body">
        {comments.map(comment => (
          <div
            key={comment.id}
            className={`chat-message ${comment.isMine ? "mine" : "other"}`}
            onClick={() =>
              setShowTimeId(prev => (prev === comment.id ? null : comment.id))
            }
          >
            <div className="chat-avatar">
              {comment.author.avatar ? (
                <img
                  className={`avatar-circle${comment.isMine ? " mine" : ""}`}
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className={`avatar-circle${comment.isMine ? " mine" : ""}`}>
                  {comment.author.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="chat-content-col">
              {showTimeId === comment.id && (
                <div className="chat-time-above">
                  {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) +
                    " " +
                    new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                </div>
              )}
              {!comment.isMine && (
                <div className="chat-author">{comment.author.name}</div>
              )}
              <div className="chat-content-row">
                <div className="chat-content">{comment.content}</div>
                <button
                  className="chat-like-btn"
                  onClick={e => {
                    e.stopPropagation();
                    handleLike(comment.id);
                  }}
                  title="Like"
                >
                  <FiThumbsUp />
                  <span className="like-count">{comment.likeCount || ""}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          className="chat-input"
          placeholder="Nhập bình luận..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button className="chat-send-btn" onClick={handleSend}>
          Gửi
        </button>
      </div>
    </div>
  );
}
