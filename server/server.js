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

// Featured Locations Schema
const FeaturedLocationSchema = new mongoose.Schema({
    id: Number,
    name: String,
    description: String,
    avgFootfall: String,
    image: String,
    bestTime: String,
    attractions: String,
    predictedCrowd: String,
    recommendedVisitDuration: String,
    altitude: String,
    temperature: String,
    significance: String
});

const FeaturedLocation = mongoose.model('FeaturedLocation', FeaturedLocationSchema);

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

// Featured Locations Endpoint
app.get('/api/public/featured-locations', async (req, res) => {
    try {
        if (mongoConnected) {
            const featuredLocations = await FeaturedLocation.find({});
            if (featuredLocations.length > 0) {
                res.json(featuredLocations);
            } else {
                // Return fallback data if no locations in database
                res.json(getDefaultFeaturedLocations());
            }
        } else {
            // Return fallback data when MongoDB is not available
            res.json(getDefaultFeaturedLocations());
        }
    } catch (error) {
        console.error('Error fetching featured locations:', error);
        // Return fallback data on error
        res.json(getDefaultFeaturedLocations());
    }
});

// Helper function to get default featured locations
function getDefaultFeaturedLocations() {
    return [
        {
            id: 1,
            name: "Gulmarg",
            description:
                "Gulmarg, meaning 'Meadow of Flowers,' is a year-round destination famous for skiing in winter and golfing in summer. Home to the world's highest golf course and Asia's highest Gondola ride, it offers breathtaking views of the Himalayas and is a UNESCO Biosphere Reserve. The town is located at an altitude of 2,730 meters and receives heavy snowfall during winters, making it a prime destination for skiing enthusiasts.",
            avgFootfall: "120,000",
            image: "/images/GULMARG.png",
            bestTime:
                "December - March (Winter Sports), May - October (Trekking)",
            attractions:
                "Gondola Ride Phase 1 & 2, Skiing, Golf Course, Strawberry Valley, Alpather Lake",
            predictedCrowd: "High",
            recommendedVisitDuration: "2-3 days",
            altitude: "2,730m (9,000 ft)",
            temperature: "-5°C to 15°C",
            significance:
                "UNESCO Biosphere Reserve, World's Highest Golf Course, Winter Sports Hub",
        },
        {
            id: 2,
            name: "Pahalgam",
            description:
                "Known as the 'Valley of Flowers,' Pahalgam is the gateway to the Amarnath Yatra and offers stunning landscapes of lush meadows, dense forests, and crystal-clear rivers. Famous for its trout fishing, pony rides, and as a base for trekking to Kolahoi Glacier. The town is nestled at an altitude of 2,133 meters and serves as a base for several high-altitude treks.",
            avgFootfall: "95,000",
            image: "/images/PAHALGAM.png",
            bestTime: "April - October",
            attractions:
                "Betaab Valley, Baisaran, Aru Valley, Chandanwari, Sheshnag Lake, Kolahoi Glacier",
            predictedCrowd: "Medium-High",
            recommendedVisitDuration: "3-4 days",
            altitude: "2,133m (7,000 ft)",
            temperature: "2°C to 22°C",
            significance:
                "Gateway to Amarnath Yatra, Trout Fishing Capital, Trekking Base Camp",
        },
        {
            id: 3,
            name: "Sonamarg",
            description:
                "Translating to 'Meadow of Gold,' Sonamarg is a pristine valley surrounded by snow-clad mountains, glaciers, and alpine lakes. Known for its breathtaking views and adventure activities like trekking, fishing, and camping. Offers access to Thajiwas Glacier and Vishansar Lake. Located at an altitude of 2,740 meters, it's known as the 'Gateway to Ladakh'.",
            avgFootfall: "75,000",
            image: "/images/SONAMARG.png",
            bestTime: "May - September",
            attractions:
                "Thajiwas Glacier, Vishansar Lake, Khardung La Pass, Baltal, Sindh River",
            predictedCrowd: "Medium",
            recommendedVisitDuration: "2-3 days",
            altitude: "2,740m (9,000 ft)",
            temperature: "1°C to 18°C",
            significance:
                "Gateway to Ladakh, Base for Kashmir Great Lakes Trek, Scenic Beauty Spot",
        },
        {
            id: 4,
            name: "Yousmarg",
            description:
                "Often referred to as the 'Meadow of Saints,' Yousmarg is a picturesque hill station located at an altitude of 2,400 meters. Known for its vast green meadows, pine forests, and stunning views of the Pir Panjal range. It's an excellent destination for skiing in winter and trekking in summer.",
            avgFootfall: "45,000",
            image: "/images/YOUSMARG.png",
            bestTime:
                "December - March (Winter Sports), April - October (Trekking)",
            attractions:
                "Dachigam National Park, Zero Point, Khilanmarg, Dood Ganga",
            predictedCrowd: "Medium",
            recommendedVisitDuration: "2-3 days",
            altitude: "2,400m (7,874 ft)",
            temperature: "-2°C to 16°C",
            significance:
                "Winter Sports Destination, Scenic Hill Station, Wildlife Spot",
        },
        {
            id: 5,
            name: "Doodpathri",
            description:
                "Known as the 'Milk Sea,' Doodpathri is famous for its white-colored streams that flow down the mountains, creating a milky appearance. Located at an altitude of 2,400 meters, it offers mesmerizing views of the Himalayas and is relatively untouched by commercial tourism.",
            avgFootfall: "25,000",
            image: "/images/DOODPATHRI.png",
            bestTime: "May - October",
            attractions:
                "White Streams, Alpine Meadows, Pine Forests, Mountain Views",
            predictedCrowd: "Low",
            recommendedVisitDuration: "1-2 days",
            altitude: "2,400m (7,874 ft)",
            temperature: "3°C to 17°C",
            significance:
                "Unique Natural Phenomenon, Offbeat Destination, Serene Location",
        },
        {
            id: 6,
            name: "Aharbal",
            description:
                "Known as the 'Niagara of Kashmir,' Aharbal is famous for its spectacular waterfall that plunges from a height of 25 meters. Located at an altitude of 2,400 meters, it's surrounded by dense forests and offers a refreshing escape from city life.",
            avgFootfall: "30,000",
            image: "/images/AHARBAL.png",
            bestTime: "April - November",
            attractions:
                "Aharbal Waterfall, Forest Walks, Picnic Spots, Nature Photography",
            predictedCrowd: "Low-Medium",
            recommendedVisitDuration: "1 day",
            altitude: "2,400m (7,874 ft)",
            temperature: "4°C to 19°C",
            significance: "Natural Waterfall, Scenic Beauty, Family Destination",
        },
        {
            id: 7,
            name: "Kokernag",
            description:
                "Known for its trout breeding center, Kokernag is a serene destination located at an altitude of 1,700 meters. Famous for its trout fish and surrounded by apple orchards and pine forests, it offers a peaceful retreat for nature lovers.",
            avgFootfall: "20,000",
            image: "/images/KOKERNAG.png",
            bestTime: "April - October",
            attractions:
                "Trout Breeding Center, Apple Orchards, Pine Forests, River Views",
            predictedCrowd: "Low",
            recommendedVisitDuration: "1 day",
            altitude: "1,700m (5,577 ft)",
            temperature: "5°C to 20°C",
            significance:
                "Trout Fish Breeding, Peaceful Retreat, Agricultural Spot",
        },
        {
            id: 8,
            name: "Lolab",
            description:
                "A beautiful valley located in the Kupwara district, Lolab is known for its saffron cultivation and stunning landscapes. Surrounded by the Himalayan peaks, it offers panoramic views and is home to traditional Kashmiri villages.",
            avgFootfall: "15,000",
            image: "/images/LOLAB.png",
            bestTime: "April - October",
            attractions:
                "Saffron Fields, Traditional Villages, Mountain Views, Cultural Experience",
            predictedCrowd: "Low",
            recommendedVisitDuration: "1-2 days",
            altitude: "1,800m (5,905 ft)",
            temperature: "6°C to 21°C",
            significance:
                "Saffron Cultivation, Cultural Heritage, Offbeat Valley",
        },
        {
            id: 9,
            name: "Manasbal",
            description:
                "Known as the 'Gem of Kashmir,' Manasbal Lake is one of the deepest lakes in India. Surrounded by hills and famous for its lotus flowers, it offers boating facilities and stunning reflections of the surrounding mountains.",
            avgFootfall: "35,000",
            image: "/images/MANASBAL.png",
            bestTime: "March - November",
            attractions:
                "Manasbal Lake, Boating, Lotus Flowers, Mountain Reflections",
            predictedCrowd: "Low-Medium",
            recommendedVisitDuration: "1 day",
            altitude: "1,500m (4,921 ft)",
            temperature: "7°C to 23°C",
            significance:
                "Deepst Lake in India, Scenic Beauty, Boating Destination",
        },
        {
            id: 10,
            name: "Gurez",
            description:
                "Located in the remote northernmost region of Kashmir, Gurez is known for its breathtaking landscapes and the Harmukh mountain range. Often called 'Mini Switzerland of Kashmir,' it offers pristine beauty and is relatively untouched by tourism.",
            avgFootfall: "10,000",
            image: "/images/GUREZ.png",
            bestTime: "May - October",
            attractions:
                "Harmukh Range, Alpine Meadows, Dudhganga River, Traditional Culture",
            predictedCrowd: "Very Low",
            recommendedVisitDuration: "2-3 days",
            altitude: "2,400m (7,874 ft)",
            temperature: "2°C to 15°C",
            significance: "Remote Beauty, Mini Switzerland, Cultural Heritage",
        }
    ];
}

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