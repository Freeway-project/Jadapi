# Pricing & Distance Calculation Module

Production-ready module for distance calculation and dynamic fare estimation with configurable pricing models.

## Features

- **Distance Calculation**: Haversine formula for accurate geographic distance
- **Dynamic Fare Estimation**: Configurable multi-factor pricing
- **Service Area Management**: Geographic coverage with soft boundaries
- **Distance-Based Pricing Bands**: Progressive pricing tiers
- **Package Size Multipliers**: Variable pricing by package size
- **Time-Based Pricing**: Duration-dependent fare components
- **Edge Surcharges**: Additional fees for service area boundaries
- **Tax Support**: Configurable tax rates
- **Production Ready**: Full validation, error handling, and type safety

## Architecture

```
server/src/
├── types/
│   └── pricing.types.ts         # TypeScript interfaces and types
├── services/
│   ├── distance.service.ts      # Distance calculation (Haversine)
│   ├── fare.service.ts          # Fare estimation logic
│   └── config.service.ts        # Configuration management
├── controllers/
│   └── pricing.controller.ts    # API request handlers
├── routes/
│   └── pricing.routes.ts        # Route definitions
└── config/
    └── app.config.ts            # Pricing configuration
```

## Configuration

Edit `/server/src/config/app.config.ts`:

```typescript
{
  "payload": {
    "serviceArea": {
      "centers": [
        {
          "code": "VAN",
          "label": "Vancouver",
          "lat": 49.2827,
          "lng": -123.1207,
          "soft_radius_km": 35,
          "active": true
        }
      ],
      "allow_outside": true,
      "edge_surcharge_cents": 200
    },
    "rateCard": {
      "currency": "CAD",
      "base_cents": 299,
      "per_km_cents": 120,
      "per_min_cents": 30,
      "min_fare_cents": 699,
      "size_multiplier": {
        "XS": 1.00,
        "S": 1.10,
        "M": 1.25,
        "L": 1.50
      }
    },
    "bands": [
      { "km_max": 5, "multiplier": 1.00, "label": "≤5 km" },
      { "km_max": 10, "multiplier": 1.10, "label": "≤10 km" },
      { "km_max": 999, "multiplier": 1.55, "label": ">20 km" }
    ],
    "tax": {
      "enabled": false,
      "rate": 0
    }
  }
}
```

## API Endpoints

### 1. Fare Estimate

**POST** `/api/pricing/estimate`

Get complete fare breakdown for a delivery route.

```json
{
  "pickup": { "lat": 49.2827, "lng": -123.1207 },
  "dropoff": { "lat": 49.2488, "lng": -123.0061 },
  "packageSize": "M"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fare": {
      "baseFare": 299,
      "distanceFare": 840,
      "timeFare": 90,
      "bandMultiplier": 1.1,
      "bandLabel": "≤10 km",
      "sizeMultiplier": 1.25,
      "edgeSurcharge": 0,
      "subtotal": 1536,
      "tax": 0,
      "total": 1536,
      "currency": "CAD",
      "distanceKm": 7.2,
      "durationMinutes": 14
    },
    "distance": {
      "distanceKm": 7.2,
      "durationMinutes": 14,
      "method": "haversine"
    },
    "serviceArea": {
      "isOutsideServiceArea": false,
      "nearestCenter": {
        "code": "VAN",
        "label": "Vancouver"
      }
    }
  }
}
```

### 2. Fare Range

**POST** `/api/pricing/fare-range`

Get min/max fare estimate across all package sizes.

```json
{
  "pickup": { "lat": 49.2827, "lng": -123.1207 },
  "dropoff": { "lat": 49.2488, "lng": -123.0061 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "min": "CAD $12.29",
    "max": "CAD $18.43",
    "currency": "CAD"
  }
}
```

### 3. Distance Calculation

**POST** `/api/pricing/distance`

Calculate distance and estimated travel time.

```json
{
  "pickup": { "lat": 49.2827, "lng": -123.1207 },
  "dropoff": { "lat": 49.2488, "lng": -123.0061 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distanceKm": 7.2,
    "durationMinutes": 14,
    "method": "haversine"
  }
}
```

### 4. Validate Location

**POST** `/api/pricing/validate-location`

Check if coordinates are within service area.

```json
{
  "lat": 49.2827,
  "lng": -123.1207
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isWithinServiceArea": true,
    "nearestCenter": {
      "code": "VAN",
      "label": "Vancouver",
      "lat": 49.2827,
      "lng": -123.1207
    },
    "distanceToNearestCenter": 0
  }
}
```

