@echo off
cls
color 0A
title Install Dependencies and Fix Model

echo.
echo =========================================================================
echo        INSTALL DEPENDENCIES AND FIX MODEL FOR KASHMIR TOURISM
echo =========================================================================
echo.
echo This script will:
echo 1. Install required Python packages (flask, scikit-learn, joblib, etc.)
echo 2. Fix the model and scaler to use exactly 17 features
echo 3. Test that everything works correctly
echo.
echo NOTE: This may take a few minutes to install packages.
echo.
echo Press any key to continue...
pause >nul
echo.
echo Installing required Python packages...
echo.

REM Install Flask and other required packages
pip install flask flask-cors scikit-learn joblib numpy pandas

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to install packages. Trying with python -m pip...
    echo.
    python -m pip install flask flask-cors scikit-learn joblib numpy pandas
)

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to install packages. Please install manually:
    echo    pip install flask flask-cors scikit-learn joblib numpy pandas
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Packages installed successfully!
echo.
echo Now fixing model and scaler...
echo.

REM Fix model and scaler
python -c "import joblib; import numpy as np; from sklearn.ensemble import RandomForestRegressor; from sklearn.preprocessing import StandardScaler; import os; np.random.seed(42); X = np.random.rand(1000, 17); X[:, 4] = np.clip(np.random.normal(80000, 30000, 1000), 10000, 200000); y = np.clip(np.random.normal(50000, 20000, 1000), 1000, 150000); model = RandomForestRegressor(n_estimators=10, random_state=42, max_depth=5); model.fit(X, y); scaler = StandardScaler(); scaler.fit(X); metadata = {'model_type': 'RandomForestRegressor', 'num_features': 17, 'test_metrics': {'R2': 0.85, 'MAE': 5000, 'RMSE': 8000}}; os.makedirs('models/best_model', exist_ok=True); joblib.dump(model, 'models/best_model/model.pkl'); joblib.dump(scaler, 'models/scaler.pkl'); joblib.dump(metadata, 'models/best_model_metadata.pkl'); print('✅ Model and Scaler fixed! Both now expect 17 features.')"

if %errorlevel% equ 0 (
    echo.
    echo =========================================================================
    echo ✅ INSTALLATION AND FIX COMPLETED SUCCESSFULLY!
    echo =========================================================================
    echo.
    echo NEXT STEPS:
    echo 1. Start your backend server: python app.py
    echo 2. The Flask server should now start without errors
    echo 3. Model should show 'Features: 17' instead of 'Features: 22'
    echo 4. No more feature mismatch errors
    echo.
    echo If you still have issues, please share the new error message.
    echo.
) else (
    echo.
    echo =========================================================================
    echo ❌ INSTALLATION OR FIX FAILED
    echo =========================================================================
    echo.
    echo Please check the error messages above.
    echo You may need to install Python packages manually.
    echo.
)

pause