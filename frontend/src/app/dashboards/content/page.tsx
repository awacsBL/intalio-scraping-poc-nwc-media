'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useContentSources,
  useCaptionLengthAnalysis,
  useMentionsAnalysis,
  useTopHashtags,
} from '@/hooks/useApi';
import { Hash, AtSign, FileText, BarChart3, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ContentDashboard() {
  const { data: sources, isLoading: sourcesLoading } = useContentSources();
  const { data: captionAnalysis, isLoading: captionLoading } = useCaptionLengthAnalysis();
  const { data: mentions, isLoading: mentionsLoading } = useMentionsAnalysis(15);
  const { data: hashtags, isLoading: hashtagsLoading } = useTopHashtags(15);

  // Transform caption analysis data - backend returns array format
  const captionData = Array.isArray(captionAnalysis)
    ? captionAnalysis.map((item: { range: string; count: number; avg_likes: number; avg_comments: number }) => ({
        name: item.range,
        range: item.range,
        count: item.count,
        engagement: Math.round((item.avg_likes || 0) + (item.avg_comments || 0)),
        avgLikes: item.avg_likes || 0,
        avgComments: item.avg_comments || 0,
      }))
    : [];

  return (
    <>
      <Header
        title="Content Performance"
        subtitle="Analyze content sources, hashtags, mentions, and caption performance"
      />
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hashtags</CardTitle>
              <Hash className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {hashtagsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{hashtags?.length || 0}+</div>
                  <p className="text-xs text-muted-foreground">Unique hashtags tracked</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
              <AtSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {mentionsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {mentions?.total_mentions?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mentions?.unique_mentions || 0} unique users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Sources</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {sourcesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{sources?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Different sources</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Caption Length</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {captionLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {captionData.reduce(
                      (max, curr) => (curr.engagement > (max?.engagement || 0) ? curr : max),
                      captionData[0]
                    )?.name || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Highest avg engagement</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Sources & Caption Analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Content Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Content by Source</CardTitle>
            </CardHeader>
            <CardContent>
              {sourcesLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : sources && sources.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percent }) =>
                        `${source} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sources.map((entry: { source: string }, index: number) => (
                        <Cell key={entry.source} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Caption Length Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Caption Length vs Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              {captionLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : captionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={captionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Post Count" />
                    <Bar yAxisId="right" dataKey="engagement" fill="#ef4444" name="Avg Engagement" />
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

        {/* Hashtags & Mentions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-500" />
                Top Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hashtagsLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : hashtags && hashtags.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={hashtags} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="hashtag"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `#${v.slice(0, 12)}${v.length > 12 ? '...' : ''}`}
                    />
                    <Tooltip formatter={(value) => [value, 'Uses']} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No hashtags found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Mentions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AtSign className="h-5 w-5 text-green-500" />
                Top Mentions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mentionsLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : mentions?.top_mentions && mentions.top_mentions.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={mentions.top_mentions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="username"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `@${v.slice(0, 12)}${v.length > 12 ? '...' : ''}`}
                    />
                    <Tooltip formatter={(value) => [value, 'Mentions']} />
                    <Bar dataKey="count" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No mentions found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hashtag Cloud */}
        <Card>
          <CardHeader>
            <CardTitle>Hashtag Cloud</CardTitle>
          </CardHeader>
          <CardContent>
            {hashtagsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : hashtags && hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag: { hashtag: string; count: number }, index: number) => {
                  const maxCount = Math.max(...hashtags.map((t: { count: number }) => t.count));
                  const size = Math.max(0.8, (tag.count / maxCount) * 1.5);
                  return (
                    <Badge
                      key={tag.hashtag}
                      variant={index < 3 ? 'default' : 'secondary'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      style={{ fontSize: `${size}rem`, padding: `${size * 0.3}rem ${size * 0.6}rem` }}
                    >
                      #{tag.hashtag}
                      <span className="ml-1 opacity-70">({tag.count})</span>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hashtags found</p>
            )}
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Source Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sources && sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map((source: {
                  source: string;
                  count: number;
                  total_likes: number;
                  total_comments: number;
                }) => (
                  <div
                    key={source.source}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{source.source.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{source.count} posts</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-right">
                      <div>
                        <p className="text-lg font-bold text-red-500">
                          {source.total_likes.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Likes</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-500">
                          {source.total_comments.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Comments</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No source data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
