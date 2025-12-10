#!/usr/bin/env python3
"""
Test seasonal transitions sequentially to check smoothing effectiveness
"""

import requests
import json

def test_sequential_transitions():
    """Test predictions sequentially to check smoothing effectiveness"""
    print("=" * 70)
    print("Testing Sequential Seasonal Transitions for Gulmarg")
    print("=" * 70)
    
    url = 'http://127.0.0.1:5000/api/predict'
    
    # Test months in sequence to trigger smoothing
    predictions = {}
    month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    print("Making sequential requests to test smoothing...")
    
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
            else:
                print(f"{month_names[month]:>4}: Error - Status {response.status_code}")
        except Exception as e:
            print(f"{month_names[month]:>4}: Error - {str(e)}")
    
    # Analyze transitions
    print("\n" + "=" * 70)
    print("Sequential Transition Analysis")
    print("=" * 70)
    
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
                abrupt_changes.append((month_names[i], month_names[i+1], change_percent))
                print(f"⚠️  ABrupt change: {month_names[i]} → {month_names[i+1]} ({change_percent:+.1f}%)")
    
    if not abrupt_changes:
        print("✅ No abrupt changes detected. Transitions appear smooth.")
    else:
        print(f"❌ {len(abrupt_changes)} abrupt changes detected.")
    
    return predictions

def test_specific_problematic_transitions():
    """Test specific problematic transitions identified by tourism department"""
    print("\n" + "=" * 70)
    print("Testing Specific Problematic Transitions")
    print("=" * 70)
    
    url = 'http://127.0.0.1:5000/api/predict'
    
    # Test the specific case mentioned by the user: Feb to May transition
    test_cases = [
        {"location": "Gulmarg", "year": 2026, "month": 2, "desc": "February (Winter decline)"},
        {"location": "Gulmarg", "year": 2026, "month": 3, "desc": "March (Spring transition)"},
        {"location": "Gulmarg", "year": 2026, "month": 4, "desc": "April (Spring progression)"},
        {"location": "Gulmarg", "year": 2026, "month": 5, "desc": "May (Early summer)"}
    ]
    
    results = {}
    for case in test_cases:
        data = {
            "location": case["location"],
            "year": case["year"],
            "month": case["month"],
            "rolling_avg": 100000
        }
        
        try:
            response = requests.post(url, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                predicted_footfall = result['prediction']['predicted_footfall']
                results[case["month"]] = predicted_footfall
                print(f"{case['desc']:>25}: {predicted_footfall:>8,} visitors")
            else:
                print(f"{case['desc']:>25}: Error - Status {response.status_code}")
        except Exception as e:
            print(f"{case['desc']:>25}: Error - {str(e)}")
    
    # Analyze the transitions
    print("\nTransition Analysis:")
    months = list(results.keys())
    month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for i in range(len(months)-1):
        current_month = months[i]
        next_month = months[i+1]
        current = results[current_month]
        next_val = results[next_month]
        
        change_percent = ((next_val - current) / current) * 100
        print(f"{month_names[current_month]} → {month_names[next_month]}: {current:,.0f} → {next_val:,.0f} ({change_percent:+.1f}%)")
        
        if abs(change_percent) > 30:
            print(f"  ⚠️  Significant change detected!")
        else:
            print(f"  ✅ Reasonable transition")

if __name__ == "__main__":
    print("Kashmir Tourism Footfall Prediction - Sequential Transition Test")
    print("Testing sequential requests to evaluate smoothing effectiveness\n")
    
    predictions = test_sequential_transitions()
    test_specific_problematic_transitions()
    
    print("\n" + "=" * 70)
    print("Summary")
    print("=" * 70)
    print("The sequential transition test evaluates how well the smoothing")
    print("algorithm works when requests are made in sequence, allowing the")
    print("smoothing cache to be utilized effectively.")