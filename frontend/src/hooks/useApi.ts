import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import type {
  PostFilters,
  ScrapeHashtagsRequest,
  ScrapeCommentsRequest,
  DiscoveryRequest,
  FullPipelineRequest,
} from '@/types';

// Stats
export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Health Check
export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.checkHealth,
    refetchInterval: 60000,
  });
};

// Posts
export const usePosts = (filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => api.getPosts(filters),
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.getPost(postId),
    enabled: !!postId,
  });
};

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => api.getPostComments(postId),
    enabled: !!postId,
  });
};

export const usePostTypes = () => {
  return useQuery({
    queryKey: ['post-types'],
    queryFn: api.getPostTypes,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Jobs
export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: api.getJobs,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });
};

export const useJobHistory = (limit: number = 50) => {
  return useQuery({
    queryKey: ['job-history', limit],
    queryFn: () => api.getJobHistory(limit),
    refetchInterval: 10000,
  });
};

export const useUpdateJobSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: any }) =>
      api.updateJobSchedule(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

// Scraping Mutations
export const useScrapeHashtags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ScrapeHashtagsRequest) => api.scrapeHashtags(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useScrapeComments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ScrapeCommentsRequest) => api.scrapeComments(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useDiscoveryPipeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DiscoveryRequest) => api.runDiscoveryPipeline(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useFullPipeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: FullPipelineRequest) => api.runFullPipeline(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useDiscoverAndSave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DiscoveryRequest & { priority?: number; limit_users?: number; limit_hashtags?: number; notes?: string }) =>
      api.discoverAndSave({
        search_term: request.search_term,
        priority: request.priority,
        limit_users: request.limit_users || request.limit,
        limit_hashtags: request.limit_hashtags || 10,
        notes: request.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['target-users'] });
      queryClient.invalidateQueries({ queryKey: ['target-hashtags'] });
    },
  });
};

// Targets
export const useTargetUsers = () => {
  return useQuery({
    queryKey: ['target-users'],
    queryFn: () => api.getTargetUsers(false),
  });
};

export const useTargetHashtags = () => {
  return useQuery({
    queryKey: ['target-hashtags'],
    queryFn: () => api.getTargetHashtags(false),
  });
};

// Analytics
export const useSentimentBreakdown = () => {
  return useQuery({
    queryKey: ['sentiment-breakdown'],
    queryFn: api.getSentimentBreakdown,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useTopHashtags = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-hashtags', limit],
    queryFn: () => api.getTopHashtags(limit),
    refetchInterval: 60000,
  });
};

export const useTopTopics = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-topics', limit],
    queryFn: () => api.getTopTopics(limit),
    refetchInterval: 60000,
  });
};

// Engagement Analytics
export const useEngagementOverview = () => {
  return useQuery({
    queryKey: ['engagement-overview'],
    queryFn: api.getEngagementOverview,
    refetchInterval: 60000,
  });
};

export const useEngagementByPostType = () => {
  return useQuery({
    queryKey: ['engagement-by-post-type'],
    queryFn: api.getEngagementByPostType,
    refetchInterval: 60000,
  });
};

export const useTopPostsByLikes = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-posts-likes', limit],
    queryFn: () => api.getTopPostsByLikes(limit),
    refetchInterval: 60000,
  });
};

export const useTopPostsByComments = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-posts-comments', limit],
    queryFn: () => api.getTopPostsByComments(limit),
    refetchInterval: 60000,
  });
};

// Time-based Analytics
export const usePostsOverTime = (groupBy: string = 'day', days: number = 30) => {
  return useQuery({
    queryKey: ['posts-over-time', groupBy, days],
    queryFn: () => api.getPostsOverTime(groupBy, days),
    refetchInterval: 60000,
  });
};

export const usePostingHours = () => {
  return useQuery({
    queryKey: ['posting-hours'],
    queryFn: api.getPostingHours,
    refetchInterval: 60000,
  });
};

export const usePostingDays = () => {
  return useQuery({
    queryKey: ['posting-days'],
    queryFn: api.getPostingDays,
    refetchInterval: 60000,
  });
};

// Author Analytics
export const useTopAuthors = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-authors', limit],
    queryFn: () => api.getTopAuthors(limit),
    refetchInterval: 60000,
  });
};

export const useTopAuthorsByEngagement = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-authors-engagement', limit],
    queryFn: () => api.getTopAuthorsByEngagement(limit),
    refetchInterval: 60000,
  });
};

