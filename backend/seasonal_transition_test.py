#!/usr/bin/env python3
"""
Test seasonal transitions to identify abrupt changes and implement smoother transitions
"""

import requests
import json

def test_seasonal_transitions():
    """Test predictions across different months to check for smooth transitions"""
    print("=" * 70)
    print("Testing Seasonal Transitions for Gulmarg")
    print("=" * 70)
    
    url = 'http://127.0.0.1:5000/api/predict'
    
    # Test all months for 2026
    predictions = {}
    
    for month in range(1, 13):
        data = {
            "location": "Gulmarg",
            "year": 2026,
            "month": month,
            "rolling_avg": 100000
        }
        
        try:
            response = requests.post(url, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                predicted_footfall = result['prediction']['predicted_footfall']
                predictions[month] = predicted_footfall
                month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                print(f"{month_names[month]:>4}: {predicted_footfall:>8,} visitors")
            else:
                print(f"Month {month}: Error - Status {response.status_code}")
        except Exception as e:
            print(f"Month {month}: Error - {str(e)}")
    
    # Analyze transitions
    print("\n" + "=" * 70)
    print("Transition Analysis")
    print("=" * 70)
    
    month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for i in range(1, 12):
        current = predictions.get(i, 0)
        next_month = predictions.get(i+1, 0)
        
        if current > 0 and next_month > 0:
            change_percent = ((next_month - current) / current) * 100
            print(f"{month_names[i]} → {month_names[i+1]}: {current:,.0f} → {next_month:,.0f} ({change_percent:+.1f}%)")
    
    # Identify abrupt changes (>50% drop or increase)
    print("\n" + "=" * 70)
    print("Identifying Abrupt Changes (>50% change)")
    print("=" * 70)
    
    abrupt_changes = []
    for i in range(1, 12):
        current = predictions.get(i, 0)
        next_month = predictions.get(i+1, 0)
        
        if current > 0 and next_month > 0:
            change_percent = ((next_month - current) / current) * 100
            if abs(change_percent) > 50:  # More than 50% change
                month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                abrupt_changes.append((month_names[i], month_names[i+1], change_percent))
                print(f"⚠️  ABrupt change: {month_names[i]} → {month_names[i+1]} ({change_percent:+.1f}%)")
    
    if not abrupt_changes:
        print("✅ No abrupt changes detected. Transitions appear smooth.")
    else:
        print(f"❌ {len(abrupt_changes)} abrupt changes detected. Need to implement smoother transitions.")
    
    return predictions

def implement_smooth_transitions():
    """Implement smoother seasonal transitions"""
    print("\n" + "=" * 70)
    print("Implementing Smoother Seasonal Transitions")
    print("=" * 70)
    
    # The idea is to modify the seasonal multipliers to create smoother transitions
    # Instead of abrupt drops, we'll create gradual declines
    
    # Current seasonal pattern for Gulmarg (from app.py):
    # 12: {'multiplier': 8.0, 'trend': 'peak'},    # Winter ski season - Lakhs range
    # 1: {'multiplier': 8.5, 'trend': 'peak'},     # Peak January - Highest visitor volume
    # 2: {'multiplier': 7.0, 'trend': 'high'},     # High winter season
    # 3: {'multiplier': 2.0, 'trend': 'low'},      # Low season
    # This creates an abrupt drop from 7.0 to 2.0 (60% decrease)
    
    # Proposed smoother transition:
    # 12: {'multiplier': 8.0, 'trend': 'peak'}
    # 1:  {'multiplier': 8.5, 'trend': 'peak'}
    # 2:  {'multiplier': 7.0, 'trend': 'high'}
    # 3:  {'multiplier': 5.0, 'trend': 'declining'}  # Gradual decline
    # 4:  {'multiplier': 3.5, 'trend': 'declining'}  # Continued decline
    # 5:  {'multiplier': 2.0, 'trend': 'low'}        # Off-season
    
    print("Current abrupt transition from February to March:")
    print("  Feb multiplier: 7.0")
    print("  Mar multiplier: 2.0")
    print("  Change: -60% (too abrupt)")
    
    print("\nProposed smoother transition:")
    print("  Feb multiplier: 7.0")
    print("  Mar multiplier: 5.0")
    print("  Apr multiplier: 3.5")
    print("  May multiplier: 2.0")
    print("  Changes: -30%, -30%, -43% (gradual decline)")

if __name__ == "__main__":
    print("Kashmir Tourism Footfall Prediction - Seasonal Transition Analysis")
    print("Analyzing seasonal transitions for realistic tourism patterns\n")
    
    predictions = test_seasonal_transitions()
    implement_smooth_transitions()
    
    print("\n" + "=" * 70)
    print("Next Steps:")
    print("1. Modify seasonal multipliers in app.py for smoother transitions")
    print("2. Implement transition smoothing algorithm")
    print("3. Retrain model with enhanced seasonal patterns")
    print("=" * 70)