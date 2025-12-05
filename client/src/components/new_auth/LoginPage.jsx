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
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
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
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Authenticating..." : "Sign In"}
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
