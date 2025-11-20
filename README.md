# Kashmir Tourism Footfall Prediction Platform

**Full-Stack MERN + Python ML Application**

AI-powered tourist footfall prediction and resource management system for Kashmir Tourism Department.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Port 3000)              │
│  • Modern UI with glassmorphism design                      │
│  • Prediction forms, charts, resource visualization         │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP Requests
                   ↓
┌─────────────────────────────────────────────────────────────┐
│              Node.js API Gateway (Port 3001)                │
│  • Express.js REST API                                      │
│  • MongoDB for prediction history                           │
│  • Resource calculation logic                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP Requests
                   ↓
┌─────────────────────────────────────────────────────────────┐
│            Python ML Service (Port 5000)                    │
│  • Flask API serving trained model                          │
│  • XGBoost/RandomForest footfall predictions                │
│  • 22 engineered features (weather, holidays, temporal)     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
kashmir-tourism-fullstack/
├── backend/              # Python Flask ML API
│   ├── app.py           # Flask server with prediction endpoint
│   ├── models/          # YOUR TRAINED MODEL FILES GO HERE
│   │   ├── best_model/
│   │   │   └── model.pkl
│   │   ├── scaler.pkl
│   │   └── best_model_metadata.pkl
│   ├── requirements.txt
│   └── README.md
│
├── server/              # Node.js Express API Gateway
│   ├── server.js        # Express server
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.js              # Landing hero section
│   │   │   ├── PredictionForm.js    # Input form
│   │   │   ├── PredictionResults.js # Results display
│   │   │   ├── ResourcePlan.js      # Resource allocation
│   │   │   └── PredictionHistory.js # History table
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── README.md            # This file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB (local or Atlas)

### 1. Python ML Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**IMPORTANT:** Copy your trained model files to `backend/models/`:
```
backend/models/
├── best_model/
│   └── model.pkl
├── scaler.pkl
└── best_model_metadata.pkl
```

Run the ML service:
```bash
python app.py
```
✓ ML API will run on http://localhost:5000

### 2. Node.js Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/kashmir_tourism
ML_API_URL=http://localhost:5000
```

Run the server:
```bash
npm run dev
```
✓ API Gateway will run on http://localhost:3001

### 3. React Frontend

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:3001/api
```

Run the React app:
```bash
npm start
```
✓ Frontend will run on http://localhost:3000

## 📊 Features

### 🎯 Core Features
- **AI Footfall Prediction** - Predicts monthly tourist footfall using XGBoost model
- **Resource Planning** - Calculates staff, transport, accommodation, and budget requirements
- **Weather Integration** - 9 weather features per location
- **Holiday Impact** - 5 holiday-related features
- **Prediction History** - MongoDB-backed history tracking
- **Interactive Charts** - Budget and staff distribution visualizations

### 🧠 ML Model Features (22 Features)
- Location encoding (10 destinations)
- Temporal: year, month, season
- Rolling average footfall
- Weather: temp (mean/max/min), precipitation, snowfall, wind, humidity, sunshine
- Derived: temp-sunshine interaction, temp range, precipitation-temp
- Holidays: count, long weekends, national, festivals, days to next holiday

### 📍 Supported Locations
1. Aharbal
2. Doodpathri
3. Gulmarg
4. Gurez
5. Kokernag
6. Lolab
7. Manasbal
8. Pahalgam
9. Sonamarg
10. Yousmarg

## 🎨 UI Features
- Modern glassmorphism design
- Animated gradient hero section
- Responsive mobile-first layout
- AOS scroll animations
- Chart.js visualizations
- Real-time loading states

## 📝 API Endpoints

### Python ML Service (Port 5000)
- `GET /api/health` - Health check
- `POST /api/predict` - Make prediction
- `GET /api/locations` - Get locations list

### Node.js API Gateway (Port 3001)
- `GET /api/health` - Health check
- `POST /api/predict` - Proxy to ML service + save to DB
- `GET /api/predictions` - Get prediction history
- `POST /api/resources` - Calculate resource requirements
- `GET /api/locations` - Get locations list

## 🧪 Testing

### Test Prediction (cURL)
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Gulmarg",
    "year": 2024,
    "month": 12,
    "rolling_avg": 95000
  }'
```

### Expected Response
```json
{
  "success": true,
  "prediction": {
    "location": "Gulmarg",
    "year": 2024,
    "month": 12,
    "predicted_footfall": 125000,
    "confidence": 0.85,
    "weather": {...},
    "holidays": {...}
  }
}
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Chart.js (data visualization)
- Leaflet (maps - future)
- AOS (animations)
- Axios (HTTP client)

### Backend (Node)
- Express.js
- MongoDB + Mongoose
- Axios (proxy to ML service)
- CORS, dotenv

### Backend (Python)
- Flask
- XGBoost / RandomForest / GradientBoosting
- scikit-learn
- pandas, numpy
- joblib

## 📦 Deployment

### Production Build
```bash
# Frontend
cd client
npm run build

# Serve with Express
cd ../server
# Add: app.use(express.static('../client/build'))
```

### Environment Variables
```bash
# Production .env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
ML_API_URL=https://ml-api.yourdomain.com
```

## 👥 Team

- **Zaid Feroz** - ML Model Development & Full-Stack Integration
- **Ziya Nisar** - Team Member
- **Mohammad Masroor** - Team Member

## 📄 License

Developed for Kashmir Tourism Department - GCW M.A. Road, Srinagar

---

## 🚨 Troubleshooting

**Model not loading?**
- Ensure model files are in `backend/models/`
- Check file paths match exactly
- Verify model was trained with 22 features

**MongoDB connection failed?**
- Start MongoDB: `mongod`
- Or use MongoDB Atlas cloud

**Port already in use?**
- Change ports in .env files
- Kill existing processes

**CORS errors?**
- Verify proxy in client/package.json
- Check CORS config in server.js

---

**Built with ❤️ for Kashmir Tourism**
