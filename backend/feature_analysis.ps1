# Analyze if features are different for different locations
Write-Host "========================================"
Write-Host "FEATURE ANALYSIS FOR DIFFERENT LOCATIONS"
Write-Host "========================================"
Write-Host ""

# Read the app.py file
$appContent = Get-Content "app.py" -Raw

# Extract the prepare_features function
$featureSection = $appContent -split "def prepare_features\(" | Select-Object -Last 1
$featureSection = $featureSection -split "@app.route" | Select-Object -First 1

# Extract LOCATION_MAPPING
$locationMappingSection = $appContent -split "# Location encoding" | Select-Object -Last 1
$locationMappingSection = $locationMappingSection -split "# Weather data by location" | Select-Object -First 1

# Parse location mappings
$locations = @{}
$locationLines = $locationMappingSection -split "`n" | Where-Object { $_ -match "'" }
foreach ($line in $locationLines) {
    if ($line -match "'(.+)':\s*(\d+)") {
        $location = $matches[1]
        $code = [int]$matches[2]
        $locations[$location] = $code
    }
}

Write-Host "LOCATIONS AND THEIR CODES:"
Write-Host "--------------------------"
$sortedLocations = $locations.Keys | Sort-Object
foreach ($loc in $sortedLocations) {
    Write-Host "  $loc : $($locations[$loc])"
}
Write-Host ""

# Simulate feature preparation for January 2026 with default rolling average
Write-Host "FEATURE SIMULATION FOR JANUARY 2026:"
Write-Host "-----------------------------------"
$testLocations = @("Gulmarg", "Pahalgam", "Aharbal", "Sonamarg")
$year = 2026
$month = 1
$rollingAvg = 80000

# Since we can't actually run Python, let's manually analyze what would happen
Write-Host "For January 2026 (Winter season):"
Write-Host ""

foreach ($location in $testLocations) {
    Write-Host "$($location):"
    
    # Location code
    $locationCode = $locations[$location]
    Write-Host "  Location code: $locationCode"
    
    # Season (January is winter, code 1)
    $season = 1
    Write-Host "  Season code: $season"
    
    # Based on the code, the key difference should be the location_code (first feature)
    # and the weather data which varies by location
    Write-Host "  First feature (location_code): $locationCode"
    Write-Host "  Second feature (year): $year"
    Write-Host "  Third feature (month): $month"
    Write-Host "  Fourth feature (season): $season"
    Write-Host "  Fifth feature (rolling_avg): $rollingAvg"
    
    # The rest of the features depend on weather data which should be different
    Write-Host "  Weather-dependent features: Vary by location"
    Write-Host ""
}

Write-Host "========================================"
Write-Host "ANALYSIS"
Write-Host "========================================"
Write-Host ""

Write-Host "Theoretically, features should be different because:"
Write-Host "1. Location code (first feature) is different for each location"
Write-Host "2. Weather data varies significantly between locations"
Write-Host "3. All other features are the same (year, month, rolling_avg)"
Write-Host ""

Write-Host "If predictions are identical, possible causes:"
Write-Host "1. Model is not actually being used (fallback to custom algorithm)"
Write-Host "2. Feature scaling is somehow making differences negligible"
Write-Host "3. The model itself is not sensitive to location differences"
Write-Host "4. There's a bug in how features are passed to the model"
Write-Host ""

Write-Host "RECOMMENDATIONS:"
Write-Host "1. Add explicit logging to see actual feature values"
Write-Host "2. Check if 'model_used': true is actually being returned"
Write-Host "3. Verify that scaler.transform is working correctly"
Write-Host "4. Test with a simple Python script that loads model and tests predictions"