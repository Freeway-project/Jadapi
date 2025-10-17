export interface PackageDetails {
  type: 'envelope' | 'small' | 'medium' | 'large';
  weight?: string;
  description?: string;
}

export interface DeliveryEstimate {
  fromAddress: string;
  toAddress: string;
  distance: number; // in km
  estimatedTime: number; // in minutes
  price: number;
  packageDetails?: PackageDetails;
  breakdown: {
    baseFee: number;
    distanceFee: number;
    packageFee: number;
    serviceFee: number;
  };
}

// Base rates (in CAD)
const BASE_RATES = {
  baseFee: 8.99,
  distanceRate: 1.25, // per km
  packageMultipliers: {
    envelope: 1.0,
    small: 1.2,
    medium: 1.5,
    large: 2.0,
  },
  serviceFeeRate: 0.1, // 10% of subtotal
  rushHourMultiplier: 1.3, // peak hours
  businessDiscount: 0.85, // 15% discount for business accounts
};

// Vancouver delivery zones (simplified)
const DELIVERY_ZONES = {
  downtown: { timeMultiplier: 1.2, feeMultiplier: 1.1 },
  suburban: { timeMultiplier: 1.0, feeMultiplier: 1.0 },
  outskirts: { timeMultiplier: 1.4, feeMultiplier: 1.3 },
};

export function calculateDeliveryEstimate(
  fromAddress: string,
  toAddress: string,
  packageDetails?: PackageDetails,
  userType: 'individual' | 'business' = 'individual'
): DeliveryEstimate {
  // Simulate distance calculation (in real app, would use Google Maps API)
  const distance = simulateDistance(fromAddress, toAddress);

  // Calculate base fees
  const baseFee = BASE_RATES.baseFee;
  const distanceFee = distance * BASE_RATES.distanceRate;

  // Package type multiplier
  const packageMultiplier = packageDetails?.type
    ? BASE_RATES.packageMultipliers[packageDetails.type]
    : BASE_RATES.packageMultipliers.small;

  const packageFee = (baseFee + distanceFee) * (packageMultiplier - 1);

  // Calculate subtotal
  let subtotal = baseFee + distanceFee + packageFee;

  // Apply business discount
  if (userType === 'business') {
    subtotal *= BASE_RATES.businessDiscount;
  }

  // Service fee
  const serviceFee = subtotal * BASE_RATES.serviceFeeRate;

  // Total price
  const price = Math.round((subtotal + serviceFee) * 100) / 100;

  // Estimate delivery time
  const estimatedTime = calculateEstimatedTime(distance, fromAddress, toAddress);

  return {
    fromAddress,
    toAddress,
    distance: Math.round(distance * 10) / 10,
    estimatedTime,
    price,
    packageDetails,
    breakdown: {
      baseFee: Math.round(baseFee * 100) / 100,
      distanceFee: Math.round(distanceFee * 100) / 100,
      packageFee: Math.round(packageFee * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
    }
  };
}

function simulateDistance(fromAddress: string, toAddress: string): number {
  // Simulate distance calculation based on address characteristics
  // In real implementation, would use Google Maps Distance Matrix API

  const baseDistance = Math.random() * 15 + 3; // 3-18 km base

  // Adjust based on address complexity (longer addresses might be further)
  const complexityFactor = (fromAddress.length + toAddress.length) / 100;

  return Math.max(2, baseDistance + complexityFactor);
}

function calculateEstimatedTime(distance: number, fromAddress: string, toAddress: string): number {
  // Base time: 20 minutes + 2.5 minutes per km
  let estimatedTime = 20 + (distance * 2.5);

  // Add traffic considerations (simplified)
  const currentHour = new Date().getHours();
  const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);

  if (isRushHour) {
    estimatedTime *= BASE_RATES.rushHourMultiplier;
  }

  // Zone adjustments (simplified - would use actual geocoding)
  if (fromAddress.toLowerCase().includes('downtown') || toAddress.toLowerCase().includes('downtown')) {
    estimatedTime *= DELIVERY_ZONES.downtown.timeMultiplier;
  }

  return Math.round(estimatedTime);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatDistance(distance: number): string {
  return `${distance} km`;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}