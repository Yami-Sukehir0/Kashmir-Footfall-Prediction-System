# PowerShell script to examine model files and understand discrepancy
Write-Host "==================================================" -ForegroundColor Green
Write-Host "EXAMINING MODEL FILES TO UNDERSTAND DISCREPANCY" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 DETAILED EXAMINATION OF MODEL FILES" -ForegroundColor Yellow
Write-Host ""

# Check file information
$modelFiles = @(
    @{Path = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model\model.pkl"; Name = "Original Model" },
    @{Path = "c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model\model.pkl"; Name = "Backend Model" }
)

Write-Host "FILE INFORMATION:" -ForegroundColor Cyan
Write-Host ""

foreach ($fileInfo in $modelFiles) {
    $path = $fileInfo.Path
    $name = $fileInfo.Name
    
    Write-Host "$name:" -ForegroundColor Yellow
    if (Test-Path $path) {
        $item = Get-Item $path
        Write-Host "  Path: $path" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($item.Length / 1KB, 2)) KB" -ForegroundColor White
        Write-Host "  Modified: $($item.LastWriteTime)" -ForegroundColor White
        Write-Host ""
    }
    else {
        Write-Host "  ❌ NOT FOUND!" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "ANALYZING POSSIBLE CAUSES" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "🔴 PRIMARY SUSPICION: WRONG MODEL FILE" -ForegroundColor Red
Write-Host ""
Write-Host "If the backend model is significantly smaller or older than the original," -ForegroundColor White
Write-Host "it suggests a different/wrong model is being used." -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "CHECKING FOR TRANSFORMATIONS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Look for these indicators in the codebase:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. TARGET VARIABLE TRANSFORMATIONS:" -ForegroundColor Yellow
Write-Host "   Search for:" -ForegroundColor White
Write-Host "   • np.log(), np.log1p() in training code" -ForegroundColor White
Write-Host "   • StandardScaler() applied to target" -ForegroundColor White
Write-Host "   • Box-Cox transformations" -ForegroundColor White

Write-Host ""
Write-Host "2. POST-PREDICTION TRANSFORMATIONS:" -ForegroundColor Yellow
Write-Host "   In app.py, look for:" -ForegroundColor White
Write-Host "   • np.exp(), np.expm1() after prediction" -ForegroundColor White
Write-Host "   • inverse_transform() on predictions" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "RECOMMENDED ACTIONS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. COMPARE MODEL FILES:" -ForegroundColor Yellow
Write-Host "   • If sizes differ significantly, replace backend model" -ForegroundColor White
Write-Host "   • If dates differ, check which is the correct version" -ForegroundColor White

Write-Host ""
Write-Host "2. EXAMINE TRAINING CODE:" -ForegroundColor Yellow
Write-Host "   • Check if target variable was transformed" -ForegroundColor White
Write-Host "   • Look for preprocessing steps that might affect scale" -ForegroundColor White

Write-Host ""
Write-Host "3. VERIFY FEATURE PREPARATION:" -ForegroundColor Yellow
Write-Host "   • Ensure prepare_features() matches training preprocessing" -ForegroundColor White
Write-Host "   • Check encoding schemes for categorical variables" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "EXPECTED BEHAVIOR VS. OBSERVED" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "EXPECTED (Based on your training data):" -ForegroundColor Green
Write-Host "   • Gulmarg Jan 2026: 1,00,000+ visitors" -ForegroundColor White
Write-Host "   • Model reflects lakh+ footfall patterns" -ForegroundColor White
Write-Host "   • Predictions align with historical data scale" -ForegroundColor White

Write-Host ""
Write-Host "OBSERVED:" -ForegroundColor Red
Write-Host "   • Gulmarg Jan 2026: 54,000 visitors" -ForegroundColor White
Write-Host "   • Predictions much lower than training data" -ForegroundColor White
Write-Host "   • Scale inconsistency indicates issue" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "ROOT CAUSE IDENTIFICATION MATRIX" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "IF MODEL FILES DIFFER:" -ForegroundColor Yellow
Write-Host "   🔴 Root Cause: Wrong model deployed" -ForegroundColor Red
Write-Host "   ✅ Solution: Deploy correct model file" -ForegroundColor Green

Write-Host ""
Write-Host "IF MODEL FILES MATCH:" -ForegroundColor Yellow
Write-Host "   🔴 Root Cause: Transformation mismatch" -ForegroundColor Red
Write-Host "   ✅ Solution: Align transformations between training and prediction" -ForegroundColor Green

Write-Host ""
Write-Host "IF TRANSFORMATIONS FOUND:" -ForegroundColor Yellow
Write-Host "   🔴 Root Cause: Missing inverse transformation" -ForegroundColor Red
Write-Host "   ✅ Solution: Apply inverse transformation to predictions" -ForegroundColor Green

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "YOUR TECHNICAL UNDERSTANDING IS CORRECT" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "✅ You are absolutely right that:" -ForegroundColor Green
Write-Host "   • Models should reflect training data patterns" -ForegroundColor White
Write-Host "   • High footfall in training should lead to high predictions" -ForegroundColor White
Write-Host "   • Environmental constraints shouldn't override actual data" -ForegroundColor White

Write-Host ""
Write-Host "❌ The 54,000 prediction indicates a technical issue:" -ForegroundColor Red
Write-Host "   • Wrong model file" -ForegroundColor White
Write-Host "   • Missing transformations" -ForegroundColor White
Write-Host "   • Preprocessing mismatch" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "IMMEDIATE NEXT STEPS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. RUN THIS SCRIPT TO CHECK FILE INFO:" -ForegroundColor Yellow
Write-Host "   Compare file sizes and modification dates" -ForegroundColor White

Write-Host ""
Write-Host "2. MANUALLY VERIFY FILES:" -ForegroundColor Yellow
Write-Host "   • Right-click each model.pkl file" -ForegroundColor White
Write-Host "   • Check Properties > Details" -ForegroundColor White

Write-Host ""
Write-Host "3. EXAMINE BACKEND CODE:" -ForegroundColor Yellow
Write-Host "   • Open app.py" -ForegroundColor White
Write-Host "   • Look for post-prediction transformations" -ForegroundColor White

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")