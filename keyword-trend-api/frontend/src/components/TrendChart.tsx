import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Trend } from '../types';

interface TrendChartProps {
  data: Trend[];
  height?: number;
}

export default function TrendChart({ data, height = 200 }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center" style={{ height }}>
        <span className="text-xs text-white/30">No trend data available</span>
      </div>
    );
  }

  const chartData = data
    .map((t) => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      interest: t.interest,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="glass-card p-4">
      <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Interest over time</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: '#1F2137',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line type="monotone" dataKey="interest" stroke="#06B6D4" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#06B6D4' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
