'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useSummarizePeriod,
  useBatchAnalyzeSentiment,
  useBatchAnalyzePostsSentiment,
  useAiCoverage,
} from '@/hooks/useApi';
import {
  SentimentBadge,
  AIResultCard,
  SummaryDisplay,
} from '@/components/ai/ai-actions';
import {
  Brain,
  FileText,
  Sparkles,
  Loader2,
  Calendar,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PeriodSummaryResponse, BatchSentimentResponse, BatchPostSentimentResponse } from '@/types';

export default function AIServicesPage() {
  const [periodDays, setPeriodDays] = useState('7');
  const [batchSize, setBatchSize] = useState('50');
  const [postBatchSize, setPostBatchSize] = useState('50');
  const [periodResult, setPeriodResult] = useState<PeriodSummaryResponse | null>(null);
  const [batchResult, setBatchResult] = useState<BatchSentimentResponse | null>(null);
  const [postBatchResult, setPostBatchResult] = useState<BatchPostSentimentResponse | null>(null);

  const { data: coverage, isLoading: coverageLoading } = useAiCoverage();
  const summarizePeriodMutation = useSummarizePeriod();
  const batchSentimentMutation = useBatchAnalyzeSentiment();
  const batchPostsSentimentMutation = useBatchAnalyzePostsSentiment();

  const handleSummarizePeriod = async () => {
    try {
      const result = await summarizePeriodMutation.mutateAsync(parseInt(periodDays));
      setPeriodResult(result);
      toast.success('Period summary generated successfully');
    } catch {
      toast.error('Failed to generate period summary');
    }
  };

  const handleBatchSentiment = async () => {
    try {
      const result = await batchSentimentMutation.mutateAsync(parseInt(batchSize));
      setBatchResult(result);
      toast.success(`Analyzed sentiment for ${result.processed} comments`);
    } catch {
      toast.error('Failed to run batch sentiment analysis');
    }
  };

  const handleBatchPostsSentiment = async () => {
    try {
      const result = await batchPostsSentimentMutation.mutateAsync(parseInt(postBatchSize));
      setPostBatchResult(result);
      toast.success(`Analyzed sentiment for ${result.processed} posts`);
    } catch {
      toast.error('Failed to run batch post sentiment analysis');
    }
  };

  const pendingCount =
    (coverage?.posts?.pending || 0) + (coverage?.comments?.pending || 0);

  return (
    <>
      <Header
        title="AI Services"
        subtitle="Run AI summarization and sentiment analysis on your data"
      />
      <div className="p-6 space-y-6">
        {/* AI Coverage Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Analyzed</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {coverage?.posts?.analyzed?.toLocaleString() || 0}
                  </div>
                  <Progress
                    value={coverage?.posts?.coverage_percent || 0}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {coverage?.posts?.coverage_percent || 0}% of {coverage?.posts?.total || 0} posts
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments Analyzed</CardTitle>
              <MessageCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {coverage?.comments?.analyzed?.toLocaleString() || 0}
                  </div>
                  <Progress
                    value={coverage?.comments?.coverage_percent || 0}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {coverage?.comments?.coverage_percent || 0}% of{' '}
                    {coverage?.comments?.total || 0} comments
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Analysis</CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{pendingCount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {coverage?.posts?.pending || 0} posts, {coverage?.comments?.pending || 0}{' '}
                    comments
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Operations */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Period Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Period Summary
              </CardTitle>
              <CardDescription>
                Generate an AI summary of all content from a specific time period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Time Period</Label>
                <Select value={periodDays} onValueChange={setPeriodDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleSummarizePeriod}
                disabled={summarizePeriodMutation.isPending}
              >
                {summarizePeriodMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>

              {/* Period Summary Result */}
              {periodResult && (
                <AIResultCard title="Generated Summary" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{periodResult.post_count} posts</span>
                      <span>{periodResult.comment_count} comments</span>
                    </div>
                    <SummaryDisplay summary={periodResult.summary} />
                    {periodResult.sentiment_breakdown && (
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-muted-foreground">Sentiment:</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +{periodResult.sentiment_breakdown.positive}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          {periodResult.sentiment_breakdown.neutral}
                        </Badge>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          -{periodResult.sentiment_breakdown.negative}
                        </Badge>
                      </div>
                    )}
                  </div>
                </AIResultCard>
              )}
            </CardContent>
          </Card>

          {/* Batch Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Batch Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Analyze sentiment for unprocessed comments in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Batch Size</Label>
                <Select value={batchSize} onValueChange={setBatchSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 comments</SelectItem>
                    <SelectItem value="50">50 comments</SelectItem>
                    <SelectItem value="100">100 comments</SelectItem>
                    <SelectItem value="200">200 comments</SelectItem>
                    <SelectItem value="500">500 comments</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {coverage?.comments?.pending || 0} comments pending analysis
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleBatchSentiment}
                disabled={batchSentimentMutation.isPending || pendingCount === 0}
              >
                {batchSentimentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Batch Analysis
                  </>
                )}
              </Button>

              {/* Batch Result */}
              {batchResult && (
                <AIResultCard title="Batch Results" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        Processed {batchResult.processed} comments
                      </span>
                    </div>
                    {batchResult.results && batchResult.results.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {batchResult.results.slice(0, 5).map((result) => (
                          <div
                            key={result.comment_id}
                            className="flex items-center justify-between text-sm p-2 bg-background rounded"
                          >
                            <span className="truncate flex-1 mr-2">{result.text_preview}</span>
                            <SentimentBadge
                              label={result.sentiment.label}
                              score={result.sentiment.score}
                              size="sm"
                            />
                          </div>
                        ))}
                        {batchResult.results.length > 5 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{batchResult.results.length - 5} more results
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </AIResultCard>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Batch Post Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Batch Post Sentiment Analysis
            </CardTitle>
            <CardDescription>
              Analyze sentiment for unprocessed posts (captions) in bulk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Batch Size</Label>
                <Select value={postBatchSize} onValueChange={setPostBatchSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 posts</SelectItem>
                    <SelectItem value="50">50 posts</SelectItem>
                    <SelectItem value="100">100 posts</SelectItem>
                    <SelectItem value="200">200 posts</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {coverage?.posts?.pending || 0} posts pending analysis
                </p>
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={handleBatchPostsSentiment}
                  disabled={batchPostsSentimentMutation.isPending || (coverage?.posts?.pending || 0) === 0}
                >
                  {batchPostsSentimentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Posts...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Analyze Posts
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Post Batch Result */}
            {postBatchResult && (
              <AIResultCard title="Post Analysis Results" className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      Processed {postBatchResult.processed} posts
                    </span>
                  </div>
                  {postBatchResult.results && postBatchResult.results.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {postBatchResult.results.slice(0, 5).map((result, idx) => (
                        <div
                          key={result.post_id || idx}
                          className="flex items-center justify-between text-sm p-2 bg-background rounded"
                        >
                          <span className="truncate flex-1 mr-2">{result.text_preview}</span>
                          <SentimentBadge
                            label={result.sentiment.label}
                            score={result.sentiment.score}
                            size="sm"
                          />
                        </div>
                      ))}
                      {postBatchResult.results.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{postBatchResult.results.length - 5} more results
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </AIResultCard>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              AI Analysis Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Arabic Summarization</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Summaries are generated using AraT5, optimized for Arabic text
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Multilingual Sentiment</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sentiment analysis works across Arabic, English, and other languages
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Long Comments Only</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Individual comment summarization requires 100+ characters
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
