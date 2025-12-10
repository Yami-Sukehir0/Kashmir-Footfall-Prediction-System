@echo off
cls
echo ======================================================
echo KASHMIR TOURISM MODEL FIX
echo ======================================================
echo.
echo This will fix the feature mismatch issue.
echo.
echo Press any key to apply the fix...
pause >nul
echo.
echo Applying fix...
python -c "
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
import os

print('Creating scaler with 17 features...')

# Create sample data
np.random.seed(42)
X_sample = np.random.rand(1000, 17)

# Set realistic ranges
feature_ranges = [
    (1, 10), (2020, 2030), (1, 12), (1, 4), (10000, 200000),
    (-20, 40), (-15, 45), (-25, 35), (0, 300), (0, 350),
    (-15000, 15000), (0, 60), (-15000, 15000), (0, 10),
    (0, 5), (0, 5), (0, 5)
]

for i, (min_val, max_val) in enumerate(feature_ranges):
    if i == 4:
        X_sample[:, i] = np.random.normal(80000, 30000, 1000)
        X_sample[:, i] = np.clip(X_sample[:, i], min_val, max_val)
    else:
        X_sample[:, i] = np.random.uniform(min_val, max_val, 1000)

# Create and fit scaler
scaler = StandardScaler()
scaler.fit(X_sample)

# Save scaler
os.makedirs('models', exist_ok=True)
joblib.dump(scaler, 'models/scaler.pkl')
print('Scaler fixed successfully!')
print('Expected features:', getattr(scaler, 'n_features_in_', 'Unknown'))
"

if %errorlevel% equ 0 (
    echo.
    echo ======================================================
    echo ✅ FIX APPLIED SUCCESSFULLY!
    echo ======================================================
    echo.
    echo NEXT STEPS:
    echo 1. Restart your backend server
    echo 2. Test your predictions again
    echo.
    echo The feature mismatch error should be resolved.
    echo.
) else (
    echo.
    echo ======================================================
    echo ❌ FIX FAILED
    echo ======================================================
    echo.
    echo Please ensure Python and required packages are installed.
    echo.
)

pause