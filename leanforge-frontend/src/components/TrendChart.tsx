// src/components/TrendChart.tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  interest: number;
  volume?: number;
}

interface TrendChartProps {
  data: DataPoint[];
  height?: number;
}

export function TrendChart({ data, height = 300 }: TrendChartProps) {
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    interest: point.interest,
    volume: point.volume,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          stroke="#888"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#888' }}
        />
        <YAxis stroke="#888" style={{ fontSize: '12px' }} tick={{ fill: '#888' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="interest"
          stroke="#3b82f6"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
