import instance from "../config/axios";

// Lấy list discussion cho 1 bài tập
export const getDiscussionsByExercise = async (exerciseId) => {
  const res = await instance.get(`/discussions/exercises/${exerciseId}`);
  if (res.data?.data) return res.data.data;
  throw new Error(res.data?.message || "Không lấy được thảo luận");
};

// Tạo discussion
export const createDiscussion = async (exerciseId, content) => {
  const res = await instance.post("/discussions", { exerciseId, content });
  if (res.data?.data) return res.data.data;
  throw new Error(res.data?.message || "Tạo thảo luận không thành công");
};

// Sửa discussion
export const updateDiscussion = async (id, content) => {
  const res = await instance.put(`/discussions/${id}`, { content });
  if (res.data?.data) return res.data.data;
  throw new Error(res.data?.message || "Sửa thảo luận không thành công");
};

// Xoá discussion
export const deleteDiscussion = async (id) => {
  const res = await instance.delete(`/discussions/${id}`);
  if (res.data?.code === 200) return true;
  throw new Error(res.data?.message || "Xoá thảo luận không thành công");
};

// Lấy bình luận cho 1 discussion
export const getCommentsByDiscussion = async (discussionId) => {
  const res = await instance.get(`/discussions/${discussionId}/comments`);
  if (res.data?.data) return res.data.data;
  throw new Error(res.data?.message || "Không lấy được bình luận");
};
