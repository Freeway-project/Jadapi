import { FareEstimateResponse } from '@/lib/api/delivery';

interface FareEstimateProps {
  estimate: FareEstimateResponse;
}

export default function FareEstimate({ estimate }: FareEstimateProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm text-gray-600">Estimated Fare</p>
          <p className="text-2xl font-semibold text-gray-900">
            ${((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-xs text-gray-600">{estimate?.data?.distance?.distanceKm?.toFixed(1)} km</p>
          <p className="text-xs text-gray-600">~{estimate?.data?.distance?.durationMinutes} min</p>
        </div>
      </div>
    </div>
  );
}
