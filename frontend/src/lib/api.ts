import axios from 'axios';
import type {
  Stats,
  Post,
  Comment,
  ScrapingJob,
  ScrapeHashtagsRequest,
  ScrapeCommentsRequest,
  DiscoveryRequest,
  FullPipelineRequest,
  PostFilters,
  TargetUser,
  TargetHashtag,
  SummarizePostResponse,
  SummarizeCommentResponse,
  PeriodSummaryResponse,
  CommentSentimentResponse,
  PostSentimentResponse,
  BatchSentimentResponse,
  BatchPostSentimentResponse,
  TargetPlace,
  AddTargetRequest,
  UpdateTargetRequest,
  DiscoverAndSaveRequest,
  UpdateJobScheduleRequest,
  JobExecution,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stats & Health
export const getStats = async (): Promise<Stats> => {
  const { data } = await api.get('/stats');
  return data;
};

export const checkHealth = async (): Promise<{ status: string; endpoints: string[] }> => {
  const { data } = await api.get('/');
  return data;
};

// Scraping Operations
export const scrapeHashtags = async (request: ScrapeHashtagsRequest) => {
  const { data } = await api.post('/scrape/hashtags', request);
  return data;
};

export const scrapeComments = async (request: ScrapeCommentsRequest) => {
  const { data } = await api.post('/scrape/comments', request);
  return data;
};

// Pipeline Operations
export const runDiscoveryPipeline = async (request: DiscoveryRequest) => {
  const { data } = await api.post('/pipeline/discovery', request);
  return data;
};

export const runFullPipeline = async (request: FullPipelineRequest) => {
  const { data } = await api.post('/pipeline/full', request);
  return data;
};

// Posts - Now using real backend endpoints
export const getPosts = async (filters?: PostFilters): Promise<Post[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  const { data } = await api.get(`/posts?${params.toString()}`);
  return data;
};

export const getPost = async (postId: string): Promise<Post> => {
  const { data } = await api.get(`/posts/${postId}`);
  return data;
};

export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const { data } = await api.get(`/posts/${postId}/comments`);
  return data;
};

export const getPostTypes = async (): Promise<string[]> => {
  const { data } = await api.get('/posts/types');
  return data;
};

// Jobs (still mock - would need WebSocket or polling implementation)
// Jobs
export const getJobs = async (): Promise<ScrapingJob[]> => {
  const { data } = await api.get('/jobs');
  return data;
};

export const getJobHistory = async (limit: number = 50): Promise<JobExecution[]> => {
  const { data } = await api.get(`/jobs/history?limit=${limit}`);
  return data;
};

export const updateJobSchedule = async (jobId: string, data: UpdateJobScheduleRequest) => {
  const { data: response } = await api.post(`/jobs/${jobId}/schedule`, data);
  return response;
};

// Targets - Using real backend endpoints
export const getTargetUsers = async (activeOnly: boolean = false): Promise<TargetUser[]> => {
  const { data } = await api.get(`/targets/users?active_only=${activeOnly}`);
  return data;
};

export const getTargetHashtags = async (activeOnly: boolean = false): Promise<TargetHashtag[]> => {
  const { data } = await api.get(`/targets/hashtags?active_only=${activeOnly}`);
  return data;
};

export const getTargetPlaces = async (activeOnly: boolean = false): Promise<TargetPlace[]> => {
  const { data } = await api.get(`/targets/places?active_only=${activeOnly}`);
  return data;
};

export const addTargets = async (request: AddTargetRequest): Promise<any> => {
  const { data } = await api.post('/targets/add', request);
  return data;
};

export const updateTarget = async (
  targetType: 'hashtag' | 'user' | 'place',
  identifier: string,
  request: UpdateTargetRequest
): Promise<any> => {
  const { data } = await api.patch(`/targets/${targetType}/${encodeURIComponent(identifier)}`, request);
  return data;
};

export const activateTarget = async (
  targetType: 'hashtag' | 'user' | 'place',
  identifier: string
): Promise<any> => {
  const { data } = await api.post(`/targets/${targetType}/${encodeURIComponent(identifier)}/activate`);
  return data;
};

export const deactivateTarget = async (
  targetType: 'hashtag' | 'user' | 'place',
  identifier: string
): Promise<any> => {
  const { data } = await api.post(`/targets/${targetType}/${encodeURIComponent(identifier)}/deactivate`);
  return data;
};

export const deleteTarget = async (
  targetType: 'hashtag' | 'user' | 'place',
  identifier: string
): Promise<any> => {
  const { data } = await api.delete(`/targets/${targetType}/${encodeURIComponent(identifier)}`);
  return data;
};

export const discoverAndSave = async (request: DiscoverAndSaveRequest): Promise<any> => {
  const { data } = await api.post('/targets/discover-and-save', request);
  return data;
};

// Analytics - New real endpoints
export const getSentimentBreakdown = async () => {
  const { data } = await api.get('/analytics/sentiment-breakdown');
  return data;
};

export const getTopHashtags = async (limit: number = 10) => {
  const { data } = await api.get(`/analytics/top-hashtags?limit=${limit}`);
  return data;
};

export const getTopTopics = async (limit: number = 10) => {
  const { data } = await api.get(`/analytics/top-topics?limit=${limit}`);
  return data;
};

// Engagement Analytics
export const getEngagementOverview = async () => {
  const { data } = await api.get('/analytics/engagement-overview');
  return data;
};

export const getEngagementByPostType = async () => {
  const { data } = await api.get('/analytics/engagement-by-post-type');
  return data;
};

