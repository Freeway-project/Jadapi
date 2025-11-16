'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { apiClient } from '../lib/api/client';
import toast from 'react-hot-toast';
import { Package } from 'lucide-react';

export default function TestOrderButton() {
  const [isCreating, setIsCreating] = useState(false);

  const createTestOrder = async () => {
    try {
      setIsCreating(true);
      const response = await apiClient.post('/test/create-order');

      if (response.data.success) {
        toast.success(`Test order created! ID: ${response.data.data.order.orderId}`);

        // Reload the page after 1 second to show new order
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Failed to create test order:', error);
      toast.error(error?.response?.data?.message || 'Failed to create test order');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={createTestOrder}
      disabled={isCreating}
      variant="outline"
      size="sm"
      className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
    >
      {isCreating ? (
        <>
          <div className="w-4 h-4 border-2 border-yellow-700 border-t-transparent rounded-full animate-spin mr-2" />
          Creating...
        </>
      ) : (
        <>
          <Package className="w-4 h-4 mr-2" />
          Create Test Order
        </>
      )}
    </Button>
  );
}
