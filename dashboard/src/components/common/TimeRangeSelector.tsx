import { useDashboard } from '../../contexts/DashboardContext';
import { TimeRange, TimeRangeOption } from '../../types';

const timeRangeOptions: TimeRangeOption[] = [
  { label: '1H', value: '1h', hours: 1 },
  { label: '6H', value: '6h', hours: 6 },
  { label: '1D', value: '1d', hours: 24 },
  { label: '1W', value: '1w', hours: 168 },
  { label: '1M', value: '1m', hours: 720 },
];

export function TimeRangeSelector() {
  const { timeRange, setTimeRange, isRealtime, toggleRealtime } = useDashboard();

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-muted rounded-lg p-1">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === option.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      <button
        onClick={toggleRealtime}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          isRealtime
            ? 'bg-green-500 text-white shadow-sm'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        Live
      </button>
    </div>
  );
}

// Helper function to convert time range to hours
export function getHoursFromTimeRange(timeRange: TimeRange): number {
  const option = timeRangeOptions.find(opt => opt.value === timeRange);
  return option ? option.hours : 1;
}

// Helper function to convert to GraphQL time range format
export function getGraphQLTimeRange(timeRange: TimeRange): string {
  switch (timeRange) {
    case '1h': return 'ONE_HOUR';
    case '6h': return 'SIX_HOURS';
    case '1d': return 'ONE_DAY';
    case '1w': return 'ONE_WEEK';
    case '1m': return 'ONE_MONTH';
    default: return 'ONE_HOUR';
  }
}