export const getTopPostsByLikes = async (limit: number = 10) => {
  const { data } = await api.get(`/analytics/top-posts-by-likes?limit=${limit}`);
  return data;
};

export const getTopPostsByComments = async (limit: number = 10) => {
  const { data } = await api.get(`/analytics/top-posts-by-comments?limit=${limit}`);
  return data;
};

// Time-based Analytics
export const getPostsOverTime = async (groupBy: string = 'day', days: number = 30) => {
  const { data } = await api.get(`/analytics/posts-over-time?group_by=${groupBy}&days=${days}`);
  return data;
};

export const getPostingHours = async () => {
  const { data } = await api.get('/analytics/posting-hours');
  return data;
};

export const getPostingDays = async () => {
  const { data } = await api.get('/analytics/posting-days');
  return data;
};

// Author Analytics
export const getTopAuthors = async (limit: number = 10) => {
  const { data } = await api.get(`/analytics/top-authors?limit=${limit}`);
  return data;
};

export const getTopAuthorsByEngagement = async (limit: number = 10) => {
  const { data } = await api.get(`/analytics/top-authors-by-engagement?limit=${limit}`);
  return data;
};

export const getAuthorActivity = async (username: string) => {
  const { data } = await api.get(`/analytics/author-activity?username=${encodeURIComponent(username)}`);
  return data;
};

// Comment Analytics
export const getCommentStats = async () => {
  const { data } = await api.get('/analytics/comment-stats');
  return data;
};

export const getTopCommenters = async (limit: number = 10) => {
  const { data } = await api.get(`/analytics/top-commenters?limit=${limit}`);
  return data;
};

export const getCommentSentimentBreakdown = async () => {
  const { data } = await api.get('/analytics/comment-sentiment-breakdown');
  return data;
};

// Content Analytics
export const getContentSources = async () => {
  const { data } = await api.get('/analytics/content-sources');
  return data;
};

export const getCaptionLengthAnalysis = async () => {
  const { data } = await api.get('/analytics/caption-length-analysis');
  return data;
};

export const getMentionsAnalysis = async (limit: number = 20) => {
  const { data } = await api.get(`/analytics/mentions?limit=${limit}`);
  return data;
};

// AI Analytics
export const getAiCoverage = async () => {
  const { data } = await api.get('/analytics/ai-coverage');
  return data;
};

export const getSentimentBySource = async () => {
  const { data } = await api.get('/analytics/sentiment-by-source');
  return data;
};

export const getSentimentTrend = async (days: number = 30) => {
  const { data } = await api.get(`/analytics/sentiment-trend?days=${days}`);
  return data;
};

// Targets Analytics
export const getTargetsOverview = async () => {
  const { data } = await api.get('/analytics/targets-overview');
  return data;
};

export const getScrapingActivity = async () => {
  const { data } = await api.get('/analytics/scraping-activity');
  return data;
};

// AI Summarization Services
export const summarizePostComments = async (
  postId: number,
  prioritizeEngagement: boolean = true
): Promise<SummarizePostResponse> => {
  const { data } = await api.post(`/ai/summarize/post/${postId}`, {
    prioritize_engagement: prioritizeEngagement,
  });
  return data;
};

export const summarizeComment = async (commentId: number): Promise<SummarizeCommentResponse> => {
  const { data } = await api.post(`/ai/summarize/comment/${commentId}`);
  return data;
};

export const summarizePeriod = async (days: number = 7): Promise<PeriodSummaryResponse> => {
  const { data } = await api.post('/ai/summarize/period', { days });
  return data;
};

// AI Sentiment Analysis Services
export const analyzeCommentSentiment = async (
  commentId: number
): Promise<CommentSentimentResponse> => {
  const { data } = await api.post(`/ai/sentiment/comment/${commentId}`);
  return data;
};

export const analyzePostSentiment = async (postId: number): Promise<PostSentimentResponse> => {
  const { data } = await api.post(`/ai/sentiment/post/${postId}`);
  return data;
};

export const batchAnalyzeSentiment = async (
  batchSize: number = 50
): Promise<BatchSentimentResponse> => {
  const { data } = await api.post('/ai/sentiment/batch', { batch_size: batchSize });
  return data;
};

export const batchAnalyzePostsSentiment = async (
  batchSize: number = 50
): Promise<BatchPostSentimentResponse> => {
  const { data } = await api.post('/ai/sentiment/batch-posts', { batch_size: batchSize });
  return data;
};

// Weekly Reports
export interface WeeklyReport {
  id: number;
  year: number;
  week_number: number;
  week_start: string | null;
  week_end: string | null;
  total_posts: number;
  total_comments: number;
  sentiment_summary: {
    positive: number;
    neutral: number;
    negative: number;
    average_score: number;
  } | null;
  content_summary: string | null;
  top_topics: string[] | null;
  generated_at: string | null;
}

export const generateWeeklyReport = async (
  year: number,
  weekNumber: number
): Promise<WeeklyReport & { success: boolean }> => {
  const { data } = await api.post('/ai/reports/weekly', { year, week_number: weekNumber });
  return data;
};

export const getWeeklyReports = async (limit: number = 10): Promise<WeeklyReport[]> => {
  const { data } = await api.get(`/ai/reports/weekly?limit=${limit}`);
  return data;
};

export const getWeeklyReport = async (year: number, weekNumber: number): Promise<WeeklyReport> => {
  const { data } = await api.get(`/ai/reports/weekly/${year}/${weekNumber}`);
  return data;
};


export default api;
