#!/usr/bin/env python3
"""
Analyze temporal weather patterns from the Kashmir tourism dataset
to provide more dynamic weather values for predictions
"""

import pandas as pd
import numpy as np
import os
import logging
from collections import defaultdict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_dataset():
    """Load the Kashmir tourism dataset"""
    # Try multiple possible paths
    possible_paths = [
        os.path.join('data', 'model_ready', 'kashmir_tourism_simple_label.csv'),
        os.path.join('..', 'data', 'model_ready', 'kashmir_tourism_simple_label.csv'),
        'data/model_ready/kashmir_tourism_simple_label.csv',
        '../data/model_ready/kashmir_tourism_simple_label.csv',
        'kashmir_tourism_simple_label.csv'
    ]
    
    data_path = None
    for path in possible_paths:
        if os.path.exists(path):
            data_path = path
            break
    
    if data_path is None:
        # Try absolute path
        abs_path = r'c:\\Users\\HP\\OneDrive\\Desktop\\kashmir-tourism-fullstack\\backend\\data\\model_ready\\kashmir_tourism_simple_label.csv'
        if os.path.exists(abs_path):
            data_path = abs_path
    
    if data_path is None:
        raise FileNotFoundError(f"Dataset not found in any of the expected locations: {possible_paths}")
    
    df = pd.read_csv(data_path)
    logger.info(f"Loaded {len(df)} records from dataset at {data_path}")
    return df

def analyze_temporal_weather_patterns(df):
    """
    Analyze temporal weather patterns from the dataset to create dynamic weather profiles
    
    Returns:
        dict: Temporal weather patterns by location and month
    """
    logger.info("Analyzing temporal weather patterns...")
    
    # Create location mapping for readable names (alphabetical order)
    location_names = {
        1: 'Aharbal',
        2: 'Doodpathri', 
        3: 'Gulmarg',
        4: 'Gurez',
        5: 'Kokernag',
        6: 'Lolab',
        7: 'Manasbal',
        8: 'Pahalgam',
        9: 'Sonamarg',
        10: 'Yousmarg'
    }
    
    # Dictionary to store temporal patterns
    temporal_patterns = {}
    
    # Group by location and month to analyze temporal trends
    for location_code in df['location_encoded'].unique():
        location_name = location_names.get(location_code, f'Location_{location_code}')
        location_data = df[df['location_encoded'] == location_code]
        
        temporal_patterns[location_name] = {}
        
        for month in range(1, 13):
            month_data = location_data[location_data['month'] == month]
            
            if len(month_data) == 0:
                # Use default values if no data for this month
                temporal_patterns[location_name][month] = {
                    'temp_mean': 15.0,
                    'temp_max': 20.0,
                    'temp_min': 10.0,
                    'precipitation_sum': 50.0,
                    'sunshine_duration': 200.0,
                    'sample_size': 0,
                    'temp_trend': 0.0,  # No trend
                    'precip_trend': 0.0  # No trend
                }
                continue
            
            # Calculate basic statistics
            temp_mean = month_data['temperature_2m_mean'].mean()
            temp_max = month_data['temperature_2m_max'].mean()
            temp_min = month_data['temperature_2m_min'].mean()
            precip_sum = month_data['precipitation_sum'].mean()
            sunshine = month_data['sunshine_duration'].mean()
            
            # Calculate temporal trends (year-over-year changes)
            # Sort by year to calculate trends
            month_data_sorted = month_data.sort_values('year')
            
            # Temperature trend (degrees per year)
            temp_trend = 0.0
            precip_trend = 0.0
            
            if len(month_data_sorted) > 1:
                years = month_data_sorted['year'].values
                temps = month_data_sorted['temperature_2m_mean'].values
                precip = month_data_sorted['precipitation_sum'].values
                
                # Simple linear trend calculation
                if len(np.unique(years)) > 1:
                    try:
                        # Calculate temperature trend
                        temp_trend = np.polyfit(years, temps, 1)[0]  # Slope of trend line
                        
                        # Calculate precipitation trend
                        precip_trend = np.polyfit(years, precip, 1)[0]
                        
                        # Ensure realistic bounds for trends
                        temp_trend = max(-2.0, min(2.0, temp_trend))  # Cap at ±2°C per year
                        precip_trend = max(-20.0, min(20.0, precip_trend))  # Cap at ±20mm per year
                    except Exception as e:
                        logger.debug(f"Could not calculate trends for {location_name} month {month}: {str(e)}")
                        temp_trend = 0.0
                        precip_trend = 0.0
            else:
                temp_trend = 0.0
                precip_trend = 0.0
            
            temporal_patterns[location_name][month] = {
                'temp_mean': float(temp_mean),
                'temp_max': float(temp_max),
                'temp_min': float(temp_min),
                'precipitation_sum': float(precip_sum),
                'sunshine_duration': float(sunshine),
                'sample_size': len(month_data),
                'temp_trend': float(temp_trend),
                'precip_trend': float(precip_trend)
            }
    
    logger.info("Temporal weather pattern analysis complete")
    return temporal_patterns

