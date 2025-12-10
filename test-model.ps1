# PowerShell script to test model loading
Write-Host "==================================================" -ForegroundColor Green
Write-Host "TESTING MODEL LOADING" -ForegroundColor Green
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
Write-Host "MODEL LOADING TEST" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Try to load the model using Python subprocess
try {
    Write-Host "Attempting to load model using Python..." -ForegroundColor Yellow
    $pythonCmd = @"
import joblib
import os

# Load model
model = joblib.load('models/best_model/model.pkl')
print(f'Model type: {type(model).__name__}')
print(f'Features: {model.n_features_in_}')

# Load scaler
scaler = joblib.load('models/scaler.pkl')
print(f'Scaler features: {scaler.n_features_in_}')

# Load metadata
metadata = joblib.load('models/best_model_metadata.pkl')
print(f'Metadata: {metadata}')
"@
    
    $result = python -c $pythonCmd
    Write-Host "✅ Python execution successful:" -ForegroundColor Green
    Write-Host $result -ForegroundColor White
    
}
catch {
    Write-Host "❌ Python execution failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor White
    
    # Try alternative approach
    Write-Host ""
    Write-Host "Trying alternative approach..." -ForegroundColor Yellow
    
    # Check if we can determine model type from file size or other characteristics
    $modelPath = "models\best_model\model.pkl"
    if (Test-Path $modelPath) {
        $size = (Get-Item $modelPath).Length
        Write-Host "Model file size: $([math]::Round($size / 1KB, 2)) KB" -ForegroundColor Yellow
        
        # Rough estimate: XGBoost models are typically larger than simple RandomForest models
        if ($size -gt 1000KB) {
            Write-Host "📈 Based on file size, this is likely a complex model (possibly XGBoost)" -ForegroundColor Cyan
        }
        else {
            Write-Host "📊 Based on file size, this is likely a simpler model" -ForegroundColor Cyan
        }
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
Write-Host "2. TEST PREDICTIONS" -ForegroundColor Yellow
Write-Host "   Try predicting Gulmarg January 2026 again" -ForegroundColor White
Write-Host "   You should now see predictions consistent with your training data" -ForegroundColor White

Write-Host ""
Write-Host "3. VERIFY RESULTS" -ForegroundColor Yellow
Write-Host "   If predictions are still low, check:" -ForegroundColor White
Write-Host "   • Was target variable transformed during training?" -ForegroundColor White
Write-Host "   • Are there post-processing steps reducing predictions?" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")