'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, TrendingUp } from 'lucide-react';

interface TopTrendsProps {
  hashtags: { hashtag: string; count: number }[];
  topics: { topic: string; count: number }[];
  isLoading?: boolean;
}

export function TopTrends({ hashtags, topics, isLoading }: TopTrendsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Top Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Hashtags */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
            <Hash className="h-3 w-3" />
            Hashtags
          </h4>
          <div className="space-y-2">
            {hashtags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hashtags found</p>
            ) : (
              hashtags.slice(0, 5).map((item, index) => (
                <div
                  key={item.hashtag}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium">#{item.hashtag}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Topics */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            AI-Detected Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {topics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No topics detected</p>
            ) : (
              topics.slice(0, 8).map((item) => (
                <Badge key={item.topic} variant="outline" className="text-xs">
                  {item.topic}
                  <span className="ml-1 text-muted-foreground">({item.count})</span>
                </Badge>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
