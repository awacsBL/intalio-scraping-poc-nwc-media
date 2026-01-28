'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  useWeeklyReports,
  useGenerateWeeklyReport,
} from '@/hooks/useApi';
import {
  Calendar,
  FileText,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Loader2,
  Plus,
  MessageCircle,
  Hash,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
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
} from 'recharts';
import { format, getISOWeek, getYear, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

// Generate week options for the last 12 weeks
function getWeekOptions() {
  const options = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = subWeeks(today, i);
    const year = getYear(date);
    const week = getISOWeek(date);
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

    options.push({
      value: `${year}-${week}`,
      label: `Week ${week}, ${year}`,
      sublabel: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
      year,
      week,
    });
  }

  return options;
}

export default function ReportsDashboard() {
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const weekOptions = getWeekOptions();

  const { data: reports, isLoading: reportsLoading } = useWeeklyReports(12);
  const generateReportMutation = useGenerateWeeklyReport();

  const handleGenerateReport = async () => {
    if (!selectedWeek) {
      toast.error('Please select a week');
      return;
    }

    const [year, week] = selectedWeek.split('-').map(Number);

    try {
      await generateReportMutation.mutateAsync({ year, weekNumber: week });
      toast.success(`Generated report for Week ${week}, ${year}`);
    } catch {
      toast.error('Failed to generate report');
    }
  };

  const latestReport = reports?.[0];

  const sentimentPieData = latestReport?.sentiment_summary
    ? [
        { name: 'Positive', value: latestReport.sentiment_summary.positive, color: SENTIMENT_COLORS.positive },
        { name: 'Neutral', value: latestReport.sentiment_summary.neutral, color: SENTIMENT_COLORS.neutral },
        { name: 'Negative', value: latestReport.sentiment_summary.negative, color: SENTIMENT_COLORS.negative },
      ]
    : [];

  const totalSentiment = latestReport?.sentiment_summary
    ? latestReport.sentiment_summary.positive + latestReport.sentiment_summary.neutral + latestReport.sentiment_summary.negative
    : 0;

  return (
    <>
      <Header
        title="Weekly Reports"
        subtitle="Generate and view AI-powered weekly analytics reports"
      />
      <div className="p-6 space-y-6">
        {/* Generate Report Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Generate New Report
            </CardTitle>
            <CardDescription>
              Create an AI-generated summary for a specific week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Select Week</label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a week..." />
                  </SelectTrigger>
                  <SelectContent>
                    {weekOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending || !selectedWeek}
              >
                {generateReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Latest Report Overview */}
        {reportsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : latestReport ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Latest Report</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Week {latestReport.week_number}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {latestReport.week_start && latestReport.week_end
                      ? `${format(new Date(latestReport.week_start), 'MMM d')} - ${format(new Date(latestReport.week_end), 'MMM d, yyyy')}`
                      : `Year ${latestReport.year}`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Posts Analyzed</CardTitle>
                  <FileText className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestReport.total_posts?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In this period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comments Analyzed</CardTitle>
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestReport.total_comments?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In this period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestReport.sentiment_summary?.average_score !== undefined
                      ? (latestReport.sentiment_summary.average_score * 100).toFixed(0) + '%'
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average positivity
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Summary & Sentiment */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Content Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Summary</CardTitle>
                  <CardDescription>
                    AI-generated summary for Week {latestReport.week_number}, {latestReport.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {latestReport.content_summary ? (
                    <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                      {latestReport.content_summary}
                    </p>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      No summary available
                    </div>
                  )}

                  {/* Top Topics */}
                  {latestReport.top_topics && latestReport.top_topics.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Top Topics
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {latestReport.top_topics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sentiment Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {latestReport.sentiment_summary && totalSentiment > 0 ? (
                    <div className="flex items-center">
                      <ResponsiveContainer width="50%" height={200}>
                        <PieChart>
                          <Pie
                            data={sentimentPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
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
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Smile className="h-5 w-5 text-green-500" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>Positive</span>
                              <span className="font-bold">{latestReport.sentiment_summary.positive}</span>
                            </div>
                            <Progress
                              value={(latestReport.sentiment_summary.positive / totalSentiment) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Meh className="h-5 w-5 text-gray-500" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>Neutral</span>
                              <span className="font-bold">{latestReport.sentiment_summary.neutral}</span>
                            </div>
                            <Progress
                              value={(latestReport.sentiment_summary.neutral / totalSentiment) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Frown className="h-5 w-5 text-red-500" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>Negative</span>
                              <span className="font-bold">{latestReport.sentiment_summary.negative}</span>
                            </div>
                            <Progress
                              value={(latestReport.sentiment_summary.negative / totalSentiment) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No sentiment data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                <p className="text-sm">Generate your first weekly report using the form above.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Report History
            </CardTitle>
            <CardDescription>
              Previously generated weekly reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report) => {
                  const total = report.sentiment_summary
                    ? report.sentiment_summary.positive + report.sentiment_summary.neutral + report.sentiment_summary.negative
                    : 0;
                  const positivePercent = total > 0 && report.sentiment_summary
                    ? Math.round((report.sentiment_summary.positive / total) * 100)
                    : 0;

                  return (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Week {report.week_number}, {report.year}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {report.week_start && report.week_end
                              ? `${format(new Date(report.week_start), 'MMM d')} - ${format(new Date(report.week_end), 'MMM d')}`
                              : 'Date range unavailable'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium">{report.total_posts} posts</div>
                          <div className="text-xs text-muted-foreground">{report.total_comments} comments</div>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-medium text-green-600">{positivePercent}% positive</div>
                          <div className="text-xs text-muted-foreground">
                            {report.generated_at
                              ? format(new Date(report.generated_at), 'MMM d, HH:mm')
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reports generated yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports Comparison Chart */}
        {reports && reports.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Comparison</CardTitle>
              <CardDescription>
                Sentiment trends across weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[...reports].reverse().map((r) => ({
                    week: `W${r.week_number}`,
                    positive: r.sentiment_summary?.positive || 0,
                    neutral: r.sentiment_summary?.neutral || 0,
                    negative: r.sentiment_summary?.negative || 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} name="Positive" />
                  <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
