@echo off
color 0E
echo ========================================
echo MODEL ISSUE DIAGNOSIS
echo ========================================
echo.
echo This script will diagnose the exact source
echo of the feature mismatch issue.
echo.
echo Diagnosing:
echo 1. Scaler files and their expected features
echo 2. Model files and their expected features
echo 3. Actual prediction flow
echo.
echo PRESS ANY KEY TO RUN DIAGNOSIS...
pause >nul
echo.
echo Running diagnosis...
echo.
python diagnose_issue.py
echo.
echo ========================================
echo Diagnosis completed!
echo ========================================
echo.
echo Press any key to exit...
pause >nul