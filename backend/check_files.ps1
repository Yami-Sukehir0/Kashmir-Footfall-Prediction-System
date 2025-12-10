Write-Host "Checking model files..."

# Check if files exist
$modelExists = Test-Path "models\best_model\model.pkl"
$scalerExists = Test-Path "models\scaler.pkl"
$metadataExists = Test-Path "models\best_model_metadata.pkl"

Write-Host "Model file exists: $modelExists"
Write-Host "Scaler file exists: $scalerExists"
Write-Host "Metadata file exists: $metadataExists"

# Show file sizes if they exist
if ($modelExists) {
    $modelSize = (Get-Item "models\best_model\model.pkl").Length
    Write-Host "Model file size: $modelSize bytes"
}

if ($scalerExists) {
    $scalerSize = (Get-Item "models\scaler.pkl").Length
    Write-Host "Scaler file size: $scalerSize bytes"
}

if ($metadataExists) {
    $metadataSize = (Get-Item "models\best_model_metadata.pkl").Length
    Write-Host "Metadata file size: $metadataSize bytes"
}