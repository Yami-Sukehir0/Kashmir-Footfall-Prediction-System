@echo off
color 0C
echo ========================================
echo FORCE SCALER FIX
echo ========================================
echo.
echo This will forcefully replace the scaler
echo to expect exactly 17 features.
echo.
echo PRESS ANY KEY TO APPLY FIX...
pause >nul
echo.
echo Applying direct scaler fix...
echo.
python direct_scaler_fix.py
echo.
echo ========================================
echo Fix process completed!
echo PLEASE RESTART YOUR BACKEND SERVER
echo ========================================
echo.
echo Press any key to exit...
pause >nul