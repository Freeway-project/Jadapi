export default {
  "id": "00000000-0000-0000-0000-000000000001",
  "version": 1,
  "status": "active",
  "effective_from": "2025-10-01T00:00:00-07:00",
  "checksum": "",
  "payload": {
    "serviceArea": {
      "centers": [
        { "code": "SUR", "label": "Surrey",    "lat": 49.1913, "lng": -122.8490, "soft_radius_km": 20, "active": true },
        { "code": "LAN", "label": "Langley",   "lat": 49.1044, "lng": -122.6603, "soft_radius_km": 20, "active": true },
        { "code": "BUR", "label": "Burnaby",   "lat": 49.2488, "lng": -122.9805, "soft_radius_km": 20, "active": true }
      ]
    },
    "rateCard": {
      "currency": "CAD",
      "base_cents": 299,
      "per_km_cents": 120,
      "per_min_cents": 30,
      "min_fare_cents": 699,
      "size_multiplier": { "XS": 1.00, "S": 1.10, "M": 1.15, "L": 1.20 }
    },  
    "bands": [
      { "km_max": 5,  "multiplier": 1.00, "label": "≤5 km"  },
      { "km_max": 10, "multiplier": 1.10, "label": "≤10 km" },
      { "km_max": 15, "multiplier": 1.20, "label": "≤15 km" },
      { "km_max": 20, "multiplier": 1.30, "label": "≤20 km" },
      { "km_max": 999,"multiplier": 1.55, "label": ">20 km" }
    ],
    "tax": { "enabled": false, "rate": 0 },
    "ui": { "show_band_label": true, "round_display_to_cents": true },
    "meta": { "notes": "Initial VAN/SUR/LAN", "updated_by": "harsh" }
  },
  "created_at": "2025-09-30T00:00:00-07:00",
  "created_by": "system"
};
