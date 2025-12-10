# Kashmir Tourism Footfall Prediction System

This is a professionally organized version of the Kashmir Tourism Footfall Prediction System. The project has been restructured into a clean, well-documented directory structure suitable for demonstration and further development.

## Project Overview

The Kashmir Tourism Footfall Prediction System is an advanced machine learning application designed to predict tourist footfall across various destinations in Kashmir. The system helps tourism departments with resource planning, infrastructure management, and strategic decision-making by providing accurate predictions based on seasonal patterns, weather conditions, and historical data.

## Directory Structure

```
organized_project/
├── backend/                    # Backend API and core logic
│   ├── api/                   # API endpoints and routes
│   ├── data/                  # Data processing and storage
│   ├── utils/                 # Utility functions and helpers
│   ├── app.py                 # Main Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/                  # Frontend user interface
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   ├── package.json           # Node.js dependencies
│   └── README.md              # Frontend documentation
├── models/                    # Machine learning models and scalers
│   ├── best_model/            # Trained ML model
│   ├── scaler.pkl             # Feature scaler
│   └── best_model_metadata.pkl# Model metadata
├── docs/                      # Documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # System architecture documents
│   └── user_guides/           # User guides and manuals
└── scripts/                   # Utility scripts for development and deployment
```

## Key Features

### Backend (Python/Flask)
- RESTful API for footfall predictions
- Machine learning model integration
- Feature engineering for temporal and environmental factors
- Seasonal pattern analysis with smooth transitions
- Comprehensive logging and error handling

### Frontend (React)
- Interactive dashboard for visualization
- Map-based interface showing all tourist destinations
- Real-time prediction updates
- Historical data visualization
- Admin panel for system management
- Responsive design for all device sizes

### Machine Learning
- RandomForestRegressor model for accurate predictions
- Log-transformed target variable for better distribution
- 17-feature input vector including:
  - Location encoding
  - Temporal features (year, month, season)
  - Weather conditions (temperature, precipitation, sunshine)
  - Holiday and event data
  - Historical rolling averages

### Data Processing
- Comprehensive weather data for all locations
- Holiday and festival impact analysis
- Seasonal multiplier adjustments
- Smooth transition algorithms to prevent abrupt changes

## Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Usage

### Starting the Services
1. Start the backend API:
   ```bash
   cd backend
   python app.py
   ```
   The API will be available at http://localhost:5000

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```
   The web interface will be available at http://localhost:3000

### API Endpoints
- `GET /api/health` - Health check endpoint
- `POST /api/predict` - Footfall prediction endpoint

Example prediction request:
```json
{
  "location": "Gulmarg",
  "year": 2026,
  "month": 1,
  "rolling_avg": 100000
}
```

## Admin Access

For demonstration purposes, you can use the following admin credentials:
- Username: admin@kashmir-tourism.gov.in
- Password: Admin@2026!

## System Architecture

The system follows a client-server architecture with:
1. **Frontend**: React-based user interface
2. **Backend**: Flask API serving predictions
3. **Database**: In-memory data structures with file-based persistence
4. **ML Model**: Pre-trained RandomForestRegressor with feature scaling

## Development

### Adding New Features
1. Backend features should be added in the appropriate subdirectory
2. Frontend components should follow the existing structure
3. Documentation should be updated in the docs folder

### Testing
- Unit tests for backend functions
- Integration tests for API endpoints
- End-to-end tests for frontend components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is proprietary to the Kashmir Tourism Department and is intended for internal use only.

## Contact

For questions or support, please contact the Kashmir Tourism Department IT team.