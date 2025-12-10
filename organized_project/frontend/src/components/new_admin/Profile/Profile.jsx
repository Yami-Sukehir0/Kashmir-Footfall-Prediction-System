import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update the profile
    alert("Profile update functionality would be implemented here");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      alert("New passwords do not match");
      return;
    }
    // In a real app, this would call an API to change the password
    alert("Password change functionality would be implemented here");
  };

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Update Profile
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                value={password.current}
                onChange={(e) =>
                  setPassword({ ...password, current: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={password.new}
                onChange={(e) =>
                  setPassword({ ...password, new: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={password.confirm}
                onChange={(e) =>
                  setPassword({ ...password, confirm: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="account-info">
            <div className="info-item">
              <span className="info-label">Account Created</span>
              <span className="info-value">
                {currentUser?.metadata?.creationTime || "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Login</span>
              <span className="info-value">
                {currentUser?.metadata?.lastSignInTime || "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">User ID</span>
              <span className="info-value">{currentUser?.uid || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