export const useAuthorActivity = (username: string) => {
  return useQuery({
    queryKey: ['author-activity', username],
    queryFn: () => api.getAuthorActivity(username),
    enabled: !!username,
  });
};

// Comment Analytics
export const useCommentStats = () => {
  return useQuery({
    queryKey: ['comment-stats'],
    queryFn: api.getCommentStats,
    refetchInterval: 60000,
  });
};

export const useTopCommenters = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-commenters', limit],
    queryFn: () => api.getTopCommenters(limit),
    refetchInterval: 60000,
  });
};

export const useCommentSentimentBreakdown = () => {
  return useQuery({
    queryKey: ['comment-sentiment'],
    queryFn: api.getCommentSentimentBreakdown,
    refetchInterval: 60000,
  });
};

// Content Analytics
export const useContentSources = () => {
  return useQuery({
    queryKey: ['content-sources'],
    queryFn: api.getContentSources,
    refetchInterval: 60000,
  });
};

export const useCaptionLengthAnalysis = () => {
  return useQuery({
    queryKey: ['caption-length'],
    queryFn: api.getCaptionLengthAnalysis,
    refetchInterval: 60000,
  });
};

export const useMentionsAnalysis = (limit: number = 20) => {
  return useQuery({
    queryKey: ['mentions', limit],
    queryFn: () => api.getMentionsAnalysis(limit),
    refetchInterval: 60000,
  });
};

// AI Analytics
export const useAiCoverage = () => {
  return useQuery({
    queryKey: ['ai-coverage'],
    queryFn: api.getAiCoverage,
    refetchInterval: 60000,
  });
};

export const useSentimentBySource = () => {
  return useQuery({
    queryKey: ['sentiment-by-source'],
    queryFn: api.getSentimentBySource,
    refetchInterval: 60000,
  });
};

export const useSentimentTrend = (days: number = 30) => {
  return useQuery({
    queryKey: ['sentiment-trend', days],
    queryFn: () => api.getSentimentTrend(days),
    refetchInterval: 60000,
  });
};

// Targets Analytics
export const useTargetsOverview = () => {
  return useQuery({
    queryKey: ['targets-overview'],
    queryFn: api.getTargetsOverview,
    refetchInterval: 60000,
  });
};

export const useScrapingActivity = () => {
  return useQuery({
    queryKey: ['scraping-activity'],
    queryFn: api.getScrapingActivity,
    refetchInterval: 30000,
  });
};

// AI Summarization Mutations
export const useSummarizePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      prioritizeEngagement = true,
    }: {
      postId: number;
      prioritizeEngagement?: boolean;
    }) => api.summarizePostComments(postId, prioritizeEngagement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['ai-coverage'] });
    },
  });
};

export const useSummarizeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => api.summarizeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
    },
  });
};

export const useSummarizePeriod = () => {
  return useMutation({
    mutationFn: (days: number) => api.summarizePeriod(days),
  });
};

// AI Sentiment Analysis Mutations
export const useAnalyzeCommentSentiment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => api.analyzeCommentSentiment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['comment-sentiment'] });
    },
  });
};

export const useAnalyzePostSentiment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => api.analyzePostSentiment(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-breakdown'] });
    },
  });
};

export const useBatchAnalyzeSentiment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchSize: number) => api.batchAnalyzeSentiment(batchSize),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['comment-sentiment'] });
      queryClient.invalidateQueries({ queryKey: ['ai-coverage'] });
    },
  });
};

export const useBatchAnalyzePostsSentiment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchSize: number) => api.batchAnalyzePostsSentiment(batchSize),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['ai-coverage'] });
    },
  });
};

// Weekly Reports
export const useWeeklyReports = (limit: number = 10) => {
  return useQuery({
    queryKey: ['weekly-reports', limit],
    queryFn: () => api.getWeeklyReports(limit),
    refetchInterval: 60000,
  });
};

export const useWeeklyReport = (year: number, weekNumber: number) => {
  return useQuery({
    queryKey: ['weekly-report', year, weekNumber],
    queryFn: () => api.getWeeklyReport(year, weekNumber),
    enabled: !!year && !!weekNumber,
  });
};

export const useGenerateWeeklyReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, weekNumber }: { year: number; weekNumber: number }) =>
      api.generateWeeklyReport(year, weekNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-reports'] });
    },
  });
};
