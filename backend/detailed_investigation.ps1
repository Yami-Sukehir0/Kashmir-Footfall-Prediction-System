# Detailed investigation of the identical predictions issue
Write-Host "========================================"
Write-Host "DETAILED INVESTIGATION OF PREDICTION ISSUE"
Write-Host "========================================"
Write-Host ""

# Check if model files exist and their sizes
Write-Host "1. MODEL FILE CHECK:"
Write-Host "-------------------"
$modelPath = "models\best_model\model.pkl"
$scalerPath = "models\scaler.pkl"
$metadataPath = "models\best_model_metadata.pkl"

$files = @(
    @{Name = "Model"; Path = $modelPath },
    @{Name = "Scaler"; Path = $scalerPath },
    @{Name = "Metadata"; Path = $metadataPath }
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        $size = (Get-Item $file.Path).Length
        Write-Host "✅ $($file.Name) exists ($size bytes)"
    }
    else {
        Write-Host "❌ $($file.Name) missing at $($file.Path)"
    }
}
Write-Host ""

# Check the app.py file for key indicators
Write-Host "2. CODE ANALYSIS:"
Write-Host "-----------------"
$appContent = Get-Content "app.py" -Raw

# Check if model loading function exists and is called
if ($appContent -match "def load_model\(\)") {
    Write-Host "✅ load_model function exists"
}
else {
    Write-Host "❌ load_model function missing"
}

if ($appContent -match "load_model\(\)" -and $appContent.IndexOf("load_model()") -lt $appContent.IndexOf("def predict()")) {
    Write-Host "✅ load_model is called on startup"
}
else {
    Write-Host "❌ load_model may not be called on startup"
}

# Check if model variables are initialized
if ($appContent -match "model = None") {
    Write-Host "✅ model variable initialized"
}
else {
    Write-Host "❌ model variable not initialized"
}

# Check if LOCATION_MAPPING has different values
Write-Host ""
Write-Host "3. LOCATION MAPPING ANALYSIS:"
Write-Host "----------------------------"
$locationMappingSection = $appContent -split "# Location encoding" | Select-Object -Last 1
$locationMappingSection = $locationMappingSection -split "# Weather data by location" | Select-Object -First 1

# Extract location mappings
$locations = @{}
$locationLines = $locationMappingSection -split "`n" | Where-Object { $_ -match "'" }
foreach ($line in $locationLines) {
    if ($line -match "'(.+)':\s*(\d+)") {
        $location = $matches[1]
        $code = $matches[2]
        $locations[$location] = $code
    }
}

Write-Host "Found $($locations.Count) locations with codes:"
foreach ($loc in $locations.Keys) {
    Write-Host "  $loc : $($locations[$loc])"
}

Write-Host ""
if ($locations.Count -ge 10) {
    Write-Host "✅ All 10 locations have unique codes"
}
else {
    Write-Host "❌ Some locations may be missing or have duplicate codes"
}

# Check if WEATHER_DATA has different values for different locations
Write-Host ""
Write-Host "4. WEATHER DATA ANALYSIS:"
Write-Host "-------------------------"
$weatherSection = $appContent -split "# Weather data by location and month" | Select-Object -Last 1
$weatherSection = $weatherSection -split "# Holiday data for Kashmir" | Select-Object -First 1

# Count locations in weather data
$weatherLocations = @()
$weatherLines = $weatherSection -split "`n" | Where-Object { $_ -match "#" -and $_ -match "'" }
foreach ($line in $weatherLines) {
    if ($line -match "# (.+) \(") {
        $weatherLocations += $matches[1]
    }
}

Write-Host "Found $($weatherLocations.Count) locations in weather data:"
foreach ($loc in $weatherLocations) {
    Write-Host "  $loc"
}

Write-Host ""
if ($weatherLocations.Count -ge 10) {
    Write-Host "✅ All 10 locations have weather data"
}
else {
    Write-Host "❌ Some locations may be missing weather data"
}

# Check feature preparation function
Write-Host ""
Write-Host "5. FEATURE PREPARATION ANALYSIS:"
Write-Host "--------------------------------"
if ($appContent -match "def prepare_features\(") {
    Write-Host "✅ prepare_features function exists"
    
    # Check if location code is used
    $featureSection = $appContent -split "def prepare_features\(" | Select-Object -Last 1
    $featureSection = $featureSection -split "@app.route" | Select-Object -First 1
    
    if ($featureSection -match "location_code.*LOCATION_MAPPING") {
        Write-Host "✅ Location code is extracted from LOCATION_MAPPING"
    }
    else {
        Write-Host "❌ Location code extraction may be faulty"
    }
    
    # Check if features include location_code as first feature
    if ($featureSection -match "features.*=\s*\[\s*location_code") {
        Write-Host "✅ location_code is first feature in feature vector"
    }
    else {
        Write-Host "❌ location_code may not be first feature"
    }
}
else {
    Write-Host "❌ prepare_features function missing"
}

# Check prediction function
Write-Host ""
Write-Host "6. PREDICTION FUNCTION ANALYSIS:"
Write-Host "--------------------------------"
if ($appContent -match "def predict\(") {
    Write-Host "✅ predict function exists"
    
    $predictSection = $appContent -split "def predict\(" | Select-Object -Last 1
    $predictSection = $predictSection -split "def " | Select-Object -First 1
    
    if ($predictSection -match "if model is not None and scaler is not None") {
        Write-Host "✅ Model availability check exists"
    }
    else {
        Write-Host "❌ Model availability check missing"
    }
    
    if ($predictSection -match "prepare_features\(") {
        Write-Host "✅ prepare_features is called"
    }
    else {
        Write-Host "❌ prepare_features is not called"
    }
    
    if ($predictSection -match "scaler\.transform\(") {
        Write-Host "✅ Features are scaled"
    }
    else {
        Write-Host "❌ Features may not be scaled"
    }
    
    if ($predictSection -match "model\.predict\(") {
        Write-Host "✅ Model prediction is made"
    }
    else {
        Write-Host "❌ Model prediction may not be made"
    }
    
    if ($predictSection -match "'model_used': True") {
        Write-Host "✅ Response indicates model was used"
    }
    else {
        Write-Host "❌ Response may not indicate model usage"
    }
}
else {
    Write-Host "❌ predict function missing"
}

Write-Host ""
Write-Host "========================================"
Write-Host "SUMMARY"
Write-Host "========================================"
Write-Host ""

# Look for potential issues
$issues = @()

# Check for the problematic pattern we fixed before
if ($appContent -match "WEATHER_DATA\[.*\]\[.*\]") {
    $issues += "Faulty weather data access pattern found"
}

# Check if there are any obvious issues with the model loading
if (-not ($appContent -match "logger\.info\(.Model loaded successfully.")) {
    $issues += "Model loading success message not found - may indicate loading failure"
}

if ($issues.Count -gt 0) {
    Write-Host "⚠️  POTENTIAL ISSUES FOUND:"
    foreach ($issue in $issues) {
        Write-Host "   - $issue"
    }
}
else {
    Write-Host "✅ No obvious code issues found"
}

Write-Host ""
Write-Host "RECOMMENDATIONS:"
Write-Host "1. Check server logs for model loading errors"
Write-Host "2. Verify that the model is actually being used by checking response 'model_used' flag"
Write-Host "3. Test with explicit logging of feature vectors to see if they differ by location"
Write-Host "4. Ensure Python dependencies are properly installed"