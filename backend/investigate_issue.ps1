# Investigate why predictions are identical
Write-Host "========================================"
Write-Host "INVESTIGATING IDENTICAL PREDICTIONS ISSUE"
Write-Host "========================================"
Write-Host ""

# Check if model files exist
Write-Host "1. CHECKING MODEL FILES:"
Write-Host "------------------------"
$modelExists = Test-Path "models\best_model\model.pkl"
$scalerExists = Test-Path "models\scaler.pkl"
$metadataExists = Test-Path "models\best_model_metadata.pkl"

Write-Host "Model file: $modelExists"
Write-Host "Scaler file: $scalerExists"  
Write-Host "Metadata file: $metadataExists"

if ($modelExists) {
    $modelSize = (Get-Item "models\best_model\model.pkl").Length
    Write-Host "Model size: $modelSize bytes"
}

Write-Host ""

# Check the app.py file for model loading code
Write-Host "2. CHECKING MODEL LOADING CODE:"
Write-Host "-------------------------------"
$appContent = Get-Content "app.py" -Raw

# Check if load_model function exists
if ($appContent -match "def load_model\(\)") {
    Write-Host "✅ load_model function found"
}
else {
    Write-Host "❌ load_model function NOT found"
}

# Check if model loading is called on startup
if ($appContent -match "load_model\(\)") {
    Write-Host "✅ load_model is called on startup"
}
else {
    Write-Host "❌ load_model is NOT called on startup"
}

# Check if model variables are initialized
if ($appContent -match "model = None") {
    Write-Host "✅ model variable initialized"
}
else {
    Write-Host "❌ model variable NOT initialized"
}

Write-Host ""

# Check feature preparation function
Write-Host "3. CHECKING FEATURE PREPARATION:"
Write-Host "--------------------------------"
if ($appContent -match "def prepare_features\(") {
    Write-Host "✅ prepare_features function found"
}
else {
    Write-Host "❌ prepare_features function NOT found"
}

# Check if location is used in features
if ($appContent -match "location_code.*LOCATION_MAPPING") {
    Write-Host "✅ Location mapping is used in features"
}
else {
    Write-Host "❌ Location mapping NOT used in features"
}

Write-Host ""

# Check for the specific issue - identical predictions for different locations
Write-Host "4. ANALYZING POTENTIAL ISSUES:"
Write-Host "------------------------------"

# Check if there are any obvious issues in the prediction logic
$faultyPatterns = @(
    "weather = WEATHER_DATA\[.*\]\[.*\]",
    "location.*default",
    "location.*fallback"
)

$issuesFound = 0
foreach ($pattern in $faultyPatterns) {
    if ($appContent -match $pattern) {
        Write-Host "⚠️  Potential issue found: $pattern"
        $issuesFound++
    }
}

if ($issuesFound -eq 0) {
    Write-Host "✅ No obvious faulty patterns found"
}

Write-Host ""

# Check if the model_used flag is properly set
Write-Host "5. CHECKING MODEL USAGE INDICATORS:"
Write-Host "----------------------------------"
if ($appContent -match "'model_used': True") {
    Write-Host "✅ Model usage indicator found (True case)"
}
if ($appContent -match "'model_used': False") {
    Write-Host "✅ Model usage indicator found (False case)"
}

Write-Host ""

# Look for the specific problem - are features really different?
Write-Host "6. CHECKING FEATURE DIFFERENCES:"
Write-Host "--------------------------------"
# Extract the feature preparation section
$featureSection = $appContent -split "def prepare_features\(" | Select-Object -Last 1
$featureSection = $featureSection -split "@app.route" | Select-Object -First 1

if ($featureSection -match "location_code.*LOCATION_MAPPING\.get\(location") {
    Write-Host "✅ Location code is properly extracted from LOCATION_MAPPING"
}
else {
    Write-Host "❌ Location code extraction may be faulty"
}

Write-Host ""

Write-Host "========================================"
Write-Host "ANALYSIS SUMMARY"
Write-Host "========================================"
Write-Host ""

Write-Host "Possible causes of identical predictions:"
Write-Host "1. Model not loading properly (silent failure)"
Write-Host "2. Feature preparation not using location properly"
Write-Host "3. Weather data being identical for all locations"
Write-Host "4. Scaling issues with the feature vectors"
Write-Host ""

Write-Host "Recommended next steps:"
Write-Host "1. Check server logs for model loading errors"
Write-Host "2. Verify that LOCATION_MAPPING has different codes for each location"
Write-Host "3. Confirm weather data varies by location"
Write-Host "4. Test with explicit logging of feature vectors"