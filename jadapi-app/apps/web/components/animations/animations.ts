// Animation registry - add new animations here
export const ANIMATIONS = {
  DELIVERY: 'global-delivery.json',
  TRUCK_DELIVERY: 'truck-delivery-service.json',
  PACKING: 'worker-packing-the-goods.json',
  ONLINE_DELIVERY: 'online-delivery-service.json',
} as const;

// Animation labels for accessibility
export const ANIMATION_LABELS = {
  [ANIMATIONS.DELIVERY]: 'Delivery animation',
  [ANIMATIONS.TRUCK_DELIVERY]: 'Truck delivery animation',
  [ANIMATIONS.PACKING]: 'Worker packing goods animation',
  [ANIMATIONS.ONLINE_DELIVERY]: 'Online delivery service animation',
} as const;

// Common size presets
export const ANIMATION_SIZES = {
  HERO: { width: 300, height: 300 },
  CARD: { width: 200, height: 200 },
  ICON: { width: 64, height: 64 },
  LOADING: { width: 120, height: 120 },
  SMALL: { width: 100, height: 100 },
  DEFAULT: { width: 250, height: 250 },
} as const;