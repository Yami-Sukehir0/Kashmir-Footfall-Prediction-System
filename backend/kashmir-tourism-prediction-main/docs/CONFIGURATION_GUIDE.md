# Configuration Guide

Complete reference for `config/config.yaml` parameters.

## Structure

The configuration file is organized into logical sections:

project: # Project metadata
paths: # Directory structure
files: # File naming
weather: # Weather API settings
footfall: # Footfall generation settings
merge: # Data merging settings
features: # Feature engineering settings
logging: # Logging configuration

---

## Project Section

project:
name: "Kashmir Tourism Footfall Prediction"
version: "1.0.0"
description: "Predictive model for tourist footfall in Kashmir regions"

**Purpose:** Metadata for documentation and logging.

---

## Paths Section

paths:
raw_data: "data/raw"
interim_data: "data/interim"
weather_raw: "data/interim/weather_data"
weather_daily: "data/interim/daily_weather_data"
weather_monthly: "data/interim/monthly_weather_data"
footfall_generated: "data/interim/generated_footfall"
processed_data: "data/processed"
model_ready: "data/model_ready"
logs: "logs"

**Purpose:** Define directory structure. All paths are relative to project root.

**Note:** The pipeline creates these directories automatically if they don't exist.

---

## Files Section

files:
tourist_sites_footfall: "kashmir_tourist_sites_footfall.csv"
monthly_tourist_data: "monthly_tourist_data_2020_2024.csv"
weather_combined: "kashmir_weather_monthly_combined.csv"
footfall_generated: "kashmir_sites_monthly_footfall_2017_2024.csv"
final_dataset: "kashmir_tourism_dataset_final.csv"
feature_engineered: "kashmir_tourism_simple_label.csv"

**Purpose:** Standardize file names across the pipeline.

**Customization:** If you rename files, update these values.

---

## Weather Section

### API Configuration

weather:
api_url: "https://archive-api.open-meteo.com/v1/archive"
request_delay: 1.5 # seconds between requests

**api_url:** Open-Meteo Archive API endpoint (don't change unless API updates)

**request_delay:** Delay between API requests to respect rate limits
- Minimum: 1.0 (may hit rate limits)
- Recommended: 1.5 (safe)
- Increase if you encounter 429 errors

### Locations

locations:

name: "gulmarg"
latitude: 34.0500
longitude: 74.3800

... more locations

**Structure:** Each location needs:
- `name`: Lowercase identifier (must match merge mapping)
- `latitude`: Decimal degrees
- `longitude`: Decimal degrees

**To add a location:**
1. Add entry here with coordinates
2. Update `merge.location_mapping`
3. Add corresponding row in input CSV files

### Parameters

parameters:

"temperature_2m_mean"

"temperature_2m_max"

"temperature_2m_min"

"precipitation_sum"

"rain_sum"

"snowfall_sum"

"precipitation_hours"

"windspeed_10m_max"

"windgusts_10m_max"

"winddirection_10m_dominant"

"shortwave_radiation_sum"

"et0_fao_evapotranspiration"

**Purpose:** Weather variables to fetch from API.

**Available parameters:** See [Open-Meteo API docs](https://open-meteo.com/en/docs/historical-weather-api)

**Caution:** Changing parameters requires model retraining.

### Date Ranges

date_ranges:

start: "2017-01-01"
end: "2018-12-31"

start: "2020-01-01"
end: "2024-12-31"
date_ranges:

start: "2017-01-01"
end: "2018-12-31"

start: "2020-01-01"
end: "2024-12-31"
columns_to_remove:

"latitude"

"longitude"

"elevation"

"timezone"

"timezone_abbreviation"

**Purpose:** Columns that don't add value for monthly analysis.

---

## Footfall Section

footfall:
generated_years:
known_years:
excluded_years:

growth_rates:
min: 0.10 # 10% minimum
max: 0.25 # 25% maximum

peak_months: # May-August
shoulder_months: # Spring/Fall​
low_months: # Winter​

**generated_years:** Years to estimate (working backward from known data)

**known_years:** Years with actual data

**excluded_years:** Years to skip entirely

**growth_rates:** Bounds for annual growth estimation
- Based on Kashmir tourism research
- Used when site-specific rate can't be calculated

**Seasonal months:** Used for monthly distribution when overall data unavailable

---

## Merge Section

merge:
location_mapping:
"Gulmarg": "gulmarg"
"Pahalgam": "pahalgam"
# ... more mappings

**Purpose:** Map footfall location names to weather location names.

**Format:** `"Footfall Name": "weather_name"`

**Critical:** Names must match exactly (case-sensitive).

---

## Features Section

features:
rolling_window: 3

seasons:
winter:​
spring:
summer:
autumn:​

drop_columns:
- "time"
- "tourist_site"

**rolling_window:** Number of months for rolling average
- Larger = smoother but more lag
- Smaller = more responsive but noisier

**seasons:** Month-to-season mapping
- Values: [winter=1, spring=2, summer=3, autumn=4]

**drop_columns:** Text columns removed for ML (replaced with encoded versions)

---

## Logging Section

logging:
level: "INFO"
format: "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
file: "pipeline_execution.log"

**level:** Logging verbosity
- `DEBUG`: Very detailed (for troubleshooting)
- `INFO`: Normal operation (recommended)
- `WARNING`: Only warnings and errors
- `ERROR`: Only errors

**format:** Log message format (Python logging format)

**file:** Name of log file in logs/ directory

---

## Common Customizations

### Extend Date Range to 2025

date_ranges:

start: "2017-01-01"
end: "2018-12-31"

start: "2020-01-01"
end: "2025-12-31" # Changed from 2024

### Add New Location

1. Add to locations
locations:

name: "new_location"
latitude: 34.1234
longitude: 75.5678

2. Add to mapping
merge:
location_mapping:
"New Location": "new_location"

### Change Rolling Window

features:
rolling_window: 6 # Changed from 3 (6-month average)

### Enable Debug Logging

logging:
level: "DEBUG" # Changed from INFO

---

## Validation

To validate your configuration:

python -c "import yaml; yaml.safe_load(open('config/config.yaml')); print('✓ Config valid')"

This checks for YAML syntax errors.
