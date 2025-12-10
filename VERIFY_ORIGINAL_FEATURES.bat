@echo off
cls
title Verify Original Features
color 0A

echo.
echo ==================================================
echo    VERIFYING ORIGINAL MODEL FEATURES
echo ==================================================
echo.
echo This will check what the original model actually
echo expects and identify the root cause of the issue.
echo.
echo Press any key to verify original features...
pause >nul
echo.
echo Verifying original features...
echo.
python VERIFY_ORIGINAL_FEATURES.py
echo.
echo ==================================================
echo Verification completed!
echo ==================================================
echo.
echo Press any key to exit...
pause >nul