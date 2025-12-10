@echo off
cls
title Fix Model Files Now
color 0A

echo.
echo ==================================================
echo    DIRECT MODEL FILE FIX
echo ==================================================
echo.
echo This will create all missing model files in the
echo correct locations with exactly 17 features.
echo.
echo Press any key to fix model files...
pause >nul
echo.
echo Fixing model files...
echo.
python "FIX_MODEL_FILES_DIRECTLY.py"
echo.
echo ==================================================
echo Process completed!
echo ==================================================
echo.
echo Please restart your backend server now.
echo.
echo Press any key to exit...
pause >nul