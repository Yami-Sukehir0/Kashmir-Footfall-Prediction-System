# PowerShell script to check original model files
Write-Host "==================================================" -ForegroundColor Green
Write-Host "CHECKING ORIGINAL MODEL FILES" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Define paths
$modelPath = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model\model.pkl"
$scalerPath = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\scaler.pkl"

Write-Host "Checking if model files exist..." -ForegroundColor Yellow

# Check if files exist
if (Test-Path $modelPath) {
    Write-Host "✅ Model file found: $modelPath" -ForegroundColor Green
} else {
    Write-Host "❌ Model file NOT found: $modelPath" -ForegroundColor Red
    exit 1
}

if (Test-Path $scalerPath) {
    Write-Host "✅ Scaler file found: $scalerPath" -ForegroundColor Green
} else {
    Write-Host "❌ Scaler file NOT found: $scalerPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "File sizes:" -ForegroundColor Yellow
$modelSize = (Get-Item $modelPath).Length
$scalerSize = (Get-Item $scalerPath).Length
Write-Host "  Model: $([math]::Round($modelSize / 1KB, 2)) KB"
Write-Host "  Scaler: $([math]::Round($scalerSize / 1KB, 2)) KB"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "MANUAL VERIFICATION INSTRUCTIONS:" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Since Python is not available, here's how to fix the issue:"
Write-Host ""
Write-Host "1. Copy the original model files to the backend directory:" -ForegroundColor Cyan
Write-Host "   FROM: c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model\model.pkl"
Write-Host "   TO:   c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model\model.pkl"
Write-Host ""
Write-Host "   FROM: c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\scaler.pkl"
Write-Host "   TO:   c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\scaler.pkl"
Write-Host ""
Write-Host "   FROM: c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model_metadata.pkl"
Write-Host "   TO:   c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model_metadata.pkl"
Write-Host ""
Write-Host "2. After copying, restart your backend server" -ForegroundColor Cyan
Write-Host "3. Check the logs for 'Features: 17' instead of 'Features: 22'" -ForegroundColor Cyan
Write-Host ""
Write-Host "This should resolve the feature mismatch error!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")