import { FareEstimateResponse } from '@/lib/api/delivery';

interface FareEstimateProps {
  estimate: FareEstimateResponse;
}

export default function FareEstimate({ estimate }: FareEstimateProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">Estimated Fare</p>
          <p className="text-3xl font-bold text-blue-600">
            ${((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-gray-600">Distance: {estimate?.data?.distance?.distanceKm?.toFixed(1)} km</p>
          <p className="text-xs text-gray-600">Duration: ~{estimate?.data?.distance?.durationMinutes} min</p>
        </div>
      </div>
    </div>
  );
}
