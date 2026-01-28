'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAiCoverage,
  useSentimentBySource,
  useSentimentTrend,
  useSentimentBreakdown,
  useTopTopics,
  useBatchAnalyzeSentiment,
  useSummarizePeriod,
} from '@/hooks/useApi';
import { Brain, FileText, MessageCircle, Smile, Meh, Frown, Sparkles, Loader2, ArrowRight, Calendar, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

export default function AIInsightsDashboard() {
  const [trendDays, setTrendDays] = useState(30);

  const { data: coverage, isLoading: coverageLoading } = useAiCoverage();
  const { data: sentimentBySource, isLoading: sourceLoading } = useSentimentBySource();
  const { data: sentimentTrend, isLoading: trendLoading } = useSentimentTrend(trendDays);
  const { data: sentimentBreakdown, isLoading: breakdownLoading } = useSentimentBreakdown();
  const { data: topics, isLoading: topicsLoading } = useTopTopics(10);

  const batchSentimentMutation = useBatchAnalyzeSentiment();
  const summarizePeriodMutation = useSummarizePeriod();

  const pendingCount = (coverage?.posts?.pending || 0) + (coverage?.comments?.pending || 0);

  const handleBatchSentiment = async () => {
    try {
      const result = await batchSentimentMutation.mutateAsync(100);
      toast.success(`Analyzed sentiment for ${result.processed} comments`);
    } catch {
      toast.error('Failed to run batch sentiment analysis');
    }
  };

  const handleWeeklySummary = async () => {
    try {
      await summarizePeriodMutation.mutateAsync(7);
      toast.success('Weekly summary generated');
    } catch {
      toast.error('Failed to generate weekly summary');
    }
  };

  const sentimentPieData = sentimentBreakdown
    ? [
        { name: 'Positive', value: sentimentBreakdown.positive, color: SENTIMENT_COLORS.positive },
        { name: 'Neutral', value: sentimentBreakdown.neutral, color: SENTIMENT_COLORS.neutral },
        { name: 'Negative', value: sentimentBreakdown.negative, color: SENTIMENT_COLORS.negative },
      ]
    : [];

  return (
    <>
      <Header
        title="AI Insights"
        subtitle="Sentiment analysis, topic detection, and AI coverage metrics"
      />
      <div className="p-6 space-y-6">
        {/* AI Coverage Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Analyzed</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {coverage?.posts?.analyzed?.toLocaleString() || 0}
                  </div>
                  <Progress
                    value={coverage?.posts?.coverage_percent || 0}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {coverage?.posts?.coverage_percent || 0}% coverage
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments Analyzed</CardTitle>
              <MessageCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {coverage?.comments?.analyzed?.toLocaleString() || 0}
                  </div>
                  <Progress
                    value={coverage?.comments?.coverage_percent || 0}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {coverage?.comments?.coverage_percent || 0}% coverage
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Analysis</CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {((coverage?.posts?.pending || 0) + (coverage?.comments?.pending || 0)).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {coverage?.posts?.pending || 0} posts, {coverage?.comments?.pending || 0} comments
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics Detected</CardTitle>
              <Sparkles className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {topicsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{topics?.length || 0}+</div>
                  <p className="text-xs text-muted-foreground">Unique topics identified</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Quick AI Actions
            </CardTitle>
            <CardDescription>
              Run AI analysis operations on your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleBatchSentiment}
                disabled={batchSentimentMutation.isPending || pendingCount === 0}
              >
                {batchSentimentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Run Batch Sentiment (100)
              </Button>
              <Button
                variant="outline"
                onClick={handleWeeklySummary}
                disabled={summarizePeriodMutation.isPending}
              >
                {summarizePeriodMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Generate Weekly Summary
              </Button>
              <Button variant="default" asChild>
                <Link href="/ai-services">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to AI Services
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboards/reports">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Weekly Reports
                </Link>
              </Button>
            </div>
            {pendingCount > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                {pendingCount.toLocaleString()} items pending analysis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sentiment Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : sentimentBreakdown && sentimentBreakdown.total > 0 ? (
                <div className="flex items-center">
                  <ResponsiveContainer width="60%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentPieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <Smile className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>Positive</span>
                          <span className="font-bold">{sentimentBreakdown.positive}</span>
                        </div>
                        <Progress
                          value={(sentimentBreakdown.positive / sentimentBreakdown.total) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Meh className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>Neutral</span>
                          <span className="font-bold">{sentimentBreakdown.neutral}</span>
                        </div>
                        <Progress
                          value={(sentimentBreakdown.neutral / sentimentBreakdown.total) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Frown className="h-5 w-5 text-red-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>Negative</span>
                          <span className="font-bold">{sentimentBreakdown.negative}</span>
                        </div>
                        <Progress
                          value={(sentimentBreakdown.negative / sentimentBreakdown.total) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No sentiment data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Top Detected Topics</CardTitle>
            </CardHeader>
            <CardContent>
              {topicsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : topics && topics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="topic"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No topics detected yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sentiment Trend Over Time</CardTitle>
            <Select
              value={trendDays.toString()}
              onValueChange={(v) => setTrendDays(parseInt(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : sentimentTrend && sentimentTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={sentimentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke={SENTIMENT_COLORS.negative}
                    fill={SENTIMENT_COLORS.negative}
                    fillOpacity={0.6}
                    name="Negative"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke={SENTIMENT_COLORS.neutral}
                    fill={SENTIMENT_COLORS.neutral}
                    fillOpacity={0.6}
                    name="Neutral"
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke={SENTIMENT_COLORS.positive}
                    fill={SENTIMENT_COLORS.positive}
                    fillOpacity={0.6}
                    name="Positive"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No trend data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentiment by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment by Content Source</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : sentimentBySource && sentimentBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sentimentBySource}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="positive" fill={SENTIMENT_COLORS.positive} name="Positive" />
                  <Bar dataKey="neutral" fill={SENTIMENT_COLORS.neutral} name="Neutral" />
                  <Bar dataKey="negative" fill={SENTIMENT_COLORS.negative} name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No source data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Coverage Details */}
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Coverage Details</CardTitle>
          </CardHeader>
          <CardContent>
            {coverageLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-bold text-lg">Posts Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        {coverage?.posts?.coverage_percent || 0}% coverage
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Posts</span>
                      <span className="font-bold">{coverage?.posts?.total || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Analyzed</span>
                      <span className="font-bold">{coverage?.posts?.analyzed || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Pending</span>
                      <span className="font-bold">{coverage?.posts?.pending || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-bold text-lg">Comments Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        {coverage?.comments?.coverage_percent || 0}% coverage
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Comments</span>
                      <span className="font-bold">{coverage?.comments?.total || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Analyzed</span>
                      <span className="font-bold">{coverage?.comments?.analyzed || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Pending</span>
                      <span className="font-bold">{coverage?.comments?.pending || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
