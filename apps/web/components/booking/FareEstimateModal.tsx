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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] bg-white border-2 border-black shadow-2xl p-5">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-bold text-black">Your Estimate</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Route - Minimal */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black flex-shrink-0"></div>
              <div className="text-sm text-gray-900 truncate">{pickup}</div>
            </div>
            <div className="ml-1 border-l border-gray-300 h-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black flex-shrink-0"></div>
              <div className="text-sm text-gray-900 truncate">{dropoff}</div>
            </div>
          </div>

          {/* Price - Simple */}
          <div className="text-center py-3">
            <div className="text-4xl font-bold text-black">
              ${((estimatedFare.total || 0) / 100).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">CAD</div>
          </div>

          {/* Details - Compact Row */}
          <div className="flex items-center justify-around bg-gray-50 rounded-lg py-2.5 px-3 border border-gray-200">
            <div className="flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">{estimatedFare.distance.toFixed(1)} km</span>
            </div>
            {estimatedFare.duration && (
              <>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-600">{estimatedFare.duration} min</span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 pt-2">
          {!isAuthenticated() ? (
            <>
              <Button
                variant="default"
                onClick={onClose}
                className="flex-1 h-10 text-xs font-semibold  border-2 border-gray-600 hover:bg-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              onClick={handleContinue}
              className="w-full h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Proceed to Booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}