@echo off
echo ========================================
echo Kashmir Tourism Prediction - Setup
echo ========================================
echo.

REM Check Python version
echo Checking Python version...
python --version
if errorlevel 1 (
    echo X Python not found. Please install Python 3.8 or higher.
    pause
    exit /b 1
)
echo √ Python found
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo X Failed to create virtual environment
    pause
    exit /b 1
)
echo √ Virtual environment created
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo √ Virtual environment activated
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo X Failed to install dependencies
    pause
    exit /b 1
)
echo √ Dependencies installed
echo.

REM Create directory structure
echo Creating directory structure...
mkdir data\raw 2>nul
mkdir data\interim\weather_data 2>nul
mkdir data\interim\daily_weather_data 2>nul
mkdir data\interim\monthly_weather_data 2>nul
mkdir data\interim\generated_footfall 2>nul
mkdir data\processed 2>nul
mkdir data\model_ready 2>nul
mkdir logs 2>nul
echo √ Directories created
echo.

REM Check for input files
echo Checking for input files...
if exist "data\raw\kashmir_tourist_sites_footfall.csv" (
    echo √ Found kashmir_tourist_sites_footfall.csv
) else (
    echo ! Missing kashmir_tourist_sites_footfall.csv in data\raw\
)

if exist "data\raw\monthly_tourist_data_2020_2024.csv" (
    echo √ Found monthly_tourist_data_2020_2024.csv
) else (
    echo ! Missing monthly_tourist_data_2020_2024.csv in data\raw\
)
echo.

REM Verify imports
echo Verifying module imports...
python -c "from src.data_collection.weather_fetcher import WeatherDataFetcher" 2>nul
if errorlevel 1 (
    echo X Module import failed
    pause
    exit /b 1
)
echo √ Module imports working
echo.

echo ========================================
echo √ Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Ensure CSV files are in data\raw\
echo 2. Review config\config.yaml
echo 3. Run pipeline: python pipeline\run_pipeline.py
echo.
pause
