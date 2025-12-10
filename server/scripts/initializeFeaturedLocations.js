const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kashmir_tourism', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ Connected to MongoDB');
    initializeFeaturedLocations();
}).catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
});

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

// Default featured locations data
const defaultFeaturedLocations = [
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

async function initializeFeaturedLocations() {
    try {
        // Clear existing data
        await FeaturedLocation.deleteMany({});
        console.log('✓ Cleared existing featured locations');
        
        // Insert new data
        await FeaturedLocation.insertMany(defaultFeaturedLocations);
        console.log('✓ Inserted default featured locations');
        
        // Verify data
        const count = await FeaturedLocation.countDocuments();
        console.log(`✓ Total featured locations in database: ${count}`);
        
        console.log('✅ Featured locations initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error initializing featured locations:', error);
        process.exit(1);
    }
}