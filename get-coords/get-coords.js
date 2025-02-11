const fs = require('fs');
const { parse } = require('csv-parse/sync');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getCoordinates(address) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_API_KEY}`
      );
  
      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
      } else {
        // Add more detailed error information
        throw new Error(`No results found. Status: ${response.data.status}, Message: ${response.data.error_message || 'No specific error message'}`);
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error(`API Error - Status: ${error.response.status}`);
        console.error(`Error Data:`, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from Google API');
        console.error(error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error setting up the request:', error.message);
      }
      throw error; // Rethrow to be caught by the calling function
    }
  }

// Define retail locations (liquor stores, wine shops)
const retailKeywords = ['wine', 'liquor', 'spirits', 'vines'];

function determineLocationType(name) {
  const lowerName = name.toLowerCase();
  return retailKeywords.some(keyword => lowerName.includes(keyword)) 
    ? 'retail' 
    : 'on-site';
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function processCSV() {
    const locations = [];
    const fileContent = fs.readFileSync('/Users/jzimms/Development/tools/assets/veda-accounts.csv', 'utf-8');
    
    // Parse the CSV content synchronously
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
    
    // Process each row
    for (const row of records) {
        // Format the data from CSV
        const location = {
            name: row['Account Name'],
            fullAddress: row['Address']
        };
        
        // Split address into components (assuming format: street, city, state zip)
        const addressParts = location.fullAddress.match(/^(.*?),\s*(.*?),\s*(\w+)\s*(\d+)$/);
        console.log(addressParts);
            if (addressParts) {
                const [_, address, city, state, zip] = addressParts;
                const formattedAddress = `${address}, ${city}, ${state} ${zip}`;
                
                // Add delay between API calls
                await delay(200);
                
                try {
                    await delay(200);
                    const coordinates = await getCoordinates(formattedAddress);
                    if (coordinates) {
                        locations.push({
                            name: location.name,
                            address: formattedAddress,
                            type: determineLocationType(location.name),
                            coordinates: coordinates
                        });
                        console.log(`Processed: ${location.name}`);
                    } else {
                        console.error(`Failed to get coordinates for: ${location.name}`);
                        console.error(`Address attempted: ${formattedAddress}`);
                        console.error(`Google API Response: No valid coordinates returned`);
                    }
                } catch (error) {
                    console.error(`Error processing location: ${location.name}`);
                    console.error(`Address attempted: ${formattedAddress}`);
                    console.error('API Error Details:', {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data
                    });
                    continue;
                }
    }

    // Write to JSON file
    fs.writeFileSync(
        './assets/locations.json',
        JSON.stringify({ locations }, null, 2)
    );
    console.log(`Processed ${locations.length} locations`);
}}

processCSV().catch(console.error);