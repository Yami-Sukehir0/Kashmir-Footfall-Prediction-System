#!/usr/bin/env python3
"""
Demonstration of static vs dynamic weather approaches for Kashmir tourism prediction
"""

import numpy as np
import json
import os

# Load temporal weather patterns
def load_temporal_patterns():
    """Load temporal weather patterns from analysis"""
    try:
        with open('temporal_weather_patterns.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Temporal weather patterns not found. Run analyze_temporal_weather.py first.")
        return {}

# Static weather data (from app.py)
STATIC_WEATHER_DATA = {
    # Gulmarg (ski resort - cold climate)
    'Gulmarg': {
        1: {'temp_mean': -2, 'temp_max': 3, 'temp_min': -7, 'precip': 150, 'snow': 80, 'sunshine': 120},
        2: {'temp_mean': 0, 'temp_max': 5, 'temp_min': -5, 'precip': 140, 'snow': 75, 'sunshine': 140},
        3: {'temp_mean': 5, 'temp_max': 10, 'temp_min': 0, 'precip': 120, 'snow': 40, 'sunshine': 160},
        4: {'temp_mean': 10, 'temp_max': 15, 'temp_min': 5, 'precip': 100, 'snow': 10, 'sunshine': 180},
        5: {'temp_mean': 15, 'temp_max': 20, 'temp_min': 10, 'precip': 80, 'snow': 2, 'sunshine': 200},
        6: {'temp_mean': 17, 'temp_max': 22, 'temp_min': 12, 'precip': 45, 'snow': 0, 'sunshine': 220},
        7: {'temp_mean': 19, 'temp_max': 24, 'temp_min': 14, 'precip': 50, 'snow': 0, 'sunshine': 230},
        8: {'temp_mean': 18, 'temp_max': 23, 'temp_min': 13, 'precip': 55, 'snow': 0, 'sunshine': 225},
        9: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 70, 'snow': 5, 'sunshine': 205},
        10: {'temp_mean': 8, 'temp_max': 13, 'temp_min': 3, 'precip': 90, 'snow': 15, 'sunshine': 185},
        11: {'temp_mean': 2, 'temp_max': 7, 'temp_min': -3, 'precip': 110, 'snow': 45, 'sunshine': 155},
        12: {'temp_mean': 2, 'temp_max': 7, 'temp_min': -3, 'precip': 120, 'snow': 50, 'sunshine': 135},
    },
    # Pahalgam (valley destination)
    'Pahalgam': {
        1: {'temp_mean': -3, 'temp_max': 2, 'temp_min': -8, 'temp_min': -8, 'precip': 125, 'snow': 70, 'sunshine': 110},
        2: {'temp_mean': -1, 'temp_max': 4, 'temp_min': -6, 'precip': 115, 'snow': 65, 'sunshine': 130},
        3: {'temp_mean': 4, 'temp_max': 9, 'temp_min': -1, 'precip': 95, 'snow': 30, 'sunshine': 150},
        4: {'temp_mean': 9, 'temp_max': 14, 'temp_min': 4, 'precip': 85, 'snow': 5, 'sunshine': 170},
        5: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 75, 'snow': 1, 'sunshine': 190},
        6: {'temp_mean': 13, 'temp_max': 18, 'temp_min': 8, 'precip': 70, 'snow': 0, 'sunshine': 210},
        7: {'temp_mean': 15, 'temp_max': 20, 'temp_min': 10, 'precip': 65, 'snow': 0, 'sunshine': 220},
        8: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 70, 'snow': 0, 'sunshine': 215},
        9: {'temp_mean': 11, 'temp_max': 16, 'temp_min': 6, 'precip': 80, 'snow': 2, 'sunshine': 195},
        10: {'temp_mean': 6, 'temp_max': 11, 'temp_min': 1, 'precip': 100, 'snow': 10, 'sunshine': 175},
        11: {'temp_mean': 1, 'temp_max': 6, 'temp_min': -4, 'precip': 120, 'snow': 40, 'sunshine': 145},
        12: {'temp_mean': 1, 'temp_max': 6, 'temp_min': -4, 'precip': 117, 'snow': 45, 'sunshine': 125},
    }
}

