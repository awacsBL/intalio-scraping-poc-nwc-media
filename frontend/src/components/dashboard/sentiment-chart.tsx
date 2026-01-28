'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface SentimentChartProps {
  data: {
    positive: number;
    negative: number;
    neutral: number;
  };
  isLoading?: boolean;
}

const COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

const chartConfig = {
  positive: {
    label: 'Positive',
    color: COLORS.positive,
  },
  neutral: {
    label: 'Neutral',
    color: COLORS.neutral,
  },
  negative: {
    label: 'Negative',
    color: COLORS.negative,
  },
};

export function SentimentChart({ data, isLoading }: SentimentChartProps) {
  const chartData = [
    { name: 'Positive', value: data.positive, fill: COLORS.positive },
    { name: 'Neutral', value: data.neutral, fill: COLORS.neutral },
    { name: 'Negative', value: data.negative, fill: COLORS.negative },
  ];

  const total = data.positive + data.neutral + data.negative;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sentiment Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ChartContainer config={chartConfig} className="h-[200px] w-full aspect-square max-w-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {total > 0 ? Math.round((data.positive / total) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Positive</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">
              {total > 0 ? Math.round((data.neutral / total) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Neutral</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {total > 0 ? Math.round((data.negative / total) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Negative</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
