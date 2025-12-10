# Simple diagnosis
Write-Host "Checking model files..."

# Check if all required files exist
$modelExists = Test-Path "models\best_model\model.pkl"
$scalerExists = Test-Path "models\scaler.pkl"
$metadataExists = Test-Path "models\best_model_metadata.pkl"

Write-Host "Model exists: $modelExists"
Write-Host "Scaler exists: $scalerExists"
Write-Host "Metadata exists: $metadataExists"

# Show file sizes
if ($modelExists) {
    $size = (Get-Item "models\best_model\model.pkl").Length
    Write-Host "Model size: $size bytes"
}

if ($scalerExists) {
    $size = (Get-Item "models\scaler.pkl").Length
    Write-Host "Scaler size: $size bytes"
}

if ($metadataExists) {
    $size = (Get-Item "models\best_model_metadata.pkl").Length
    Write-Host "Metadata size: $size bytes"
}

Write-Host "Done."