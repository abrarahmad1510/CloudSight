import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeRange, RealtimeEvent } from '../types';
import { generateRealtimeEvent } from '../utils/mockData';

interface DashboardContextType {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  realtimeEvents: RealtimeEvent[];
  isRealtime: boolean;
  toggleRealtime: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [isRealtime, setIsRealtime] = useState(true);

  // Convert timeRange to GraphQL TimeRange format
  const getGraphQLTimeRange = (range: TimeRange): string => {
    switch (range) {
      case '1h': return 'ONE_HOUR';
      case '6h': return 'SIX_HOURS';
      case '1d': return 'ONE_DAY';
      case '1w': return 'ONE_WEEK';
      case '1m': return 'ONE_MONTH';
      default: return 'ONE_HOUR';
    }
  };

  // Simulate realtime events (we'll replace with WebSocket later)
  useEffect(() => {
    if (!isRealtime) return;

    const interval = setInterval(() => {
      const newEvent = generateRealtimeEvent();
      setRealtimeEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealtime]);

  const toggleRealtime = () => {
    setIsRealtime(prev => !prev);
  };

  const value: DashboardContextType = {
    timeRange,
    setTimeRange,
    realtimeEvents,
    isRealtime,
    toggleRealtime,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
