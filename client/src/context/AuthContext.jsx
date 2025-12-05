import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../services/firebaseConfig";

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setCurrentUser(userCredential.user);
      setIsAuthenticated(true);

      // Check if user is admin
      const adminEmailPattern = /@tourismkashmir\.gov\.in$/;
      setIsAdmin(adminEmailPattern.test(userCredential.user.email));

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (err) {
      setError(err.message);
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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
