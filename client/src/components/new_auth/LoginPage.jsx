import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      // Provide more specific error messages
      if (err.message.includes("invalid-credential")) {
        setError("Invalid credentials. Please check your email and password.");
      } else if (err.message.includes("network")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          err.message ||
            "Failed to login. Please check your credentials and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Kashmir Tourism Admin Portal</h2>
          <p>Sign in to access the administration dashboard</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Official Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@tourismkashmir.gov.in"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your secure password"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-info">
          <h3>About Admin Access</h3>
          <p>
            This portal is exclusively for authorized personnel of the Kashmir
            Tourism Department.
          </p>
          <p>Features include:</p>
          <ul>
            <li>Footfall prediction analytics</li>
            <li>Resource planning tools</li>
            <li>Visitor trend visualization</li>
            <li>User management</li>
          </ul>
        </div>

        <div className="auth-footer">
          <p>
            Not an administrator? <Link to="/">Return to Public Site</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
