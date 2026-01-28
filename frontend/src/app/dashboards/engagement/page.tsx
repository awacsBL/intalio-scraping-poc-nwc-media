'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useEngagementOverview,
  useEngagementByPostType,
  useTopPostsByLikes,
  useTopPostsByComments,
} from '@/hooks/useApi';
import {
  Heart,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Film,
  Layers,
  Play,
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
import Image from 'next/image';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const typeIcons: Record<string, React.ElementType> = {
  Photo: ImageIcon,
  Video: Film,
  Carousel: Layers,
  Reel: Play,
};

export default function EngagementDashboard() {
  const { data: overview, isLoading: overviewLoading } = useEngagementOverview();
  const { data: byPostType, isLoading: typeLoading } = useEngagementByPostType();
  const { data: topByLikes, isLoading: likesLoading } = useTopPostsByLikes(5);
  const { data: topByComments, isLoading: commentsLoading } = useTopPostsByComments(5);

  return (
    <>
      <Header
        title="Engagement Analytics"
        subtitle="Track likes, comments, and overall engagement metrics"
      />
      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {overview?.total_likes?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {overview?.avg_likes_per_post?.toLocaleString() || 0} per post
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {overview?.total_comments?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {overview?.avg_comments_per_post?.toLocaleString() || 0} per post
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {overview?.engagement_rate?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Interactions per post
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {overview?.total_posts?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max likes: {overview?.max_likes?.toLocaleString() || 0}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Engagement by Post Type Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Post Type</CardTitle>
            </CardHeader>
            <CardContent>
              {typeLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : byPostType && byPostType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byPostType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="post_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_likes" fill="#ef4444" name="Avg Likes" />
                    <Bar dataKey="avg_comments" fill="#3b82f6" name="Avg Comments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Type Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Post Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {typeLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : byPostType && byPostType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={byPostType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ post_type, percent }) =>
                        `${post_type} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {byPostType.map((entry: { post_type: string }, index: number) => (
                        <Cell key={entry.post_type} fill={COLORS[index % COLORS.length]} />
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
        </div>

        {/* Top Posts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top by Likes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Top Posts by Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {likesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : topByLikes && topByLikes.length > 0 ? (
                <div className="space-y-3">
                  {topByLikes.map((post: {
                    post_id: string;
                    display_url: string;
                    owner_username: string;
                    post_type: string;
                    likes_count: number;
                    comments_count: number;
                  }, index: number) => {
                    const TypeIcon = typeIcons[post.post_type] || ImageIcon;
                    return (
                      <div
                        key={post.post_id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                      >
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={post.display_url}
                            alt="Post"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            @{post.owner_username}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TypeIcon className="h-3 w-3" />
                            {post.post_type}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-500">
                            {post.likes_count.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.comments_count.toLocaleString()} comments
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No posts yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top by Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Top Posts by Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : topByComments && topByComments.length > 0 ? (
                <div className="space-y-3">
                  {topByComments.map((post: {
                    post_id: string;
                    display_url: string;
                    owner_username: string;
                    post_type: string;
                    likes_count: number;
                    comments_count: number;
                  }, index: number) => {
                    const TypeIcon = typeIcons[post.post_type] || ImageIcon;
                    return (
                      <div
                        key={post.post_id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                      >
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={post.display_url}
                            alt="Post"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            @{post.owner_username}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TypeIcon className="h-3 w-3" />
                            {post.post_type}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-500">
                            {post.comments_count.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.likes_count.toLocaleString()} likes
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No posts yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
