'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useTopAuthors,
  useTopAuthorsByEngagement,
  useAuthorActivity,
} from '@/hooks/useApi';
import { Users, TrendingUp, Heart, MessageCircle, Search, User } from 'lucide-react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AuthorsDashboard() {
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: topAuthors, isLoading: authorsLoading } = useTopAuthors(10);
  const { data: topByEngagement, isLoading: engagementLoading } = useTopAuthorsByEngagement(10);
  const { data: authorActivity, isLoading: activityLoading } = useAuthorActivity(selectedAuthor);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSelectedAuthor(searchInput.trim().replace('@', ''));
    }
  };

  return (
    <>
      <Header
        title="Author Analytics"
        subtitle="Analyze content creators and their performance"
      />
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {authorsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{topAuthors?.length || 0}+</div>
              )}
              <p className="text-xs text-muted-foreground">Unique content creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Author</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {authorsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold truncate">
                    @{topAuthors?.[0]?.username || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {topAuthors?.[0]?.post_count || 0} posts
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Engaging</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold truncate">
                    @{topByEngagement?.[0]?.username || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {topByEngagement?.[0]?.total_engagement?.toLocaleString() || 0} total engagement
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Author Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Author Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter username (e.g., nwc_media)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {selectedAuthor && (
              <div className="mt-4">
                {activityLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : authorActivity ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">@{authorActivity.username}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{authorActivity.total_posts} posts</span>
                          <span>{authorActivity.total_likes.toLocaleString()} likes</span>
                          <span>{authorActivity.total_comments.toLocaleString()} comments</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Avg per post</p>
                        <p className="font-bold">{authorActivity.avg_likes} likes</p>
                        <p className="text-sm">{authorActivity.avg_comments} comments</p>
                      </div>
                    </div>

                    {/* Sentiment breakdown for author */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {authorActivity.sentiment_breakdown.positive}
                        </p>
                        <p className="text-xs text-muted-foreground">Positive</p>
                      </div>
                      <div className="p-3 bg-gray-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-600">
                          {authorActivity.sentiment_breakdown.neutral}
                        </p>
                        <p className="text-xs text-muted-foreground">Neutral</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {authorActivity.sentiment_breakdown.negative}
                        </p>
                        <p className="text-xs text-muted-foreground">Negative</p>
                      </div>
                    </div>

                    {/* Recent posts */}
                    {authorActivity.recent_posts?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recent Posts</h4>
                        <div className="space-y-2">
                          {authorActivity.recent_posts.map((post: {
                            post_id: string;
                            caption: string | null;
                            likes_count: number;
                            comments_count: number;
                            timestamp: string | null;
                          }) => (
                            <div
                              key={post.post_id}
                              className="p-3 border rounded-lg text-sm"
                            >
                              <p className="text-muted-foreground line-clamp-2">
                                {post.caption || 'No caption'}
                              </p>
                              <div className="flex gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {post.likes_count.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.comments_count.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Author not found
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Authors Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Authors by Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Authors by Post Count</CardTitle>
            </CardHeader>
            <CardContent>
              {authorsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : topAuthors && topAuthors.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topAuthors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="username"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `@${v.slice(0, 12)}${v.length > 12 ? '...' : ''}`}
                    />
                    <Tooltip
                      formatter={(value, name) => [value, name === 'post_count' ? 'Posts' : name]}
                    />
                    <Bar dataKey="post_count" fill="#3b82f6" name="Posts" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Authors by Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Top Authors by Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : topByEngagement && topByEngagement.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topByEngagement} layout="vertical">
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
                    <Bar dataKey="total_likes" fill="#ef4444" name="Likes" stackId="a" />
                    <Bar dataKey="total_comments" fill="#3b82f6" name="Comments" stackId="a" />
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

        {/* Authors List */}
        <Card>
          <CardHeader>
            <CardTitle>All Top Authors</CardTitle>
          </CardHeader>
          <CardContent>
            {authorsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topAuthors && topAuthors.length > 0 ? (
              <div className="space-y-2">
                {topAuthors.map((author: {
                  username: string;
                  post_count: number;
                  total_likes: number;
                  total_comments: number;
                  avg_likes: number;
                }, index: number) => (
                  <div
                    key={author.username}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSearchInput(author.username);
                      setSelectedAuthor(author.username);
                    }}
                  >
                    <span className="text-lg font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </span>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">@{author.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {author.post_count} posts
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <Badge variant="secondary">
                        <Heart className="h-3 w-3 mr-1" />
                        {author.total_likes.toLocaleString()}
                      </Badge>
                      <Badge variant="outline">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {author.total_comments.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No authors found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
