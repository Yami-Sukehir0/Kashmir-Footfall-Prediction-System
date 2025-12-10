# PowerShell script to check model type
Write-Host "==================================================" -ForegroundColor Green
Write-Host "CHECKING MODEL TYPE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Set-Location -Path "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if required files exist
$requiredFiles = @(
    @{Path = "models\best_model\model.pkl"; Name = "Model" },
    @{Path = "models\scaler.pkl"; Name = "Scaler" },
    @{Path = "models\best_model_metadata.pkl"; Name = "Metadata" }
)

Write-Host "Checking required files:" -ForegroundColor Cyan
foreach ($file in $requiredFiles) {
    $path = $file.Path
    $name = $file.Name
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Host "✅ $name file exists ($([math]::Round($size / 1KB, 2)) KB)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $name file NOT found: $path" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "MODEL INFORMATION" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Try to determine model type from file size
$modelPath = "models\best_model\model.pkl"
if (Test-Path $modelPath) {
    $size = (Get-Item $modelPath).Length
    Write-Host "Model file size: $([math]::Round($size / 1KB, 2)) KB" -ForegroundColor Yellow
    
    # Rough estimate based on file size
    if ($size -gt 1000KB) {
        Write-Host "📈 Based on file size, this is likely a complex model (possibly XGBoost)" -ForegroundColor Cyan
    }
    elseif ($size -gt 500KB) {
        Write-Host "📊 Based on file size, this is likely a moderately complex model" -ForegroundColor Cyan
    }
    else {
        Write-Host "📋 Based on file size, this is likely a simpler model (possibly RandomForest)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "NEXT STEPS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. RESTART YOUR BACKEND SERVER" -ForegroundColor Yellow
Write-Host "   The model files are now in the correct location" -ForegroundColor White
Write-Host "   The backend should load the actual trained model" -ForegroundColor White

Write-Host ""
Write-Host "2. CHECK SERVER LOGS" -ForegroundColor Yellow
Write-Host "   Look for: 'Model type: XGBRegressor' (or similar)" -ForegroundColor White
Write-Host "   Instead of: 'Model type: RandomForestRegressor'" -ForegroundColor White

Write-Host ""
Write-Host "3. TEST PREDICTIONS" -ForegroundColor Yellow
Write-Host "   Try predicting Gulmarg January 2026 again" -ForegroundColor White
Write-Host "   You should now see predictions consistent with your training data" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green