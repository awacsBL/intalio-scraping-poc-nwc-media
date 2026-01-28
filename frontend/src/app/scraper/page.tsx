'use client';

import { Header } from '@/components/layout/header';
import { JobForm } from '@/components/scraper/job-form';
import { JobQueue } from '@/components/scraper/job-queue';
import { useJobs, useStats, useJobHistory } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, MessageSquare, DollarSign, Clock } from 'lucide-react';

export default function ScraperPage() {
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useJobs();
  const { data: history, isLoading: historyLoading } = useJobHistory();
  const { data: stats, isLoading: statsLoading } = useStats();

  const runningJobs = jobs?.filter((j) => j.status === 'running').length ?? 0;
  const queuedJobs = jobs?.filter((j) => j.status === 'queued').length ?? 0;

  return (
    <>
      <Header
        title="Job Manager"
        subtitle="Configure and monitor scraping jobs"
      />
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Jobs
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{runningJobs}</span>
                  {queuedJobs > 0 && (
                    <Badge variant="secondary">{queuedJobs} queued</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Posts Collected
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <span className="text-2xl font-bold">
                  {stats?.total_posts.toLocaleString() ?? 0}
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comments Collected
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <span className="text-2xl font-bold">
                  {stats?.total_comments.toLocaleString() ?? 0}
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Est. API Cost
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    ${(
                      ((stats?.total_posts ?? 0) * 0.0023 +
                        (stats?.total_comments ?? 0) * 0.0023)
                    ).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ~$2.30/1000 items
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Job Form */}
          <JobForm />

          {/* Job Queue */}
          <JobQueue
            jobs={jobs ?? []}
            history={history ?? []}
            isLoading={jobsLoading || historyLoading}
            onRefresh={() => refetchJobs()}
          />
        </div>

        {/* Rate Limit Warning */}
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-700 dark:text-yellow-500">
                Rate Limit Information
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Instagram may rate-limit requests if too many are made in a short period.
                It&apos;s recommended to keep scraping jobs under 200 posts per hashtag and wait
                at least 30 seconds between jobs. The scraper uses proxies and retry logic
                to minimize rate limiting issues.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
