# PowerShell script to copy original model files to backend directory
Write-Host "==================================================" -ForegroundColor Green
Write-Host "COPYING ORIGINAL MODEL FILES TO BACKEND" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Define source and destination paths
$sourceModel = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model\model.pkl"
$sourceScaler = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\scaler.pkl"
$sourceMetadata = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model_metadata.pkl"

$destDir = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models"
$destModelDir = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model"

$destModel = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model\model.pkl"
$destScaler = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\scaler.pkl"
$destMetadata = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model_metadata.pkl"

Write-Host "Checking source files..." -ForegroundColor Yellow

# Check if source files exist
$missingFiles = @()
if (-not (Test-Path $sourceModel)) { $missingFiles += $sourceModel }
if (-not (Test-Path $sourceScaler)) { $missingFiles += $sourceScaler }
if (-not (Test-Path $sourceMetadata)) { $missingFiles += $sourceMetadata }

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing source files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✅ All source files found" -ForegroundColor Green

Write-Host ""
Write-Host "Creating destination directories..." -ForegroundColor Yellow

# Create destination directories
try {
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir | Out-Null
        Write-Host "✅ Created: $destDir" -ForegroundColor Green
    }
    else {
        Write-Host "✅ Directory exists: $destDir" -ForegroundColor Green
    }
    
    if (-not (Test-Path $destModelDir)) {
        New-Item -ItemType Directory -Path $destModelDir | Out-Null
        Write-Host "✅ Created: $destModelDir" -ForegroundColor Green
    }
    else {
        Write-Host "✅ Directory exists: $destModelDir" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Error creating directories: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Copying files..." -ForegroundColor Yellow

# Copy files
try {
    Copy-Item $sourceModel $destModel -Force
    Write-Host "✅ Copied model file" -ForegroundColor Green
    
    Copy-Item $sourceScaler $destScaler -Force
    Write-Host "✅ Copied scaler file" -ForegroundColor Green
    
    Copy-Item $sourceMetadata $destMetadata -Force
    Write-Host "✅ Copied metadata file" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error copying files: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying copied files..." -ForegroundColor Yellow

# Verify copied files exist
$copiedFiles = @($destModel, $destScaler, $destMetadata)
foreach ($file in $copiedFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "✅ $file ($([math]::Round($size / 1KB, 2)) KB)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $file (NOT FOUND)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "🎉 SUCCESS! Original model files copied to backend!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ SUMMARY:" -ForegroundColor Green
Write-Host "   • Original model files copied to backend directory"
Write-Host "   • Files are in correct locations for app.py"
Write-Host ""
Write-Host "🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Restart your backend server" -ForegroundColor Cyan
Write-Host "   2. Check logs - should show 'Features: ??'" -ForegroundColor Cyan
Write-Host "   3. Test predictions - feature mismatch error should be resolved" -ForegroundColor Cyan
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")