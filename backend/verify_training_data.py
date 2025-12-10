#!/usr/bin/env python3
"""
Verify what data was actually used for training
"""

import pandas as pd
import numpy as np
import os

def verify_training_data():
    """Verify which dataset was used for training"""
    print("🔍 Verifying Training Data")
    print("=" * 40)
    
    # Check log-transformed dataset
    log_data_path = r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\data\kashmir_tourism_LOG_TRANSFORMED_option2.csv'
    if os.path.exists(log_data_path):
        df_log = pd.read_csv(log_data_path)
        print("Log-transformed dataset:")
        print(f"  Shape: {df_log.shape}")
        print(f"  Target (Footfall) range: {df_log['Footfall'].min():.4f} to {df_log['Footfall'].max():.4f}")
        print(f"  Target mean: {df_log['Footfall'].mean():.4f}")
        print(f"  Target std: {df_log['Footfall'].std():.4f}")
        print()
    
    # Check simple label dataset
    simple_data_path = r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\data\model_ready\kashmir_tourism_simple_label.csv'
    if os.path.exists(simple_data_path):
        df_simple = pd.read_csv(simple_data_path)
        print("Simple label dataset:")
        print(f"  Shape: {df_simple.shape}")
        print(f"  Target (Footfall) range: {df_simple['Footfall'].min():.0f} to {df_simple['Footfall'].max():.0f}")
        print(f"  Target mean: {df_simple['Footfall'].mean():.0f}")
        print(f"  Target std: {df_simple['Footfall'].std():.0f}")
        print()
    
    # The key difference:
    print("🎯 Key Difference:")
    print("  Log-transformed targets are typically 7-12 (natural log of visitor counts)")
    print("  Linear targets are typically 10,000-100,000 (actual visitor counts)")
    print()
    
    # Check what the current model is producing
    print("🧠 Current Model Behavior:")
    print("  Raw predictions around 80,000 suggest linear training")
    print("  Raw predictions around 9-11 would suggest log training")

if __name__ == "__main__":
    verify_training_data()