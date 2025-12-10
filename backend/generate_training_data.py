#!/usr/bin/env python3
"""
Generate synthetic training data for Kashmir tourism prediction
Creates realistic footfall data with location-specific patterns
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import random

# Location mapping (same as in app.py)
LOCATION_MAPPING = {
    'Aharbal': 1,
    'Doodpathri': 2,
    'Gulmarg': 3,
    'Gurez': 4,
    'Kokernag': 5,
    'Lolab': 6,
    'Manasbal': 7,
    'Pahalgam': 8,
    'Sonamarg': 9,
    'Yousmarg': 10
}

# Location popularity scores (higher = more popular)
LOCATION_POPULARITY = {
    'Gulmarg': 95,      # Ski resort - very popular in winter
    'Pahalgam': 90,     # Valley destination - popular in summer
    'Sonamarg': 75,     # Beautiful valley
    'Yousmarg': 65,     # Emerging destination
    'Manasbal': 60,     # Beautiful lake
    'Doodpathri': 50,   # Nearby attraction
    'Aharbal': 45,      # Waterfall destination
    'Kokernag': 40,     # Lesser known
    'Lolab': 35,        # Remote valley
    'Gurez': 30         # Very remote
}

# Seasonal multipliers by location
SEASONAL_PATTERNS = {
    'Gulmarg': {
        12: 1.4, 1: 1.3, 2: 1.2,  # Winter ski season (peak)
        3: 0.7, 6: 0.5, 7: 0.4, 8: 0.5  # Off-season
    },
    'Pahalgam': {
        5: 1.1, 6: 1.5, 7: 1.4, 8: 1.3,  # Summer peak
        9: 1.1, 10: 0.8, 11: 0.6,
        12: 0.5, 1: 0.4  # Winter off-season
    },
    'Sonamarg': {
        5: 1.0, 6: 1.3, 7: 1.2, 8: 1.1,  # Summer
        9: 0.9, 10: 0.7, 11: 0.6
    }
}

# Default seasonal pattern for other locations
DEFAULT_SEASONAL = {
    1: 0.6, 2: 0.7, 3: 0.9, 4: 1.0, 5: 1.1,
    6: 1.2, 7: 1.3, 8: 1.2, 9: 1.0, 10: 0.8,
    11: 0.7, 12: 0.6
}

# Holiday data (same as in app.py)
HOLIDAY_DATA = {
    1: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2},
    2: {'count': 1, 'long_weekend': 0, 'national': 0, 'festival': 1},
    3: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
    4: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2},
    5: {'count': 2, 'long_weekend': 0, 'national': 1, 'festival': 1},
    6: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
    7: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2},
    8: {'count': 3, 'long_weekend': 1, 'national': 2, 'festival': 1},
    9: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2},
    10: {'count': 4, 'long_weekend': 2, 'national': 1, 'festival': 3},
    11: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
    12: {'count': 4, 'long_weekend': 2, 'national': 2, 'festival': 2},
}

def get_season(month):
    """Get season code from month"""
    if month in [12, 1, 2]:
        return 1  # Winter
    elif month in [3, 4, 5]:
        return 2  # Spring
    elif month in [6, 7, 8]:
        return 3  # Summer
    else:
        return 4  # Autumn

def generate_realistic_weather_data():
    """Generate realistic weather data for each location and month"""
    weather_data = {}
    
    # Base weather patterns for Kashmir
    base_weather = {
        1: {'temp_mean': 2, 'temp_max': 7, 'temp_min': -3, 'precip': 120, 'snow': 40, 'sunshine': 140},
        2: {'temp_mean': 4, 'temp_max': 9, 'temp_min': -1, 'precip': 110, 'snow': 30, 'sunshine': 160},
        3: {'temp_mean': 9, 'temp_max': 14, 'temp_min': 4, 'precip': 95, 'snow': 15, 'sunshine': 190},
        4: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 75, 'snow': 5, 'sunshine': 220},
        5: {'temp_mean': 19, 'temp_max': 24, 'temp_min': 14, 'precip': 60, 'snow': 0, 'sunshine': 260},
        6: {'temp_mean': 23, 'temp_max': 28, 'temp_min': 18, 'precip': 50, 'snow': 0, 'sunshine': 300},
        7: {'temp_mean': 25, 'temp_max': 30, 'temp_min': 20, 'precip': 45, 'snow': 0, 'sunshine': 320},
        8: {'temp_mean': 24, 'temp_max': 29, 'temp_min': 19, 'precip': 50, 'snow': 0, 'sunshine': 310},
        9: {'temp_mean': 20, 'temp_max': 25, 'temp_min': 15, 'precip': 60, 'snow': 0, 'sunshine': 270},
        10: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 75, 'snow': 5, 'sunshine': 220},
        11: {'temp_mean': 8, 'temp_max': 13, 'temp_min': 3, 'precip': 95, 'snow': 20, 'sunshine': 170},
        12: {'temp_mean': 3, 'temp_max': 8, 'temp_min': -2, 'precip': 120, 'snow': 45, 'sunshine': 140},
    }
    
    # Location-specific adjustments
    location_adjustments = {
        'Gulmarg': {'temp_offset': -3, 'snow_mult': 2.0, 'precip_mult': 1.2},  # Cold, snowy
        'Pahalgam': {'temp_offset': 0, 'snow_mult': 0.8, 'precip_mult': 1.0},   # Moderate
        'Aharbal': {'temp_offset': 1, 'snow_mult': 0.5, 'precip_mult': 0.9},    # Warmer
        'Doodpathri': {'temp_offset': 0, 'snow_mult': 0.7, 'precip_mult': 0.9}, # Cool
        'Gurez': {'temp_offset': -4, 'snow_mult': 2.5, 'precip_mult': 1.3},     # Very cold
        'Kokernag': {'temp_offset': -1, 'snow_mult': 1.0, 'precip_mult': 1.0},  # Moderate
        'Lolab': {'temp_offset': -2, 'snow_mult': 1.8, 'precip_mult': 1.1},     # Cold
        'Manasbal': {'temp_offset': 0, 'snow_mult': 0.6, 'precip_mult': 0.9},   # Moderate
        'Sonamarg': {'temp_offset': -1, 'snow_mult': 1.2, 'precip_mult': 1.0},  # Cool
        'Yousmarg': {'temp_offset': -2, 'snow_mult': 1.5, 'precip_mult': 1.1},  # Cool
    }
    
    for location in LOCATION_MAPPING.keys():
        weather_data[location] = {}
        adjustments = location_adjustments.get(location, {'temp_offset': 0, 'snow_mult': 1.0, 'precip_mult': 1.0})
        
        for month in range(1, 13):
            base = base_weather[month].copy()
            
            # Apply location-specific adjustments
            base['temp_mean'] += adjustments['temp_offset']
            base['temp_max'] += adjustments['temp_offset']
            base['temp_min'] += adjustments['temp_offset']
            base['snow'] = int(base['snow'] * adjustments['snow_mult'])
            base['precip'] = int(base['precip'] * adjustments['precip_mult'])
            
            # Add some randomness
            base['temp_mean'] += random.randint(-2, 2)
            base['temp_max'] += random.randint(-2, 2)
            base['temp_min'] += random.randint(-2, 2)
            base['precip'] = max(0, base['precip'] + random.randint(-20, 20))
            base['snow'] = max(0, base['snow'] + random.randint(-10, 10))
            base['sunshine'] = max(100, min(350, base['sunshine'] + random.randint(-30, 30)))
            
            weather_data[location][month] = base
    
    return weather_data

def generate_footfall_data(start_year=2017, end_year=2024):
    """Generate synthetic footfall data with location-specific patterns"""
    print("Generating synthetic training data...")
    
    # Generate weather data
    weather_data = generate_realistic_weather_data()
    
    # Data storage
    data_rows = []
    
    # Generate data for each year
    for year in range(start_year, end_year + 1):
        # Base growth trend (Kashmir tourism has been growing)
        growth_factor = 1.0 + (year - 2017) * 0.08  # 8% annual growth
        
        for month in range(1, 13):
            for location, location_code in LOCATION_MAPPING.items():
                # Base visitors by location popularity
                base_visitors = LOCATION_POPULARITY[location] * 1000
                
                # Apply seasonal pattern
                location_pattern = SEASONAL_PATTERNS.get(location, DEFAULT_SEASONAL)
                seasonal_multiplier = location_pattern.get(month, DEFAULT_SEASONAL[month])
                
                # Apply weather factors
                weather = weather_data[location][month]
                
                # Temperature comfort score (ideal range 15-25°C)
                temp_comfort = max(0, 1 - abs(weather['temp_mean'] - 20) / 20)
                
                # Sunshine score (more sunshine is better)
                sunshine_score = min(1, weather['sunshine'] / 300)
                
                # Precipitation penalty (less rain/snow is better)
                precip_penalty = max(0, 1 - (weather['precip'] + weather['snow']) / 200)
                
                weather_multiplier = 0.7 + 0.3 * (temp_comfort + sunshine_score + precip_penalty) / 3
                
                # Holiday factor
                holidays = HOLIDAY_DATA[month]
                holiday_impact = (holidays['count'] * 0.08) + (holidays['long_weekend'] * 0.12) + (holidays['national'] * 0.05)
                holiday_multiplier = 1.0 + holiday_impact
                
                # Calculate base prediction
                base_footfall = base_visitors * growth_factor * seasonal_multiplier * weather_multiplier * holiday_multiplier
                
                # Add realistic variance (±15%)
                variance = random.uniform(0.85, 1.15)
                footfall = int(base_footfall * variance)
                
                # Ensure reasonable bounds
                footfall = max(500, min(footfall, 100000))
                
                # Create data row
                row = {
                    'location_encoded': location_code,
                    'year': year,
                    'month': month,
                    'season': get_season(month),
                    'Footfall': footfall,
                    'temperature_2m_mean': weather['temp_mean'],
                    'temperature_2m_max': weather['temp_max'],
                    'temperature_2m_min': weather['temp_min'],
                    'precipitation_sum': weather['precip'],
                    'snowfall_sum': weather['snow'],
                    'sunshine_duration': weather['sunshine'],
                    'holiday_count': holidays['count'],
                    'long_weekend_count': holidays['long_weekend'],
                    'national_holiday_count': holidays['national'],
                    'festival_holiday_count': holidays['festival']
                }
                
                data_rows.append(row)
    
    # Create DataFrame
    df = pd.DataFrame(data_rows)
    
    # Add derived features
    df['temp_sunshine_interaction'] = df['temperature_2m_mean'] * df['sunshine_duration']
    df['temperature_range'] = df['temperature_2m_max'] - df['temperature_2m_min']
    df['precipitation_temperature'] = df['precipitation_sum'] * df['temperature_2m_mean']
    
    # Add rolling average (using a simple approach for synthetic data)
    df = df.sort_values(['location_encoded', 'year', 'month'])
    df['footfall_rolling_avg'] = df.groupby('location_encoded')['Footfall'].transform(
        lambda x: x.rolling(window=3, min_periods=1).mean().fillna(x.mean())
    )
    
    print(f"Generated {len(df)} training samples")
    print(f"Footfall range: {df['Footfall'].min()} to {df['Footfall'].max()}")
    
    return df

def save_training_data(df, output_path='kashmir_tourism_training_data.csv'):
    """Save training data to CSV"""
    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    print(f"Training data saved to: {output_path}")
    
    # Display column info
    print(f"\nDataset info:")
    print(f"  Rows: {len(df)}")
    print(f"  Columns: {len(df.columns)}")
    print(f"  Columns: {list(df.columns)}")
    
    return output_path

def main():
    """Main function to generate and save training data"""
    print("Kashmir Tourism Training Data Generator")
    print("=" * 50)
    
    # Generate data
    df = generate_footfall_data(start_year=2017, end_year=2024)
    
    # Save data
    output_path = os.path.join('data', 'model_ready', 'kashmir_tourism_simple_label.csv')
    save_training_data(df, output_path)
    
    print("\n✓ Data generation complete!")
    return df

if __name__ == '__main__':
    main()