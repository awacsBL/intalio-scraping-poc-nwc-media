'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Heart,
  MessageCircle,
  ExternalLink,
  User,
  Calendar,
  Image as ImageIcon,
  Film,
  Layers,
  Play,
  Hash,
  AtSign,
  Loader2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSummarizePost, useAnalyzePostSentiment } from '@/hooks/useApi';
import {
  SentimentBadge,
  AIResultCard,
  SummaryDisplay,
} from '@/components/ai/ai-actions';
import type { Post, SummarizePostResponse, PostSentimentResponse } from '@/types';

interface PostDetailProps {
  post: Post | undefined;
  isLoading?: boolean;
}

const typeIcons = {
  Photo: ImageIcon,
  Video: Film,
  Carousel: Layers,
  Reel: Play,
};

export function PostDetail({ post, isLoading }: PostDetailProps) {
  const [summaryResult, setSummaryResult] = useState<SummarizePostResponse | null>(null);
  const [sentimentResult, setSentimentResult] = useState<PostSentimentResponse | null>(null);

  const summarizePostMutation = useSummarizePost();
  const analyzePostSentimentMutation = useAnalyzePostSentiment();

  const handleSummarize = async () => {
    if (!post) return;
    try {
      const result = await summarizePostMutation.mutateAsync({
        postId: post.id,
        prioritizeEngagement: true,
      });
      setSummaryResult(result);
      toast.success('Comments summarized successfully');
    } catch {
      toast.error('Failed to summarize comments');
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!post) return;
    try {
      const result = await analyzePostSentimentMutation.mutateAsync(post.id);
      setSentimentResult(result);
      toast.success('Sentiment analysis complete');
    } catch {
      toast.error('Failed to analyze sentiment');
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const TypeIcon = typeIcons[post.post_type] || ImageIcon;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Media */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-muted">
              {post.display_url ? (
                <Image
                  src={post.display_url}
                  alt={post.caption?.slice(0, 50) || 'Instagram post'}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <TypeIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Type badge */}
              <Badge className="absolute top-4 left-4" variant="secondary">
                <TypeIcon className="h-4 w-4 mr-1" />
                {post.post_type}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Heart className="h-5 w-5 text-red-500" />
                  {post.likes_count.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  {post.comments_count.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {((post.likes_count + post.comments_count) / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Details */}
      <div className="space-y-4">
        {/* Author Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Post Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">@{post.owner_username}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {post.owner_id}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Instagram
                </a>
              </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Posted:</span>
                <span>{format(new Date(post.timestamp), 'PP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{post.source}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Caption */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Caption</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {post.caption || 'No caption'}
            </p>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Mentions */}
            {post.mentions && post.mentions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <AtSign className="h-4 w-4" />
                  Mentions
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.mentions.map((mention) => (
                    <Badge key={mention} variant="outline" className="text-xs">
                      @{mention}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={summarizePostMutation.isPending || post.comments_count === 0}
              >
                {summarizePostMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Summarize Comments
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeSentiment}
                disabled={analyzePostSentimentMutation.isPending || post.comments_count === 0}
              >
                {analyzePostSentimentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Analyze Sentiment
              </Button>
            </div>

            {/* Summary Result */}
            {summaryResult && (
              <AIResultCard title="Comments Summary">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Based on {summaryResult.comment_count} comments
                  </p>
                  <SummaryDisplay summary={summaryResult.summary} />
                </div>
              </AIResultCard>
            )}

            {/* Sentiment Result */}
            {sentimentResult && (
              <AIResultCard title="Aggregated Sentiment">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Overall:</span>
                    <SentimentBadge label={sentimentResult.overall_label} />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{sentimentResult.sentiment_breakdown.positive}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {sentimentResult.sentiment_breakdown.neutral}
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      -{sentimentResult.sentiment_breakdown.negative}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {sentimentResult.comment_count} comments
                  </p>
                </div>
              </AIResultCard>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {post.ai_results && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                AI Analysis
                <Badge variant="secondary" className="text-xs">
                  Processed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sentiment */}
              {post.ai_results.sentiment && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Sentiment
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full',
                          post.ai_results.sentiment.label === 'positive' &&
                            'bg-green-500',
                          post.ai_results.sentiment.label === 'neutral' &&
                            'bg-gray-500',
                          post.ai_results.sentiment.label === 'negative' &&
                            'bg-red-500'
                        )}
                      />
                      <span className="font-medium capitalize">
                        {post.ai_results.sentiment.label}
                      </span>
                      {post.ai_results.sentiment.confidence && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            post.ai_results.sentiment.confidence >= 0.8 &&
                              'border-green-500 text-green-600',
                            post.ai_results.sentiment.confidence >= 0.5 &&
                              post.ai_results.sentiment.confidence < 0.8 &&
                              'border-yellow-500 text-yellow-600',
                            post.ai_results.sentiment.confidence < 0.5 &&
                              'border-red-500 text-red-600'
                          )}
                        >
                          {Math.round(post.ai_results.sentiment.confidence * 100)}%
                          confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {post.ai_results.summary && (
                <div>
                  <span className="text-sm text-muted-foreground">Summary</span>
                  <p className="text-sm mt-1 bg-muted/50 p-3 rounded-md">
                    {post.ai_results.summary}
                  </p>
                </div>
              )}
              {/* Comment Summary */}
              {post.ai_results.comment_summary && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Comments Summary ({post.ai_results.comment_summary.comment_count} of {post.ai_results.comment_summary.total_comments} comments)
                  </span>
                  <p className="text-sm mt-1 bg-muted/50 p-3 rounded-md">
                    {post.ai_results.comment_summary.summary}
                  </p>
                </div>
              )}

              {/* Topics */}
              {post.ai_results.topics && post.ai_results.topics.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Detected Topics
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.ai_results.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Language */}
              {post.ai_results.language && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Language:</span>
                  <Badge variant="secondary">
                    {post.ai_results.language.toUpperCase()}
                  </Badge>
                </div>
              )}

              {/* Emotions */}
              {post.ai_results.emotions && post.ai_results.emotions.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Emotions</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.ai_results.emotions.map((emotion) => (
                      <Badge key={emotion} variant="secondary" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
