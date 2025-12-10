@echo off
color 0B
echo ========================================
echo KASHMIR TOURISM MODEL TEST
echo ========================================
echo.
echo This script will test if the model prediction
echo is working correctly after the fix.
echo.
echo Testing:
echo 1. Model loading
echo 2. Feature preparation
echo 3. Prediction pipeline
echo 4. Edge cases
echo.
echo Press any key to run tests...
pause >nul
echo.
echo Running tests...
echo.
python test_prediction.py
echo.
echo ========================================
echo Test completed!
echo ========================================
echo.
echo Press any key to exit...
pause >nul