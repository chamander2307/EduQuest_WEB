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
    if (url.startsWith("http") || url.startsWith("/") || url.startsWith("blob:")) return true;
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
  <div className="profile-bg-v2">
    <div className="profile-card-v2 animate-slideup">
      {/* Left */}
      <div className="profile-left-v2">
            <div className="profile-avatar-v2">
          {editMode && preview ? (
            <img src={preview} alt="avatar" />
          ) : isValidAvatarUrl(profile.avatarUrl) && !avatarError ? (
            <img src={profile.avatarUrl} alt="avatar" />
          ) : (
            <div className="profile-avatar-placeholder-v2">
              <svg width="60" height="60" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#e5e7eb"/>
                <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4Z" stroke="#94a3b8" strokeWidth="1.5"/>
                <circle cx="12" cy="7" r="4" stroke="#94a3b8" strokeWidth="1.5"/>
              </svg>
            </div>
          )}
        </div>
        <div className="profile-name-v2">{profile.name}</div>
        <div className="profile-role-v2">
          <span>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4Z" stroke="#2563eb" strokeWidth="1.5"/>
              <circle cx="12" cy="7" r="4" stroke="#2563eb" strokeWidth="1.5"/>
            </svg>
            {getRoleLabel(profile.role)}
          </span>
        </div>
      </div>
      {/* Right */}
      <div className="profile-right-v2">
        {editMode ? (
          <form onSubmit={handleUpdate}>
            <div className="profile-info-card-v2 animate-pop">
              <div className="profile-info-icon-v2">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4Z" stroke="#2563eb" strokeWidth="1.5"/>
                  <circle cx="12" cy="7" r="4" stroke="#2563eb" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <div className="profile-info-label-v2">Họ và tên</div>
                <div className="profile-info-value-v2">{profile.name}</div>
              </div>
            </div>
            <div className="profile-info-card-v2 animate-pop">
              <div className="profile-info-icon-v2">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path d="M2 4v16h20V4H2Zm2 2h16v12H4V6Zm8 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="#2563eb"/>
                </svg>
              </div>
              <div>
                <div className="profile-info-label-v2">Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="profile-input-v2"
                  style={{marginTop: 4}}
                />
              </div>
            </div>
            <div className="profile-info-card-v2 animate-pop">
              <div className="profile-info-icon-v2">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="1.5"/>
                  <path d="M12 7v6l4 2" stroke="#2563eb" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <div className="profile-info-label-v2">Avatar</div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{marginTop: 4}} />
              </div>
            </div>
            <div className="profile-edit-actions-v2">
              <button className="profile-btn-v2" type="submit">Lưu</button>
              <button className="profile-btn-v2 cancel" type="button" onClick={() => setEditMode(false)}>Hủy</button>
            </div>
          </form>
        ) : (
          <>
            <button className="profile-edit-btn-v2 animate-pop" onClick={() => setEditMode(true)}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M4 21h4.586a1 1 0 0 0 .707-.293l9.414-9.414a2 2 0 0 0 0-2.828l-2.172-2.172a2 2 0 0 0-2.828 0l-9.414 9.414A1 1 0 0 0 3 19.414V21a1 1 0 0 0 1 1Z" stroke="#2563eb" strokeWidth="1.5"/>
                <path d="M15 6l3 3" stroke="#2563eb" strokeWidth="1.5"/>
              </svg>
              Chỉnh sửa thông tin
            </button>
            <div className="profile-info-card-v2 animate-pop">
              <div className="profile-info-icon-v2">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4Z" stroke="#2563eb" strokeWidth="1.5"/>
                  <circle cx="12" cy="7" r="4" stroke="#2563eb" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <div className="profile-info-label-v2">Họ và tên</div>
                <div className="profile-info-value-v2">{profile.name}</div>
              </div>
            </div>
            <div className="profile-info-card-v2 animate-pop">
              <div className="profile-info-icon-v2">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path d="M2 4v16h20V4H2Zm2 2h16v12H4V6Zm8 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="#2563eb"/>
                </svg>
              </div>
              <div>
                <div className="profile-info-label-v2">Email</div>
                <div className="profile-info-value-v2">{profile.email}</div>
              </div>
            </div>
            <div className="profile-info-card-v2 animate-pop">
          <div className="profile-info-icon-v2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="1.5"/>
              <path d="M12 6v6l4 2" stroke="#2563eb" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div className="profile-info-label-v2">Ngày tham gia</div>
            <div className="profile-info-value-v2">
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })
                : "Không rõ"}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  </div>
);
};

export default ProfilePage;