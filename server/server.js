const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kashmir_tourism', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ Connected to MongoDB');
}).catch(err => {
    console.error('✗ MongoDB connection error:', err);
});

// Prediction Schema
const PredictionSchema = new mongoose.Schema({
    location: String,
    year: Number,
    month: Number,
    predictedFootfall: Number,
    confidence: Number,
    weather: Object,
    holidays: Object,
    createdAt: { type: Date, default: Date.now }
});

const Prediction = mongoose.model('Prediction', PredictionSchema);

// Routes

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const mlHealth = await axios.get(`${ML_API_URL}/api/health`);
        res.json({
            server: 'healthy',
            mlService: mlHealth.data.status,
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            server: 'healthy',
            mlService: 'unavailable',
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    }
});

// Get all predictions (history)
app.get('/api/predictions', async (req, res) => {
    try {
        const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(50);
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Make prediction
app.post('/api/predict', async (req, res) => {
    try {
        const { location, year, month, rolling_avg } = req.body;

        // Call Python ML service
        const mlResponse = await axios.post(`${ML_API_URL}/api/predict`, {
            location,
            year,
            month,
            rolling_avg: rolling_avg || 80000
        });

        const predictionData = mlResponse.data.prediction;

        // Save to database
        const prediction = new Prediction(predictionData);
        await prediction.save();

        res.json(mlResponse.data);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ 
            error: error.response?.data?.error || error.message 
        });
    }
});

// Get locations
app.get('/api/locations', async (req, res) => {
    try {
        const mlResponse = await axios.get(`${ML_API_URL}/api/locations`);
        res.json(mlResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Resource calculation endpoint
app.post('/api/resources', async (req, res) => {
    try {
        const { footfall } = req.body;

        // Calculate resources based on footfall
        // Assuming 50 staff per 1000 footfall
        const staff = Math.ceil(footfall / 50);
        // Assuming 1000 vehicles per 1000 footfall
        const vehicles = Math.ceil(footfall / 1000);
        // Assuming 2 rooms per 1000 footfall
        const rooms = Math.ceil((footfall * 0.30) / 2);
        // Assuming 10 rupees per person
        const budget = (staff * 25000 + vehicles * 15000 + footfall * 10) * 1.15;

        res.json({
            staff: {
                total: staff,
                guides: Math.ceil(staff * 0.30),
                security: Math.ceil(staff * 0.25),
                support: Math.ceil(staff * 0.45)
            },
            transport: {
                total: vehicles,
                buses: Math.ceil(vehicles * 0.50),
                vans: Math.ceil(vehicles * 0.30),
                taxis: Math.ceil(vehicles * 0.20)
            },
            accommodation: {
                rooms: rooms,
                hotels: Math.ceil(rooms / 50)
            },
            budget: {
                total: Math.round(budget),
                staff: staff * 25000,
                transport: vehicles * 15000,
                maintenance: footfall * 10,
                emergency: Math.round(budget * 0.15)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ ML service at ${ML_API_URL}`);
});
