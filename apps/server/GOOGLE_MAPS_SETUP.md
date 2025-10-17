# Google Maps API Setup Guide

This module uses Google Maps Distance Matrix API to calculate real driving distances and times.

## Setup Steps

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable **Distance Matrix API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Distance Matrix API"
   - Click "Enable"
4. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

### 2. Configure Environment Variable

Add to your `.env` file:

```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Restrict API Key (Production)

For security, restrict your API key:

1. In Google Cloud Console > Credentials
2. Click on your API key
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Distance Matrix API"
4. Under "Application restrictions":
   - Choose "IP addresses"
   - Add your server IPs

## How It Works

### Distance Calculation Flow

```
1. API call to /api/pricing/estimate
2. DistanceService.calculate() checks for GOOGLE_MAPS_API_KEY
3. If key exists:
   → Call Google Maps Distance Matrix API
   → Get real driving distance and duration
   → Return { distanceKm, durationMinutes, method: 'google' }
4. If no key or API fails:
   → Fallback to Haversine formula
   → Return { distanceKm, durationMinutes, method: 'haversine' }
```

### API Request

```typescript
GET https://maps.googleapis.com/maps/api/distancematrix/json
  ?origins=49.2827,-123.1207
  &destinations=49.2488,-123.0061
  &mode=driving
  &key=YOUR_API_KEY
```

### API Response

```json
{
  "rows": [{
    "elements": [{
      "distance": { "value": 7200, "text": "7.2 km" },
      "duration": { "value": 840, "text": "14 mins" },
      "status": "OK"
    }]
  }],
  "status": "OK"
}
```

## Response Format

The distance result includes a `method` field:

```json
{
  "distanceKm": 7.2,
  "durationMinutes": 14,
  "method": "google"  // or "haversine"
}
```

- **`google`**: Real driving distance via Google Maps API
- **`haversine`**: Straight-line distance (fallback)

## Cost Management

### Free Tier
- $200 free credit per month
- Distance Matrix: $5 per 1000 requests
- ~40,000 free requests/month

### Optimize Costs

1. **Cache Results**: Store recent calculations
2. **Batch Requests**: Combine multiple distance checks
3. **Use Haversine**: For quick estimates, disable API
4. **Set Budget Alerts**: In Google Cloud Console

### Example Budget Check

```typescript
// Disable Google Maps for development
// Comment out in .env:
# GOOGLE_MAPS_API_KEY=...

// System automatically falls back to Haversine
```

## Testing

### With API Key
```bash
curl -X POST http://localhost:4000/api/pricing/distance \
  -H "Content-Type: application/json" \
  -d '{
    "pickup": {"lat": 49.2827, "lng": -123.1207},
    "dropoff": {"lat": 49.2488, "lng": -123.0061}
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "distanceKm": 7.2,
    "durationMinutes": 14,
    "method": "google"
  }
}
```

### Without API Key (Fallback)
Remove `GOOGLE_MAPS_API_KEY` from `.env`

Response:
```json
{
  "success": true,
  "data": {
    "distanceKm": 6.8,
    "durationMinutes": 14,
    "method": "haversine"
  }
}
```

## Error Handling

The service gracefully handles errors:

1. **API Key Missing**: Falls back to Haversine
2. **API Request Fails**: Falls back to Haversine
3. **No Route Found**: Throws error with message
4. **Invalid Coordinates**: Returns 400 error

All errors are logged for monitoring:
```
console.warn('Google Maps API failed, falling back to Haversine:', error)
```

## Alternative: Mapbox

If you prefer Mapbox over Google Maps:

```typescript
// Update distance.service.ts
private static readonly MAPBOX_API_URL =
  'https://api.mapbox.com/directions/v5/mapbox/driving';

// Add to env.ts
MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN ?? ""
```

## Production Checklist

- [ ] API key added to `.env`
- [ ] API key restricted to Distance Matrix API only
- [ ] IP restrictions configured
- [ ] Budget alerts set in Google Cloud
- [ ] Error logging/monitoring configured
- [ ] Cache strategy implemented (optional)
- [ ] Tested with real coordinates

## Monitoring

Track API usage in Google Cloud Console:
- APIs & Services > Dashboard
- View requests, errors, latency
- Set up alerts for quota limits

## Support

- [Distance Matrix API Docs](https://developers.google.com/maps/documentation/distance-matrix)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
