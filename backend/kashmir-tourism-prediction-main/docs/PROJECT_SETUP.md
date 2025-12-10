# Project Setup Guide

This document provides detailed setup instructions for the Kashmir Tourism Prediction pipeline.

## Step-by-Step Setup

### 1. Create Project Structure

Create the following directory structure:

mkdir -p kashmir_tourism_prediction/{config,data/{raw,interim/{weather_data,daily_weather_data,monthly_weather_data,generated_footfall},processed,model_ready},src/{data_collection,data_processing,features},pipeline,docs,logs}

### 2. Place All Python Files

Copy all the provided Python files into their respective directories as shown in the project structure.

### 3. Create Empty __init__.py Files

These files are already provided, but if missing:

touch src/init.py
touch src/data_collection/init.py
touch src/data_processing/init.py
touch src/features/init.py
touch pipeline/init.py

### 4. Place Input Data

Copy your CSV files to `data/raw/`:
- `kashmir_tourist_sites_footfall.csv`
- `monthly_tourist_data_2020_2024.csv`

### 5. Install Dependencies

pip install -r requirements.txt

### 6. Verify Configuration

Check `config/config.yaml` and adjust any paths or parameters as needed.

### 7. Run the Pipeline

python pipeline/run_pipeline.py

## Verification

After setup, verify the structure:

Check Python can import modules
python -c "from src.data_collection.weather_fetcher import WeatherDataFetcher; print('✓ Imports working')"

Check config loads
python -c "import yaml; yaml.safe_load(open('config/config.yaml')); print('✓ Config valid')"

Check input files exist
ls data/raw/*.csv

## Next Steps

1. Run a test with `--skip-weather` to verify processing steps work
2. Review logs in `logs/pipeline_execution.log`
3. Examine output files in `data/processed/` and `data/model_ready/`
4. Begin model development using the feature-engineered dataset
