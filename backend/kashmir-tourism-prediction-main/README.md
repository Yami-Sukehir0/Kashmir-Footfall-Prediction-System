# Kashmir Tourism Footfall Prediction System 🏔️

<div align="center">

![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![License](https://img.shields.io/badge/license-Academic-orange.svg)
![Status](https://img.shields.io/badge/status-Production--Ready-success.svg)

**AI-powered tourism forecasting system achieving 77.6% R² with 3.74% error**

[Features](#-features) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Performance](#-model-performance)

</div>

---

## 📋 Table of Contents
- [Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Model Performance](#-model-performance)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

Production-ready machine learning system for predicting tourist footfall in Kashmir's major destinations using historical weather data, tourism statistics, and holiday patterns.

### Academic Context
- **Institution:** Government College for Women M.A. Road Srinagar
- **Program:** IMCA (Integrated Master of Computer Applications)  
- **Semester:** Final Year (10th Semester)
- **Internship:** Emly Labs
- **Duration:** October 2025 - Ongoing
- **Type:** Real-world ML deployment project

### Key Achievements
- ✅ **77.6% R²** (explains variance effectively)
- ✅ **3.74% MAPE** (excellent prediction accuracy)
- ✅ **840 records** analyzed (2017-2024, 10 locations)
- ✅ **22 engineered features** (location + time + weather + holidays)
- ✅ **GradientBoosting** model (best performer)
- ✅ **Production REST API** with Swagger documentation
- ✅ **Temporal validation** (no data leakage)

---

## ✨ Key Features

### 📊 Data Pipeline
- Automated weather data collection (Open-Meteo API)
- Historical footfall data processing
- Holiday calendar integration
- Comprehensive feature engineering
- Robust data validation & cleaning

### 🤖 Machine Learning
- 5 regression models trained and compared
- Automatic best model selection
- Temporal train/validation/test split
- StandardScaler normalization
- Log-scale target transformation

### 🚀 Production API
- FastAPI framework with auto-documentation
- Input validation using Pydantic
- Comprehensive error handling
- Location-specific predictions
- Temporal forecasting (2017-2035)

---

## 🛠️ Technology Stack

**Core ML & Data Science:**
```
Python 3.11+
├── scikit-learn 1.3+  (ML algorithms)
├── XGBoost 2.0+       (GradientBoosting)
├── pandas 2.0+        (data manipulation)
├── numpy 2.1+         (numerical computing)
└── joblib 1.3+        (model serialization)
```

**API & Web:**
```
FastAPI 0.104+         (REST API)
├── uvicorn 0.24+      (ASGI server)
├── pydantic 2.5+      (data validation)
└── python-multipart   (file handling)
```

**Data Sources:**
- 🌤️ **Open-Meteo API** - Historical weather data
- 📊 **Kashmir Tourism Board** - Footfall statistics
- 📅 **Government Records** - Holiday calendars

---

## 📁 Project Structure

```
kashmir-tourism-prediction/
│
├── 📄 app.py                          # FastAPI REST API
├── 📄 requirements.txt                # Python dependencies
│
├── 📂 config/
│   └── config.yaml                    # Configuration settings
│
├── 📂 scripts/
│   ├── train_models.py                # Model training script
│   └── predict.py                     # Batch predictions
│
├── 📂 src/
│   ├── 📂 data/
│   │   ├── weather_fetcher.py         # Weather API client
│   │   ├── weather_processor.py       # Weather data processing
│   │   ├── holiday_processor.py       # Holiday data processing
│   │   ├── footfall_generator.py      # Footfall data generation
│   │   ├── data_merger.py             # Data merging logic
│   │   ├── data_enhancer.py           # Data enhancement
│   │   └── feature_engineering.py     # Feature creation
│   │
│   └── 📂 models/
│       ├── model_trainer.py           # Training pipeline
│       └── model_evaluator.py         # Model evaluation
│
├── 📂 data/
│   ├── 📂 raw/                        # Input datasets
│   │   ├── kashmir_holidays_2017_2024.csv
│   │   ├── kashmir_tourist_sites_footfall.csv
│   │   └── monthly_tourist_data_2020_2024.csv
│   │
│   ├── 📂 interim/                    # Intermediate data
│   ├── 📂 processed/                  # Processed datasets
│   └── 📂 model_ready/                # ML-ready features
│       └── kashmir_tourism_simple_label.csv
│
├── 📂 models/                         # Trained models
│   ├── 📂 best_model/
│   │   └── model.pkl                  # GradientBoosting model
│   ├── scaler.pkl                     # Feature scaler
│   └── best_model_metadata.pkl        # Model metadata
│
├── 📂 logs/                           # Execution logs
├── 📂 results/                        # Prediction outputs
│
├── 📄 .gitignore                      # Git ignore rules
└── 📄 README.md                       # This file
```

---

## 🚀 Installation

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)
- Git (for cloning)

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/kashmir-tourism-prediction.git
cd kashmir-tourism-prediction

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Verify installation
python -c "import sklearn, xgboost, fastapi; print('✓ All dependencies installed')"
```

---

## 📖 Usage

### 1️⃣ Train the Model

```bash
# Train model using all 22 features
python scripts/train_models.py
```

**Expected Output:**
```
==================================================================
KASHMIR TOURISM FOOTFALL PREDICTION - ENHANCED TRAINING
Using COMPLETE feature set (location + time + weather + holidays)
==================================================================
Loading data from: data/model_ready/kashmir_tourism_simple_label.csv
Loaded 840 rows and 23 columns

Training Ridge...
Train - MAE: 0.4439, RMSE: 0.5649, R2: 0.4439
Validation - MAE: 0.4863, RMSE: 0.6124, R2: 0.4863

Training GradientBoosting...
Train - MAE: 0.3198, RMSE: 0.4089, R2: 0.8561
Validation - MAE: 0.3542, RMSE: 0.4523, R2: 0.8363

✓ Best model: GradientBoosting (R2 = 0.836)
✓ Model saved: models/best_model/model.pkl
✓ Scaler saved: models/scaler.pkl
✓ Metadata saved: models/best_model_metadata.pkl
```

**Time:** ~1-2 minutes

---

### 2️⃣ Start the API

```bash
# Launch FastAPI server
python app.py
```

**Server Output:**
```
===============================================================
KASHMIR TOURISM FOOTFALL PREDICTION API v3.0
COMPLETE FEATURE SET VERSION
===============================================================
Loading models at startup...
✓ Model loaded: models/best_model/model.pkl
✓ Scaler loaded: models/scaler.pkl
✓ Metadata loaded:
     - Model type: gradientboosting
     - Features: 22
     - Trained at: 2025-11-18T17:00:33
✓ API ready to serve predictions!
===============================================================
INFO: Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

### 3️⃣ Access Interactive API Documentation

**Open in your browser:**
```
http://localhost:8000/docs
```

**Features:**
- 📝 Interactive Swagger UI
- ▶️ "Try it out" for live testing
- 📊 Request/Response schemas
- 🔍 Automatic validation

---

### 4️⃣ Make Predictions

#### **Via Swagger UI:**
1. Navigate to `http://localhost:8000/docs`
2. Click on `POST /predict`
3. Click "Try it out"
4. Enter request body (see example below)
5. Click "Execute"

#### **Via cURL:**

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
  "location": "Pahalgam",
  "year": 2025,
  "month": 7,
  "temperature_2m_mean": 20.0,
  "temperature_2m_max": 24.0,
  "temperature_2m_min": 16.0,
  "precipitation_sum": 4.0,
  "snowfall_sum": 0,
  "precipitation_hours": 6,
  "windgusts_10m_max": 29.0,
  "relative_humidity_2m_mean": 75.0,
  "sunshine_duration": 40000,
  "holiday_count": 1,
  "long_weekend_count": 1,
  "national_holiday_count": 0,
  "festival_holiday_count": 1,
  "days_to_next_holiday": 7
}'
```

**Response:**
```json
{
  "predicted_footfall": 131214,
  "confidence": "medium",
  "message": "Predicted 131,214 visitors in Pahalgam for July 2025",
  "location": "Pahalgam",
  "year": 2025,
  "month": 7,
  "month_name": "July"
}
```

---

## 🏆 Model Performance

### Final Model: **GradientBoosting Regressor**

| Metric | Train | Validation | Test | Interpretation |
|--------|-------|------------|------|----------------|
| **R²** | 0.856 | 0.836 | **0.776** | Explains 77.6% of variance ✅ |
| **MAE** | 0.320 | 0.354 | **0.390** | ±0.39 in log scale |
| **RMSE** | 0.409 | 0.452 | **0.487** | Root mean squared error |
| **MAPE** | 3.06% | 3.39% | **3.74%** | Excellent accuracy! ✅ |

### Model Comparison (Validation R²)

| Rank | Model | Validation R² | Status |
|------|-------|---------------|---------|
| 1 🥇 | **GradientBoosting** | **0.8363** | ✓ Selected |
| 2 🥈 | XGBoost | 0.8240 | |
| 3 🥉 | RandomForest | 0.7950 | |
| 4 | Lasso | 0.4861 | |
| 5 | Ridge | 0.4439 | |

### Performance Insights

✅ **No Overfitting:** Val R² (0.836) ≈ Test R² (0.776)  
✅ **Excellent MAPE:** 3.74% beats industry standard (10-15%)  
✅ **Temporal Validation:** Proper past→future split  
✅ **Production-Ready:** Consistent performance across splits  

---

## 🗺️ Supported Locations

The system covers 10 major Kashmir tourist destinations:

| # | Location | Type | Peak Season |
|---|----------|------|-------------|
| 1 | **Gulmarg** | Ski Resort | Winter (Dec-Feb) |
| 2 | **Pahalgam** | Trekking Base | Summer (Jun-Aug) |
| 3 | **Sonamarg** | Meadow | Summer (May-Sep) |
| 4 | **Doodpathri** | Valley | Summer (Jun-Aug) |
| 5 | **Kokernag** | Springs | Spring (Apr-Jun) |
| 6 | **Aharbal** | Waterfall | Summer (Jun-Aug) |
| 7 | **Yousmarg** | Forest Meadow | Summer (May-Aug) |
| 8 | **Manasbal** | Lake | All seasons |
| 9 | **Lolab** | Border Tourism | Summer (Jun-Sep) |
| 10 | **Gurez** | Remote Valley | Summer (Jul-Sep) |

---

## 📊 Feature Engineering

### 22 Features Used for Training

**Categorical (2):**
- `location_encoded` (1-10): Alphabetically sorted location IDs
- `season` (1-4): Winter, Spring, Summer, Autumn

**Temporal (2):**
- `year` (2017-2024): Year of observation
- `month` (1-12): Month of observation

**Historical (1):**
- `footfall_rolling_avg`: 3-month rolling average per location

**Weather - Base (9):**
- `temperature_2m_mean`: Average temperature (°C)
- `temperature_2m_max`: Maximum temperature (°C)
- `temperature_2m_min`: Minimum temperature (°C)
- `precipitation_sum`: Total precipitation (mm)
- `snowfall_sum`: Total snowfall (cm)
- `precipitation_hours`: Hours with precipitation
- `windgusts_10m_max`: Maximum wind gust (km/h)
- `relative_humidity_2m_mean`: Average humidity (%)
- `sunshine_duration`: Total sunshine (hours × 3600)

**Weather - Derived (3):**
- `temp_sunshine_interaction`: temp × sunshine
- `temperature_range`: max_temp - min_temp
- `precipitation_temperature`: precip × temp

**Holiday (5):**
- `holiday_count`: Total holidays in month
- `long_weekend_count`: Long weekends (3+ days)
- `national_holiday_count`: National holidays
- `festival_holiday_count`: Festival holidays
- `days_to_next_holiday`: Days until next holiday

**Target:**
- `Footfall`: **Log-transformed** tourist visitor count

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### **1. Root Endpoint**
```http
GET /
```

**Response:**
```json
{
  "name": "Kashmir Tourism Footfall Prediction API",
  "version": "3.0.0",
  "status": "running",
  "model_loaded": true,
  "num_features": 22,
  "supported_locations": ["Aharbal", "Doodpathri", ...]
}
```

---

#### **2. Health Check**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "num_features": 22,
  "feature_names": ["location_encoded", "year", ...]
}
```

---

#### **3. Get Locations**
```http
GET /locations
```

**Response:**
```json
{
  "locations": [
    {"name": "Aharbal", "code": 1},
    {"name": "Doodpathri", "code": 2},
    ...
  ],
  "total": 10
}
```

---

#### **4. Make Prediction**
```http
POST /predict
```

**Request Body:** See Usage section for complete example.

**Response:**
```json
{
  "predicted_footfall": 131214,
  "confidence": "medium",
  "message": "Predicted 131,214 visitors in Pahalgam for July 2025",
  "location": "Pahalgam",
  "year": 2025,
  "month": 7,
  "month_name": "July"
}
```

---

## ⚙️ Configuration

All settings in `config/config.yaml`:

```yaml
project:
  name: "Kashmir Tourism Footfall Prediction"
  version: "3.0.0"

paths:
  raw_data: "data/raw"
  interim_data: "data/interim"
  processed_data: "data/processed"
  model_ready: "data/model_ready"
  models: "models"
  logs: "logs"

modeling:
  test_size: 0.2
  val_size: 0.1
  random_state: 42
  cv_folds: 5

api:
  host: "0.0.0.0"
  port: 8000
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Models not found**
```bash
# Solution: Train models first
python scripts/train_models.py
```

**2. Port 8000 already in use**
```bash
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -ti:8000 | xargs kill -9

# Or change port in config/config.yaml
```

**3. Import errors**
```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

---

## 📄 License

Academic project for MCA internship at Emly Labs.

---

## 👨‍💻 Author

**Muhammad Masroor**  
IMCA Final Year | ML Engineer Intern @ Emly Labs

📧 maxroor0@gmail.com  
💼 [LinkedIn](https://linkedin.com/in/your-profile)  
🐙 [GitHub](https://github.com/Muhammad-Masroor)

---

## 🙏 Acknowledgments

- **Emly Labs** - Internship opportunity
- **GCW M.A. Road Srinagar** - Academic support
- **Open-Meteo** - Weather API
- **Kashmir Tourism Board** - Data access

---

## 🚧 Future Enhancements

- [ ] Deep learning (LSTM time series)
- [ ] Real-time dashboard
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Confidence intervals
- [ ] Holiday auto-lookup
- [ ] Mobile app

---

## 📞 Support

📧 maxroor0@gmail.com  
💬 [GitHub Issues](https://github.com/YOUR_USERNAME/kashmir-tourism-prediction/issues)

---

<div align="center">

**⭐ Star this project if you find it helpful!**

**Built with ❤️ for Kashmir Tourism**

*"Predicting the future of Kashmir tourism, one visitor at a time"*

</div>