def generate_dynamic_weather_features(temporal_patterns, location, year, month, base_year=2020):
    """
    Generate dynamic weather features based on temporal patterns and requested year
    
    Args:
        temporal_patterns (dict): Temporal weather patterns
        location (str): Location name
        year (int): Target year
        month (int): Target month
        base_year (int): Base year for trend calculations
    
    Returns:
        dict: Dynamic weather features
    """
    if location not in temporal_patterns:
        logger.warning(f"No temporal patterns found for {location}, using defaults")
        location = 'Gulmarg'  # Fallback to Gulmarg
    
    if month not in temporal_patterns[location]:
        logger.warning(f"No data for month {month} in {location}, using defaults")
        # Use average of all months for this location
        month_data = list(temporal_patterns[location].values())
        if month_data:
            weather = {
                'temp_mean': np.mean([m['temp_mean'] for m in month_data]),
                'temp_max': np.mean([m['temp_max'] for m in month_data]),
                'temp_min': np.mean([m['temp_min'] for m in month_data]),
                'precipitation_sum': np.mean([m['precipitation_sum'] for m in month_data]),
                'sunshine_duration': np.mean([m['sunshine_duration'] for m in month_data]),
                'temp_trend': np.mean([m['temp_trend'] for m in month_data]),
                'precip_trend': np.mean([m['precip_trend'] for m in month_data])
            }
        else:
            # Ultimate fallback
            weather = {
                'temp_mean': 15.0,
                'temp_max': 20.0,
                'temp_min': 10.0,
                'precipitation_sum': 50.0,
                'sunshine_duration': 200.0,
                'temp_trend': 0.0,
                'precip_trend': 0.0
            }
    else:
        weather = temporal_patterns[location][month]
    
    # Apply temporal trends based on year difference
    year_diff = year - base_year
    
    # Adjust temperature based on trend
    adjusted_temp_mean = weather['temp_mean'] + (weather['temp_trend'] * year_diff)
    adjusted_temp_max = weather['temp_max'] + (weather['temp_trend'] * year_diff)
    adjusted_temp_min = weather['temp_min'] + (weather['temp_trend'] * year_diff)
    
    # Adjust precipitation based on trend
    adjusted_precip = weather['precipitation_sum'] + (weather['precip_trend'] * year_diff)
    
    # Enhanced approach: Also consider seasonal interpolation
    # If we have data for adjacent months, we can interpolate
    prev_month = month - 1 if month > 1 else 12
    next_month = month + 1 if month < 12 else 1
    
    # Get adjacent month data for smoother transitions
    if prev_month in temporal_patterns[location] and next_month in temporal_patterns[location]:
        prev_weather = temporal_patterns[location][prev_month]
        next_weather = temporal_patterns[location][next_month]
        
        # Weighted interpolation based on proximity to adjacent months
        # This helps with seasonal transitions
        weight_prev = 0.1  # Small influence from previous month
        weight_next = 0.1  # Small influence from next month
        weight_current = 0.8  # Dominant influence from current month
        
        # Apply interpolation to temperature
        interpolated_temp_mean = (
            weight_prev * prev_weather['temp_mean'] +
            weight_current * adjusted_temp_mean +
            weight_next * next_weather['temp_mean']
        )
        
        # Apply interpolation to precipitation
        interpolated_precip = (
            weight_prev * prev_weather['precipitation_sum'] +
            weight_current * adjusted_precip +
            weight_next * next_weather['precipitation_sum']
        )
        
        # Use interpolated values
        adjusted_temp_mean = interpolated_temp_mean
        adjusted_precip = interpolated_precip
    
    # Ensure realistic bounds
    adjusted_temp_mean = max(-20, min(40, adjusted_temp_mean))  # Reasonable temp range
    adjusted_temp_max = max(-15, min(45, adjusted_temp_max))
    adjusted_temp_min = max(-25, min(35, adjusted_temp_min))
    adjusted_precip = max(0, adjusted_precip)  # Non-negative precipitation
    
    dynamic_weather = {
        'temp_mean': adjusted_temp_mean,
        'temp_max': adjusted_temp_max,
        'temp_min': adjusted_temp_min,
        'precipitation_sum': adjusted_precip,
        'sunshine_duration': weather['sunshine_duration'],  # Sunshine duration relatively stable
        'temp_trend': weather['temp_trend'],
        'precip_trend': weather['precip_trend'],
        'sample_size': weather['sample_size'],
        'year_diff': year_diff,
        'base_values': {
            'temp_mean': weather['temp_mean'],
            'precipitation_sum': weather['precipitation_sum']
        }
    }
    
    return dynamic_weather

