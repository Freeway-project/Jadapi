'use client';

import { useEffect, useState } from 'react';
import { adminAPI, SmsUsageStats } from '../../../lib/api/admin';
import { MessageSquare, DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function SmsUsagePage() {
  const [smsStats, setSmsStats] = useState<SmsUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const data = await adminAPI.getSmsUsage();
      setSmsStats(data);
    } catch (err: any) {
      console.error('Failed to load SMS usage data:', err);
      setError(err?.message || 'Failed to load SMS usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading SMS usage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = smsStats?.usage;
  const percentages = smsStats?.percentages;
  const warnings = smsStats?.warnings || [];
  const status = smsStats?.status || 'healthy';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SMS Usage Statistics</h1>
            <p className="text-gray-600">Monitor SMS usage and costs</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {status === 'healthy' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-semibold">{status === 'healthy' ? 'Healthy' : 'Warning'}</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Warnings</h3>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-800">{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <UsageCard
          title="Hourly Usage"
          current={stats?.hourly || 0}
          limit={stats?.limits.global.hourly || 100}
          percentage={percentages?.hourly || 0}
          icon={Clock}
          color="blue"
        />
        <UsageCard
          title="Daily Usage"
          current={stats?.daily || 0}
          limit={stats?.limits.global.daily || 500}
          percentage={percentages?.daily || 0}
          icon={TrendingUp}
          color="green"
        />
        <UsageCard
          title="Monthly Usage"
          current={stats?.monthly || 0}
          limit={stats?.limits.global.monthly || 10000}
          percentage={percentages?.monthly || 0}
          icon={MessageSquare}
          color="purple"
        />
      </div>

      {/* Cost Stats Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CostCard
            title="Daily Cost"
            current={stats?.costDaily || 0}
            limit={stats?.limits.costs.dailyLimit || 10}
            percentage={percentages?.costDaily || 0}
          />
          <CostCard
            title="Monthly Cost"
            current={stats?.costMonthly || 0}
            limit={stats?.limits.costs.monthlyLimit || 200}
            percentage={percentages?.costMonthly || 0}
          />
        </div>
      </div>

      {/* Rate Limits Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Limit Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Global Limits</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hourly:</span>
                <span className="font-medium">{stats?.limits.global.hourly} SMS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily:</span>
                <span className="font-medium">{stats?.limits.global.daily} SMS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly:</span>
                <span className="font-medium">{stats?.limits.global.monthly} SMS</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Cost Limits</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Budget:</span>
                <span className="font-medium">${stats?.limits.costs.dailyLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Budget:</span>
                <span className="font-medium">${stats?.limits.costs.monthlyLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Per SMS Cost:</span>
                <span className="font-medium">${stats?.limits.costs.perSmsCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Auto-refreshing every 30 seconds
      </div>
    </div>
  );
}

interface UsageCardProps {
  title: string;
  current: number;
  limit: number;
  percentage: number;
  icon: any;
  color: 'blue' | 'green' | 'purple';
}

function UsageCard({ title, current, limit, percentage, icon: Icon, color }: UsageCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const progressColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-600';
    return progressColors[color];
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-gray-900">{current}</span>
          <span className="text-gray-500 mb-1">/ {limit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{percentage.toFixed(1)}% used</span>
          {percentage >= 80 && (
            <span className="text-xs font-medium text-yellow-600">⚠ Approaching limit</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface CostCardProps {
  title: string;
  current: number;
  limit: number;
  percentage: number;
}

function CostCard({ title, current, limit, percentage }: CostCardProps) {
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="p-3 rounded-lg bg-green-100 text-green-600">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-gray-900">${current.toFixed(2)}</span>
          <span className="text-gray-500 mb-1">/ ${limit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{percentage.toFixed(1)}% of budget</span>
          {percentage >= 80 && (
            <span className="text-xs font-medium text-yellow-600">⚠ Approaching budget</span>
          )}
        </div>
      </div>
    </div>
  );
}
