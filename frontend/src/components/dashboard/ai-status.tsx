'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, CheckCircle, Clock } from 'lucide-react';

interface AIStatusProps {
  totalPosts: number;
  postsWithAI: number;
  totalComments: number;
  commentsWithAI: number;
  isLoading?: boolean;
}

export function AIStatus({
  totalPosts,
  postsWithAI,
  totalComments,
  commentsWithAI,
  isLoading,
}: AIStatusProps) {
  const postsProgress = totalPosts > 0 ? (postsWithAI / totalPosts) * 100 : 0;
  const commentsProgress =
    totalComments > 0 ? (commentsWithAI / totalComments) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Posts Processing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Posts Analyzed</span>
            <span className="font-medium">
              {postsWithAI} / {totalPosts}
            </span>
          </div>
          <Progress value={postsProgress} className="h-2" />
          <div className="flex justify-between">
            <Badge
              variant={postsProgress === 100 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {postsProgress === 100 ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.round(postsProgress)}% Done
                </>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {totalPosts - postsWithAI} pending
            </span>
          </div>
        </div>

        {/* Comments Processing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Comments Analyzed</span>
            <span className="font-medium">
              {commentsWithAI} / {totalComments}
            </span>
          </div>
          <Progress value={commentsProgress} className="h-2" />
          <div className="flex justify-between">
            <Badge
              variant={commentsProgress === 100 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {commentsProgress === 100 ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.round(commentsProgress)}% Done
                </>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {totalComments - commentsWithAI} pending
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
