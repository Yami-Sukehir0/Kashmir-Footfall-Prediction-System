@echo off
color 0A
title Automated Feature Mismatch Fix

echo.
echo ============================================================
echo    KASHMIR TOURISM - AUTOMATED FEATURE MISMATCH FIX
echo ============================================================
echo.
echo This script will automatically:
echo 1. Diagnose the current feature mismatch issue
echo 2. Fix the scaler to expect exactly 17 features
echo 3. Test that the fix works correctly
echo 4. Provide clear next steps
echo.
echo NOTE: Please ensure your backend server is stopped before running this.
echo.
echo Press any key to begin the automated fix...
pause >nul
echo.
echo Starting automated fix process...
echo.
python AUTOMATED_FIX.py
echo.
echo ============================================================
echo Automated fix process completed!
echo ============================================================
echo.
echo Please follow the instructions provided above.
echo Remember to restart your backend server after the fix.
echo.
echo Press any key to exit...
pause >nul