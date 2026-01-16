import { useState, useEffect } from 'react';
import { swipes } from '../services/api';

export default function SwipeLimitCounter() {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLimits();
    // Refresh every minute
    const interval = setInterval(loadLimits, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadLimits = async () => {
    try {
      const data = await swipes.getLimits();
      setLimits(data);
    } catch (err) {
      console.error('Failed to load swipe limits:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !limits) {
    return null;
  }

  const { remaining, used_today, daily_limit } = limits;
  const percentage = (used_today / daily_limit) * 100;
  const isWarning = remaining < 10;
  const isCritical = remaining === 0;

  return (
    <div className={`px-4 py-2 ${isCritical ? 'bg-red-50' : isWarning ? 'bg-amber-50' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">
          Swipes Today
        </span>
        <span className={`text-xs font-bold ${
          isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-700'
        }`}>
          {used_today} / {daily_limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isCritical && (
        <p className="text-xs text-red-600 mt-1 text-center">
          Daily limit reached. Resets at midnight.
        </p>
      )}
      {isWarning && !isCritical && (
        <p className="text-xs text-amber-600 mt-1 text-center">
          Only {remaining} swipes remaining today
        </p>
      )}
    </div>
  );
}
