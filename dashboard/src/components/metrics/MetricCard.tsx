import { Card } from '../ui/card';
import { LucideIcon } from 'lucide-react';
import { formatNumber, formatPercentage, formatDuration } from '../../utils/formatters';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  change?: number;
  format?: 'number' | 'percentage' | 'duration';
  trend?: 'up' | 'down';
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  change,
  format = 'number',
  trend 
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return formatPercentage(val);
      case 'duration':
        return formatDuration(val);
      default:
        return formatNumber(val);
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (title.toLowerCase().includes('error')) {
      return trend === 'up' ? 'text-destructive' : 'text-green-600';
    }
    return trend === 'up' ? 'text-green-600' : 'text-destructive';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{formatValue(value)}</p>
          {change !== undefined && (
            <p className={`mt-2 ${getTrendColor()}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}% vs last period
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-3.5">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
