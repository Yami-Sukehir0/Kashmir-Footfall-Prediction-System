import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    role: "user",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/users`, newUser);
      setShowAddUserModal(false);
      setNewUser({ email: "", role: "user" });
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error("Failed to add user:", error);
      alert(
        "Failed to add user: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert(
        "Failed to delete user: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-user-management">
      <div className="users-header">
        <h1>User Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddUserModal(true)}
        >
          <i className="fas fa-plus"></i> Add User
        </button>
      </div>

      {loading ? (
        <div className="users-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {user.lastLoginAt
                        ? formatDate(user.lastLoginAt)
                        : "Never"}
                    </td>
                    <td>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(user.uid)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
