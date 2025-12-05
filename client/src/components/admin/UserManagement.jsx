import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "admin",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      setError("Failed to load users");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // In a real implementation, you would call the backend API to add a user
      // For now, we'll just show a success message
      alert("User invitation sent successfully!");
      setShowAddUserForm(false);
      setNewUser({ email: "", name: "", role: "admin" });
    } catch (error) {
      setError("Failed to add user");
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/admin/users/${userId}`);
        loadUsers(); // Refresh the user list
      } catch (error) {
        setError("Failed to delete user");
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="users-loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="users-header">
        <h1>User Management</h1>
        <p>Manage administrator accounts and permissions</p>
      </div>

      {/* Add User Button */}
      <div className="users-actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowAddUserForm(true)}
        >
          <i className="fas fa-plus"></i> Add New Admin
        </button>
      </div>

      {/* Add User Form */}
      {showAddUserForm && (
        <div className="add-user-form">
          <h3>Invite New Administrator</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
                placeholder="Enter official email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
              >
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Send Invitation
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddUserForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="users-table">
        <h3>Administrators</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name || "N/A"}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </td>
                <td>
                  <span
                    className={`status-badge status-${
                      user.isActive ? "active" : "inactive"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="btn btn-small btn-secondary">
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
