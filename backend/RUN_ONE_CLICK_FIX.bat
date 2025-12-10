@echo off
cls
color 0A
title One-Click Fix for Kashmir Tourism Model

echo.
echo =====================================================================
echo        KASHMIR TOURISM MODEL - ONE-CLICK FIX
echo =====================================================================
echo.
echo This will fix the feature mismatch issue:
echo "X has 17 features, but StandardScaler is expecting 22 features"
echo.
echo The fix will:
echo 1. Replace the problematic scaler with one that expects 17 features
echo 2. Test that the fix works correctly
echo 3. Provide clear next steps
echo.
echo NOTE: Make sure your backend server is STOPPED before running this.
echo.
echo Press any key to apply the one-click fix...
pause >nul
echo.
echo Applying one-click fix...
echo.
python one_click_fix.py
echo.
echo =====================================================================
echo Process completed!
echo =====================================================================
echo.
echo Please follow the instructions shown above.
echo Remember to restart your backend server after the fix.
echo.
echo Press any key to exit...
pause >nul