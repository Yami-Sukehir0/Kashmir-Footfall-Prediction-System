# PowerShell script to diagnose identical predictions issue
Write-Host "==================================================" -ForegroundColor Green
Write-Host "DIAGNOSING IDENTICAL PREDICTIONS ISSUE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Set-Location -Path "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if required model files exist
Write-Host "Checking model files:" -ForegroundColor Cyan
$requiredFiles = @(
    @{Path = "models\best_model\model.pkl"; Name = "Model" },
    @{Path = "models\scaler.pkl"; Name = "Scaler" },
    @{Path = "models\best_model_metadata.pkl"; Name = "Metadata" }
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    $path = $file.Path
    $name = $file.Name
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Host "✅ $name file exists ($([math]::Round($size / 1KB, 2)) KB)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $name file NOT found: $path" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""
if ($allFilesExist) {
    Write-Host "✅ All model files are present" -ForegroundColor Green
}
else {
    Write-Host "❌ Some model files are missing" -ForegroundColor Red
    Write-Host "Please ensure all model files are in the correct locations" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "ANALYZING THE IDENTICAL PREDICTIONS PROBLEM" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Based on code analysis, here are the most likely causes:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. FEATURE PREPARATION ISSUE" -ForegroundColor Yellow
Write-Host "   • The prepare_features() function might not be properly" -ForegroundColor White
Write-Host "     encoding different locations, resulting in identical" -ForegroundColor White
Write-Host "     feature vectors for all predictions." -ForegroundColor White

Write-Host ""
Write-Host "2. MODEL NOT LOADING" -ForegroundColor Yellow
Write-Host "   • The system might be falling back to a hardcoded" -ForegroundColor White
Write-Host "     prediction value instead of using the actual model." -ForegroundColor White

Write-Host ""
Write-Host "3. SCALING PROBLEM" -ForegroundColor Yellow
Write-Host "   • The scaler might not be transforming features correctly," -ForegroundColor White
Write-Host "     leading to identical scaled inputs." -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "HOW TO FIX PYTHON INSTALLATION" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. UNINSTALL MICROSOFT STORE PYTHON (Optional)" -ForegroundColor Yellow
Write-Host "   • Go to Settings > Apps > Apps & features" -ForegroundColor White
Write-Host "   • Find 'Python' and uninstall it" -ForegroundColor White

Write-Host ""
Write-Host "2. INSTALL OFFICIAL PYTHON" -ForegroundColor Yellow
Write-Host "   • Download from https://www.python.org/downloads/" -ForegroundColor White
Write-Host "   • Choose latest stable version (3.9 or higher)" -ForegroundColor White
Write-Host "   • During installation, check 'Add Python to PATH'" -ForegroundColor White

Write-Host ""
Write-Host "3. VERIFY INSTALLATION" -ForegroundColor Yellow
Write-Host "   • Open new Command Prompt" -ForegroundColor White
Write-Host "   • Run: python --version" -ForegroundColor White
Write-Host "   • Run: pip --version" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "AFTER FIXING PYTHON" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. INSTALL REQUIRED PACKAGES:" -ForegroundColor Yellow
Write-Host "   pip install flask flask-cors joblib numpy scikit-learn xgboost" -ForegroundColor White

Write-Host ""
Write-Host "2. TEST THE MODEL:" -ForegroundColor Yellow
Write-Host "   cd c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend" -ForegroundColor White
Write-Host "   python test_prediction.py" -ForegroundColor White

Write-Host ""
Write-Host "3. START THE SERVER:" -ForegroundColor Yellow
Write-Host "   python app.py" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "WHAT TO LOOK FOR IN SERVER LOGS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "✅ GOOD SIGNS:" -ForegroundColor Green
Write-Host "   • '✓ Model loaded successfully'" -ForegroundColor White
Write-Host "   • 'Model type: XGBRegressor' (or similar XGBoost identifier)" -ForegroundColor White
Write-Host "   • 'Features: 17'" -ForegroundColor White
Write-Host "   • 'ML Model Prediction: [Location] [Year]-[Month] → [Number] visitors'" -ForegroundColor White

Write-Host ""
Write-Host "❌ BAD SIGNS:" -ForegroundColor Red
Write-Host "   • '✗ Failed to load model: ...'" -ForegroundColor White
Write-Host "   • 'Model type: RandomForestRegressor'" -ForegroundColor White
Write-Host "   • No prediction log messages" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "EXPECTED RESULTS AFTER FIX" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "BEFORE FIX:" -ForegroundColor Red
Write-Host "   • Identical predictions for all destinations (54,495 visitors)" -ForegroundColor White
Write-Host "   • Server logs might show loading errors" -ForegroundColor White

Write-Host ""
Write-Host "AFTER FIX:" -ForegroundColor Green
Write-Host "   • Different predictions for different destinations" -ForegroundColor White
Write-Host "   • Server logs show 'Model type: XGBRegressor'" -ForegroundColor White
Write-Host "   • Predictions reflect training data patterns" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "TECHNICAL DETAILS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "The prepare_features() function creates 17 features:" -ForegroundColor Cyan
Write-Host "   1. Location encoding (different for each location)" -ForegroundColor White
Write-Host "   2. Year" -ForegroundColor White
Write-Host "   3. Month" -ForegroundColor White
Write-Host "   4. Season" -ForegroundColor White
Write-Host "   5. Rolling average" -ForegroundColor White
Write-Host "   6. Temperature mean" -ForegroundColor White
Write-Host "   7. Temperature max" -ForegroundColor White
Write-Host "   8. Temperature min" -ForegroundColor White
Write-Host "   9. Precipitation" -ForegroundColor White
Write-Host "   10. Sunshine duration" -ForegroundColor White
Write-Host "   11. Temperature-sunshine interaction" -ForegroundColor White
Write-Host "   12. Temperature range" -ForegroundColor White
Write-Host "   13. Precipitation-temperature interaction" -ForegroundColor White
Write-Host "   14. Holiday count" -ForegroundColor White
Write-Host "   15. Long weekend count" -ForegroundColor White
Write-Host "   16. National holiday count" -ForegroundColor White
Write-Host "   17. Festival holiday count" -ForegroundColor White

Write-Host ""
Write-Host "If all locations get identical predictions, check:" -ForegroundColor Yellow
Write-Host "   • Is location encoding working properly?" -ForegroundColor White
Write-Host "   • Are weather data values varying by location?" -ForegroundColor White
Write-Host "   • Is the actual model being used?" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green