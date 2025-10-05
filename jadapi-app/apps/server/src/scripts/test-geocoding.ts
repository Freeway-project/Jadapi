import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Test script to discover city names for service area validation
 * Usage: ts-node src/scripts/test-geocoding.ts
 */

interface TestLocation {
  name: string;
  lat: number;
  lng: number;
}

// Add test coordinates from your service area
const testLocations: TestLocation[] = [
  // Surrey locations
  { name: 'Surrey Central', lat: 49.1913, lng: -122.8490 },
  { name: 'Surrey Guildford', lat: 49.1843, lng: -122.8027 },
  { name: 'Surrey Newton', lat: 49.1129, lng: -122.8473 },

  // Langley locations
  { name: 'Langley City', lat: 49.1044, lng: -122.6603 },
  { name: 'Langley Township', lat: 49.0847, lng: -122.6081 },
  { name: 'Willoughby Langley', lat: 49.0591, lng: -122.6236 },

  // Vancouver (for comparison)
  { name: 'Vancouver Downtown', lat: 49.2827, lng: -123.1207 },

  // Burnaby
  { name: 'Burnaby Metrotown', lat: 49.2262, lng: -122.9991 },
];

async function reverseGeocode(coords: { lat: number; lng: number }) {
  const params = {
    latlng: `${coords.lat},${coords.lng}`,
    key: GOOGLE_MAPS_API_KEY
  };

  const response = await axios.get(GOOGLE_GEOCODING_API_URL, { params });

  if (response.data.status !== 'OK' || !response.data.results.length) {
    throw new Error('Unable to determine location');
  }

  return response.data.results[0];
}

async function analyzeLocation(location: TestLocation) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📍 Testing: ${location.name}`);
  console.log(`   Coordinates: ${location.lat}, ${location.lng}`);
  console.log(`${'='.repeat(60)}`);

  try {
    const result = await reverseGeocode({ lat: location.lat, lng: location.lng });

    console.log(`\n✅ Formatted Address:`);
    console.log(`   ${result.formatted_address}`);

    console.log(`\n📋 Address Components:`);
    result.address_components.forEach((component: any) => {
      const types = component.types.join(', ');
      console.log(`   • ${component.long_name} (${component.short_name})`);
      console.log(`     Types: ${types}`);
    });

    // Extract useful info
    const locality = result.address_components.find((c: any) =>
      c.types.includes('locality')
    );
    const adminLevel3 = result.address_components.find((c: any) =>
      c.types.includes('administrative_area_level_3')
    );
    const adminLevel2 = result.address_components.find((c: any) =>
      c.types.includes('administrative_area_level_2')
    );
    const province = result.address_components.find((c: any) =>
      c.types.includes('administrative_area_level_1')
    );

    console.log(`\n🎯 Key Identifiers:`);
    console.log(`   Locality: ${locality?.long_name || 'N/A'}`);
    console.log(`   Admin Level 3: ${adminLevel3?.long_name || 'N/A'}`);
    console.log(`   Admin Level 2: ${adminLevel2?.long_name || 'N/A'}`);
    console.log(`   Province: ${province?.short_name || 'N/A'}`);

  } catch (error) {
    console.error(`❌ Error:`, error);
  }
}

async function main() {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('\n🔍 Service Area Discovery Tool');
  console.log('================================\n');
  console.log('This script will analyze coordinates to find city names');
  console.log('Use these names in the ALLOWED_AREAS array\n');

  for (const location of testLocations) {
    await analyzeLocation(location);
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
  }

  console.log('\n\n📝 Summary:');
  console.log('==========');
  console.log('Based on the results above, update ALLOWED_AREAS in distance.service.ts');
  console.log('Look for "locality" or "administrative_area_level_3" values');
  console.log('\nExample:');
  console.log('private static readonly ALLOWED_AREAS = [');
  console.log('  "Surrey",');
  console.log('  "Langley",');
  console.log('  "Langley City",');
  console.log('  // Add more based on results above');
  console.log('];\n');
}

main().catch(console.error);
