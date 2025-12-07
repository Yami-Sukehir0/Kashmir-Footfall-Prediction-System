# Manual Admin Account Setup Guide

## Issue Explanation

The error "No account found with this email address" occurs because the admin account hasn't been created yet in the Firebase Authentication system. Additionally, the "auth/configuration-not-found" error suggests that either:

1. The Firebase project with the provided configuration doesn't exist
2. The API key or project configuration is incorrect
3. The Firebase project hasn't been properly set up

## Solution: Create Admin Account Manually

Follow these steps to create the admin account in Firebase Console:

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account

### Step 2: Select or Create Project

1. If you have a project named "kashmir-footfall", select it
2. If not, create a new project with this name

### Step 3: Enable Authentication

1. In the left sidebar, click on "Authentication"
2. Click on the "Get started" button if authentication is not enabled
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" sign-in provider

### Step 4: Create Admin User

1. Go to the "Users" tab
2. Click on "Add user"
3. Fill in the following details:
   - **Email**: `admin@tourismkashmir.gov.in`
   - **Password**: `KashmirTourism2025!` (or any secure password)
4. Click "Add user"

### Step 5: Verify Configuration

After creating the user, verify that your [.env](file:///C:/Users/HP/OneDrive/Desktop/kashmir-tourism-fullstack/client/.env) file in the `client` directory has the correct configuration:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Base URL
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### Step 6: Test Login

1. Start your application
2. Navigate to the login page
3. Use the following credentials:
   - **Email**: `admin@tourismkashmir.gov.in`
   - **Password**: The password you set in Step 4

## Alternative Solution: Use Demo Credentials

If you prefer to continue using the demo mode for presentation purposes, you can use any email ending with `@tourismkashmir.gov.in` and any password with at least 6 characters:

- **Email**: `admin@tourismkashmir.gov.in`
- **Password**: `password123` (or any password with 6+ characters)

The system will automatically switch to demo mode when it detects that Firebase is not properly configured.

## Troubleshooting

If you continue to experience issues:

1. Double-check that all configuration values in [.env](file:///C:/Users/HP/OneDrive/Desktop/kashmir-tourism-fullstack/client/.env) match your Firebase project settings
2. Ensure that the Firebase project exists and is properly configured
3. Verify that the API key has the necessary permissions
4. Check that the domain restrictions (if any) allow your application domain

## Need Help?

If you need assistance with setting up the Firebase project or have questions about the configuration, please reach out for support.