def get_static_weather(location, month):
    """Get static weather data"""
    location_data = STATIC_WEATHER_DATA.get(location, STATIC_WEATHER_DATA['Gulmarg'])
    return location_data.get(month, location_data.get(6, {}))  # Fallback to June

def get_dynamic_weather(temporal_patterns, location, year, month, base_year=2020):
    """Get dynamic weather data with temporal trends"""
    if not temporal_patterns or location not in temporal_patterns:
        return get_static_weather(location, month)
    
    location_patterns = temporal_patterns[location]
    if str(month) not in location_patterns:
        return get_static_weather(location, month)
    
    pattern = location_patterns[str(month)]
    
    # Calculate adjustments based on temporal trends
    year_diff = year - base_year
    
    # Apply trends (with reasonable bounds)
    temp_mean = pattern['temp_mean'] + (pattern['temp_trend'] * year_diff)
    precipitation = pattern['precipitation_sum'] + (pattern['precip_trend'] * year_diff)
    
    # Ensure realistic bounds
    temp_mean = max(-20, min(40, temp_mean))
    precipitation = max(0, precipitation)
    
    return {
        'temp_mean': round(temp_mean, 1),
        'temp_max': round(temp_mean + 5, 1),  # Approximate
        'temp_min': round(temp_mean - 5, 1),  # Approximate
        'precip': round(precipitation, 1),
        'snow': 0 if temp_mean > 2 else max(0, 30 - temp_mean * 2),
        'sunshine': round(pattern['sunshine_duration'], 1)
    }

def calculate_derived_features(weather):
    """Calculate derived features used by the model"""
    temp_sunshine = weather['temp_mean'] * weather['sunshine']
    temp_range = weather['temp_max'] - weather['temp_min']
    precip_temp = weather['precip'] * weather['temp_mean']
    
    return {
        'temp_sunshine_interaction': round(temp_sunshine, 1),
        'temperature_range': round(temp_range, 1),
        'precipitation_temperature': round(precip_temp, 1)
    }

def demonstrate_approaches():
    """Demonstrate the difference between static and dynamic approaches"""
    print("=" * 80)
    print("WEATHER DATA APPROACHES COMPARISON")
    print("=" * 80)
    
    # Load temporal patterns
    temporal_patterns = load_temporal_patterns()
    
    # Test cases
    test_cases = [
        ('Gulmarg', 2024, 1),  # Winter
        ('Gulmarg', 2025, 1),  # Winter next year
        ('Gulmarg', 2026, 1),  # Winter future
        ('Gulmarg', 2024, 6),  # Summer
        ('Gulmarg', 2025, 6),  # Summer next year
        ('Pahalgam', 2024, 6), # Summer in Pahalgam
        ('Pahalgam', 2025, 6), # Summer next year in Pahalgam
    ]
    
    for location, year, month in test_cases:
        print(f"\n{location.upper()} - {year}-{month:02d}")
        print("-" * 40)
        
        # Static approach
        static_weather = get_static_weather(location, month)
        static_derived = calculate_derived_features(static_weather)
        
        # Dynamic approach (if available)
        if temporal_patterns:
            dynamic_weather = get_dynamic_weather(temporal_patterns, location, year, month)
            dynamic_derived = calculate_derived_features(dynamic_weather)
            
            print("STATIC WEATHER:")
            print(f"  Temperature: {static_weather.get('temp_mean', 'N/A')}°C")
            print(f"  Precipitation: {static_weather.get('precip', 'N/A')}mm")
            print(f"  Sunshine: {static_weather.get('sunshine', 'N/A')} hours")
            print(f"  Derived - Temp×Sunshine: {static_derived['temp_sunshine_interaction']}")
            print(f"  Derived - Temp Range: {static_derived['temperature_range']}°C")
            print(f"  Derived - Precip×Temp: {static_derived['precipitation_temperature']}")
            
            print("\nDYNAMIC WEATHER:")
            print(f"  Temperature: {dynamic_weather.get('temp_mean', 'N/A')}°C")
            print(f"  Precipitation: {dynamic_weather.get('precip', 'N/A')}mm")
            print(f"  Sunshine: {dynamic_weather.get('sunshine', 'N/A')} hours")
            print(f"  Derived - Temp×Sunshine: {dynamic_derived['temp_sunshine_interaction']}")
            print(f"  Derived - Temp Range: {dynamic_derived['temperature_range']}°C")
            print(f"  Derived - Precip×Temp: {dynamic_derived['precipitation_temperature']}")
            
            # Calculate differences
            temp_diff = dynamic_weather.get('temp_mean', 0) - static_weather.get('temp_mean', 0)
            precip_diff = dynamic_weather.get('precip', 0) - static_weather.get('precip', 0)
            
            print(f"\nDIFFERENCES:")
            print(f"  Temperature: {temp_diff:+.1f}°C")
            print(f"  Precipitation: {precip_diff:+.1f}mm")
        else:
            print("STATIC WEATHER (Dynamic data not available):")
            print(f"  Temperature: {static_weather.get('temp_mean', 'N/A')}°C")
            print(f"  Precipitation: {static_weather.get('precip', 'N/A')}mm")
            print(f"  Sunshine: {static_weather.get('sunshine', 'N/A')} hours")

