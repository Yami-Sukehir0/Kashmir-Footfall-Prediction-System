import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signUp } from "../../services/authService";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Remove isDemoMode since we're always using real Firebase

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check if email domain is authorized
    const allowedDomains = ["tourismkashmir.gov.in"];
    const emailDomain = email.split("@")[1];
    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
      setError(
        "Only official tourism department emails (@tourismkashmir.gov.in) are allowed."
      );
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Sign up the user
      await signUp(email, password);

      // Log in the user after successful signup
      await login(email, password);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      // Use the error message from the auth service or provide a generic one
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Admin Signup</h2>
          <p>Create an account to access the admin dashboard</p>
          <p className="note">
            <i className="fas fa-info-circle"></i> Only official tourism
            department emails are allowed
          </p>
        </div>

        {/* Remove demo mode indicator since we're always using real Firebase */}
        {/* {isDemoMode && (
          <div className="info-message">
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Demo Mode Active</strong>
              <p>
                Account creation is simulated for presentation purposes. Use any
                valid email ending with @tourismkashmir.gov.in
              </p>
            </div>
          </div>
        )} */}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
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
              placeholder="Enter your password (min. 6 characters)"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/auth/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
