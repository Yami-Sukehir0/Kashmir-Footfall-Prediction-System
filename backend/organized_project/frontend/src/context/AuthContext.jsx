import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../services/firebaseConfig";
import {
  login as authServiceLogin,
  logout as authServiceLogout,
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribe;

    try {
      console.log("Initializing Firebase auth listener");

      // Check if auth is properly initialized
      if (!auth || typeof auth.onAuthStateChanged !== "function") {
        console.warn("Firebase auth not properly initialized");
        setLoading(false);
        return;
      }

      // Use Firebase auth state change
      unsubscribe = auth.onAuthStateChanged(
        async (user) => {
          try {
            if (user) {
              setCurrentUser(user);
              setIsAuthenticated(true);

              // Check if user is admin (in a real app, this would come from your backend)
              // For demo purposes, we'll check if the email ends with @tourismkashmir.gov.in
              const adminEmailPattern = /@tourismkashmir\.gov\.in$/;
              setIsAdmin(adminEmailPattern.test(user.email));
            } else {
              setCurrentUser(null);
              setIsAuthenticated(false);
              setIsAdmin(false);
            }
          } catch (err) {
            console.error("Auth state change error:", err);
            setError("Authentication state error: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Firebase auth state error:", error);
          setError("Authentication service error: " + error.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Auth context initialization error:", err);
      setError("Failed to initialize authentication: " + err.message);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);

      const user = await authServiceLogin(email, password);

      setCurrentUser(user);
      setIsAuthenticated(true);

      // Check if user is admin
      const adminEmailPattern = /@tourismkashmir\.gov\.in$/;
      setIsAdmin(adminEmailPattern.test(user.email));

      return user;
    } catch (err) {
      console.error("Login error in context:", err);
      setError(err.message || "Failed to login. Please try again.");
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);

      await authServiceLogout();

      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (err) {
      console.error("Logout error in context:", err);
      setError(err.message || "Failed to logout. Please try again.");
      throw err;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    logout,
    setCurrentUser,
    setIsAuthenticated,
    setIsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