def explain_approach_benefits():
    """Explain the benefits of each approach"""
    print("\n" + "=" * 80)
    print("APPROACH BENEFITS ANALYSIS")
    print("=" * 80)
    
    print("\nSTATIC WEATHER DATABASE APPROACH:")
    print("✅ Pros:")
    print("   • Consistent with training data")
    print("   • Fast and reliable predictions")
    print("   • Simple to maintain and debug")
    print("   • No external dependencies")
    print("   • Predictable performance")
    
    print("\n❌ Cons:")
    print("   • No adaptation to climate changes")
    print("   • May become outdated over time")
    print("   • Doesn't reflect recent weather patterns")
    
    print("\nDYNAMIC WEATHER ANALYSIS APPROACH:")
    print("✅ Pros:")
    print("   • Adapts to climate trends")
    print("   • More realistic predictions")
    print("   • Can account for warming/cooling trends")
    print("   • Reflects evolving weather patterns")
    
    print("\n❌ Cons:")
    print("   • Requires periodic re-analysis")
    print("   • Slightly more complex implementation")
    print("   • Dependent on data quality")
    print("   • May introduce noise if trends are not significant")

def recommendation():
    """Provide recommendations"""
    print("\n" + "=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)
    
    print("\nFOR KASHMIR TOURISM PREDICTION SYSTEM:")
    print("\n🎯 SHORT TERM (Recommended):")
    print("   Continue using the static weather database approach because:")
    print("   • The model was trained on specific weather patterns")
    print("   • Tourism predictions depend more on seasonality than minor weather variations")
    print("   • Static approach ensures consistency and reliability")
    
    print("\n🚀 LONG TERM (Optional Enhancement):")
    print("   Consider a hybrid approach:")
    print("   • Maintain static base weather patterns")
    print("   • Apply small, validated adjustments for long-term climate trends")
    print("   • Periodically update static database with new climate data")
    print("   • Use dynamic analysis for monitoring and insights only")
    
    print("\n💡 WHY THIS RECOMMENDATION:")
    print("   Kashmir tourism is primarily driven by:")
    print("   • Seasonal patterns (well-established)")
    print("   • Location characteristics (static)")
    print("   • Holiday effects (predictable)")
    print("   • Historical trends (modeled in rolling averages)")
    print("   ")
    print("   Weather variations within typical seasonal patterns have less impact")
    print("   than these major factors, making the static approach appropriate.")

if __name__ == "__main__":
    demonstrate_approaches()
    explain_approach_benefits()
    recommendation()