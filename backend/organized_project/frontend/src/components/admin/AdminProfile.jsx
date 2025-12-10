import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AdminProfile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, you would update the user profile
      // For now, we'll just show a success message
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (profileData.newPassword !== profileData.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    if (profileData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, you would change the user password
      // For now, we'll just show a success message
      setSuccess("Password changed successfully!");

      // Reset password fields
      setProfileData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <h1>Admin Profile</h1>
        <p>Manage your account settings and security</p>
      </div>

      <div className="profile-content">
        {/* Profile Information */}
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                readOnly
              />
              <p className="form-help">
                Email cannot be changed for security reasons
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={profileData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={profileData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={profileData.confirmNewPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="profile-section">
          <h2>Security Settings</h2>
          <div className="security-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
              </div>
              <button className="btn btn-secondary">Enable 2FA</button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Login History</h3>
                <p>View your recent login activity</p>
              </div>
              <button className="btn btn-secondary">View History</button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Session Management</h3>
                <p>View and manage active sessions</p>
              </div>
              <button className="btn btn-secondary">Manage Sessions</button>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="account-info">
            <div className="info-item">
              <span className="info-label">Account Status:</span>
              <span className="info-value">
                <span className="status-badge status-active">Active</span>
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">Administrator</span>
            </div>

            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">January 1, 2024</span>
            </div>

            <div className="info-item">
              <span className="info-label">Last Login:</span>
              <span className="info-value">Just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
