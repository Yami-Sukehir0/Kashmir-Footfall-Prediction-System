import joblib
import pprint

# Load metadata
try:
    metadata = joblib.load(r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model\metadata.pkl')
    print("Metadata contents:")
    pprint.pprint(metadata)
    
    # Check if target_transform field exists
    if 'target_transform' in metadata:
        print(f"\n🎯 Target transformation: {metadata['target_transform']}")
    else:
        print("\n⚠️  Target transformation field not found in metadata")
except Exception as e:
    print(f"Error loading metadata: {e}")