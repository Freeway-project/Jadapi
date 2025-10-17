# Service Area Discovery Guide

How to determine which city names to use in `ALLOWED_AREAS` for Google Maps validation.

## Quick Method: Use the Test Script

Run the geocoding test script to discover city names:

```bash
cd apps/server
npx ts-node src/scripts/test-geocoding.ts
```

This will analyze your service area coordinates and show you exactly what Google Maps returns for each location.

## Manual Method: Google Maps Geocoding API

### 1. Get Coordinates from Your Service Centers

From `app.config.ts`:
```typescript
{ "code": "SUR", "label": "Surrey", "lat": 49.1913, "lng": -122.8490 }
{ "code": "LAN", "label": "Langley", "lat": 49.1044, "lng": -122.6603 }
```

### 2. Test with Google Geocoding API

```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?latlng=49.1913,-122.8490&key=YOUR_API_KEY"
```

### 3. Look for City Names in Response

Check these fields in the response:
- `locality` - City name (e.g., "Surrey")
- `administrative_area_level_3` - Township/District (e.g., "Langley Township")
- `administrative_area_level_2` - Metro area (e.g., "Metro Vancouver")

Example response:
```json
{
  "address_components": [
    {
      "long_name": "Surrey",
      "short_name": "Surrey",
      "types": ["locality", "political"]
    },
    {
      "long_name": "British Columbia",
      "short_name": "BC",
      "types": ["administrative_area_level_1"]
    }
  ]
}
```

**Use the `long_name` from `locality` type** → Add "Surrey" to ALLOWED_AREAS

## Understanding the Test Script Output

When you run `test-geocoding.ts`, you'll see:

```
📍 Testing: Surrey Central
   Coordinates: 49.1913, -122.8490
============================================================

✅ Formatted Address:
   Surrey, BC V3T, Canada

📋 Address Components:
   • Surrey (Surrey)
     Types: locality, political
   • Metro Vancouver (Metro Vancouver)
     Types: administrative_area_level_2, political
   • British Columbia (BC)
     Types: administrative_area_level_1, political

🎯 Key Identifiers:
   Locality: Surrey          ← ADD THIS TO ALLOWED_AREAS
   Admin Level 3: N/A
   Admin Level 2: Metro Vancouver
   Province: BC
```

## Common BC Cities Format

Based on Google Maps responses:

| Location | Google Returns | Add to ALLOWED_AREAS |
|----------|---------------|---------------------|
| Surrey | "Surrey" | "Surrey" |
| Langley City | "Langley" | "Langley", "Langley City" |
| Langley Township | "Langley" | "Langley", "Langley Township" |
| Burnaby | "Burnaby" | "Burnaby" |
| Richmond | "Richmond" | "Richmond" |
| Coquitlam | "Coquitlam" | "Coquitlam" |
| New Westminster | "New Westminster" | "New Westminster" |

## Update ALLOWED_AREAS

In `distance.service.ts`:

```typescript
private static readonly ALLOWED_AREAS = [
  'Surrey',
  'Langley',
  'Langley City',
  'Langley Township',
  'Burnaby',
  // Add more as needed
];
```

## Testing Tips

### 1. Test Edge Cases

Test coordinates at the boundaries of your service area:
- City borders
- Suburban areas
- Rural areas within township

### 2. Handle Variations

Google may return different formats:
- "Surrey" vs "Surrey, BC"
- "Langley" vs "Langley City" vs "Langley Township"

The current code handles this with `includes()`:
```typescript
cityName.includes(allowedArea.toLowerCase()) ||
allowedArea.toLowerCase().includes(cityName)
```

### 3. Verify with Real Addresses

Test with actual customer addresses:

```bash
# Get coordinates from address
curl "https://maps.googleapis.com/maps/api/geocode/json?address=123+Main+St,+Surrey,+BC&key=YOUR_API_KEY"

# Then reverse geocode to verify
curl "https://maps.googleapis.com/maps/api/geocode/json?latlng=LAT,LNG&key=YOUR_API_KEY"
```

## Alternative: Use Config-Based Areas

Instead of hardcoding, use your config:

```typescript
// In app.config.ts
"serviceArea": {
  "centers": [
    { "code": "SUR", "label": "Surrey", ... },
    { "code": "LAN", "label": "Langley", ... }
  ],
  "allowedCities": ["Surrey", "Langley", "Langley City", "Langley Township"]
}
```

Then in `distance.service.ts`:
```typescript
static async getServiceAreaConfig() {
  const config = await ConfigService.getActiveConfig();
  return config.payload.serviceArea.allowedCities;
}
```

## Debugging Failed Validations

If valid locations are being rejected:

1. **Run the test script** with the exact coordinates
2. **Check the console logs** in your API
3. **Compare returned city name** with ALLOWED_AREAS
4. **Add variations** if needed

Example debug output:
```typescript
console.log('Received city:', cityName);
console.log('Allowed areas:', this.ALLOWED_AREAS);
console.log('Match found:', this.ALLOWED_AREAS.some(area =>
  cityName.includes(area.toLowerCase())
));
```

## Production Recommendations

### Option 1: Strict City Matching (Current)
- Most accurate
- Prevents deliveries outside service area
- May reject valid locations due to naming differences

### Option 2: Radius-Based (Backup)
- Less accurate but more forgiving
- Use simple distance check from service centers
- Fallback if geocoding fails

### Option 3: Hybrid Approach
```typescript
// Try geocoding first
const geocodeValid = await this.validateWithPlacesAPI(coords);

// Fallback to radius if geocoding fails or uncertain
if (!geocodeValid.isValid && geocodeValid.area === 'Unknown') {
  return this.isWithinServiceArea(coords, centers);
}
```

## Cost Consideration

Each validation uses 2 API calls (pickup + dropoff):
- Geocoding API: $5 per 1000 requests
- Places API: $17 per 1000 requests

**Recommendation:** Cache results by postal code or grid area to reduce API calls.

## Next Steps

1. Run `npm run test:geocoding` (add script to package.json)
2. Review output and note city names
3. Update `ALLOWED_AREAS` array
4. Test with real coordinates from your service area
5. Monitor validation failures in production logs
