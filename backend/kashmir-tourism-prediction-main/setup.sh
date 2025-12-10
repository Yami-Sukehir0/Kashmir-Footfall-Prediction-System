#!/bin/bash
# Quick setup script for Kashmir Tourism Prediction Pipeline

echo "========================================"
echo "Kashmir Tourism Prediction - Setup"
echo "========================================"
echo ""

# Check Python version
echo "Checking Python version..."
python --version
if [ $? -ne 0 ]; then
    echo "✗ Python not found. Please install Python 3.8 or higher."
    exit 1
fi
echo "✓ Python found"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv
if [ $? -ne 0 ]; then
    echo "✗ Failed to create virtual environment"
    exit 1
fi
echo "✓ Virtual environment created"
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
echo "✓ Virtual environment activated"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "✗ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Create directory structure
echo "Creating directory structure..."
mkdir -p data/raw
mkdir -p data/interim/{weather_data,daily_weather_data,monthly_weather_data,generated_footfall}
mkdir -p data/processed
mkdir -p data/model_ready
mkdir -p logs
echo "✓ Directories created"
echo ""

# Check for input files
echo "Checking for input files..."
if [ -f "data/raw/kashmir_tourist_sites_footfall.csv" ]; then
    echo "✓ Found kashmir_tourist_sites_footfall.csv"
else
    echo "⚠ Missing kashmir_tourist_sites_footfall.csv in data/raw/"
fi

if [ -f "data/raw/monthly_tourist_data_2020_2024.csv" ]; then
    echo "✓ Found monthly_tourist_data_2020_2024.csv"
else
    echo "⚠ Missing monthly_tourist_data_2020_2024.csv in data/raw/"
fi
echo ""

# Verify imports
echo "Verifying module imports..."
python -c "from src.data_collection.weather_fetcher import WeatherDataFetcher" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Module imports working"
else
    echo "✗ Module import failed"
    exit 1
fi
echo ""

echo "========================================"
echo "✓ Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Ensure CSV files are in data/raw/"
echo "2. Review config/config.yaml"
echo "3. Run pipeline: python pipeline/run_pipeline.py"
echo ""
