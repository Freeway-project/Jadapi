'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { appConfigAPI } from '../../lib/api/appConfig';
import toast from 'react-hot-toast';
import { Mail, Phone, User, MapPin, Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EarlyAccessFormProps {
  pickupAddress?: string;
  dropoffAddress?: string;
  estimatedFare?: {
    distance?: number;
    total?: number;
  };
}

interface FormData {
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
}

export default function EarlyAccessForm({
  pickupAddress = '',
  dropoffAddress = '',
  estimatedFare,
}: EarlyAccessFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!pickupAddress || !dropoffAddress) {
      toast.error('Please select pickup and dropoff addresses first');
      return;
    }

    setIsSubmitting(true);

    try {
      await appConfigAPI.submitEarlyAccessRequest({
        pickupAddress,
        dropoffAddress,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        estimatedFare: estimatedFare
          ? {
              distance: estimatedFare.distance,
              total: estimatedFare.total,
              currency: 'CAD',
            }
          : undefined,
        notes: data.notes,
      });

      setIsSubmitted(true);
      toast.success('Thank you! We\'ll contact you soon.');
    } catch (error) {
      console.error('Failed to submit early access request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-md">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Request Submitted!</h2>
          <p className="text-slate-600">
            We've received your early access request. Our team will contact you as soon as
            service is available in your area.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-md">
      {/* Back Button */}
      <button
        onClick={() => router.push('/search')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Search</span>
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Service Coming Soon
        </h2>
        <p className="text-slate-600">
          Our service is currently Inactive

        </p>
      </div>

      {/* Route Summary */}
      {pickupAddress && dropoffAddress && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Pickup</p>
              <p className="text-sm font-medium text-slate-900">{pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Dropoff</p>
              <p className="text-sm font-medium text-slate-900">{dropoffAddress}</p>
            </div>
          </div>
          {estimatedFare?.total && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Estimated Fare: <span className="font-semibold text-slate-900">${estimatedFare.total.toFixed(2)}</span>
                {estimatedFare.distance && (
                  <span className="text-xs text-slate-500 ml-2">
                    ({estimatedFare.distance.toFixed(1)} km)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contactName" className="text-sm font-semibold text-slate-900">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="contactName"
              type="text"
              placeholder="Your name"
              disabled={isSubmitting}
              className="pl-10"
              {...register('contactName', { required: 'Name is required' })}
            />
          </div>
          {errors.contactName && (
            <p className="text-sm text-rose-600">{errors.contactName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone" className="text-sm font-semibold text-slate-900">
            Phone Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="contactPhone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="6041234567"
              disabled={isSubmitting}
              className="pl-10"
              {...register('contactPhone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Phone number must be exactly 10 digits',
                },
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                }
              })}
            />
          </div>
          {errors.contactPhone && (
            <p className="text-sm text-rose-600">{errors.contactPhone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="text-sm font-semibold text-slate-900">
            Email (Optional)
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="contactEmail"
              type="email"
              placeholder="your@email.com"
              disabled={isSubmitting}
              className="pl-10"
              {...register('contactEmail', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          {errors.contactEmail && (
            <p className="text-sm text-rose-600">{errors.contactEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-semibold text-slate-900">
            Additional Notes (Optional)
          </Label>
          <textarea
            id="notes"
            placeholder="Any specific requirements or questions..."
            disabled={isSubmitting}
            rows={3}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 resize-none"
            {...register('notes')}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Submitting...</span>
            </div>
          ) : (
            'Request'
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        By submitting, you agree to be contacted when service is available.
      </p>
    </div>
  );
}
