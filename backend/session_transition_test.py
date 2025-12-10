#!/usr/bin/env python3
"""
Test seasonal transitions within a single session to evaluate smoothing effectiveness
"""

import requests
import json
import time

def test_session_transitions():
    """Test predictions within a single session to evaluate smoothing effectiveness"""
    print("=" * 70)
    print("Testing Session-Based Seasonal Transitions for Gulmarg")
    print("=" * 70)
    
    url = 'http://127.0.0.1:5000/api/predict'
    
    # Test months in sequence within a single session
    predictions = {}
    month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    print("Making sequential requests within a single session...")
    
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
                print(f"{month_names[month]:>4}: {predicted_footfall:>8,} visitors")
                
                # Small delay to ensure proper sequencing
                time.sleep(0.1)
            else:
                print(f"{month_names[month]:>4}: Error - Status {response.status_code}")
        except Exception as e:
            print(f"{month_names[month]:>4}: Error - {str(e)}")
    
    # Analyze transitions
    print("\n" + "=" * 70)
    print("Session-Based Transition Analysis")
    print("=" * 70)
    
    for i in range(1, 12):
        current = predictions.get(i, 0)
        next_month = predictions.get(i+1, 0)
        
        if current > 0 and next_month > 0:
            change_percent = ((next_month - current) / current) * 100
            print(f"{month_names[i]} → {month_names[i+1]}: {current:,.0f} → {next_month:,.0f} ({change_percent:+.1f}%)")
    
    # Identify abrupt changes (>30% drop or increase)
    print("\n" + "=" * 70)
    print("Identifying Significant Changes (>30% change)")
    print("=" * 70)
    
    significant_changes = []
    for i in range(1, 12):
        current = predictions.get(i, 0)
        next_month = predictions.get(i+1, 0)
        
        if current > 0 and next_month > 0:
            change_percent = ((next_month - current) / current) * 100
            if abs(change_percent) > 30:  # More than 30% change
                significant_changes.append((month_names[i], month_names[i+1], change_percent))
                print(f"⚠️  Significant change: {month_names[i]} → {month_names[i+1]} ({change_percent:+.1f}%)")
    
    if not significant_changes:
        print("✅ No significant changes detected. Transitions appear smooth.")
    else:
        print(f"⚠️  {len(significant_changes)} significant changes detected.")
    
    return predictions

def test_user_scenario():
    """Test the specific user scenario: Feb to May transition"""
    print("\n" + "=" * 70)
    print("Testing User Scenario: February to May Transition")
    print("=" * 70)
    
    url = 'http://127.0.0.1:5000/api/predict'
    
    # First establish the cache by requesting January and February
    print("Establishing prediction cache...")
    jan_data = {"location": "Gulmarg", "year": 2026, "month": 1, "rolling_avg": 100000}
    feb_data = {"location": "Gulmarg", "year": 2026, "month": 2, "rolling_avg": 100000}
    
    # Get January prediction
    response_jan = requests.post(url, json=jan_data, timeout=10)
    jan_result = response_jan.json()
    jan_visitors = jan_result['prediction']['predicted_footfall']
    print(f"January: {jan_visitors:>8,} visitors")
    
    # Get February prediction (should use January for smoothing)
    response_feb = requests.post(url, json=feb_data, timeout=10)
    feb_result = response_feb.json()
    feb_visitors = feb_result['prediction']['predicted_footfall']
    print(f"February: {feb_visitors:>8,} visitors")
    
    # Now test March, April, May
    test_months = [3, 4, 5]
    results = {2: feb_visitors}  # Start with February
    
    for month in test_months:
        data = {"location": "Gulmarg", "year": 2026, "month": month, "rolling_avg": 100000}
        response = requests.post(url, json=data, timeout=10)
        result = response.json()
        visitors = result['prediction']['predicted_footfall']
        results[month] = visitors
        month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        print(f"{month_names[month]:>7}: {visitors:>8,} visitors")
    
    # Analyze transitions
    print("\nTransition Analysis:")
    for i in range(2, 5):  # Feb to May
        current = results[i]
        next_month = results[i+1]
        month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        change_percent = ((next_month - current) / current) * 100
        print(f"{month_names[i]} → {month_names[i+1]}: {current:,.0f} → {next_month:,.0f} ({change_percent:+.1f}%)")
        
        if abs(change_percent) > 30:
            print(f"  ⚠️  Significant change detected!")
        else:
            print(f"  ✅ Reasonable transition")

if __name__ == "__main__":
    print("Kashmir Tourism Footfall Prediction - Session Transition Test")
    print("Testing within a single session to evaluate smoothing effectiveness\n")
    
    predictions = test_session_transitions()
    test_user_scenario()
    
    print("\n" + "=" * 70)
    print("Summary")
    print("=" * 70)
    print("This test evaluates how well the smoothing algorithm works when")
    print("requests are made within a single session, allowing the smoothing")
    print("cache to be utilized effectively for consecutive predictions.")