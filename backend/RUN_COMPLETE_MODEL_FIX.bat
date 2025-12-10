@echo off
cls
color 0A
title Complete Model and Scaler Fix

echo.
echo =========================================================================
echo        COMPLETE MODEL AND SCALER FIX FOR KASHMIR TOURISM
echo =========================================================================
echo.
echo This will fix BOTH the model and scaler to use exactly 17 features:
echo - Model: models/best_model/model.pkl
echo - Scaler: models/scaler.pkl
echo - Metadata: models/best_model_metadata.pkl
echo.
echo The fix will:
echo 1. Create a model that expects exactly 17 features (not 22)
echo 2. Create a scaler that expects exactly 17 features (not 22)
echo 3. Save both to the exact paths used by app.py
echo 4. Test that the fix works correctly
echo.
echo NOTE: Make sure your backend server is STOPPED before running this.
echo       Run this from the backend directory.
echo.
echo Press any key to apply the complete fix...
pause >nul
echo.
echo Applying complete model and scaler fix...
echo.
python complete_model_fix.py
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