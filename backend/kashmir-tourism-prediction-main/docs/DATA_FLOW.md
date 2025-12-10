# Data Flow Documentation

This document explains how data flows through the Kashmir Tourism Prediction pipeline.

## Pipeline Overview

Raw Data → Collection → Processing → Merging → Feature Engineering → ML Ready

## Detailed Flow

### Stage 1: Weather Data Collection

**Input:**
- Open-Meteo API (external)
- Configuration from `config.yaml`

**Process:**
1. Reads location coordinates and date ranges from config
2. Makes API requests for each location and date range
3. Implements rate limiting (1.5s delay between requests)
4. Handles API errors with retries and logging

**Output:**
- `data/interim/weather_data/*.csv` - Raw daily weather files for each location
- 10 CSV files (one per location)

**Data Format:**
time,temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,...,location
2017-01-01,2.5,5.3,-0.2,0.0,...,gulmarg

---

### Stage 2: Weather Data Processing

**Input:**
- `data/interim/weather_data/*.csv` - Raw daily weather files

**Process:**
1. Reads each daily weather file
2. Removes unnecessary columns (lat, lon, elevation, timezone)
3. Groups data by year-month
4. Calculates monthly averages for all weather parameters
5. Combines all location files into single dataset

**Output:**
- `data/interim/monthly_weather_data/*.csv` - Individual monthly files
- `data/processed/kashmir_weather_monthly_combined.csv` - Combined file

**Data Format:**
time,location,temperature_2m_mean,temperature_2m_max,temperature_2m_min,...
2017-01,gulmarg,2.8,7.2,-1.5,...

---

### Stage 3: Footfall Data Generation

**Input:**
- `data/raw/kashmir_tourist_sites_footfall.csv` - Yearly footfall by site (2020-2024)
- `data/raw/monthly_tourist_data_2020_2024.csv` - Monthly Kashmir-wide data

**Process:**
1. Loads site-wise yearly data and overall monthly patterns
2. Calculates average annual growth rate for each site
3. Works backward from 2020 to estimate 2017-2018 yearly totals
4. Distributes yearly totals into monthly values using seasonal patterns
5. Combines generated data with known data (2020-2024)
6. Standardizes location names to match weather data

**Output:**
- `data/processed/kashmir_sites_monthly_footfall_2017_2024.csv`

**Data Format:**
Tourist Site,Time,Footfall
Gulmarg,2017-01,45230
Gulmarg,2017-02,52100

---

### Stage 4: Data Merging

**Input:**
- `data/processed/kashmir_weather_monthly_combined.csv` - Weather data
- `data/processed/kashmir_sites_monthly_footfall_2017_2024.csv` - Footfall data

**Process:**
1. Standardizes location names in both datasets
2. Renames columns for consistency
3. Performs inner join on `tourist_site` and `time`
4. Validates merge results
5. Checks for missing values and data quality issues

**Output:**
- `data/processed/kashmir_tourism_dataset_final.csv`

**Data Format:**
tourist_site,time,Footfall,temperature_2m_mean,precipitation_sum,...
gulmarg,2017-01,45230,2.8,125.5,...

**Important:** Inner join means only records with matching location AND time in both datasets are kept.

---

### Stage 5: Feature Engineering

**Input:**
- `data/processed/kashmir_tourism_dataset_final.csv`

**Process:**
1. **Temporal Features**: Extracts year and month from time string
2. **Season Encoding**: Maps months to seasons (1=winter, 2=spring, 3=summer, 4=autumn)
3. **Location Encoding**: Converts location names to numeric labels (1-10)
4. **Rolling Features**: Calculates 3-month rolling average of footfall per location
5. **Cleanup**: Removes original text columns (time, tourist_site)

**Output:**
- `data/model_ready/kashmir_tourism_simple_label.csv`

**Data Format:**
Footfall,location_encoded,year,month,season,footfall_rolling_avg,temperature_2m_mean,...
45230,1,2017,1,1,45230,2.8,...
52100,1,2017,2,1,48665,4.3,...

**Features Created:**
- `year`: Numeric year (2017-2024)
- `month`: Numeric month (1-12)
- `season`: Season code (1-4)
- `location_encoded`: Location ID (1-10)
- `footfall_rolling_avg`: 3-month moving average of footfall

---

## Data Dependencies

config.yaml
↓
weather_fetcher.py → weather_data/*.csv
↓
weather_processor.py → kashmir_weather_monthly_combined.csv
↓
↓ (merge)
kashmir_tourist_sites_footfall.csv ↓
monthly_tourist_data_2020_2024.csv ↓
↓ ↓
footfall_generator.py → kashmir_sites_monthly_footfall_2017_2024.csv
↓ ↓
↓___________________________data_merger.py
↓
kashmir_tourism_dataset_final.csv
↓
feature_engineering.py
↓
kashmir_tourism_simple_label.csv
↓
(Model Training)

## Key Data Transformations

### Location Name Standardization

The pipeline handles location name variations:

| Footfall Data | Weather Data | Standardized |
|---------------|--------------|--------------|
| Gulmarg | gulmarg | gulmarg |
| Pahalgam | pahalgam | pahalgam |
| Lolab Bungus, Keran Teetwal | lolab, bungus, keran, teetwal | lolab, bungus, keran, teetwal |

### Time Format Standardization

All time values are converted to `YYYY-MM` format:
- Weather API returns: `YYYY-MM-DD` → converted to `YYYY-MM`
- Footfall uses: `YYYY-MM` (already correct)

### Missing Data Handling

- **2019**: Completely excluded (political unrest)
- **Pre-2020 footfall**: Estimated using research-based growth patterns
- **Missing weather values**: Filled with column mean (if any)

## Data Validation Points

Each stage includes validation:

1. **Weather Collection**: Checks API response, verifies data completeness
2. **Weather Processing**: Validates date ranges, checks for gaps
3. **Footfall Generation**: Ensures all locations have data, validates distributions
4. **Data Merging**: Confirms matching records, checks location alignment
5. **Feature Engineering**: Validates no null values in critical columns

## Performance Characteristics

**Typical Data Volumes:**

- Raw weather records: ~29,000 daily records (10 locations × 8 years × 365 days)
- Monthly weather records: ~960 records (10 locations × 96 months)
- Footfall records: ~840 records (10 locations × 84 months)
- Final merged dataset: ~840 records
- Feature-engineered dataset: ~840 records with 13+ columns

**Processing Time:**

- Weather collection: 3-8 minutes (API dependent)
- Weather processing: 5-15 seconds
- Footfall generation: 2-5 seconds
- Data merging: 1-3 seconds
- Feature engineering: 1-3 seconds

**Total pipeline runtime:** 5-10 minutes (full), 30-60 seconds (skip weather)
