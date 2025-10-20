'use client'

import { useState } from 'react'
import { FareEstimateModal } from './FareEstimateModal'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { MapPin, ArrowRight } from 'lucide-react'
import { deliveryAPI } from '../../lib/api/delivery'
import toast from 'react-hot-toast'

export function SearchQuote() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [showEstimate, setShowEstimate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [estimatedFare, setEstimatedFare] = useState<{ total: number; distance: number; duration?: number } | null>(null)

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    if (!window.google?.maps) {
      throw new Error('Google Maps not loaded')
    }

    const geocoder = new window.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng()
          })
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  }

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pickup || !dropoff) return

    setIsLoading(true)
    try {
      // Geocode addresses
      const pickupCoords = await geocodeAddress(pickup)
      const dropoffCoords = await geocodeAddress(dropoff)

      // Use unified API service
      const estimate = await deliveryAPI.getFareEstimate({
        pickup: pickupCoords,
        dropoff: dropoffCoords,
        packageSize: 'S',
      })

      if (!estimate?.data?.fare) {
        throw new Error('Invalid response from server')
      }

      setEstimatedFare({
        total: estimate.data.fare.total,
        distance: estimate.data.fare.distanceKm,
        duration: estimate.data.fare.durationMinutes
      })
      setShowEstimate(true)
    } catch (err: any) {
      console.error('Failed to get estimate:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to get estimate. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleGetQuote} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Pickup address"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Dropoff address"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium"
          disabled={isLoading || !pickup || !dropoff}
        >
          {isLoading ? (
            'Getting Quote...'
          ) : (
            <>
              Get Quote <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {estimatedFare && (
        <FareEstimateModal
          isOpen={showEstimate}
          onClose={() => setShowEstimate(false)}
          pickup={pickup}
          dropoff={dropoff}
          estimatedFare={{
            total: estimatedFare.total,
            distance: estimatedFare.distance,
            duration: estimatedFare.duration,
            currency: 'CAD'
          }}
        />
      )}
    </>
  )
}