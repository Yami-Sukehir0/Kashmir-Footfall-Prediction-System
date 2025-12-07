import React, { useState, useEffect } from "react";
import { auth } from "./services/firebaseConfig";

const FirebaseDiagnostic = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState({
    envVars: {},
    firebaseInitialized: false,
    authAvailable: false,
    authMethods: [],
    demoMode: false,
    userState: null,
  });

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        // Check environment variables
        const envVars = {
          REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY
            ? "SET"
            : "NOT SET",
          REACT_APP_FIREBASE_PROJECT_ID: process.env
            .REACT_APP_FIREBASE_PROJECT_ID
            ? "SET"
            : "NOT SET",
          REACT_APP_FIREBASE_AUTH_DOMAIN: process.env
            .REACT_APP_FIREBASE_AUTH_DOMAIN
            ? "SET"
            : "NOT SET",
        };

        // Check Firebase auth object
        const authAvailable = !!auth;
        const demoMode =
          !auth || typeof auth.signInWithEmailAndPassword !== "function";

        // Get auth methods if available
        const authMethods = authAvailable ? Object.keys(auth) : [];

        // Check user state
        let userState = "UNKNOWN";
        if (auth && auth.currentUser) {
          userState = "LOGGED_IN";
        } else if (auth && !auth.currentUser) {
          userState = "NOT_LOGGED_IN";
        }

        setDiagnosticInfo({
          envVars,
          firebaseInitialized: true,
          authAvailable,
          authMethods,
          demoMode,
          userState,
        });
      } catch (error) {
        console.error("Diagnostic error:", error);
        setDiagnosticInfo((prev) => ({
          ...prev,
          error: error.message,
        }));
      }
    };

    runDiagnostic();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>Firebase Diagnostic Tool</h1>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h2>Environment Variables</h2>
        <pre>{JSON.stringify(diagnosticInfo.envVars, null, 2)}</pre>
      </div>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h2>Firebase Status</h2>
        <p>
          <strong>Firebase Initialized:</strong>{" "}
          {diagnosticInfo.firebaseInitialized ? "YES" : "NO"}
        </p>
        <p>
          <strong>Auth Available:</strong>{" "}
          {diagnosticInfo.authAvailable ? "YES" : "NO"}
        </p>
        <p>
          <strong>Demo Mode:</strong> {diagnosticInfo.demoMode ? "YES" : "NO"}
        </p>
        <p>
          <strong>User State:</strong> {diagnosticInfo.userState}
        </p>
      </div>

      {diagnosticInfo.authMethods.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <h2>Available Auth Methods</h2>
          <ul>
            {diagnosticInfo.authMethods.map((method) => (
              <li key={method}>{method}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnosticInfo.error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <h2>Error</h2>
          <p>{diagnosticInfo.error}</p>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#d1ecf1",
          color: "#0c5460",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        <h2>Interpretation</h2>
        {diagnosticInfo.demoMode ? (
          <p>
            <strong>Application is running in DEMO MODE.</strong> This means
            Firebase authentication is not active. The application falls back to
            demo mode when:
          </p>
        ) : (
          <p>
            <strong>Application is using REAL FIREBASE AUTHENTICATION.</strong>{" "}
            This means Firebase is properly configured.
          </p>
        )}
        <ul>
          <li>
            Firebase configuration values are missing from environment variables
          </li>
          <li>Firebase project doesn't exist or configuration is incorrect</li>
          <li>Network issues preventing Firebase initialization</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseDiagnostic;
