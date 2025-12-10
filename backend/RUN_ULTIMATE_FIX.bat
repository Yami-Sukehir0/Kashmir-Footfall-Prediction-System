@echo off
cls
color 0A
title Ultimate Fix for Kashmir Tourism Model

echo.
echo ====================================================================================
echo        ULTIMATE FIX - ENSURING 17-FEATURE MODEL ONLY
echo ====================================================================================
echo.
echo This will completely fix the feature mismatch issue by:
echo 1. Deleting ALL existing model files (including any 22-feature models)
echo 2. Creating fresh directories
echo 3. Generating realistic 17-feature training data
echo 4. Training a new model that expects exactly 17 features
echo 5. Creating a scaler that expects exactly 17 features
echo 6. Saving all components to correct paths
echo 7. Verifying everything works correctly
echo.
echo NOTE: This is a comprehensive fix that may take 2-3 minutes to complete.
echo      Make sure your backend server is STOPPED before running this.
echo.
echo Press any key to apply the ultimate fix...
pause >nul
echo.
echo Applying ultimate fix (this may take 2-3 minutes)...
echo.
python ULTIMATE_FIX.py
echo.
echo ====================================================================================
echo Ultimate fix process completed!
echo ====================================================================================
echo.
echo Please follow the instructions shown above.
echo Remember to restart your backend server after the fix.
echo.
echo Press any key to exit...
pause >nul