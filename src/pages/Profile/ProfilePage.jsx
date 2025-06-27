import React, { useEffect, useState, useContext } from "react";
import axios from "../../config/axios";
import { toast } from "react-toastify";
import { UserContext } from "../../contexts/InstructorContext";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  const { refreshUser } = useContext(UserContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/Profile/me");
        setProfile(res.data.data);
        setEmail(res.data.data.email);
        setPreview(res.data.data.avatarUrl);
        setAvatarError(false);
      } catch (err) {
        toast.error("Không lấy được thông tin tài khoản");
      }
    };
    fetchProfile();
  }, []);

  // Kiểm tra url ảnh hợp lệ - đồng nhất với Header
  const isValidAvatarUrl = (url) => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    if (url.trim() === "" || url === "null" || url === "undefined") return false;
    if (url.startsWith("http") || url.startsWith("/")) return true;
    return false;
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "I";
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setAvatarError(false);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    if (avatar) formData.append("avatar", avatar);

    try {
  await axios.put("/update/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Lấy lại profile mới từ BE để cập nhật avatar mới nhất
  const profileRes = await axios.get("/Profile/me");
  setProfile(profileRes.data.data);
  setEmail(profileRes.data.data.email);
  setPreview(profileRes.data.data.avatarUrl);
  setEditMode(false);
  setAvatar(null);
  setAvatarError(false);
  await refreshUser();
  toast.success("Cập nhật thành công!");
} catch (err) {
  toast.error("Cập nhật thất bại!");
}
  };

  if (!profile) return <div>Đang tải...</div>;

  // Hiển thị vai trò tiếng Việt
  const getRoleLabel = (role) => {
    if (role === "INSTRUCTOR") return "Giảng viên";
    return role;
  };

  // Avatar đồng nhất với Header: có ảnh thì hiện ảnh, không có thì hiện ký tự đầu tên
  const renderAvatar = () => {
    // Khi đang edit, ưu tiên preview (ảnh mới chọn)
    if (editMode) {
      if (isValidAvatarUrl(preview) && !avatarError) {
        return (
          <img
            src={preview}
            alt="avatar"
            className="profile-avatar-img"
            onError={() => setAvatarError(true)}
          />
        );
      }
      return (
        <div className="profile-avatar-placeholder">
          {getInitial(profile.name)}
        </div>
      );
    }
    
    // Khi không edit, ưu tiên avatarUrl từ profile - đồng nhất với Header
    if (isValidAvatarUrl(profile.avatarUrl) && !avatarError) {
      return (
        <img
          src={
            profile.avatarUrl.startsWith("http")
              ? profile.avatarUrl
              : `http://localhost:8080${profile.avatarUrl}`
          }
          alt="avatar"
          className="profile-avatar-img"
          onError={() => setAvatarError(true)}
        />
      );
    }
    
    return (
      <div className="profile-avatar-placeholder">
        {getInitial(profile.name)}
      </div>
    );
  };

  return (
    <div className="profile-bg">
      <div className="profile-header animated-fadein">
        <h1>Thông tin cá nhân</h1>
        <p>Quản lý thông tin tài khoản của bạn</p>
      </div>
      <div className="profile-container animated-slideup">
        {/* Left */}
        <div className="profile-left-col">
          <div className="profile-avatar-outer">
            {renderAvatar()}
          </div>
          <div className="profile-left-info">
            <div className="profile-fullname">{profile.name}</div>
            <span className="profile-role-badge">{getRoleLabel(profile.role)}</span>
          </div>
        </div>
        {/* Right */}
        <div className="profile-right-col">
          {editMode ? (
            <form onSubmit={handleUpdate}>
              <div className="profile-info-row">
                <div className="profile-info-label">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4Z" stroke="#64748b" strokeWidth="1.5"/>
                    <circle cx="12" cy="7" r="4" stroke="#64748b" strokeWidth="1.5"/>
                  </svg>
                  <span>Họ và tên</span>
                </div>
                <div className="profile-info-value">
                  <b>{profile.name}</b>
                </div>
              </div>
              <hr className="profile-divider"/>
              <div className="profile-info-row">
                <div className="profile-info-label">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M2 4v16h20V4H2Zm2 2h16v12H4V6Zm8 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="#64748b"/>
                  </svg>
                  <span>Email</span>
                </div>
                <div className="profile-info-value">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>
              <div className="profile-info-row">
                <div className="profile-info-label">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#64748b" strokeWidth="1.5"/>
                    <path d="M12 7v6l4 2" stroke="#64748b" strokeWidth="1.5"/>
                  </svg>
                  <span>Avatar</span>
                </div>
                <div className="profile-info-value">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                </div>
              </div>
              <div className="profile-action-row">
                <button className="profile-btn" type="submit">Lưu</button>
                <button className="profile-btn cancel" type="button" onClick={() => setEditMode(false)}>Hủy</button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-info-row">
                <div className="profile-info-label">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4Z" stroke="#64748b" strokeWidth="1.5"/>
                    <circle cx="12" cy="7" r="4" stroke="#64748b" strokeWidth="1.5"/>
                  </svg>
                  <span>Họ và tên</span>
                </div>
                <div className="profile-info-value">
                  <b>{profile.name}</b>
                </div>
              </div>
              <hr className="profile-divider"/>
              <div className="profile-info-row">
                <div className="profile-info-label">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M2 4v16h20V4H2Zm2 2h16v12H4V6Zm8 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="#64748b"/>
                  </svg>
                  <span>Email</span>
                </div>
                <div className="profile-info-value">
                  {profile.email}
                </div>
              </div>
              <div className="profile-action-row">
                <button className="profile-btn" type="button" onClick={() => setEditMode(true)}>
                  Chỉnh sửa thông tin
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;