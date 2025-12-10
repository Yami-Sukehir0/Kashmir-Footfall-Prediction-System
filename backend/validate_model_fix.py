"""
Validation script to confirm model issues and test potential fixes
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import load_model, model, scaler, prepare_features, LOCATION_MAPPING
import numpy as np

def validate_model_issues():
    """Validate the specific issues we've identified"""
    print("=== Model Issue Validation ===")
    
    if model is None:
        print("❌ Model not loaded!")
        return False
    
    print("✅ Model loaded successfully")
    print(f"Model type: {type(model).__name__}")
    
    # Test 1: Check if multiple locations produce identical predictions
    print("\n--- Test 1: Prediction Diversity ---")
    locations = list(LOCATION_MAPPING.keys())
    year, month = 2026, 1
    predictions = {}
    
    for location in locations:
        features = prepare_features(location, year, month, 80000)
        scaled_features = scaler.transform(features)
        prediction = model.predict(scaled_features)[0]
        predictions[location] = prediction
        print(f"  {location}: {prediction:,.0f} visitors")
    
    # Check diversity
    unique_predictions = len(set([round(p) for p in predictions.values()]))
    total_locations = len(locations)
    
    print(f"\nUnique predictions: {unique_predictions}/{total_locations}")
    
    if unique_predictions < total_locations * 0.7:  # Less than 70% unique
        print("❌ MAJOR ISSUE: Too many identical predictions!")
        return False
    else:
        print("✅ Good prediction diversity")
        return True

def test_location_sensitivity():
    """Test how sensitive the model is to location changes"""
    print("\n--- Test 2: Location Sensitivity ---")
    
    base_location = "Gulmarg"
    year, month = 2026, 1
    
    # Get base prediction
    base_features = prepare_features(base_location, year, month, 80000)
    base_scaled = scaler.transform(base_features)
    base_prediction = model.predict(base_scaled)[0]
    
    print(f"Base location ({base_location}): {base_prediction:,.0f} visitors")
    
    # Test changing just the location code
    sensitivity_count = 0
    for location_code in range(1, 11):
        test_features = base_features.copy()
        test_features[0, 0] = location_code  # Change only location code
        test_scaled = scaler.transform(test_features)
        test_prediction = model.predict(test_scaled)[0]
        
        diff = abs(test_prediction - base_prediction)
        if diff > 1:  # More than 1 visitor difference
            sensitivity_count += 1
            print(f"  Location code {location_code}: {test_prediction:,.0f} (diff: {diff:,.0f})")
        else:
            print(f"  Location code {location_code}: {test_prediction:,.0f} (NO CHANGE)")
    
    if sensitivity_count == 0:
        print("❌ CRITICAL ISSUE: Model completely insensitive to location!")
        return False
    elif sensitivity_count < 5:
        print("⚠️  WARNING: Model has low location sensitivity")
        return False
    else:
        print("✅ Good location sensitivity")
        return True

def test_feature_importance_alignment():
    """Test if feature importance aligns with business needs"""
    print("\n--- Test 3: Feature Importance Alignment ---")
    
    # Location should be among the most important features for tourism prediction
    importances = model.feature_importances_
    location_importance = importances[0]  # Location is first feature
    
    # Get top 3 most important features
    top_indices = np.argsort(importances)[-3:][::-1]
    feature_names = [
        "Location code", "Year", "Month", "Season", "Rolling avg",
        "Temp mean", "Temp max", "Temp min", "Precipitation", "Sunshine",
        "Temp-sunshine interaction", "Temperature range", "Precipitation-temp",
        "Holiday count", "Long weekend", "National holiday", "Festival holiday"
    ]
    
    print("Top 3 most important features:")
    for i, idx in enumerate(top_indices):
        print(f"  {i+1}. {feature_names[idx]}: {importances[idx]:.4f}")
    
    # Check if location is in top 3
    if 0 in top_indices:  # Location code is feature 0
        print("✅ Location is among top important features")
        return True
    else:
        print("❌ CRITICAL ISSUE: Location is NOT among top important features!")
        print(f"   Location importance: {location_importance:.4f} (rank: {np.argsort(importances).tolist().index(0)+1}/{len(importances)})")
        return False

def comprehensive_validation():
    """Run all validation tests"""
    print("🔍 Comprehensive Model Validation")
    print("=" * 50)
    
    # Load model
    if model is None:
        load_model()
    
    # Run all tests
    test1_result = validate_model_issues()
    test2_result = test_location_sensitivity()
    test3_result = test_feature_importance_alignment()
    
    print("\n" + "=" * 50)
    print("VALIDATION SUMMARY")
    print("=" * 50)
    
    tests = [
        ("Prediction Diversity", test1_result),
        ("Location Sensitivity", test2_result),
        ("Feature Importance", test3_result)
    ]
    
    passed = 0
    for name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name:<25} {status}")
        if result:
            passed += 1
    
    print("-" * 50)
    print(f"Overall: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 Model is working correctly!")
        return True
    else:
        print("🚨 Model has critical issues that need fixing!")
        return False

if __name__ == "__main__":
    comprehensive_validation()