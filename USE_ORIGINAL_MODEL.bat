@echo off
cls
title Use Original Model
color 0A

echo.
echo ==================================================
echo    USING ORIGINAL MODEL FILES
echo ==================================================
echo.
echo This will copy the original model files from the
echo root models directory to the backend directory.
echo.
echo Press any key to use original model files...
pause >nul
echo.
echo Using original model files...
echo.
python USE_ORIGINAL_MODEL.py
echo.
echo ==================================================
echo Process completed!
echo ==================================================
echo.
echo Press any key to exit...
pause >nul