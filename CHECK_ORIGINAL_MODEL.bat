@echo off
cls
title Check Original Model
color 0A

echo.
echo ==================================================
echo    CHECKING ORIGINAL MODEL FILES
echo ==================================================
echo.
echo This will verify the original model files in the
echo root models directory and check their feature count.
echo.
echo Press any key to check original model...
pause >nul
echo.
echo Checking original model files...
echo.
python CHECK_ORIGINAL_MODEL.py
echo.
echo ==================================================
echo Check completed!
echo ==================================================
echo.
echo Press any key to exit...
pause >nul