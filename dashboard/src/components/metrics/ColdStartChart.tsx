import { Card } from '../ui/card';
import { MetricDataPoint } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateTime } from '../../utils/formatters';

interface ColdStartChartProps {
  data: MetricDataPoint[];
}

export function ColdStartChart({ data }: ColdStartChartProps) {
  const chartData = data.map(point => ({
    time: point.timestamp,
    coldStarts: point.value,
  }));

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-border/50">
      <h3 className="mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Cold Start Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="colorColdStart" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.70 0.16 200)" stopOpacity={1}/>
              <stop offset="95%" stopColor="oklch(0.70 0.16 200)" stopOpacity={0.6}/>
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
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Cold Start Rate']}
          />
          <Bar
            dataKey="coldStarts"
            fill="url(#colorColdStart)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
