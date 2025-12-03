"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';

const data = [
  { month: 'Jan', thisYear: 10000, lastYear: 8000 },
  { month: 'Feb', thisYear: 15000, lastYear: 12000 },
  { month: 'Mar', thisYear: 12000, lastYear: 14000 },
  { month: 'Apr', thisYear: 20000, lastYear: 15000 },
  { month: 'May', thisYear: 26000, lastYear: 22000 },
  { month: 'Jun', thisYear: 23000, lastYear: 24000 },
  { month: 'Jul', thisYear: 28000, lastYear: 27000 },
];

export default function RequestChart() {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="reqArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111827" stopOpacity={0.12} />
              <stop offset="80%" stopColor="#111827" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#6b7280' }} />
          <YAxis stroke="#9ca3af" tick={{ fill: '#6b7280' }} />
          <Tooltip />
          <Area dataKey="thisYear" stroke="none" fill="url(#reqArea)" />
          <Line type="monotone" dataKey="thisYear" stroke="#111827" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="lastYear" stroke="#60a5fa" strokeWidth={2} dot={false} strokeDasharray="6 6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
