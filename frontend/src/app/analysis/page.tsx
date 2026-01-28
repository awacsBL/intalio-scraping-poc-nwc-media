'use client';

import { Header } from '@/components/layout/header';
import { PostCard } from '@/components/explorer/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePosts } from '@/hooks/useApi';
import { BarChart3 } from 'lucide-react';

export default function AnalysisPage() {
  const { data: posts, isLoading } = usePosts({ hasAiResults: true });

  return (
    <>
      <Header
        title="Analysis"
        subtitle="Select a post to view detailed AI analysis"
      />
      <div className="p-6">
        {/* Info Card */}
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Deep Dive Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Click on any post below to view detailed AI analysis including sentiment,
                topics, and comment breakdown.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Posts with AI Results */}
        <h2 className="text-lg font-semibold mb-4">Posts with AI Analysis</h2>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} viewMode="grid" />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No analyzed posts yet</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
                Scrape some posts and run AI analysis to see them here.
                Go to the Job Manager to start scraping.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
