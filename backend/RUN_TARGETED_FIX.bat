@echo off
cls
color 0A
title Targeted Scaler Fix for Kashmir Tourism Model

echo.
echo =========================================================================
echo        TARGETED SCALER FIX FOR KASHMIR TOURISM MODEL
echo =========================================================================
echo.
echo This will fix the EXACT scaler path used by app.py:
echo "models/scaler.pkl"
echo.
echo The fix will:
echo 1. Create a scaler that expects exactly 17 features
echo 2. Save it to the exact path used by app.py
echo 3. Test that the fix works correctly
echo 4. Provide clear next steps
echo.
echo NOTE: Make sure your backend server is STOPPED before running this.
echo       Run this from the backend directory.
echo.
echo Press any key to apply the targeted fix...
pause >nul
echo.
echo Applying targeted scaler fix...
echo.
python targeted_fix.py
echo.
echo =========================================================================
echo Targeted fix process completed!
echo =========================================================================
echo.
echo Please follow the instructions shown above.
echo Remember to restart your backend server after the fix.
echo.
echo Press any key to exit...
pause >nul