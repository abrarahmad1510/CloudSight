import { Card } from '../ui/card';
import { MetricDataPoint } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateTime } from '../../utils/formatters';

interface InvocationChartProps {
  data: MetricDataPoint[];
  title: string;
  color?: string;
}

export function InvocationChart({ data, title, color = '#8884d8' }: InvocationChartProps) {
  const chartData = data.map(point => ({
    time: point.timestamp,
    value: point.value,
  }));

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-border/50">
      <h3 className="mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="colorInvocation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelFormatter={(timestamp) => formatDateTime(timestamp as number)}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
