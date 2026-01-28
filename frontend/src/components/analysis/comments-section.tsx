'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Heart,
  User,
  ThumbsUp,
  ThumbsDown,
  Minus,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSummarizeComment, useAnalyzeCommentSentiment } from '@/hooks/useApi';
import { SentimentBadge } from '@/components/ai/ai-actions';
import type { Comment } from '@/types';

interface CommentsSectionProps {
  comments: Comment[];
  isLoading?: boolean;
}

interface CommentItemProps {
  comment: Comment;
}

const LONG_COMMENT_THRESHOLD = 100;

function CommentItem({ comment }: CommentItemProps) {
  const [localSummary, setLocalSummary] = useState<string | null>(null);
  const [localSentiment, setLocalSentiment] = useState<{
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  } | null>(null);

  const summarizeMutation = useSummarizeComment();
  const analyzeSentimentMutation = useAnalyzeCommentSentiment();

  const sentiment = localSentiment || comment.ai_results?.sentiment;
  const summary = localSummary || comment.ai_results?.summary;
  const isLongComment = comment.comment_text.length >= LONG_COMMENT_THRESHOLD;
  const hasSentiment = !!sentiment;

  const handleSummarize = async () => {
    try {
      const result = await summarizeMutation.mutateAsync(comment.id);
      setLocalSummary(result.summary);
      toast.success('Comment summarized');
    } catch {
      toast.error('Failed to summarize comment');
    }
  };

  const handleAnalyzeSentiment = async () => {
    try {
      const result = await analyzeSentimentMutation.mutateAsync(comment.id);
      setLocalSentiment(result.sentiment);
      toast.success('Sentiment analyzed');
    } catch {
      toast.error('Failed to analyze sentiment');
    }
  };

  return (
    <TooltipProvider>
      <div className="p-4 border-b last:border-0">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">@{comment.owner_username}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.timestamp), {
                  addSuffix: true,
                })}
              </span>
              {sentiment && (
                <SentimentBadge
                  label={sentiment.label}
                  score={sentiment.score}
                  size="sm"
                />
              )}
            </div>
            <p className="text-sm mt-1" dir="auto">
              {comment.comment_text}
            </p>

            {/* AI Summary */}
            {summary && (
              <p
                className="text-xs text-muted-foreground mt-2 italic bg-muted/50 px-2 py-1 rounded"
                dir="auto"
              >
                AI: {summary}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                {comment.likes_count}
              </div>
              {comment.ai_results?.language && (
                <Badge variant="outline" className="text-xs h-5">
                  {comment.ai_results.language.toUpperCase()}
                </Badge>
              )}

              {/* AI Action Buttons */}
              <div className="flex items-center gap-1 ml-auto">
                {isLongComment && !summary && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleSummarize}
                        disabled={summarizeMutation.isPending}
                      >
                        {summarizeMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Summarize comment</TooltipContent>
                  </Tooltip>
                )}
                {!hasSentiment && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleAnalyzeSentiment}
                        disabled={analyzeSentimentMutation.isPending}
                      >
                        {analyzeSentimentMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Analyze sentiment</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function CommentsSection({ comments, isLoading }: CommentsSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group comments by sentiment
  const positiveComments = comments.filter(
    (c) => c.ai_results?.sentiment?.label === 'positive'
  );
  const neutralComments = comments.filter(
    (c) => c.ai_results?.sentiment?.label === 'neutral'
  );
  const negativeComments = comments.filter(
    (c) => c.ai_results?.sentiment?.label === 'negative'
  );
  const unanalyzedComments = comments.filter((c) => !c.ai_results?.sentiment);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments Analysis
          <Badge variant="secondary">{comments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all">
          <div className="px-4 border-b">
            <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                All ({comments.length})
              </TabsTrigger>
              <TabsTrigger
                value="positive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent"
              >
                <ThumbsUp className="h-3 w-3 mr-1 text-green-500" />
                Positive ({positiveComments.length})
              </TabsTrigger>
              <TabsTrigger
                value="neutral"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-500 data-[state=active]:bg-transparent"
              >
                <Minus className="h-3 w-3 mr-1 text-gray-500" />
                Neutral ({neutralComments.length})
              </TabsTrigger>
              <TabsTrigger
                value="negative"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent"
              >
                <ThumbsDown className="h-3 w-3 mr-1 text-red-500" />
                Negative ({negativeComments.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            <TabsContent value="all" className="m-0">
              {comments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No comments collected yet
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItem key={comment.comment_id} comment={comment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="positive" className="m-0">
              {positiveComments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No positive comments
                </p>
              ) : (
                positiveComments.map((comment) => (
                  <CommentItem key={comment.comment_id} comment={comment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="neutral" className="m-0">
              {neutralComments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No neutral comments
                </p>
              ) : (
                neutralComments.map((comment) => (
                  <CommentItem key={comment.comment_id} comment={comment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="negative" className="m-0">
              {negativeComments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No negative comments
                </p>
              ) : (
                negativeComments.map((comment) => (
                  <CommentItem key={comment.comment_id} comment={comment} />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Sentiment Summary */}
        {comments.length > 0 && (
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sentiment Distribution</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>
                    {Math.round((positiveComments.length / comments.length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  <span>
                    {Math.round((neutralComments.length / comments.length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>
                    {Math.round((negativeComments.length / comments.length) * 100)}%
                  </span>
                </div>
                {unanalyzedComments.length > 0 && (
                  <span className="text-muted-foreground">
                    ({unanalyzedComments.length} unanalyzed)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
