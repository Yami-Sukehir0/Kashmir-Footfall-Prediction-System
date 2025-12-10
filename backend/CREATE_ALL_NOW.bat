
@echo off
cls
title Create All Model Files Now
color 0A

echo.
echo ==================================================
echo    DIRECT MODEL FILE CREATION
echo ==================================================
echo.
echo This will create all required model files:
echo - models/best_model/model.pkl
echo - models/scaler.pkl
echo - models/best_model/metadata.pkl
echo.
echo All files will expect exactly 17 features.
echo.
echo Press any key to create files...
pause >nul
echo.
echo Creating all model files...
echo.
python DIRECT_CREATE_ALL.py
echo.
echo ==================================================
echo Process completed!
echo ==================================================
echo.
echo Please restart your backend server now.
echo.
echo Press any key to exit...
pause >nul