# Test the prediction API endpoints
Write-Host "========================================"
Write-Host "TESTING PREDICTION API ENDPOINTS"
Write-Host "========================================"
Write-Host ""

# Check if we can connect to the backend server
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "✅ Backend server is running"
    Write-Host "   Status: $($healthData.status)"
    Write-Host "   Model loaded: $($healthData.model_loaded)"
    Write-Host ""
}
catch {
    Write-Host "⚠️  Backend server is not responding"
    Write-Host "   Please start the server with: python app.py"
    Write-Host ""
    exit 1
}

# Test different locations
$testLocations = @(
    @{ location = "Gulmarg"; year = 2024; month = 12 },
    @{ location = "Pahalgam"; year = 2024; month = 6 },
    @{ location = "Sonamarg"; year = 2024; month = 9 },
    @{ location = "Aharbal"; year = 2024; month = 3 }
)

Write-Host "Testing predictions for different locations:"
Write-Host "========================================"
Write-Host ""

foreach ($test in $testLocations) {
    Write-Host "Testing: $($test.location) in $($test.month)/$($test.year)"
    
    try {
        $body = @{
            location = $test.location
            year     = $test.year
            month    = $test.month
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/predict" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            $footfall = $data.prediction.predicted_footfall
            $modelUsed = $data.model_used
            Write-Host "   ✅ Success: $footfall visitors"
            Write-Host "   Model used: $modelUsed"
        }
        else {
            Write-Host "   ❌ Error: $($data.error)"
        }
    }
    catch {
        Write-Host "   ❌ Request failed: $($_.Exception.Message)"
    }
    
    Write-Host ""
}

Write-Host "========================================"
Write-Host "API TEST COMPLETE"
Write-Host "========================================"