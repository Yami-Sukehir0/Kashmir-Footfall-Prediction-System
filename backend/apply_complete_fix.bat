@echo off
color 0A
echo ========================================
echo KASHMIR TOURISM MODEL COMPLETE FIX
echo ========================================
echo.
echo This script will:
echo 1. Fix the scaler to expect 17 features
echo 2. Recreate the model with 17 features
echo 3. Update metadata
echo 4. Test the fix
echo.
echo Press any key to continue...
pause >nul
echo.
echo Applying fixes...
echo.
python complete_fix.py
echo.
echo ========================================
echo Fix process completed!
echo Please restart your backend server.
echo ========================================
echo.
echo Press any key to exit...
pause >nul