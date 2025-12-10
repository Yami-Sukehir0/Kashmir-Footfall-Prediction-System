# Verify that the fix worked
Write-Host "========================================"
Write-Host "VERIFYING FIX FOR MODEL LOADING ISSUE"
Write-Host "========================================"
Write-Host ""

# Check that all model files still exist
$modelExists = Test-Path "models\best_model\model.pkl"
$scalerExists = Test-Path "models\scaler.pkl"
$metadataExists = Test-Path "models\best_model_metadata.pkl"

Write-Host "Model files status:"
Write-Host "  Model: $modelExists"
Write-Host "  Scaler: $scalerExists"
Write-Host "  Metadata: $metadataExists"
Write-Host ""

# Check app.py for the fixed code
$appContent = Get-Content "app.py" -Raw

# Look for the fixed fallback logic
$fixedLogicFound = $appContent -match "weather = WEATHER_DATA\[weather_key\]\.get\(month, WEATHER_DATA\['Gulmarg'\]\.get\(6, default_weather\)\)"

Write-Host "Code fix verification:"
if ($fixedLogicFound) {
    Write-Host "  ✅ Fixed fallback logic found in app.py"
}
else {
    Write-Host "  ❌ Fixed fallback logic NOT found in app.py"
}
Write-Host ""

# Look for the faulty logic to make sure it's gone
$faultyLogicFound = $appContent -match "weather = WEATHER_DATA\[weather_key\]\.get\(month, WEATHER_DATA\['Gulmarg'\]\[6\]\)"

if ($faultyLogicFound) {
    Write-Host "  ❌ Faulty fallback logic STILL present in app.py"
}
else {
    Write-Host "  ✅ Faulty fallback logic removed from app.py"
}
Write-Host ""

Write-Host "========================================"
Write-Host "SUMMARY"
Write-Host "========================================"
Write-Host ""

if ($modelExists -and $scalerExists -and $metadataExists -and $fixedLogicFound -and -not $faultyLogicFound) {
    Write-Host "🎉 ALL FIXES APPLIED SUCCESSFULLY!"
    Write-Host ""
    Write-Host "The prediction system should now:"
    Write-Host "✅ Load the actual ML model"
    Write-Host "✅ Generate varied predictions for different locations"
    Write-Host "✅ Provide accurate visitor forecasts"
    Write-Host ""
    Write-Host "To test the fix:"
    Write-Host "1. Restart the backend server"
    Write-Host "2. Make prediction requests for different locations"
    Write-Host "3. Verify that results vary by location and conditions"
}
else {
    Write-Host "❌ Some issues remain"
    Write-Host "Please check the files and apply missing fixes"
}

Write-Host ""
Write-Host "========================================"