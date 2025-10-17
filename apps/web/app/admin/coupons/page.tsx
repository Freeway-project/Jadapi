'use client';

import { useState, useEffect } from 'react';
import { adminAPI, Coupon, CreateCouponData } from '@/lib/api/admin';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Plus, Tag, Calendar, Users, DollarSign } from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<CreateCouponData>({
    code: '',
    discountType: 'percentage_discount',
    discountValue: 0,
    expiryDate: '',
    maxUsesTotal: undefined,
    maxUsesPerUser: 1,
    minOrderAmount: undefined,
    description: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await adminAPI.getCoupons({ limit: 100 });
      setCoupons(data.coupons);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const payload: CreateCouponData = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        description: formData.description || undefined,
      };

      if (formData.discountType !== 'eliminate_fee') {
        payload.discountValue = formData.discountValue;
      }

      if (formData.expiryDate) {
        payload.expiryDate = formData.expiryDate;
      }

      if (formData.maxUsesTotal) {
        payload.maxUsesTotal = formData.maxUsesTotal;
      }

      if (formData.maxUsesPerUser) {
        payload.maxUsesPerUser = formData.maxUsesPerUser;
      }

      if (formData.minOrderAmount) {
        payload.minOrderAmount = formData.minOrderAmount;
      }

      await adminAPI.createCoupon(payload);

      // Reset form and reload
      setFormData({
        code: '',
        discountType: 'percentage_discount',
        discountValue: 0,
        expiryDate: '',
        maxUsesTotal: undefined,
        maxUsesPerUser: 1,
        minOrderAmount: undefined,
        description: '',
      });
      setShowCreateForm(false);
      loadCoupons();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDiscountType = (type: string) => {
    switch (type) {
      case 'eliminate_fee':
        return 'Eliminate Fee';
      case 'fixed_discount':
        return 'Fixed Discount';
      case 'percentage_discount':
        return 'Percentage Discount';
      default:
        return type;
    }
  };

  const formatDiscountValue = (coupon: Coupon) => {
    if (coupon.discountType === 'eliminate_fee') {
      return 'Free delivery';
    }
    if (coupon.discountType === 'fixed_discount') {
      return `$${((coupon.discountValue || 0) / 100).toFixed(2)}`;
    }
    if (coupon.discountType === 'percentage_discount') {
      return `${coupon.discountValue}%`;
    }
    return '-';
  };

  return (
  <div className="p-6 text-black">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Coupon</h2>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Coupon Code *</Label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., WELCOME10"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Discount Type *</Label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="mt-1 w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
                  required
                >
                  <option value="percentage_discount">Percentage Discount</option>
                  <option value="fixed_discount">Fixed Discount</option>
                  <option value="eliminate_fee">Eliminate Fee</option>
                </select>
              </div>

              {formData.discountType !== 'eliminate_fee' && (
                <div>
                  <Label>
                    Discount Value * {formData.discountType === 'percentage_discount' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.discountValue || ''}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    min="0"
                    max={formData.discountType === 'percentage_discount' ? '100' : undefined}
                    step={formData.discountType === 'fixed_discount' ? '0.01' : '1'}
                    required
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Max Uses Total (Optional)</Label>
                <Input
                  type="number"
                  value={formData.maxUsesTotal || ''}
                  onChange={(e) => setFormData({ ...formData, maxUsesTotal: e.target.value ? Number(e.target.value) : undefined })}
                  min="1"
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Max Uses Per User</Label>
                <Input
                  type="number"
                  value={formData.maxUsesPerUser || 1}
                  onChange={(e) => setFormData({ ...formData, maxUsesPerUser: Number(e.target.value) })}
                  min="1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Min Order Amount (Optional, $)</Label>
                <Input
                  type="number"
                  value={formData.minOrderAmount ? formData.minOrderAmount / 100 : ''}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value ? Number(e.target.value) * 100 : undefined })}
                  min="0"
                  step="0.01"
                  placeholder="No minimum"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Description (Optional)</Label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Welcome coupon for new users"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? 'Creating...' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No coupons created yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span className="font-mono font-semibold text-black">{coupon.code}</span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {formatDiscountType(coupon.discountType)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-600">
                        {formatDiscountValue(coupon)}
                      </span>
                      {coupon.minOrderAmount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Min: ${(coupon.minOrderAmount / 100).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {coupon.currentUsesTotal}
                          {coupon.maxUsesTotal ? ` / ${coupon.maxUsesTotal}` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Max per user: {coupon.maxUsesPerUser}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {coupon.expiryDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
