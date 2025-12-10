const axios = require('axios');

async function testFeaturedLocationsEndpoint() {
    try {
        console.log('Testing /api/public/featured-locations endpoint...');
        
        const response = await axios.get('http://localhost:3001/api/public/featured-locations');
        
        console.log('✅ API Response Status:', response.status);
        console.log('✅ Number of locations returned:', response.data.length);
        
        if (response.data.length > 0) {
            console.log('✅ Sample location data:');
            console.log('  Name:', response.data[0].name);
            console.log('  Image:', response.data[0].image);
            console.log('  Description preview:', response.data[0].description.substring(0, 100) + '...');
        }
        
        console.log('✅ Test completed successfully');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Data:', error.response.data);
        }
    }
}

testFeaturedLocationsEndpoint();