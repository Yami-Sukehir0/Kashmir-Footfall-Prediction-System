"""
Analyze features for different locations to understand why some produce identical predictions
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import prepare_features, LOCATION_MAPPING, WEATHER_DATA
import numpy as np

def analyze_location_features():
    """Analyze features for different locations in January"""
    print("=== Feature Analysis for January 2026 ===")
    
    locations = ["Gulmarg", "Pahalgam", "Sonamarg", "Aharbal"]
    year = 2026
    month = 1
    
    features_dict = {}
    
    for location in locations:
        print(f"\n--- {location} ---")
        features = prepare_features(location, year, month, 80000)
        features_flat = features.flatten()
        
        features_dict[location] = features_flat
        
        print(f"Location code: {features_flat[0]}")
        print(f"Year: {features_flat[1]}")
        print(f"Month: {features_flat[2]}")
        print(f"Season: {features_flat[3]}")
        print(f"Rolling avg: {features_flat[4]}")
        print(f"Temp mean: {features_flat[5]}")
        print(f"Temp max: {features_flat[6]}")
        print(f"Temp min: {features_flat[7]}")
        print(f"Precipitation: {features_flat[8]}")
        print(f"Sunshine: {features_flat[9]}")
        print(f"Temp-sunshine interaction: {features_flat[10]}")
        print(f"Temperature range: {features_flat[11]}")
        print(f"Precipitation-temperature: {features_flat[12]}")
        print(f"Holiday count: {features_flat[13]}")
        print(f"Long weekend count: {features_flat[14]}")
        print(f"National holiday count: {features_flat[15]}")
        print(f"Festival holiday count: {features_flat[16]}")
    
    # Compare features between locations
    print("\n=== Feature Comparison ===")
    locations_list = list(features_dict.keys())
    
    for i in range(len(locations_list)):
        for j in range(i+1, len(locations_list)):
            loc1 = locations_list[i]
            loc2 = locations_list[j]
            
            diff_count = np.sum(features_dict[loc1] != features_dict[loc2])
            if diff_count == 0:
                print(f"⚠️  {loc1} and {loc2} have IDENTICAL features!")
            else:
                print(f"✅ {loc1} and {loc2} have {diff_count} different features")
                
            # Show which features are different
            if diff_count > 0:
                diffs = np.where(features_dict[loc1] != features_dict[loc2])[0]
                print(f"   Different feature indices: {diffs.tolist()}")

def detailed_feature_comparison():
    """Detailed comparison of features that might cause identical predictions"""
    print("\n=== Detailed Feature Comparison ===")
    
    # Focus on the locations that produced identical predictions
    locations = ["Pahalgam", "Sonamarg", "Aharbal"]
    year = 2026
    month = 1
    
    print("Comparing features for locations that produced identical predictions:")
    
    features_data = {}
    for location in locations:
        features = prepare_features(location, year, month, 80000)
        features_data[location] = features.flatten()
        
    # Print all features side by side
    feature_names = [
        "Location code", "Year", "Month", "Season", "Rolling avg",
        "Temp mean", "Temp max", "Temp min", "Precipitation", "Sunshine",
        "Temp-sunshine interaction", "Temperature range", "Precipitation-temp",
        "Holiday count", "Long weekend", "National holiday", "Festival holiday"
    ]
    
    print(f"\n{'Feature':<25} {'Pahalgam':<12} {'Sonamarg':<12} {'Aharbal':<12}")
    print("-" * 60)
    
    for i, name in enumerate(feature_names):
        p_val = features_data["Pahalgam"][i]
        s_val = features_data["Sonamarg"][i]
        a_val = features_data["Aharbal"][i]
        print(f"{name:<25} {p_val:<12} {s_val:<12} {a_val:<12}")
        
        # Check if all three are identical
        if p_val == s_val == a_val:
            print(f"{'':<25} {'==':<12} {'==':<12} {'==':<12}")

if __name__ == "__main__":
    analyze_location_features()
    detailed_feature_comparison()