# Script to add debug logging to the app.py file to diagnose the issue
Write-Host "========================================"
Write-Host "ADDING DEBUG LOGGING TO APP.PY"
Write-Host "========================================"
Write-Host ""

# Read the current app.py file
$appContent = Get-Content "app.py" -Raw

# Check if debug logging is already added
if ($appContent -match "DEBUG FEATURE VALUES") {
    Write-Host "⚠️  Debug logging already exists"
    exit
}

# Find the predict function and add debug logging
$predictSection = $appContent -split "def predict\(\)" | Select-Object -Last 1
$predictSectionStart = $appContent.IndexOf("def predict()")

# Find where to insert debug logging - after features are prepared but before scaling
$insertPointPattern = "features = prepare_features\(location, year, month, rolling_avg\)"
if ($predictSection -match $insertPointPattern) {
    Write-Host "✅ Found location to insert debug logging"
    
    # Create the debug logging code
    $debugCode = @"
            # DEBUG FEATURE VALUES
            logger.info(f"DEBUG: Location={location}, Location code={location_code}")
            logger.info(f"DEBUG: Raw features shape={features.shape}")
            logger.info(f"DEBUG: Raw features (first 5)={features.flatten()[:5]}")
            logger.info(f"DEBUG: Raw features (last 5)={features.flatten()[-5:]}")
            
            # Scale features
            scaled_features = scaler.transform(features)
            
            # DEBUG SCALED FEATURES
            logger.info(f"DEBUG: Scaled features shape={scaled_features.shape}")
            logger.info(f"DEBUG: Scaled features (first 5)={scaled_features.flatten()[:5]}")
            logger.info(f"DEBUG: Scaled features (last 5)={scaled_features.flatten()[-5:]}")
            
            # Make prediction using the trained model
            model_prediction = model.predict(scaled_features)[0]
            
            # DEBUG PREDICTION
            logger.info(f"DEBUG: Raw model prediction={model_prediction}")
"@

    # Replace the section with debug logging added
    $newPredictSection = $predictSection -replace "features = prepare_features\(location, year, month, rolling_avg\)\s*\n\s*# Scale features\s*\n\s*scaled_features = scaler\.transform\(features\)\s*\n\s*# Make prediction using the trained model\s*\n\s*model_prediction = model\.predict\(scaled_features\)\[0\]", $debugCode
    
    # Now we need to replace the entire predict function in the main content
    $predictFunctionEnd = $predictSectionStart + $predictSection.Length
    $beforePredict = $appContent.Substring(0, $predictSectionStart)
    $afterPredict = $appContent.Substring($predictSectionStart + $predictSection.Length)
    
    $newAppContent = $beforePredict + "def predict()" + $newPredictSection + $afterPredict
    
    # Write the modified content back to the file
    Set-Content "app.py" $newAppContent -Encoding UTF8
    
    Write-Host "✅ Debug logging added successfully"
    Write-Host ""
    Write-Host "The following debug information will now be logged:"
    Write-Host "  - Raw feature values (before scaling)"
    Write-Host "  - Scaled feature values (after scaling)"
    Write-Host "  - Raw model prediction value"
    Write-Host ""
    Write-Host "Restart the server and check logs for these DEBUG messages"
}
else {
    Write-Host "❌ Could not find the right location to insert debug logging"
    Write-Host "Pattern not found: $insertPointPattern"
}