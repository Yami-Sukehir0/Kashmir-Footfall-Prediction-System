@echo off
cls
color 0A
title Create Model Files

echo.
echo ============================================================
echo        SIMPLE MODEL FILE CREATION
echo ============================================================
echo.
echo This will create all required model files:
echo - models/best_model/model.pkl
echo - models/scaler.pkl
echo - models/best_model/metadata.pkl
echo.
echo All files will be configured to use exactly 17 features.
echo.
echo Press any key to create model files...
pause >nul
echo.
echo Creating model files...
echo.
python SIMPLE_CREATE_MODEL.py
echo.
echo ============================================================
echo Process completed!
echo ============================================================
echo.
echo Please restart your backend server after this.
echo.
echo Press any key to exit...
pause >nul