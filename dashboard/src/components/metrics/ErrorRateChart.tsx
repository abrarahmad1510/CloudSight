import { Card } from '../ui/card';
import { MetricDataPoint } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateTime } from '../../utils/formatters';

interface ErrorRateChartProps {
  data: MetricDataPoint[];
}

export function ErrorRateChart({ data }: ErrorRateChartProps) {
  const chartData = data.map(point => ({
    time: point.timestamp,
    errorRate: point.value,
  }));

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-border/50">
      <h3 className="mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Error Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
          <XAxis
            dataKey="time"
            tickFormatter={(timestamp) => formatDateTime(timestamp)}
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelFormatter={(timestamp) => formatDateTime(timestamp as number)}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Error Rate']}
          />
          <Area
            type="monotone"
            dataKey="errorRate"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#colorError)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
