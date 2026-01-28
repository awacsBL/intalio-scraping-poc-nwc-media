'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePostsOverTime,
  usePostingHours,
  usePostingDays,
} from '@/hooks/useApi';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export default function TimeAnalyticsDashboard() {
  const [groupBy, setGroupBy] = useState('day');
  const [days, setDays] = useState(30);

  const { data: postsOverTime, isLoading: timeLoading } = usePostsOverTime(groupBy, days);
  const { data: postingHours, isLoading: hoursLoading } = usePostingHours();
  const { data: postingDays, isLoading: daysLoading } = usePostingDays();

  // Find peak hour and day
  const peakHour = postingHours?.reduce(
    (max: { hour: number; count: number }, curr: { hour: number; count: number }) =>
      curr.count > (max?.count || 0) ? curr : max,
    null
  );
  const peakDay = postingDays?.reduce(
    (max: { day_name: string; count: number }, curr: { day_name: string; count: number }) =>
      curr.count > (max?.count || 0) ? curr : max,
    null
  );

  return (
    <>
      <Header
        title="Time-based Analytics"
        subtitle="Analyze posting patterns and trends over time"
      />
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Posting Hour</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {hoursLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {peakHour ? `${peakHour.hour}:00` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {peakHour?.count || 0} posts at this hour
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Posting Day</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {daysLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{peakDay?.day_name || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">
                    {peakDay?.count || 0} posts on this day
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Day for Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {daysLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {postingDays?.reduce(
                      (max: { day_name: string; avg_likes: number }, curr: { day_name: string; avg_likes: number }) =>
                        curr.avg_likes > (max?.avg_likes || 0) ? curr : max,
                      null
                    )?.day_name || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Highest average likes</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Posts Over Time Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Posts Over Time</CardTitle>
            <div className="flex gap-2">
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">By Hour</SelectItem>
                  <SelectItem value="day">By Day</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="month">By Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {timeLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : postsOverTime && postsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={postsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      if (!value) return '';
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                  <Tooltip
                    labelFormatter={(value) => {
                      if (!value) return '';
                      const date = new Date(value);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Posts"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="likes"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Likes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No data available for this time range
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hour and Day Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Posting Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Posts by Hour of Day</CardTitle>
            </CardHeader>
            <CardContent>
              {hoursLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : postingHours && postingHours.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={postingHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(h) => `${h}:00`}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(h) => `${h}:00 - ${h}:59`}
                    />
                    <Bar dataKey="count" fill="#3b82f6" name="Posts" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posting Days */}
          <Card>
            <CardHeader>
              <CardTitle>Posts by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
              {daysLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : postingDays && postingDays.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={postingDays}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day_name" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Posts" />
                    <Bar yAxisId="right" dataKey="avg_likes" fill="#ef4444" name="Avg Likes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Engagement by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Average Likes by Posting Hour</CardTitle>
          </CardHeader>
          <CardContent>
            {hoursLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : postingHours && postingHours.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={postingHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(h) => `${h}:00`}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(h) => `${h}:00 - ${h}:59`} />
                  <Line
                    type="monotone"
                    dataKey="avg_likes"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                    name="Avg Likes"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