def compare_static_vs_dynamic():
    """Compare static lookup vs dynamic temporal analysis"""
    logger.info("Comparing static vs dynamic weather approaches...")
    
    # Load data
    df = load_dataset()
    
    # Analyze temporal patterns
    temporal_patterns = analyze_temporal_weather_patterns(df)
    
    # Example comparison
    locations = ['Gulmarg', 'Pahalgam', 'Sonamarg']
    months = [1, 6, 12]  # Winter, summer, winter
    
    print("\n" + "="*80)
    print("STATIC vs DYNAMIC WEATHER COMPARISON")
    print("="*80)
    
    for location in locations:
        print(f"\n{location.upper()}:")
        print("-" * 50)
        
        for month in months:
            # Static approach (current)
            static_temp = get_static_temperature(location, month)
            static_precip = get_static_precipitation(location, month)
            
            # Dynamic approach (proposed)
            dynamic = generate_dynamic_weather_features(temporal_patterns, location, 2025, month)
            
            print(f"  Month {month}:")
            print(f"    Static:  {static_temp:5.1f}°C, {static_precip:5.1f}mm")
            print(f"    Dynamic: {dynamic['temp_mean']:5.1f}°C, {dynamic['precipitation_sum']:5.1f}mm")
            print(f"    Trend:   {dynamic['temp_trend']:6.2f}°C/year, {dynamic['precip_trend']:6.2f}mm/year")

def get_static_temperature(location, month):
    """Get static temperature from current approach (simplified)"""
    # This mimics the current static approach in app.py
    static_temps = {
        'Gulmarg': {1: -2, 6: 17, 12: 2},
        'Pahalgam': {1: -3, 6: 13, 12: 1},
        'Sonamarg': {1: -5, 6: 19, 12: 2}
    }
    
    return static_temps.get(location, {}).get(month, 15)

def get_static_precipitation(location, month):
    """Get static precipitation from current approach (simplified)"""
    # This mimics the current static approach in app.py
    static_precip = {
        'Gulmarg': {1: 150, 6: 45, 12: 120},
        'Pahalgam': {1: 125, 6: 70, 12: 117},
        'Sonamarg': {1: 126, 6: 69, 12: 132}
    }
    
    return static_precip.get(location, {}).get(month, 50)

def main():
    """Main function to demonstrate temporal weather analysis"""
    try:
        # Load dataset
        df = load_dataset()
        
        # Analyze temporal patterns
        temporal_patterns = analyze_temporal_weather_patterns(df)
        
        # Save temporal patterns for use in prediction system
        import json
        with open('temporal_weather_patterns.json', 'w') as f:
            json.dump(temporal_patterns, f, indent=2)
        
        logger.info("Temporal weather patterns saved to temporal_weather_patterns.json")
        
        # Demonstrate dynamic weather generation
        print("\n" + "="*80)
        print("DYNAMIC WEATHER GENERATION EXAMPLES")
        print("="*80)
        
        # Example: Generate weather for different years
        test_cases = [
            ('Gulmarg', 2024, 1),
            ('Gulmarg', 2025, 1),
            ('Gulmarg', 2026, 1),
            ('Pahalgam', 2024, 6),
            ('Pahalgam', 2025, 6),
            ('Pahalgam', 2026, 6)
        ]
        
        for location, year, month in test_cases:
            dynamic_weather = generate_dynamic_weather_features(temporal_patterns, location, year, month)
            print(f"\n{location} {year}-{month:02d}:")
            print(f"  Temperature: {dynamic_weather['temp_mean']:.1f}°C "
                  f"(trend: {dynamic_weather['temp_trend']:+.2f}°C/year)")
            print(f"  Precipitation: {dynamic_weather['precipitation_sum']:.1f}mm "
                  f"(trend: {dynamic_weather['precip_trend']:+.2f}mm/year)")
            print(f"  Sunshine: {dynamic_weather['sunshine_duration']:.1f} hours")
            print(f"  Based on {dynamic_weather['sample_size']} historical samples")
        
        # Compare approaches
        compare_static_vs_dynamic()
        
        return temporal_patterns
        
    except Exception as e:
        logger.error(f"Error in temporal weather analysis: {str(e)}")
        raise

if __name__ == '__main__':
    main()