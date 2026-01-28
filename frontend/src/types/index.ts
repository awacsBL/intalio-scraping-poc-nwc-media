// API Response Types
export interface Stats {
  total_posts: number;
  total_comments: number;
  posts_with_ai_results: number;
  comments_with_ai_results: number;
}

export interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence?: number;
}

export interface AIResults {
  sentiment?: SentimentResult;
  summary?: string;
  topics?: string[];
  language?: string;
  emotions?: string[];
  entity_mentions?: string[];
  keywords?: string[];
  category?: string;
  processed_at?: string;
  objects_detected?: ObjectDetection[];
  comment_summary?: {
    summary: string;
    comment_count: number;
    total_comments: number;
  };
}

export interface ObjectDetection {
  label: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Post {
  id: number;
  post_id: string;
  shortcode: string;
  post_url: string;
  owner_username: string;
  owner_id: string;
  caption: string | null;
  post_type: 'Photo' | 'Video' | 'Carousel' | 'Reel';
  likes_count: number;
  comments_count: number;
  timestamp: string;
  collected_at: string;
  source: 'hashtag' | 'user_profile' | 'mentions';
  ai_results: AIResults | null;
  display_url?: string;
  video_url?: string;
  hashtags?: string[];
  mentions?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  comment_id: string;
  post_id: number;
  comment_text: string;
  owner_username: string;
  owner_id: string;
  likes_count: number;
  timestamp: string;
  collected_at: string;
  ai_results: AIResults | null;
}

export interface TargetUser {
  id: number;
  username: string;
  user_id: string;
  display_name: string | null;
  profile_url: string;
  follower_count: number | null;
  is_verified: boolean;
  is_active: boolean;
  priority: number;
  added_at: string;
  last_scraped_at: string | null;
  notes: string | null;
  tags: string[];
}

export interface TargetHashtag {
  id: number;
  hashtag: string;
  post_count: number | null;
  is_active: boolean;
  priority: number;
  added_at: string;
  last_scraped_at: string | null;
  notes: string | null;
  tags: string[];
}

export interface TargetPlace {
  id: number;
  place_name: string;
  place_id: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  post_count: number | null;
  is_active: boolean;
  priority: number;
  added_at: string;
  last_scraped_at: string | null;
  notes: string | null;
  tags: string[];
}

// Target Request Types
export interface AddTargetRequest {
  hashtags?: string[];
  usernames?: string[];
  places?: { place_id: string; place_name?: string }[];
  priority?: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateTargetRequest {
  priority?: number;
  is_active?: boolean;
  notes?: string;
  tags?: string[];
}

export interface DiscoverAndSaveRequest {
  search_term: string;
  priority?: number;
  limit_users?: number;
  limit_hashtags?: number;
  notes?: string;
}

// Job Management Types
export interface ScrapingJob {
  id: string;
  type: 'hashtag' | 'comments' | 'discovery' | 'full_pipeline';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  target: string;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  results?: {
    posts_added?: number;
    posts_skipped?: number;
    comments_added?: number;
    posts_processed?: number;
  };
  // Schedule config
  name?: string;
  is_active?: boolean;
  schedule_type?: 'interval' | 'specific_time';
  interval_minutes?: number;
  config?: {
    hour?: number;
    minute?: number;
    day_of_week?: string;
    day_of_month?: string;
  };
  next_run?: string;
}

export interface UpdateJobScheduleRequest {
  name?: string;
  is_active?: boolean;
  schedule_type?: 'interval' | 'specific_time';
  interval_minutes?: number;
  hour?: number;
  minute?: number;
  day_of_week?: string;
  day_of_month?: string;
}

export interface JobExecution {
  id: number;
  job_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  target?: string;
  type?: 'hashtag' | 'comments' | 'discovery' | 'full_pipeline';
}

// API Request Types
export interface ScrapeHashtagsRequest {
  hashtags: string[];
  limit: number;
  download_media?: boolean;
  fetch_comments?: boolean;
  run_ai_analysis?: boolean;
}

export interface ScrapeCommentsRequest {
  limit_posts: number;
  limit_comments: number;
}

export interface DiscoveryRequest {
  search_term: string;
  limit: number;
}

export interface FullPipelineRequest {
  search_term: string;
  discovery_limit: number;
  posts_per_hashtag: number;
  comments_limit_posts: number;
  comments_limit_per_post: number;
}

// Filter Types
export interface PostFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minLikes?: number;
  maxLikes?: number;
  minComments?: number;
  maxComments?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  postType?: string;
  source?: string;
  hasAiResults?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  totalAccounts: number;
  avgEngagementRate: number;
  postsWithAI: number;
  commentsWithAI: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topHashtags: { hashtag: string; count: number }[];
  topTopics: { topic: string; count: number }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'scrape' | 'ai_analysis' | 'comment_collected';
  message: string;
  timestamp: string;
  status: 'success' | 'error' | 'info';
}

// AI Service Request Types
export interface SummarizePostRequest {
  prioritize_engagement: boolean;
}

export interface SummarizePeriodRequest {
  days: number;
}

export interface BatchSentimentRequest {
  batch_size: number;
}

// AI Service Response Types
export interface SummarizePostResponse {
  post_id: number;
  comment_count: number;
  summary: string;
  generated_at: string;
}

export interface SummarizeCommentResponse {
  comment_id: number;
  original_length: number;
  summary: string;
}

export interface PeriodSummaryResponse {
  period_start: string;
  period_end: string;
  days: number;
  post_count: number;
  comment_count: number;
  summary: string;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface CommentSentimentResponse {
  comment_id: number;
  text_preview: string;
  sentiment: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
}

export interface PostSentimentResponse {
  post_id: number;
  comment_count: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  average_score: number;
  overall_label: 'positive' | 'neutral' | 'negative';
}

export interface BatchSentimentResponse {
  processed: number;
  results: CommentSentimentResponse[];
}

export interface PostSentimentBatchResult {
  post_id: number;
  text_preview: string;
  sentiment: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
}

export interface BatchPostSentimentResponse {
  processed: number;
  results: PostSentimentBatchResult[];
}
