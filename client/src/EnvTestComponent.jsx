import React, { useEffect, useState } from "react";

const EnvTestComponent = () => {
  const [envVars, setEnvVars] = useState({});
  const [firebaseStatus, setFirebaseStatus] = useState("Checking...");
  const [authTestResult, setAuthTestResult] = useState(null);

  useEffect(() => {
    // Check environment variables
    const envVariables = {
      REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN:
        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_STORAGE_BUCKET:
        process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID:
        process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
      REACT_APP_FIREBASE_MEASUREMENT_ID:
        process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    };

    setEnvVars(envVariables);

    // Check if Firebase is properly configured
    const checkFirebaseConfig = async () => {
      try {
        // Check if required env vars are present
        const requiredVars = [
          "REACT_APP_FIREBASE_API_KEY",
          "REACT_APP_FIREBASE_AUTH_DOMAIN",
          "REACT_APP_FIREBASE_PROJECT_ID",
        ];

        const missingVars = requiredVars.filter(
          (varName) => !process.env[varName]
        );

        if (missingVars.length > 0) {
          setFirebaseStatus(
            `❌ Missing required environment variables: ${missingVars.join(
              ", "
            )}`
          );
          return;
        }

        setFirebaseStatus("✅ All required environment variables are present");

        // Try to initialize Firebase
        try {
          const { getApps, initializeApp } = await import("firebase/app");
          const { getAuth } = await import("firebase/auth");

          // Check if Firebase is already initialized
          if (getApps().length === 0) {
            const firebaseConfig = {
              apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
              authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
              storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
              messagingSenderId:
                process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.REACT_APP_FIREBASE_APP_ID,
              measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
            };

            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            setFirebaseStatus(
              (prev) => prev + "\n✅ Firebase initialized successfully"
            );
          } else {
            setFirebaseStatus(
              (prev) => prev + "\nℹ️ Firebase already initialized"
            );
          }
        } catch (initError) {
          setFirebaseStatus(
            `❌ Firebase initialization failed: ${initError.message}`
          );
        }
      } catch (error) {
        setFirebaseStatus(
          `❌ Error checking Firebase config: ${error.message}`
        );
      }
    };

    checkFirebaseConfig();
  }, []);

  const testAuthFunction = async () => {
    setAuthTestResult("Testing...");

    try {
      // Import auth service functions
      const { login } = await import("./services/authService");

      // Test with demo credentials
      const email = "admin@tourismkashmir.gov.in";
      const password = "KashmirDemo2025!";

      try {
        const user = await login(email, password);
        setAuthTestResult(
          `✅ Login successful!\nUser ID: ${user.uid}\nEmail: ${user.email}`
        );
      } catch (error) {
        setAuthTestResult(`❌ Login failed: ${error.message}`);
      }
    } catch (importError) {
      setAuthTestResult(
        `❌ Failed to import auth service: ${importError.message}`
      );
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Firebase Environment Test</h1>

      <h2>Environment Variables</h2>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        {JSON.stringify(envVars, null, 2)}
      </pre>

      <h2>Firebase Status</h2>
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          borderRadius: "4px",
          whiteSpace: "pre-wrap",
        }}
      >
        {firebaseStatus}
      </div>

      <h2>Auth Service Test</h2>
      <button
        onClick={testAuthFunction}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Test Auth Function
      </button>

      {authTestResult && (
        <div
          style={{
            marginTop: "10px",
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
          }}
        >
          {authTestResult}
        </div>
      )}
    </div>
  );
};

export default EnvTestComponent;
