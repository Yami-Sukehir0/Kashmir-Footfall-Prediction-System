import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/new_common/ProtectedRoute';
import LoginPage from './components/new_auth/LoginPage';
import SignupPage from './components/new_auth/SignupPage';
import PublicLayout from './components/new_common/PublicLayout';
import AdminLayout from './components/new_common/AdminLayout';
import HomePage from './components/pages/HomePage';
import FeaturesPage from './components/pages/FeaturesPage';
import LocationsPage from './components/pages/LocationsPage';
import AboutPage from './components/pages/AboutPage';
import UnauthorizedPage from './components/pages/UnauthorizedPage';
import Dashboard from './components/new_admin/Dashboard/Dashboard';
import Predictions from './components/new_admin/Predictions/Predictions';
import PredictionDetail from './components/new_admin/PredictionDetail/PredictionDetail';
import Heatmap from './components/new_admin/Heatmap/Heatmap';
import ResourcePlanner from './components/new_admin/ResourcePlanner/ResourcePlanner';
import UserManagement from './components/new_admin/UserManagement/UserManagement';
import ActivityLogs from './components/new_admin/ActivityLogs/ActivityLogs';
import Profile from './components/new_admin/Profile/Profile';
import TestImagesSlider from './components/pages/TestImagesSlider';
import FirebaseDiagnostic from './FirebaseDiagnostic';
import './App.css';
import './components/new_common/layout.css';
import './components/new_auth/auth.css';

// Test environment variables
console.log('=== Environment Variable Test ===');
console.log('REACT_APP_FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('REACT_APP_FIREBASE_PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
console.log('REACT_APP_FIREBASE_AUTH_DOMAIN:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET');
console.log('Firebase Configured:', !!(
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN &&
  process.env.REACT_APP_FIREBASE_PROJECT_ID
));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout />}> 
            <Route index element={<HomePage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="test-slider" element={<TestImagesSlider />} />
            <Route path="diagnostic" element={<FirebaseDiagnostic />} />
          </Route>
          
          {/* Authentication routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          
          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="predictions/:id" element={<PredictionDetail />} />
            <Route path="heatmap" element={<Heatmap />} />
            <Route path="resources" element={<ResourcePlanner />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    );
}

export default App;