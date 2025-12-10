# Test to see if there are any issues with model loading
Write-Host "========================================"
Write-Host "MODEL LOADING TEST"
Write-Host "========================================"
Write-Host ""

# Check if the success message is in the app.py file
Write-Host "1. CHECKING FOR MODEL LOADING MESSAGES:"
Write-Host "--------------------------------------"
$appContent = Get-Content "app.py" -Raw

if ($appContent -match "Model loaded successfully") {
    Write-Host "✅ Model loading success message found in code"
}
else {
    Write-Host "❌ Model loading success message NOT found in code"
}

if ($appContent -match "Failed to load model") {
    Write-Host "✅ Model loading failure message found in code"
}
else {
    Write-Host "❌ Model loading failure message NOT found in code"
}

Write-Host ""

# Check if there are any obvious issues in the load_model function
Write-Host "2. ANALYZING LOAD_MODEL FUNCTION:"
Write-Host "--------------------------------"
$loadModelSection = $appContent -split "def load_model\(\)" | Select-Object -Last 1
$loadModelSection = $loadModelSection -split "def " | Select-Object -First 1

if ($loadModelSection -match "joblib\.load\(MODEL_PATH\)") {
    Write-Host "✅ Model loading code found"
}
else {
    Write-Host "❌ Model loading code NOT found"
}

if ($loadModelSection -match "joblib\.load\(SCALER_PATH\)") {
    Write-Host "✅ Scaler loading code found"
}
else {
    Write-Host "❌ Scaler loading code NOT found"
}

if ($loadModelSection -match "joblib\.load\(METADATA_PATH\)") {
    Write-Host "✅ Metadata loading code found"
}
else {
    Write-Host "❌ Metadata loading code NOT found"
}

Write-Host ""

# Check the paths
Write-Host "3. CHECKING MODEL PATHS:"
Write-Host "-----------------------"
if ($appContent -match "MODEL_PATH = os\.path\.join\('models', 'best_model', 'model\.pkl'\)") {
    Write-Host "✅ MODEL_PATH is correctly defined"
}
else {
    Write-Host "❌ MODEL_PATH may be incorrectly defined"
}

if ($appContent -match "SCALER_PATH = os\.path\.join\('models', 'scaler\.pkl'\)") {
    Write-Host "✅ SCALER_PATH is correctly defined"
}
else {
    Write-Host "❌ SCALER_PATH may be incorrectly defined"
}

if ($appContent -match "METADATA_PATH = os\.path\.join\('models', 'best_model_metadata\.pkl'\)") {
    Write-Host "✅ METADATA_PATH is correctly defined"
}
else {
    Write-Host "❌ METADATA_PATH may be incorrectly defined"
}

Write-Host ""

# Check if the paths actually exist
Write-Host "4. VERIFYING ACTUAL FILE PATHS:"
Write-Host "------------------------------"
$expectedPaths = @(
    @{Name = "Model"; Path = "models\best_model\model.pkl" },
    @{Name = "Scaler"; Path = "models\scaler.pkl" },
    @{Name = "Metadata"; Path = "models\best_model_metadata.pkl" }
)

foreach ($pathInfo in $expectedPaths) {
    $fullPath = Join-Path $pwd $pathInfo.Path
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "✅ $($pathInfo.Name) exists at $fullPath ($size bytes)"
    }
    else {
        Write-Host "❌ $($pathInfo.Name) NOT found at $fullPath"
    }
}

Write-Host ""

# Check imports
Write-Host "5. CHECKING REQUIRED IMPORTS:"
Write-Host "----------------------------"
if ($appContent -match "import joblib") {
    Write-Host "✅ joblib import found"
}
else {
    Write-Host "❌ joblib import NOT found"
}

Write-Host ""

# Check if there are any issues that would prevent the model from loading
Write-Host "6. LOOKING FOR POTENTIAL ISSUES:"
Write-Host "-------------------------------"
$potentialIssues = @()

# Check for the old faulty pattern we fixed
if ($appContent -match "weather = WEATHER_DATA\[.*\]\.get\(.*, WEATHER_DATA\[.*\]\[.*\]\)") {
    $potentialIssues += "Old faulty weather data access pattern found"
}

# Check for any obvious syntax errors in the load_model function
if ($loadModelSection -match "\}\s*except") {
    $potentialIssues += "Potential syntax error in exception handling"
}

if ($potentialIssues.Count -gt 0) {
    Write-Host "⚠️  POTENTIAL ISSUES FOUND:"
    foreach ($issue in $potentialIssues) {
        Write-Host "   - $issue"
    }
}
else {
    Write-Host "✅ No obvious issues found in code"
}

Write-Host ""
Write-Host "========================================"
Write-Host "CONCLUSION"
Write-Host "========================================"
Write-Host ""

Write-Host "Based on this analysis, the most likely causes of identical predictions are:"
Write-Host "1. Model loading is silently failing (no success message in logs)"
Write-Host "2. Even if model loads, features might not be varying enough to produce different predictions"
Write-Host "3. There could be an issue with the model itself or how it was trained"
Write-Host ""
Write-Host "RECOMMENDATIONS:"
Write-Host "- Check server logs for model loading errors"
Write-Host "- Add explicit logging to see what features are being generated"
Write-Host "- Verify that the model file is not corrupted"
Write-Host "- Test with a simple script that loads and tests the model directly"