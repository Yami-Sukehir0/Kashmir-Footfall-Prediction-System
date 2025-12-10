"""
Detailed analysis to understand why some locations produce identical predictions
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import load_model, model, scaler, prepare_features, LOCATION_MAPPING, WEATHER_DATA
import numpy as np
import joblib

def analyze_feature_importance():
    """Analyze which features are most important for predictions"""
    print("=== Feature Importance Analysis ===")
    
    feature_names = [
        "Location code", "Year", "Month", "Season", "Rolling avg",
        "Temp mean", "Temp max", "Temp min", "Precipitation", "Sunshine",
        "Temp-sunshine interaction", "Temperature range", "Precipitation-temp",
        "Holiday count", "Long weekend", "National holiday", "Festival holiday"
    ]
    
    importances = model.feature_importances_
    
    # Sort features by importance
    sorted_indices = np.argsort(importances)[::-1]
    
    print("Feature importances (sorted by importance):")
    for i in sorted_indices:
        print(f"  {feature_names[i]}: {importances[i]:.4f}")
    
    return feature_names, importances

def analyze_prediction_differences():
    """Analyze why some predictions are identical"""
    print("\n=== Prediction Difference Analysis ===")
    
    # Locations that produce identical predictions
    identical_group = ["Pahalgam", "Sonamarg", "Aharbal", "Doodpathri"]
    different_group = ["Gulmarg", "Kokernag"]
    
    print("Analyzing locations with identical predictions:")
    
    # Compare scaled features for identical group
    year = 2026
    month = 1
    
    scaled_features_dict = {}
    
    for location in identical_group:
        features = prepare_features(location, year, month, 80000)
        scaled_features = scaler.transform(features)
        scaled_features_dict[location] = scaled_features.flatten()
        print(f"\n{location}:")
        print(f"  Scaled features: {scaled_features.flatten()}")
    
    # Check which features are identical across these locations
    print("\nChecking which scaled features are identical across identical group:")
    sample_features = scaled_features_dict[identical_group[0]]
    
    for i in range(len(sample_features)):
        values = [scaled_features_dict[loc][i] for loc in identical_group]
        all_same = len(set(values)) == 1
        
        if all_same:
            print(f"  Feature {i} ({get_feature_name(i)}): IDENTICAL ({values[0]:.4f})")
        else:
            print(f"  Feature {i} ({get_feature_name(i)}): DIFFERENT {values}")

def get_feature_name(index):
    """Get feature name by index"""
    feature_names = [
        "Location code", "Year", "Month", "Season", "Rolling avg",
        "Temp mean", "Temp max", "Temp min", "Precipitation", "Sunshine",
        "Temp-sunshine interaction", "Temperature range", "Precipitation-temp",
        "Holiday count", "Long weekend", "National holiday", "Festival holiday"
    ]
    
    if index < len(feature_names):
        return feature_names[index]
    return f"Feature {index}"

def analyze_model_behavior():
    """Analyze model behavior in more detail"""
    print("\n=== Model Behavior Analysis ===")
    
    # Test with slight variations to see model sensitivity
    base_features = prepare_features("Pahalgam", 2026, 1, 80000)
    base_scaled = scaler.transform(base_features)
    base_prediction = model.predict(base_scaled)[0]
    
    print(f"Base prediction (Pahalgam): {base_prediction:.2f}")
    
    # Test sensitivity to location code
    test_features = base_features.copy()
    for loc_code in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
        test_features[0, 0] = loc_code  # Change location code
        test_scaled = scaler.transform(test_features)
        test_prediction = model.predict(test_scaled)[0]
        print(f"  Location code {loc_code}: {test_prediction:.2f} (diff: {test_prediction - base_prediction:.2f})")
    
    # Test sensitivity to temperature
    test_features = base_features.copy()
    original_temp = base_features[0, 5]  # Temp mean
    for temp_offset in [-5, -2, 0, 2, 5]:
        new_temp = original_temp + temp_offset
        test_features[0, 5] = new_temp  # Change temperature
        test_scaled = scaler.transform(test_features)
        test_prediction = model.predict(test_scaled)[0]
        print(f"  Temp mean {new_temp}: {test_prediction:.2f} (diff: {test_prediction - base_prediction:.2f})")

def check_for_tree_model_patterns():
    """Check for patterns in tree-based model predictions"""
    print("\n=== Tree Model Pattern Analysis ===")
    
    # For tree-based models, identical predictions often occur when
    # samples end up in the same leaf nodes
    
    locations = ["Gulmarg", "Pahalgam", "Sonamarg", "Aharbal"]
    year = 2026
    month = 1
    
    print("Checking if samples reach the same leaf nodes...")
    
    # For Random Forest, we can check the leaf indices
    if hasattr(model, 'apply'):
        try:
            leaf_indices = {}
            for location in locations:
                features = prepare_features(location, year, month, 80000)
                scaled_features = scaler.transform(features)
                leaves = model.apply(scaled_features)
                leaf_indices[location] = leaves
                
                print(f"{location}: {leaves.flatten()[:5]}...")  # Show first 5 tree leaf indices
            
            # Check if any locations have identical leaf patterns
            print("\nComparing leaf patterns:")
            for i in range(len(locations)):
                for j in range(i+1, len(locations)):
                    loc1, loc2 = locations[i], locations[j]
                    leaves1 = leaf_indices[loc1]
                    leaves2 = leaf_indices[loc2]
                    
                    # Compare all trees
                    identical_trees = np.sum(leaves1 == leaves2)
                    total_trees = leaves1.shape[1]
                    
                    print(f"  {loc1} vs {loc2}: {identical_trees}/{total_trees} trees identical")
                    
        except Exception as e:
            print(f"Could not analyze leaf patterns: {e}")

if __name__ == "__main__":
    # Load model if not already loaded
    if model is None:
        load_model()
    
    analyze_feature_importance()
    analyze_prediction_differences()
    analyze_model_behavior()
    check_for_tree_model_patterns()