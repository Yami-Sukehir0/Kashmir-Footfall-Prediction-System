# Simple PowerShell script to check model files
cd "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend"

Write-Host "Checking model files..." -ForegroundColor Green

# Check if files exist
if (Test-Path "models\best_model\model.pkl") {
    $size = (Get-Item "models\best_model\model.pkl").Length
    Write-Host "Model file: $([math]::Round($size / 1KB, 2)) KB" -ForegroundColor Green
}
else {
    Write-Host "Model file: NOT FOUND" -ForegroundColor Red
}

if (Test-Path "models\scaler.pkl") {
    $size = (Get-Item "models\scaler.pkl").Length
    Write-Host "Scaler file: $([math]::Round($size / 1KB, 2)) KB" -ForegroundColor Green
}
else {
    Write-Host "Scaler file: NOT FOUND" -ForegroundColor Red
}

if (Test-Path "models\best_model_metadata.pkl") {
    $size = (Get-Item "models\best_model_metadata.pkl").Length
    Write-Host "Metadata file: $([math]::Round($size / 1KB, 2)) KB" -ForegroundColor Green
}
else {
    Write-Host "Metadata file: NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "Model files copied successfully!" -ForegroundColor Green