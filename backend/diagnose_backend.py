"""
Backend Diagnosis - Check where the backend loads the scaler from
"""
import os
import sys

def check_app_imports():
    """Check how app.py imports and loads the scaler"""
    print("🔍 CHECKING APP.PY FOR SCALER LOADING...")
    
    app_path = 'app.py'
    if not os.path.exists(app_path):
        app_path = '../app.py'
        if not os.path.exists(app_path):
            app_path = '../../app.py'
    
    if os.path.exists(app_path):
        try:
            with open(app_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f"   Found app.py at: {app_path}")
            
            # Look for scaler loading code
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'scaler' in line.lower() and ('load' in line.lower() or 'joblib' in line.lower() or 'pickle' in line.lower()):
                    print(f"   Line {i+1}: {line.strip()}")
                    
            # Look for model path
            for i, line in enumerate(lines):
                if 'model' in line.lower() and 'path' in line.lower():
                    print(f"   Line {i+1}: {line.strip()}")
                    
        except Exception as e:
            print(f"   ❌ Error reading app.py: {e}")
    else:
        print("   ❌ app.py not found")

def check_working_directory():
    """Check current working directory"""
    print("📂 CHECKING CURRENT WORKING DIRECTORY...")
    cwd = os.getcwd()
    print(f"   Current directory: {cwd}")
    
    # Check if we're in the right place
    if 'backend' in cwd.lower():
        print("   ✅ In backend directory")
    else:
        print("   ⚠  Not in backend directory - this might be the issue!")

def check_python_path():
    """Check Python path"""
    print("🐍 CHECKING PYTHON PATH...")
    for path in sys.path:
        if 'kashmir' in path.lower() or 'tourism' in path.lower():
            print(f"   Relevant path: {path}")

def check_environment_variables():
    """Check relevant environment variables"""
    print("⚙️  CHECKING ENVIRONMENT VARIABLES...")
    relevant_vars = ['PYTHONPATH', 'MODEL_PATH', 'SCALER_PATH']
    found_any = False
    
    for var in relevant_vars:
        value = os.environ.get(var)
        if value:
            print(f"   {var}: {value}")
            found_any = True
    
    if not found_any:
        print("   No relevant environment variables found")

def main():
    print("=" * 70)
    print("BACKEND DIAGNOSIS FOR SCALER LOADING")
    print("=" * 70)
    print()
    
    check_working_directory()
    print()
    
    check_app_imports()
    print()
    
    check_python_path()
    print()
    
    check_environment_variables()
    print()
    
    print("=" * 70)
    print("DIAGNOSIS COMPLETE")
    print("=" * 70)
    print()
    print("NEXT STEPS:")
    print("1. Check the app.py output above to see where it loads the scaler")
    print("2. Ensure you're running the backend from the correct directory")
    print("3. Run the complete scaler fix from the same directory")
    print("=" * 70)

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")