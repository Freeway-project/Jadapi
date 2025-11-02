'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog'
import { DollarSign, Route, Clock, ArrowRight } from 'lucide-react'

interface FareEstimate {
  total: number
  distance: number
  duration?: number
  currency?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  pickup: string
  dropoff: string
  estimatedFare: FareEstimate
  onProceedToBooking?: () => void
}

export function FareEstimateModal({
  isOpen,
  onClose,
  pickup,
  dropoff,
  estimatedFare,
  onProceedToBooking,
}: Props) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const handleContinue = () => {
    if (!isAuthenticated()) {
      // Not logged in - redirect to signup
      router.push('/auth/signup')
      return
    }

    // User is logged in - proceed to booking
    onClose()
    if (onProceedToBooking) {
      onProceedToBooking()
    }
  }

  // Format address to remove country/province and keep first 3 segments so it fits in two lines
  const formatAddress = (address: string) => {
    if (!address) return '';
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    // Keep up to first 3 segments (e.g. name, street, city) and drop province/country
    const kept = parts.slice(0, 3);
    return kept.join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm bg-white border-2 border-black shadow-2xl p-4 sm:p-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base sm:text-lg font-bold text-black">Your Estimate</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Route - Minimal */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-black flex-shrink-0"></div>
              <div
                className="text-xs sm:text-sm text-gray-900 min-w-0 flex-1"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {formatAddress(pickup)}
              </div>
            </div>
            <div className="ml-1 border-l border-gray-300 h-2"></div>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-black flex-shrink-0"></div>
              <div
                className="text-xs sm:text-sm text-gray-900 min-w-0 flex-1"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {formatAddress(dropoff)}
              </div>
            </div>
          </div>

          {/* Price - Simple */}
          <div className="text-center py-3">
            <div className="text-3xl sm:text-4xl font-bold text-black">
              ${((estimatedFare.total || 0) / 100).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">CAD</div>
          </div>

          {/* Details - Compact Row */}
          <div className="flex items-center justify-around bg-gray-50 rounded-lg py-2.5 px-2 sm:px-3 border border-gray-200">
            <div className="flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-600">{estimatedFare.distance.toFixed(1)} km</span>
            </div>
            {estimatedFare.duration && (
              <>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{estimatedFare.duration} min</span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 pt-2 flex flex-col sm:flex-row">
          {!isAuthenticated() ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:flex-1 h-10 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                className="w-full sm:flex-1 h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              onClick={handleContinue}
              className="w-full h-10 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Proceed to Booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}