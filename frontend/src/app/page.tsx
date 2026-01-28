'use client';

import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/dashboard/stat-card';
import { SentimentChart } from '@/components/dashboard/sentiment-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { TopTrends } from '@/components/dashboard/top-trends';
import { AIStatus } from '@/components/dashboard/ai-status';
import {
  useStats,
  useSentimentBreakdown,
  useTopHashtags,
  useTopTopics,
  useTargetUsers,
  useJobHistory,
} from '@/hooks/useApi';
import {
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
} from 'lucide-react';
import type { ActivityItem, JobExecution } from '@/types';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: sentiment, isLoading: sentimentLoading } = useSentimentBreakdown();
  const { data: hashtags, isLoading: hashtagsLoading } = useTopHashtags(5);
  const { data: topics, isLoading: topicsLoading } = useTopTopics(8);
  const { data: targetUsers } = useTargetUsers();
  const { data: jobHistory } = useJobHistory(10);

  const isLoading = statsLoading || sentimentLoading;

  // Use real sentiment data from backend, fallback to zeros
  const sentimentData = {
    positive: sentiment?.positive ?? 0,
    neutral: sentiment?.neutral ?? 0,
    negative: sentiment?.negative ?? 0,
  };

  // Use real hashtags from backend, fallback to empty array
  const hashtagData = hashtags ?? [];

  // Use real topics from backend, fallback to empty array
  const topicData = topics ?? [];

  // Count active target users
  const activeTargets = targetUsers?.length ?? 0;

  // Map job history to activities
  const recentActivities: ActivityItem[] = jobHistory?.map((job: JobExecution) => ({
    id: job.id.toString(),
    type: 'scrape',
    message: `${job.status === 'completed' ? 'Finished' : 'Started'} job: ${job.target || job.job_id}`,
    timestamp: job.completed_at || job.started_at,
    status: job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'info',
  })) ?? [];

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Overview of your Instagram analytics"
      />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Posts"
            value={stats?.total_posts ?? 0}
            description="posts collected"
            icon={FileText}
            isLoading={statsLoading}
          />
          <StatCard
            title="Total Comments"
            value={stats?.total_comments ?? 0}
            description="comments scraped"
            icon={MessageSquare}
            isLoading={statsLoading}
          />
          <StatCard
            title="Accounts Monitored"
            value={activeTargets}
            description="active targets"
            icon={Users}
            isLoading={statsLoading}
          />
          <StatCard
            title="AI Analyzed"
            value={`${stats?.posts_with_ai_results ?? 0} / ${stats?.total_posts ?? 0}`}
            description="posts processed"
            icon={TrendingUp}
            isLoading={statsLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SentimentChart data={sentimentData} isLoading={isLoading} />
              <AIStatus
                totalPosts={stats?.total_posts ?? 0}
                postsWithAI={stats?.posts_with_ai_results ?? 0}
                totalComments={stats?.total_comments ?? 0}
                commentsWithAI={stats?.comments_with_ai_results ?? 0}
                isLoading={statsLoading}
              />
            </div>
            <TopTrends
              hashtags={hashtagData}
              topics={topicData}
              isLoading={hashtagsLoading || topicsLoading}
            />
          </div>

          {/* Right Column - Activity */}
          <div>
            <ActivityFeed activities={recentActivities} isLoading={statsLoading} />
          </div>
        </div>
      </div>
    </>
  );
}
