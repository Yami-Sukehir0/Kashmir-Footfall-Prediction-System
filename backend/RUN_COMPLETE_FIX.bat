@echo off
cls
color 0A
title Complete Scaler Fix for Kashmir Tourism Model

echo.
echo =========================================================================
echo        COMPLETE SCALER FIX FOR KASHMIR TOURISM MODEL
echo =========================================================================
echo.
echo This will completely fix the feature mismatch issue by:
echo 1. Finding ALL scaler files in the project
echo 2. Fixing EACH one to expect exactly 17 features
echo 3. Testing the main scaler
echo 4. Providing clear next steps
echo.
echo NOTE: Make sure your backend server is STOPPED before running this.
echo.
echo Press any key to apply the complete fix...
pause >nul
echo.
echo Applying complete scaler fix...
echo.
python complete_scaler_fix.py
echo.
echo =========================================================================
echo Complete fix process completed!
echo =========================================================================
echo.
echo Please follow the instructions shown above.
echo Remember to restart your backend server after the fix.
echo.
echo Press any key to exit...
pause >nul