### 5. Get Pricing Config

**GET** `/api/pricing/config`

Retrieve current pricing configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "rateCard": { ... },
    "bands": [ ... ],
    "serviceArea": { ... },
    "tax": { ... },
    "version": 1
  }
}
```

### 6. Get Service Areas

**GET** `/api/pricing/service-areas`

Get all active service centers and coverage.

### 7. Get Rate Card

**GET** `/api/pricing/rate-card`

Get current pricing rates (converted to dollars).

## Fare Calculation Formula

```
Base Subtotal = base_cents + (distance_km × per_km_cents) + (duration_min × per_min_cents)

After Band Multiplier = Base Subtotal × band_multiplier

After Size Multiplier = After Band Multiplier × size_multiplier

Subtotal = After Size Multiplier + edge_surcharge_cents

Final Subtotal = max(Subtotal, min_fare_cents)

Tax = Final Subtotal × tax_rate (if enabled)

Total = Final Subtotal + Tax
```

## Distance Bands

Progressive pricing based on delivery distance:

| Distance | Multiplier | Label |
|----------|-----------|--------|
| ≤5 km    | 1.00      | ≤5 km  |
| ≤10 km   | 1.10      | ≤10 km |
| ≤15 km   | 1.20      | ≤15 km |
| ≤20 km   | 1.35      | ≤20 km |
| >20 km   | 1.55      | >20 km |

## Package Size Multipliers

| Size | Multiplier | Description |
|------|-----------|-------------|
| XS   | 1.00      | Extra Small |
| S    | 1.10      | Small       |
| M    | 1.25      | Medium      |
| L    | 1.50      | Large       |

## Service Area Logic

1. **In-Area**: Both pickup and dropoff within soft radius
2. **Edge Delivery**: One or both points outside soft radius
3. **Edge Surcharge**: Applied when `allow_outside: true` and delivery is outside radius

## Usage Examples

### Basic Fare Estimate
```typescript
import { FareService } from './services/fare.service';

const estimate = await FareService.estimateFare({
  pickup: { lat: 49.2827, lng: -123.1207 },
  dropoff: { lat: 49.2488, lng: -123.0061 },
  packageSize: 'M'
});

console.log(`Total: ${estimate.fare.total / 100} ${estimate.fare.currency}`);
```

### Distance Calculation
```typescript
import { DistanceService } from './services/distance.service';

const result = await DistanceService.calculate(
  { lat: 49.2827, lng: -123.1207 },
  { lat: 49.2488, lng: -123.0061 }
);

console.log(`Distance: ${result.distanceKm} km`);
console.log(`Duration: ${result.durationMinutes} min`);
```

### Validate Service Area
```typescript
import { DistanceService } from './services/distance.service';
import { ConfigService } from './services/config.service';

const serviceArea = await ConfigService.getServiceArea();
const validation = DistanceService.isWithinServiceArea(
  { lat: 49.2827, lng: -123.1207 },
  serviceArea.centers,
  serviceArea.allow_outside
);

console.log(`Can serve: ${validation.isWithin}`);
```

## Configuration Management

### Load Configuration
```typescript
const config = await ConfigService.getActiveConfig();
```

### Reload Configuration
```typescript
await ConfigService.reloadConfig();
```

### Validate Configuration
```typescript
const validation = await ConfigService.validateConfig();
if (!validation.valid) {
  console.error('Config errors:', validation.errors);
}
```

## Production Considerations

### Performance
- **Caching**: Configuration is cached in memory
- **Efficiency**: Haversine calculation is O(1)
- **No External APIs**: No network calls for basic distance/fare

### Scalability
- Stateless design
- Configuration versioning support
- Easy horizontal scaling

### Monitoring
- Add logging for fare calculations
- Track distance calculation accuracy
- Monitor configuration changes

### Future Enhancements
- Google Maps API integration for real-time distance
- Time-of-day pricing (surge pricing)
- Promotional discount support
- Multi-currency support
- Historical pricing analytics

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Invalid pickup coordinates",
    "statusCode": 400
  }
}
```

## Testing

### Unit Tests
```bash
npm test services/distance.service
npm test services/fare.service
```

### Integration Tests
```bash
npm test controllers/pricing.controller
```

## Development Workflow

1. **Modify Config**: Edit `app.config.ts`
2. **Reload**: Call `/api/pricing/config` to verify
3. **Test**: Use `/api/pricing/estimate` to test fares
4. **Deploy**: Version increment and deployment

## License

Proprietary - Jadapi
