import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Discover city name for service area validation
 *
 * Usage:
 * npx ts-node src/scripts/discover-area.ts 49.1913 -122.8490
 * npx ts-node src/scripts/discover-area.ts "1234 Main St, Surrey, BC"
 */

async function discoverByCoordinates(lat: number, lng: number) {
  console.log(`\n🔍 Checking coordinates: ${lat}, ${lng}`);
  console.log('='.repeat(60));

  const params = {
    latlng: `${lat},${lng}`,
    key: GOOGLE_MAPS_API_KEY
  };

  const response = await axios.get(GOOGLE_GEOCODING_API_URL, { params });

  if (response.data.status !== 'OK') {
    console.error(`❌ Error: ${response.data.status}`);
    return;
  }

  const result = response.data.results[0];

  console.log(`\n📍 Address: ${result.formatted_address}`);
  console.log('\n📋 City Names to Add:\n');

  const cityNames = new Set<string>();

  result.address_components.forEach((component: any) => {
    if (component.types.includes('locality')) {
      cityNames.add(component.long_name);
      console.log(`   ✅ "${component.long_name}" (locality)`);
    }
    if (component.types.includes('administrative_area_level_3')) {
      cityNames.add(component.long_name);
      console.log(`   ✅ "${component.long_name}" (administrative_area_level_3)`);
    }
    if (component.types.includes('sublocality')) {
      cityNames.add(component.long_name);
      console.log(`   ✅ "${component.long_name}" (sublocality)`);
    }
  });

  if (cityNames.size === 0) {
    console.log('   ⚠️  No city names found');
  }

  console.log('\n💡 Add these to ALLOWED_AREAS in distance.service.ts:');
  console.log('\nprivate static readonly ALLOWED_AREAS = [');
  cityNames.forEach(name => {
    console.log(`  '${name}',`);
  });
  console.log('];\n');
}

async function discoverByAddress(address: string) {
  console.log(`\n🔍 Checking address: ${address}`);
  console.log('='.repeat(60));

  // First geocode the address to get coordinates
  const geocodeParams = {
    address: address,
    key: GOOGLE_MAPS_API_KEY
  };

  const geocodeResponse = await axios.get(GOOGLE_GEOCODING_API_URL, { params: geocodeParams });

  if (geocodeResponse.data.status !== 'OK') {
    console.error(`❌ Error: ${geocodeResponse.data.status}`);
    return;
  }

  const location = geocodeResponse.data.results[0].geometry.location;
  console.log(`📌 Coordinates: ${location.lat}, ${location.lng}`);

  // Then reverse geocode to get detailed info
  await discoverByCoordinates(location.lat, location.lng);
}

async function main() {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('\n❌ GOOGLE_MAPS_API_KEY not found in .env file\n');
    process.exit(1);
  }

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\n📖 Usage:');
    console.log('   By coordinates: npx ts-node src/scripts/discover-area.ts 49.1913 -122.8490');
    console.log('   By address:     npx ts-node src/scripts/discover-area.ts "123 Main St, Surrey, BC"\n');
    process.exit(1);
  }

  // Check if first arg is a number (coordinates) or string (address)
  if (!isNaN(parseFloat(args[0])) && args.length >= 2) {
    const lat = parseFloat(args[0]);
    const lng = parseFloat(args[1]);
    await discoverByCoordinates(lat, lng);
  } else {
    const address = args.join(' ');
    await discoverByAddress(address);
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
