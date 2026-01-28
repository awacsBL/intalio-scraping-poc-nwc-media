'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  useCommentStats,
  useTopCommenters,
  useCommentSentimentBreakdown,
} from '@/hooks/useApi';
import { MessageCircle, Users, TrendingUp, ThumbsUp, Smile, Meh, Frown } from 'lucide-react';
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

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

export default function CommentsDashboard() {
  const { data: stats, isLoading: statsLoading } = useCommentStats();
  const { data: topCommenters, isLoading: commentersLoading } = useTopCommenters(10);
  const { data: sentiment, isLoading: sentimentLoading } = useCommentSentimentBreakdown();

  const sentimentData = sentiment
    ? [
      { name: 'Positive', value: sentiment.positive, color: SENTIMENT_COLORS.positive },
      { name: 'Neutral', value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
      { name: 'Negative', value: sentiment.negative, color: SENTIMENT_COLORS.negative },
    ]
    : [];

  return (
    <>
      <Header
        title="Comment Analytics"
        subtitle="Analyze comments, sentiment, and community engagement"
      />
      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.total_comments?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.comments_analyzed || 0} analyzed by AI
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Comment Length</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.avg_comment_length?.toFixed(0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">characters</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comment Likes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.total_comment_likes?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total likes on comments</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Coverage</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.total_comments
                      ? ((stats.comments_analyzed / stats.total_comments) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Comments analyzed</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sentiment Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comment Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : sentiment && sentiment.total > 0 ? (
                <div className="flex items-center">
                  <ResponsiveContainer width="60%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry) => (
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
                          <span className="font-bold">{sentiment.positive}</span>
                        </div>
                        <Progress
                          value={(sentiment.positive / sentiment.total) * 100}
                          className="h-2 bg-green-100"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Meh className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>Neutral</span>
                          <span className="font-bold">{sentiment.neutral}</span>
                        </div>
                        <Progress
                          value={(sentiment.neutral / sentiment.total) * 100}
                          className="h-2 bg-gray-100"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Frown className="h-5 w-5 text-red-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>Negative</span>
                          <span className="font-bold">{sentiment.negative}</span>
                        </div>
                        <Progress
                          value={(sentiment.negative / sentiment.total) * 100}
                          className="h-2 bg-red-100"
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

          {/* Top Commenters */}
          <Card>
            <CardHeader>
              <CardTitle>Most Active Commenters</CardTitle>
            </CardHeader>
            <CardContent>
              {commentersLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : topCommenters && topCommenters.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCommenters} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="username"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `@${v.slice(0, 12)}${v.length > 12 ? '...' : ''}`}
                    />
                    <Tooltip />
                    <Bar dataKey="comment_count" fill="#3b82f6" name="Comments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No commenters data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Commenters List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Commenters Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {commentersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topCommenters && topCommenters.length > 0 ? (
              <div className="space-y-2">
                {topCommenters.map((commenter: {
                  username: string;
                  comment_count: number;
                  total_likes: number;
                }, index: number) => (
                  <div
                    key={commenter.username}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted"
                  >
                    <span
                      className={`text-lg font-bold w-8 ${index === 0
                          ? 'text-yellow-500'
                          : index === 1
                            ? 'text-gray-400'
                            : index === 2
                              ? 'text-amber-600'
                              : 'text-muted-foreground'
                        }`}
                    >
                      #{index + 1}
                    </span>
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">@{commenter.username}</p>
                    </div>
                    <div className="flex gap-4">
                      <Badge variant="secondary">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {commenter.comment_count} comments
                      </Badge>
                      <Badge variant="outline">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {commenter.total_likes.toLocaleString()} likes
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No commenters found</p>
            )}
          </CardContent>
        </Card>

        {/* Comment Sentiment by Post */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Breakdown Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading || sentimentLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Smile className="h-10 w-10 text-green-500" />
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        {stats?.sentiment_breakdown?.positive || sentiment?.positive || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Positive Comments</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-gray-500/10 border border-gray-500/20">
                  <div className="flex items-center gap-3">
                    <Meh className="h-10 w-10 text-gray-500" />
                    <div>
                      <p className="text-3xl font-bold text-gray-600">
                        {stats?.sentiment_breakdown?.neutral || sentiment?.neutral || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Neutral Comments</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <Frown className="h-10 w-10 text-red-500" />
                    <div>
                      <p className="text-3xl font-bold text-red-600">
                        {stats?.sentiment_breakdown?.negative || sentiment?.negative || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Negative Comments</p>
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
