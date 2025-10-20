import { FareEstimateResponse } from '../../../lib/api/delivery';

interface FareEstimateProps {
  estimate: FareEstimateResponse;
}

export default function FareEstimate({ estimate }: FareEstimateProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-0.5">Estimated Fare</p>
          <p className="text-lg font-bold text-blue-600">
            ${((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-700">{estimate?.data?.distance?.distanceKm?.toFixed(1)} km</p>
          <p className="text-xs text-gray-700">~{estimate?.data?.distance?.durationMinutes} min</p>
        </div>
      </div>
    </div>
  );
}
