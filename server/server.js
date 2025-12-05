const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Firebase Admin
const admin = require('./firebaseAdmin');
const { verifyToken, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3004;
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let mongoConnected = false;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kashmir_tourism', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ Connected to MongoDB');
    mongoConnected = true;
}).catch(err => {
    console.error('✗ MongoDB connection error:', err);
    console.log('⚠ Continuing without MongoDB - some features will be limited');
    mongoConnected = false;
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

// Admin User Schema
const AdminUserSchema = new mongoose.Schema({
    firebaseUID: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    name: String,
    role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
    permissions: [String],
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

// Activity Log Schema
const ActivityLogSchema = new mongoose.Schema({
    adminUID: String,
    action: { type: String, enum: ['create', 'read', 'update', 'delete'] },
    resource: String,
    details: Object,
    ipAddress: String,
    timestamp: { type: Date, default: Date.now }
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// Public Analytics Schema
const PublicAnalyticsSchema = new mongoose.Schema({
    totalLocations: Number,
    avgFootfall: Number,
    peakMonth: String,
    peakLocation: String,
    topLocations: [{ name: String, count: Number }],
    lastUpdated: Date
});

const PublicAnalytics = mongoose.model('PublicAnalytics', PublicAnalyticsSchema);

// Helper function to handle MongoDB dependent operations
const handleMongoOperation = async (operation, fallbackData = null) => {
    if (mongoConnected) {
        return await operation();
    } else {
        console.log('MongoDB not connected, returning fallback data');
        return fallbackData;
    }
};

// Routes

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const mlHealth = await axios.get(`${ML_API_URL}/api/health`);
        res.json({
            server: 'healthy',
            mlService: mlHealth.data.status,
            database: mongoConnected ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            server: 'healthy',
            mlService: 'unavailable',
            database: mongoConnected ? 'connected' : 'disconnected'
        });
    }
});

// Public endpoints - No authentication required
app.get('/api/public/locations', async (req, res) => {
    try {
        const mlResponse = await axios.get(`${ML_API_URL}/api/locations`);
        res.json(mlResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/public/predictions/summary', async (req, res) => {
    try {
        if (mongoConnected) {
            // Get summary statistics
            const stats = await Prediction.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPredictions: { $sum: 1 },
                        averageFootfall: { $avg: "$predictedFootfall" },
                        maxFootfall: { $max: "$predictedFootfall" },
                        minFootfall: { $min: "$predictedFootfall" },
                        locations: { $addToSet: "$location" }
                    }
                }
            ]);
            
            // Get most predicted locations
            const locationStats = await Prediction.aggregate([
                {
                    $group: {
                        _id: "$location",
                        count: { $sum: 1 },
                        averageFootfall: { $avg: "$predictedFootfall" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            
            res.json({
                totalLocations: stats[0]?.locations?.length || 0,
                avgFootfall: Math.round(stats[0]?.averageFootfall || 0),
                topLocations: locationStats,
                trends_data: [] // In a real implementation, you would populate this with actual trend data
            });
        } else {
            // Fallback data when MongoDB is not available
            res.json({
                totalLocations: 0,
                avgFootfall: 0,
                topLocations: [],
                trends_data: []
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/public/statistics', async (req, res) => {
    try {
        if (mongoConnected) {
            const stats = await Prediction.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPredictions: { $sum: 1 },
                        averageFootfall: { $avg: "$predictedFootfall" },
                        maxFootfall: { $max: "$predictedFootfall" },
                        minFootfall: { $min: "$predictedFootfall" },
                        locations: { $addToSet: "$location" }
                    }
                }
            ]);
            
            // Get most predicted locations
            const locationStats = await Prediction.aggregate([
                {
                    $group: {
                        _id: "$location",
                        count: { $sum: 1 },
                        averageFootfall: { $avg: "$predictedFootfall" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]);
            
            res.json({
                totalVisitors: stats[0]?.totalPredictions || 0,
                avgMonthlyVisitors: Math.round(stats[0]?.averageFootfall || 0),
                peakMonth: "June", // Placeholder
                peakLocation: locationStats[0]?._id || "Gulmarg"
            });
        } else {
            // Fallback data when MongoDB is not available
            res.json({
                totalVisitors: 0,
                avgMonthlyVisitors: 0,
                peakMonth: "June",
                peakLocation: "Gulmarg"
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/public/featured-locations', async (req, res) => {
    try {
        if (mongoConnected) {
            // Get most predicted locations
            const locationStats = await Prediction.aggregate([
                {
                    $group: {
                        _id: "$location",
                        count: { $sum: 1 },
                        averageFootfall: { $avg: "$predictedFootfall" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            
            // In a real implementation, you would have actual location data with images and descriptions
            const featuredLocations = locationStats.map((location, index) => ({
                name: location._id,
                description: `Popular tourist destination in Kashmir with an average of ${Math.round(location.averageFootfall)} visitors per month.`,
                image: `/images/locations/${location._id.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                avgFootfall: Math.round(location.averageFootfall),
                popular_months: ["May", "June", "July", "August", "September"] // Placeholder
            }));
            
            res.json(featuredLocations);
        } else {
            // Fallback data when MongoDB is not available
            const fallbackLocations = [
                {
                    name: "Gulmarg",
                    description: "Popular tourist destination in Kashmir with beautiful landscapes.",
                    image: "/images/locations/gulmarg.jpg",
                    avgFootfall: 50000,
                    popular_months: ["May", "June", "July", "August", "September"]
                },
                {
                    name: "Pahalgam",
                    description: "Scenic hill station known for its lush green meadows.",
                    image: "/images/locations/pahalgam.jpg",
                    avgFootfall: 45000,
                    popular_months: ["April", "May", "June", "July", "August"]
                },
                {
                    name: "Srinagar",
                    description: "Capital city of Jammu and Kashmir, famous for houseboats and gardens.",
                    image: "/images/locations/srinagar.jpg",
                    avgFootfall: 60000,
                    popular_months: ["March", "April", "May", "June", "September", "October"]
                }
            ];
            res.json(fallbackLocations);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all predictions (history) with filtering
app.get('/api/predictions', async (req, res) => {
    try {
        if (mongoConnected) {
            const { location, year, month, limit = 50 } = req.query;
            let query = {};
            
            if (location) query.location = location;
            if (year) query.year = parseInt(year);
            if (month) query.month = parseInt(month);
            
            const predictions = await Prediction.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));
            res.json(predictions);
        } else {
            // Fallback data when MongoDB is not available
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get prediction statistics
app.get('/api/predictions/stats', async (req, res) => {
    try {
        if (mongoConnected) {
            const stats = await Prediction.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPredictions: { $sum: 1 },
                        averageFootfall: { $avg: "$predictedFootfall" },
                        maxFootfall: { $max: "$predictedFootfall" },
                        minFootfall: { $min: "$predictedFootfall" },
                        locations: { $addToSet: "$location" }
                    }
                }
            ]);
            
            // Get most predicted locations
            const locationStats = await Prediction.aggregate([
                {
                    $group: {
                        _id: "$location",
                        count: { $sum: 1 },
                        averageFootfall: { $avg: "$predictedFootfall" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            
            res.json({
                overall: stats[0] || {},
                topLocations: locationStats
            });
        } else {
            // Fallback data when MongoDB is not available
            res.json({
                overall: {
                    totalPredictions: 0,
                    averageFootfall: 0,
                    maxFootfall: 0,
                    minFootfall: 0,
                    locations: []
                },
                topLocations: []
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get predictions by date range
app.get('/api/predictions/range', async (req, res) => {
    try {
        if (mongoConnected) {
            const { start, end } = req.query;
            
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            const predictions = await Prediction.find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ createdAt: -1 });
            
            res.json(predictions);
        } else {
            // Fallback data when MongoDB is not available
            res.json([]);
        }
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

        // Save to database only if MongoDB is connected
        if (mongoConnected) {
            const prediction = new Prediction(predictionData);
            await prediction.save();
        }

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

// Admin protected endpoints
app.get('/api/admin/predictions', verifyToken, requireAdmin, async (req, res) => {
    try {
        if (mongoConnected) {
            const { location, year, month, limit = 100 } = req.query;
            let query = {};
            
            if (location) query.location = location;
            if (year) query.year = parseInt(year);
            if (month) query.month = parseInt(month);
            
            const predictions = await Prediction.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));
            res.json(predictions);
        } else {
            // Fallback data when MongoDB is not available
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/heatmap-data', verifyToken, requireAdmin, async (req, res) => {
    try {
        if (mongoConnected) {
            // Get all predictions grouped by location and month
            const heatmapData = await Prediction.aggregate([
                {
                    $group: {
                        _id: {
                            location: "$location",
                            year: "$year",
                            month: "$month"
                        },
                        footfall: { $avg: "$predictedFootfall" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ]);
            
            res.json(heatmapData);
        } else {
            // Fallback data when MongoDB is not available
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/prediction-create', verifyToken, requireAdmin, async (req, res) => {
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

        // Save to database only if MongoDB is connected
        if (mongoConnected) {
            const prediction = new Prediction(predictionData);
            await prediction.save();
        }

        res.json(mlResponse.data);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ 
            error: error.response?.data?.error || error.message 
        });
    }
});

app.get('/api/admin/resources/:predictionId', verifyToken, requireAdmin, async (req, res) => {
    try {
        if (mongoConnected) {
            const prediction = await Prediction.findById(req.params.predictionId);
            if (!prediction) {
                return res.status(404).json({ error: 'Prediction not found' });
            }

            // Calculate resources based on footfall
            const footfall = prediction.predictedFootfall;
            const staff = Math.ceil(footfall / 50);
            const vehicles = Math.ceil(footfall / 1000);
            const rooms = Math.ceil((footfall * 0.30) / 2);
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
        } else {
            // Fallback response when MongoDB is not available
            res.status(404).json({ error: 'Prediction not found - MongoDB not available' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/activity-log', verifyToken, requireAdmin, async (req, res) => {
    try {
        if (mongoConnected) {
            const { action, resource, details } = req.body;
            
            const activityLog = new ActivityLog({
                adminUID: req.user.uid,
                action,
                resource,
                details,
                ipAddress: req.ip
            });
            
            await activityLog.save();
            res.json({ message: 'Activity logged successfully' });
        } else {
            // Fallback response when MongoDB is not available
            res.json({ message: 'Activity logged successfully (not persisted - MongoDB not available)' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin user management endpoints
app.post('/api/admin/register', async (req, res) => {
    try {
        if (mongoConnected) {
            const { firebaseUID, email, name } = req.body;
            
            // Check if email domain is authorized
            const allowedDomains = (process.env.ADMIN_EMAIL_DOMAIN || 'tourismkashmir.gov.in').split(',');
            const emailDomain = email.split('@')[1];
            
            if (!allowedDomains.includes(emailDomain)) {
                return res.status(400).json({ error: 'Unauthorized email domain' });
            }
            
            // Create admin user
            const adminUser = new AdminUser({
                firebaseUID,
                email,
                name,
                role: 'admin'
            });
            
            await adminUser.save();
            
            res.json({ message: 'Admin user registered successfully', user: adminUser });
        } else {
            // Fallback response when MongoDB is not available
            res.status(500).json({ error: 'User registration failed - MongoDB not available' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        if (mongoConnected) {
            const { email } = req.body;
            
            // Update last login time
            const adminUser = await AdminUser.findOneAndUpdate(
                { email },
                { lastLogin: new Date() },
                { new: true }
            );
            
            if (!adminUser) {
                return res.status(404).json({ error: 'Admin user not found' });
            }
            
            res.json({ message: 'Login successful', user: adminUser });
        } else {
            // Fallback response when MongoDB is not available
            res.status(404).json({ error: 'Admin user not found - MongoDB not available' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/profile', verifyToken, requireAdmin, async (req, res) => {
    try {
        if (mongoConnected) {
            const adminUser = await AdminUser.findOne({ firebaseUID: req.user.uid });
            
            if (!adminUser) {
                return res.status(404).json({ error: 'Admin user not found' });
            }
            
            res.json(adminUser);
        } else {
            // Fallback response when MongoDB is not available
            res.status(404).json({ error: 'Admin user not found - MongoDB not available' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/all-admins', verifyToken, requireAdmin, async (req, res) => {
    try {
        if (mongoConnected) {
            const admins = await AdminUser.find({}, { firebaseUID: 0 }); // Exclude firebaseUID for security
            res.json(admins);
        } else {
            // Fallback response when MongoDB is not available
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/:adminId', verifyToken, requireAdmin, async (req, res) => {
    try {
        if (mongoConnected) {
            const adminUser = await AdminUser.findById(req.params.adminId);
            
            if (!adminUser) {
                return res.status(404).json({ error: 'Admin user not found' });
            }
            
            // Prevent deletion of super admin by regular admin
            if (adminUser.role === 'super_admin' && req.user.role !== 'super_admin') {
                return res.status(403).json({ error: 'Insufficient permissions to delete super admin' });
            }
            
            await AdminUser.findByIdAndDelete(req.params.adminId);
            res.json({ message: 'Admin user deleted successfully' });
        } else {
            // Fallback response when MongoDB is not available
            res.status(404).json({ error: 'Admin user not found - MongoDB not available' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ ML service at ${ML_API_URL}`);
    if (!mongoConnected) {
        console.log('⚠ MongoDB not connected - some features will be limited');
    }
});