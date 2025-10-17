export function isVancouverAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const addressLower = address.toLowerCase();

  // Check for Vancouver indicators
  const vancouverIndicators = [
    'vancouver',
    'vancouver, bc',
    'vancouver, british columbia',
    'bc',
    'british columbia',
    'v5k', 'v5l', 'v5m', 'v5n', 'v5p', 'v5r', 'v5s', 'v5t', 'v5v', 'v5w', 'v5x', 'v5y', 'v5z', // Vancouver postal codes
    'v6a', 'v6b', 'v6c', 'v6e', 'v6g', 'v6h', 'v6j', 'v6k', 'v6l', 'v6m', 'v6n', 'v6p', 'v6r', 'v6s', 'v6t', 'v6v', 'v6w', 'v6x', 'v6y', 'v6z'
  ];

  // Check if address contains any Vancouver indicators
  return vancouverIndicators.some(indicator => addressLower.includes(indicator));
}

export function validateVancouverAddress(address: string): { isValid: boolean; message?: string } {
  if (!address || address.trim().length === 0) {
    return { isValid: false, message: 'Address is required' };
  }

  if (address.length < 10) {
    return { isValid: false, message: 'Please enter a complete address' };
  }

  if (!isVancouverAddress(address)) {
    return {
      isValid: false,
      message: 'Address must be in Vancouver, BC. We currently only serve the Vancouver area.'
    };
  }

  return { isValid: true };
}