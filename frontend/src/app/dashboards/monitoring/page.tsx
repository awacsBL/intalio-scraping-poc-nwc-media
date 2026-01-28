'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  useTargetsOverview,
  useScrapingActivity,
  useTargetUsers,
  useTargetHashtags,
} from '@/hooks/useApi';
import {
  Users,
  Hash,
  MapPin,
  Activity,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function MonitoringDashboard() {
  const { data: overview, isLoading: overviewLoading } = useTargetsOverview();
  const { data: activity, isLoading: activityLoading } = useScrapingActivity();
  const { data: users, isLoading: usersLoading } = useTargetUsers();
  const { data: hashtags, isLoading: hashtagsLoading } = useTargetHashtags();

  const targetsData = overview
    ? [
        { name: 'Users', active: overview.users?.active || 0, inactive: overview.users?.inactive || 0 },
        { name: 'Hashtags', active: overview.hashtags?.active || 0, inactive: overview.hashtags?.inactive || 0 },
        { name: 'Places', active: overview.places?.active || 0, inactive: overview.places?.inactive || 0 },
      ]
    : [];

  return (
    <>
      <Header
        title="Monitoring Targets"
        subtitle="Track users, hashtags, places, and scraping activity"
      />
      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.users?.total || 0}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-green-600">
                      {overview?.users?.active || 0} active
                    </Badge>
                    <Badge variant="outline" className="text-gray-500">
                      {overview?.users?.inactive || 0} inactive
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Hashtags</CardTitle>
              <Hash className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.hashtags?.total || 0}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-green-600">
                      {overview?.hashtags?.active || 0} active
                    </Badge>
                    <Badge variant="outline" className="text-gray-500">
                      {overview?.hashtags?.inactive || 0} inactive
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Places</CardTitle>
              <MapPin className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.places?.total || 0}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-green-600">
                      {overview?.places?.active || 0} active
                    </Badge>
                    <Badge variant="outline" className="text-gray-500">
                      {overview?.places?.inactive || 0} inactive
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts (24h)</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {activity?.posts?.last_24h?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity?.comments?.last_24h || 0} comments collected
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scraping Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Scraping Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : activity ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        period: 'Last 24h',
                        posts: activity.posts?.last_24h || 0,
                        comments: activity.comments?.last_24h || 0,
                      },
                      {
                        period: 'Last 7d',
                        posts: activity.posts?.last_7d || 0,
                        comments: activity.comments?.last_7d || 0,
                      },
                      {
                        period: 'Last 30d',
                        posts: activity.posts?.last_30d || 0,
                        comments: activity.comments?.last_30d || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill="#3b82f6" name="Posts" />
                    <Bar dataKey="comments" fill="#22c55e" name="Comments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No activity data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Targets Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Targets Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : targetsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={targetsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="active" fill="#22c55e" name="Active" stackId="a" />
                    <Bar dataKey="inactive" fill="#6b7280" name="Inactive" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No targets configured
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Target Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Monitored Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user: {
                  id: number;
                  username: string;
                  display_name: string | null;
                  follower_count: number | null;
                  is_verified: boolean;
                  is_active: boolean;
                  last_scraped_at: string | null;
                  tags: string[];
                }) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">@{user.username}</p>
                        {user.is_verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                        {user.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.display_name || 'No display name'}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">
                        {user.follower_count?.toLocaleString() || 'N/A'} followers
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.last_scraped_at
                          ? `Scraped ${formatDistanceToNow(new Date(user.last_scraped_at), { addSuffix: true })}`
                          : 'Never scraped'}
                      </p>
                    </div>
                    {user.tags && user.tags.length > 0 && (
                      <div className="flex gap-1">
                        {user.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No target users configured
              </p>
            )}
          </CardContent>
        </Card>

        {/* Target Hashtags List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-green-500" />
              Monitored Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hashtagsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : hashtags && hashtags.length > 0 ? (
              <div className="space-y-2">
                {hashtags.map((hashtag: {
                  id: number;
                  hashtag: string;
                  post_count: number | null;
                  is_active: boolean;
                  last_scraped_at: string | null;
                  notes: string | null;
                  tags: string[];
                }) => (
                  <div
                    key={hashtag.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Hash className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">#{hashtag.hashtag}</p>
                        {hashtag.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {hashtag.notes || 'No notes'}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">
                        {hashtag.post_count?.toLocaleString() || 'N/A'} posts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hashtag.last_scraped_at
                          ? `Scraped ${formatDistanceToNow(new Date(hashtag.last_scraped_at), { addSuffix: true })}`
                          : 'Never scraped'}
                      </p>
                    </div>
                    {hashtag.tags && hashtag.tags.length > 0 && (
                      <div className="flex gap-1">
                        {hashtag.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No target hashtags configured
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Last 24 Hours</span>
                  </div>
                  <p className="text-2xl font-bold">{activity?.posts?.last_24h || 0} posts</p>
                  <p className="text-sm text-muted-foreground">
                    {activity?.comments?.last_24h || 0} comments
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Last 7 Days</span>
                  </div>
                  <p className="text-2xl font-bold">{activity?.posts?.last_7d || 0} posts</p>
                  <p className="text-sm text-muted-foreground">
                    {activity?.comments?.last_7d || 0} comments
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Last 30 Days</span>
                  </div>
                  <p className="text-2xl font-bold">{activity?.posts?.last_30d || 0} posts</p>
                  <p className="text-sm text-muted-foreground">
                    {activity?.comments?.last_30d || 0} comments
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
