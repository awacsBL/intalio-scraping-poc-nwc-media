from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional, List
from pydantic import BaseModel, Field
from functools import lru_cache
from app.database import init_db, SessionLocal
from app.models import Post, Comment, TargetUser, TargetHashtag, TargetPlace
from app.orchestrator import ScrapingOrchestrator
from sqlalchemy import desc, func
from datetime import datetime, timedelta
import logging
from app.scheduler import start_scheduler, stop_scheduler, get_jobs_status
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Request Models
class HashtagRequest(BaseModel):
    hashtags: list[str]
    limit: int = 50
    download_media: bool = False
    fetch_comments: bool = True
    run_ai_analysis: bool = True


class CommentRequest(BaseModel):
    limit_posts: int = 10
    limit_comments: int = 50


class DiscoveryRequest(BaseModel):
    search_term: str
    limit: int = 30


class FullPipelineRequest(BaseModel):
    search_term: str
    limit_discovery: int = 30
    limit_posts: int = 20
    limit_comments: int = 50


class AddTargetRequest(BaseModel):
    """Request to add new targets"""
    hashtags: Optional[List[str]] = Field(None, description="List of hashtags (without #)")
    usernames: Optional[List[str]] = Field(None, description="List of Instagram usernames")
    places: Optional[List[dict]] = Field(None, description="List of places with place_id and place_name")
    priority: int = Field(5, ge=1, le=10, description="Priority (1=highest, 10=lowest)")
    notes: Optional[str] = Field(None, description="Notes about these targets")
    tags: Optional[List[str]] = Field(None, description="Tags for categorization")

    class Config:
        json_schema_extra = {
            "example": {
                "hashtags": ["flynas", "flynas2025"],
                "usernames": ["flynas_official"],
                "priority": 1,
                "notes": "Q1 2025 campaign targets",
                "tags": ["campaign", "q1_2025"]
            }
        }


class UpdateTargetRequest(BaseModel):
    """Request to update target metadata"""
    priority: Optional[int] = Field(None, ge=1, le=10)
    is_active: Optional[bool] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "priority": 1,
                "notes": "High priority competitor",
                "tags": ["competitor", "monitoring"]
            }
        }


class DiscoverAndSaveRequest(BaseModel):
    """Request to discover and save targets"""
    search_term: str = Field(..., description="Brand name to search for")
    priority: int = Field(5, ge=1, le=10, description="Priority for discovered targets")
    limit_users: int = Field(10, description="Max users to discover")
    limit_hashtags: int = Field(10, description="Max hashtags to discover")
    notes: Optional[str] = Field(None, description="Notes for discovered targets")

    class Config:
        json_schema_extra = {
            "example": {
                "search_term": "flynas",
                "priority": 3,
                "limit_users": 10,
                "limit_hashtags": 10,
                "notes": "Q1 2025 discovery"
            }
        }


class SummarizePostRequest(BaseModel):
    """Request to summarize post comments"""
    prioritize_engagement: bool = Field(True, description="Weight high-engagement comments more")

    class Config:
        json_schema_extra = {
            "example": {"prioritize_engagement": True}
        }


class SummarizePeriodRequest(BaseModel):
    """Request to summarize time period"""
    days: int = Field(7, ge=1, le=365, description="Number of days to look back")

    class Config:
        json_schema_extra = {
            "example": {"days": 7}
        }


class BatchSentimentRequest(BaseModel):
    """Request to batch analyze sentiment"""
    batch_size: int = Field(50, ge=1, le=1000, description="Number of comments to process")

    class Config:
        json_schema_extra = {
            "example": {"batch_size": 50}
        }


class WeeklyReportRequest(BaseModel):
    """Request to generate weekly report"""
    year: int = Field(..., description="Year for the report")
    week_number: int = Field(..., ge=1, le=53, description="ISO week number (1-53)")

    class Config:
        json_schema_extra = {
            "example": {"year": 2025, "week_number": 52}
        }


class UpdateJobScheduleRequest(BaseModel):
    """Request to update job schedule"""
    name: Optional[str] = None
    is_active: Optional[bool] = None
    schedule_type: Optional[str] = Field(None, pattern='^(interval|specific_time)$')
    interval_minutes: Optional[int] = None
    hour: Optional[int] = Field(None, ge=0, le=23)
    minute: Optional[int] = Field(None, ge=0, le=59)
    day_of_week: Optional[str] = None
    day_of_month: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "schedule_type": "interval",
                "interval_minutes": 360,
                "is_active": True
            }
        }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    logger.info("Starting scraping POC...")
    init_db()
    
    # Start Scheduler
    try:
        start_scheduler()
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        
    logger.info("Ready")
    yield
    stop_scheduler()
    logger.info("Shutting down...")


app = FastAPI(
    title="Instagram Scraping POC",
    description="Scraping pipeline",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache()
def get_orchestrator() -> ScrapingOrchestrator:
    """Get singleton orchestrator instance (loads AI models once)"""
    return ScrapingOrchestrator()


@app.get("/")
def root():
    return {
        "app": "Instagram Scraping POC",
        "status": "running",
        "endpoints": {
            "scrape_hashtags": "POST /scrape/hashtags",
            "scrape_comments": "POST /scrape/comments",
            "stats": "GET /stats",
            "jobs": "GET /jobs"
        }
    }


@app.get("/jobs")
def list_jobs():
    """List scheduled jobs"""
    return get_jobs_status()

@app.get("/jobs/history")
def job_history(limit: int = 50):
    """Get job execution history"""
    from app.scheduler import get_job_history
    return get_job_history(limit)


@app.post("/jobs/{job_id}/schedule")
def update_job(job_id: str, request: UpdateJobScheduleRequest):
    """Update schedule for a specific job"""
    from app.scheduler import update_job_schedule
    try:
        return update_job_schedule(job_id, request.dict(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scrape/hashtags")
def scrape_hashtags(request: HashtagRequest):
    """
    Scrape posts for given hashtags

    May take 30s-2min depending on the number of hashtags and posts.
    Results are stored in the database.

    Example:
        POST /scrape/hashtags
        {
            "hashtags": ["flynas", "السعودية"],
            "limit": 50,
            "download_media": false,
            "fetch_comments": true,
            "run_ai_analysis": true
        }
    """
    try:
        orchestrator = get_orchestrator()
        logger.info(f"Scraping options: download_media={request.download_media}, fetch_comments={request.fetch_comments}, run_ai_analysis={request.run_ai_analysis}")

        # Scrape hashtag posts
        result = orchestrator.scrape_hashtags(request.hashtags, request.limit)

        # Optionally fetch comments after scraping posts
        if request.fetch_comments and result.get('posts_added', 0) > 0:
            logger.info("Fetching comments for scraped posts...")
            comments_result = orchestrator.scrape_comments_for_posts(
                limit_posts=min(result['posts_added'], 20),
                limit_comments=50
            )
            result['comments'] = comments_result

        # Optionally run AI analysis
        if request.run_ai_analysis and result.get('posts_added', 0) > 0:
            logger.info("Running AI analysis on scraped posts...")
            try:
                ai_result = orchestrator.analyze_all_posts_sentiment(batch_size=50)
                result['ai_analysis'] = ai_result
            except Exception as e:
                logger.warning(f"AI analysis failed: {e}")
                result['ai_analysis'] = {'error': str(e)}

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scrape/comments")
def scrape_comments(request: CommentRequest):
    """
    Scrape comments for recent posts
    
    May take 1-3 minutes depending on the number of posts and comments.
    Results are stored in the database.
    
    Example:
        POST /scrape/comments
        {
            "limit_posts": 10,
            "limit_comments": 50
        }
    """
    try:
        orchestrator = get_orchestrator()
        result = orchestrator.scrape_comments_for_posts(request.limit_posts, request.limit_comments)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
def get_stats():
    """Get database statistics"""
    from app.database import SessionLocal
    from app.models import Post, Comment
    
    db = SessionLocal()
    try:
        total_posts = db.query(Post).count()
        total_comments = db.query(Comment).count()
        posts_with_ai = db.query(Post).filter(Post.ai_results != None).count()
        comments_with_ai = db.query(Comment).filter(Comment.ai_results != None).count()
        
        return {
            "total_posts": total_posts,
            "total_comments": total_comments,
            "posts_with_ai_results": posts_with_ai,
            "comments_with_ai_results": comments_with_ai
        }
    finally:
        db.close()


@app.post("/pipeline/discovery")
def run_discovery_pipeline(request: DiscoveryRequest):
    """
    Discovery pipeline: Search Instagram + Get hashtag stats
    
    Discovers accounts, hashtags, places, and related hashtags.
    
    Example:
        POST /pipeline/discovery
        {
            "search_term": "flynas",
            "limit": 30
        }
    """
    try:
        orchestrator = get_orchestrator()
        result = orchestrator.run_discovery_pipeline(request.search_term, request.limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/pipeline/full")
def run_full_pipeline(request: FullPipelineRequest):
    """
    Complete end-to-end pipeline:
    1. Discovery (search + hashtag stats)
    2. Collect posts (hashtags + users + mentions)
    3. Collect comments
    
    May take 3-10 minutes depending on the limits.
    Results are stored in the database. Check logs for progress.
    
    Example:
        POST /pipeline/full
        {
            "search_term": "flynas",
            "limit_discovery": 30,
            "limit_posts": 20,
            "limit_comments": 50
        }
    """
    try:
        orchestrator = get_orchestrator()
        result = orchestrator.run_full_collection_pipeline(
            request.search_term,
            request.limit_discovery,
            request.limit_posts,
            request.limit_comments
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# === AI Services Endpoints ===

@app.post("/ai/summarize/post/{post_id}")
def summarize_post(post_id: int, request: SummarizePostRequest):
    """
    Summarize all comments under a post
    
    Args:
        post_id: Database ID of post
        request: Summarization options
        
    Example:
        POST /ai/summarize/post/1
        {"prioritize_engagement": true}
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.summarize_post_comments(post_id, request.prioritize_engagement)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/summarize/comment/{comment_id}")
def summarize_comment(comment_id: int):
    """
    Summarize a long comment (only if > 100 chars)
    
    Args:
        comment_id: Database ID of comment
        
    Example:
        POST /ai/summarize/comment/5
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.summarize_long_comment(comment_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/summarize/period")
def summarize_period(request: SummarizePeriodRequest):
    """
    Summarize all content from last N days
    
    Args:
        request: Time period configuration
        
    Example:
        POST /ai/summarize/period
        {"days": 7}
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.summarize_time_period(request.days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/sentiment/comment/{comment_id}")
def analyze_comment(comment_id: int):
    """
    Analyze sentiment for a single comment
    
    Args:
        comment_id: Database ID of comment
    
    Example:
        POST /ai/sentiment/comment/5
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.analyze_comment_sentiment(comment_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/sentiment/post/{post_id}")
def analyze_post(post_id: int):
    """
    Analyze overall sentiment for a post (aggregated from comments)
    
    Args:
        post_id: Database ID of post
        
    Example:
        POST /ai/sentiment/post/1
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.analyze_post_sentiment(post_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/sentiment/batch")
def analyze_all(request: BatchSentimentRequest):
    """
    Analyze sentiment for all unprocessed comments

    Run this periodically or after scraping new data

    Args:
        request: Batch processing configuration

    Example:
        POST /ai/sentiment/batch
        {"batch_size": 100}
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.analyze_all_comments_sentiment(request.batch_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/sentiment/batch-posts")
def analyze_all_posts(request: BatchSentimentRequest):
    """
    Analyze sentiment for all unprocessed posts (using captions)

    Run this periodically or after scraping new data

    Args:
        request: Batch processing configuration

    Example:
        POST /ai/sentiment/batch-posts
        {"batch_size": 100}
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.analyze_all_posts_sentiment(request.batch_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/reports/weekly")
def generate_weekly_report(request: WeeklyReportRequest):
    """
    Generate a weekly report with summary and sentiment analysis

    Args:
        request: Year and week number

    Example:
        POST /ai/reports/weekly
        {"year": 2025, "week_number": 52}
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.generate_weekly_report(request.year, request.week_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/reports/weekly")
def get_weekly_reports(limit: int = Query(10, ge=1, le=52)):
    """
    Get list of generated weekly reports

    Args:
        limit: Maximum number of reports to return
    """
    from app.models import WeeklyReport
    db = SessionLocal()
    try:
        reports = db.query(WeeklyReport).order_by(
            desc(WeeklyReport.year),
            desc(WeeklyReport.week_number)
        ).limit(limit).all()

        return [
            {
                'id': r.id,
                'year': r.year,
                'week_number': r.week_number,
                'week_start': r.week_start_date.isoformat() if r.week_start_date else None,
                'week_end': r.week_end_date.isoformat() if r.week_end_date else None,
                'total_posts': r.post_count,
                'total_comments': r.comment_count,
                'sentiment_summary': r.sentiment_breakdown,
                'content_summary': r.summary,
                'top_topics': None,
                'generated_at': r.generated_at.isoformat() if r.generated_at else None,
            }
            for r in reports
        ]
    finally:
        db.close()


@app.get("/ai/reports/weekly/{year}/{week_number}")
def get_weekly_report(year: int, week_number: int):
    """
    Get a specific weekly report

    Args:
        year: Year of the report
        week_number: Week number (1-53)
    """
    from app.models import WeeklyReport
    db = SessionLocal()
    try:
        report = db.query(WeeklyReport).filter(
            WeeklyReport.year == year,
            WeeklyReport.week_number == week_number
        ).first()

        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        return {
            'id': report.id,
            'year': report.year,
            'week_number': report.week_number,
            'week_start': report.week_start_date.isoformat() if report.week_start_date else None,
            'week_end': report.week_end_date.isoformat() if report.week_end_date else None,
            'total_posts': report.post_count,
            'total_comments': report.comment_count,
            'sentiment_summary': report.sentiment_breakdown,
            'content_summary': report.summary,
            'top_topics': None,
            'generated_at': report.generated_at.isoformat() if report.generated_at else None,
        }
    finally:
        db.close()


@app.get("/targets")
def list_targets(
    target_type: str = Query('all', description="Filter by type: hashtags, users, places, or all"),
    include_inactive: bool = Query(False, description="Include inactive targets")
):
    """
    List all scraping targets with their metadata
    
    Returns detailed information about configured targets including:
    - Priority levels
    - Active/inactive status
    - Last scrape timestamps
    - Notes and tags
    """
    try:
        orchestrator = get_orchestrator()
        return orchestrator.list_all_targets(target_type, include_inactive)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/targets/add")
def add_targets(request: AddTargetRequest):
    """
    Add new targets for scraping
    
    Can add multiple hashtags, users, and places in a single request.
    Duplicates are automatically skipped.
    """
    try:
        orchestrator = get_orchestrator()
        result = orchestrator.save_discovered_targets(
            hashtags=request.hashtags,
            usernames=request.usernames,
            places=request.places,
            priority=request.priority,
            notes=request.notes,
            tags=request.tags
        )
        
        # Trigger immediate scraping for the new targets
        try:
            from app.scheduler import trigger_now
            trigger_now('scrape_targets')
            logger.info("Triggered immediate scraping for new targets")
        except Exception as e:
            logger.warning(f"Failed to trigger immediate scraping: {e}")
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/targets/{target_type}/{identifier}")
def update_target(
    target_type: str,
    identifier: str,
    request: UpdateTargetRequest
):
    """
    Update target metadata
    
    Args:
        target_type: Type of target (hashtag, user, or place)
        identifier: Hashtag name, username, or place_id
    
    Update any combination of: priority, is_active, notes, tags
    """
    try:
        if target_type not in ['hashtag', 'user', 'place']:
            raise HTTPException(status_code=400, detail="target_type must be 'hashtag', 'user', or 'place'")
        
        orchestrator = get_orchestrator()
        result = orchestrator.update_target(
            target_type=target_type,
            identifier=identifier,
            priority=request.priority,
            is_active=request.is_active,
            notes=request.notes,
            tags=request.tags
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/targets/{target_type}/{identifier}/activate")
def activate_target(target_type: str, identifier: str):
    """
    Activate a target for scraping
    
    Args:
        target_type: Type of target (hashtag, user, or place)
        identifier: Hashtag name, username, or place_id
    """
    try:
        if target_type not in ['hashtag', 'user', 'place']:
            raise HTTPException(status_code=400, detail="target_type must be 'hashtag', 'user', or 'place'")
        
        orchestrator = get_orchestrator()
        result = orchestrator.activate_target(target_type, identifier)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/targets/{target_type}/{identifier}/deactivate")
def deactivate_target(target_type: str, identifier: str):
    """
    Deactivate a target (stop scraping)
    
    Target remains in database but won't be scraped.
    Can be reactivated later.
    
    Args:
        target_type: Type of target (hashtag, user, or place)
        identifier: Hashtag name, username, or place_id
    """
    try:
        if target_type not in ['hashtag', 'user', 'place']:
            raise HTTPException(status_code=400, detail="target_type must be 'hashtag', 'user', or 'place'")
        
        orchestrator = get_orchestrator()
        result = orchestrator.deactivate_target(target_type, identifier)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/targets/{target_type}/{identifier}")
def delete_target(target_type: str, identifier: str):
    """
    Permanently delete a target
    
    Warning: This cannot be undone. Target will need to be re-added if needed.
    Consider deactivating instead if you might want to re-enable later.
    
    Args:
        target_type: Type of target (hashtag, user, or place)
        identifier: Hashtag name, username, or place_id
    """
    try:
        if target_type not in ['hashtag', 'user', 'place']:
            raise HTTPException(status_code=400, detail="target_type must be 'hashtag', 'user', or 'place'")
        
        orchestrator = get_orchestrator()
        result = orchestrator.delete_target(target_type, identifier)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/targets/discover-and-save")
def discover_and_save(request: DiscoverAndSaveRequest):
    """
    Run discovery and automatically save results as targets
    
    Combines discovery pipeline with target saving in one call.
    Useful for quickly building your target list from a brand search.
    
    Example:
        POST /targets/discover-and-save
        {
            "search_term": "flynas",
            "priority": 3,
            "limit_users": 10,
            "limit_hashtags": 10,
            "notes": "Q1 2025 discovery"
        }
    """
    try:
        orchestrator = get_orchestrator()
        
        # Run discovery
        discovery = orchestrator.run_discovery_pipeline(
            search_term=request.search_term,
            limit_users=request.limit_users,
            limit_hashtags=request.limit_hashtags
        )
        
        # Extract discovered items
        hashtags = discovery['discovered']['hashtags']
        usernames = discovery['discovered']['accounts']
        
        # Save as targets
        save_result = orchestrator.save_discovered_targets(
            hashtags=hashtags,
            usernames=usernames,
            priority=request.priority,
            notes=request.notes or f"Discovered from search: {request.search_term}",
            tags=["discovered", request.search_term]
        )
        
        return {
            'success': True,
            'discovery': discovery['counts'],
            'saved_targets': save_result['added']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# POSTS ENDPOINTS (for Frontend Dashboard)
# ============================================================================

@app.get("/posts")
def get_posts(
    search: Optional[str] = Query(None, description="Search in captions and usernames"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment: positive, negative, neutral"),
    post_type: Optional[str] = Query(None, alias="postType", description="Filter by post type: Photo, Video, Carousel, Reel"),
    source: Optional[str] = Query(None, description="Filter by source: hashtag, user_profile, mentions"),
    min_likes: Optional[int] = Query(None, alias="minLikes", description="Minimum likes count"),
    max_likes: Optional[int] = Query(None, alias="maxLikes", description="Maximum likes count"),
    min_comments: Optional[int] = Query(None, alias="minComments", description="Minimum comments count"),
    max_comments: Optional[int] = Query(None, alias="maxComments", description="Maximum comments count"),
    date_from: Optional[str] = Query(None, alias="dateFrom", description="Filter posts from this date (ISO format)"),
    date_to: Optional[str] = Query(None, alias="dateTo", description="Filter posts until this date (ISO format)"),
    has_ai_results: Optional[bool] = Query(None, alias="hasAiResults", description="Filter posts with AI results"),
    limit: int = Query(100, le=500, description="Maximum number of posts to return"),
    offset: int = Query(0, ge=0, description="Number of posts to skip")
):
    """
    Get posts with optional filters

    Supports filtering by:
    - search: Text search in captions and usernames
    - sentiment: AI-detected sentiment (positive, negative, neutral)
    - postType: Type of post (Photo, Video, Carousel, Reel)
    - source: How the post was collected
    - minLikes/maxLikes: Engagement filters
    - minComments/maxComments: Comments count filters
    - dateFrom/dateTo: Date range filters (ISO format)
    - hasAiResults: Only posts that have been AI-analyzed
    """
    db = SessionLocal()
    try:
        query = db.query(Post)

        # Text search
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Post.caption.ilike(search_term)) |
                (Post.owner_username.ilike(search_term))
            )

        # Sentiment filter (searches in JSON)
        if sentiment:
            query = query.filter(
                Post.ai_results.isnot(None),
                func.json_extract(Post.ai_results, '$.sentiment.label') == sentiment
            )

        # Post type filter
        if post_type:
            query = query.filter(Post.post_type == post_type)

        # Source filter
        if source:
            query = query.filter(Post.source == source)

        # Likes filters
        if min_likes is not None:
            query = query.filter(Post.likes_count >= min_likes)
        if max_likes is not None:
            query = query.filter(Post.likes_count <= max_likes)

        # Comments filters
        if min_comments is not None:
            query = query.filter(Post.comments_count >= min_comments)
        if max_comments is not None:
            query = query.filter(Post.comments_count <= max_comments)

        # Date range filters
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(Post.timestamp >= from_date)
            except ValueError:
                pass  # Ignore invalid date format
        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                # Add one day to include the entire end date
                to_date = to_date + timedelta(days=1)
                query = query.filter(Post.timestamp < to_date)
            except ValueError:
                pass  # Ignore invalid date format

        # Has AI results filter
        if has_ai_results:
            query = query.filter(Post.ai_results.isnot(None))

        # Order by most recent and paginate
        posts = query.order_by(desc(Post.collected_at)).offset(offset).limit(limit).all()

        # Convert to dict with additional fields for frontend
        result = []
        for post in posts:
            post_dict = {
                "id": post.id,
                "post_id": post.post_id,
                "shortcode": post.shortcode,
                "post_url": post.post_url,
                "owner_username": post.owner_username,
                "owner_id": post.owner_id,
                "caption": post.caption,
                "post_type": post.post_type,
                "likes_count": post.likes_count,
                "comments_count": post.comments_count,
                "timestamp": post.timestamp.isoformat() if post.timestamp else None,
                "collected_at": post.collected_at.isoformat() if post.collected_at else None,
                "source": post.source,
                "ai_results": post.ai_results,
                # Generate placeholder image URL based on post_id for demo
                "display_url": f"https://picsum.photos/seed/{post.post_id}/800/800",
            }

            # Extract hashtags from caption if present
            if post.caption:
                hashtags = re.findall(r'#(\w+)', post.caption)
                post_dict["hashtags"] = hashtags

            result.append(post_dict)

        return result
    finally:
        db.close()


@app.get("/posts/types")
def get_post_types():
    """Get distinct post types from the database"""
    db = SessionLocal()
    try:
        result = db.query(Post.post_type).distinct().filter(Post.post_type.isnot(None)).all()
        return [post_type for (post_type,) in result if post_type]
    finally:
        db.close()


@app.get("/posts/{post_id}")
def get_post(post_id: str):
    """
    Get a single post by post_id

    Returns full post details including AI results
    """
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.post_id == post_id).first()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        post_dict = {
            "id": post.id,
            "post_id": post.post_id,
            "shortcode": post.shortcode,
            "post_url": post.post_url,
            "owner_username": post.owner_username,
            "owner_id": post.owner_id,
            "caption": post.caption,
            "post_type": post.post_type,
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "timestamp": post.timestamp.isoformat() if post.timestamp else None,
            "collected_at": post.collected_at.isoformat() if post.collected_at else None,
            "source": post.source,
            "ai_results": post.ai_results,
            "display_url": f"https://picsum.photos/seed/{post.post_id}/800/800",
        }

        # Extract hashtags and mentions from caption
        if post.caption:
            post_dict["hashtags"] = re.findall(r'#(\w+)', post.caption)
            post_dict["mentions"] = re.findall(r'@(\w+)', post.caption)

        return post_dict
    finally:
        db.close()


@app.get("/posts/{post_id}/comments")
def get_post_comments(post_id: str, limit: int = Query(100, le=500)):
    """
    Get comments for a specific post

    Returns comments with AI analysis results
    """
    db = SessionLocal()
    try:
        # First get the post to find its internal ID
        post = db.query(Post).filter(Post.post_id == post_id).first()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Get comments for this post
        comments = db.query(Comment).filter(
            Comment.post_id == post.id
        ).order_by(desc(Comment.likes_count)).limit(limit).all()

        result = []
        for comment in comments:
            result.append({
                "id": comment.id,
                "comment_id": comment.comment_id,
                "post_id": comment.post_id,
                "comment_text": comment.comment_text,
                "owner_username": comment.owner_username,
                "owner_id": comment.owner_id,
                "likes_count": comment.likes_count,
                "timestamp": comment.timestamp.isoformat() if comment.timestamp else None,
                "collected_at": comment.collected_at.isoformat() if comment.collected_at else None,
                "ai_results": comment.ai_results,
            })

        return result
    finally:
        db.close()


# ============================================================================
# TARGETS ENDPOINTS (for Settings & Monitoring)
# ============================================================================

@app.get("/targets/users")
def get_target_users(active_only: bool = Query(True)):
    """Get all target users being monitored"""
    db = SessionLocal()
    try:
        query = db.query(TargetUser)
        if active_only:
            query = query.filter(TargetUser.is_active == True)

        users = query.order_by(desc(TargetUser.added_at)).all()

        return [
            {
                "id": user.id,
                "username": user.username,
                "user_id": user.user_id,
                "display_name": user.display_name,
                "profile_url": user.profile_url,
                "follower_count": user.follower_count,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
                "added_at": user.added_at.isoformat() if user.added_at else None,
                "last_scraped_at": user.last_scraped_at.isoformat() if user.last_scraped_at else None,
                "notes": user.notes,
                "tags": user.tags or [],
            }
            for user in users
        ]
    finally:
        db.close()


@app.get("/targets/hashtags")
def get_target_hashtags(active_only: bool = Query(True)):
    """Get all target hashtags being monitored"""
    db = SessionLocal()
    try:
        query = db.query(TargetHashtag)
        if active_only:
            query = query.filter(TargetHashtag.is_active == True)

        hashtags = query.order_by(desc(TargetHashtag.added_at)).all()

        return [
            {
                "id": hashtag.id,
                "hashtag": hashtag.hashtag,
                "post_count": hashtag.post_count,
                "is_active": hashtag.is_active,
                "added_at": hashtag.added_at.isoformat() if hashtag.added_at else None,
                "last_scraped_at": hashtag.last_scraped_at.isoformat() if hashtag.last_scraped_at else None,
                "notes": hashtag.notes,
                "tags": hashtag.tags or [],
            }
            for hashtag in hashtags
        ]
    finally:
        db.close()


@app.get("/targets/places")
def get_target_places(active_only: bool = Query(True)):
    """Get all target places being monitored"""
    db = SessionLocal()
    try:
        query = db.query(TargetPlace)
        if active_only:
            query = query.filter(TargetPlace.is_active == True)

        places = query.order_by(desc(TargetPlace.added_at)).all()

        return [
            {
                "id": place.id,
                "place_name": place.place_name,
                "place_id": place.place_id,
                "city": place.city,
                "country": place.country,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "post_count": place.post_count,
                "is_active": place.is_active,
                "added_at": place.added_at.isoformat() if place.added_at else None,
                "last_scraped_at": place.last_scraped_at.isoformat() if place.last_scraped_at else None,
                "notes": place.notes,
                "tags": place.tags or [],
            }
            for place in places
        ]
    finally:
        db.close()


# ============================================================================
# ANALYTICS ENDPOINTS (for Dashboard)
# ============================================================================

@app.get("/analytics/sentiment-breakdown")
def get_sentiment_breakdown():
    """Get sentiment breakdown across all posts and comments with AI results"""
    db = SessionLocal()
    try:
        positive = 0
        neutral = 0
        negative = 0

        # Count post sentiments
        posts = db.query(Post).filter(Post.ai_results.isnot(None)).all()
        for post in posts:
            if post.ai_results and isinstance(post.ai_results, dict) and "sentiment" in post.ai_results:
                label = post.ai_results["sentiment"].get("label", "").lower()
                if label == "positive":
                    positive += 1
                elif label == "negative":
                    negative += 1
                else:
                    neutral += 1

        # Count comment sentiments
        comments = db.query(Comment).filter(Comment.ai_results.isnot(None)).all()
        for comment in comments:
            if comment.ai_results and isinstance(comment.ai_results, dict) and "sentiment" in comment.ai_results:
                label = comment.ai_results["sentiment"].get("label", "").lower()
                if label == "positive":
                    positive += 1
                elif label == "negative":
                    negative += 1
                else:
                    neutral += 1

        return {
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "total": positive + neutral + negative
        }
    finally:
        db.close()


@app.get("/analytics/top-hashtags")
def get_top_hashtags(limit: int = Query(10, le=50)):
    """Get most frequently occurring hashtags from scraped posts"""
    db = SessionLocal()
    try:
        posts = db.query(Post.caption).filter(Post.caption.isnot(None)).all()

        from collections import Counter

        all_hashtags = []
        for (caption,) in posts:
            if caption:
                hashtags = re.findall(r'#(\w+)', caption.lower())
                all_hashtags.extend(hashtags)

        hashtag_counts = Counter(all_hashtags).most_common(limit)

        return [
            {"hashtag": tag, "count": count}
            for tag, count in hashtag_counts
        ]
    finally:
        db.close()


@app.get("/analytics/top-topics")
def get_top_topics(limit: int = Query(10, le=50)):
    """Get most frequently detected AI topics"""
    db = SessionLocal()
    try:
        posts = db.query(Post.ai_results).filter(Post.ai_results.isnot(None)).all()

        from collections import Counter

        all_topics = []
        for (ai_results,) in posts:
            if ai_results and "topics" in ai_results:
                all_topics.extend(ai_results["topics"])

        topic_counts = Counter(all_topics).most_common(limit)

        return [
            {"topic": topic, "count": count}
            for topic, count in topic_counts
        ]
    finally:
        db.close()


# ============================================================================
# ENGAGEMENT ANALYTICS
# ============================================================================

@app.get("/analytics/engagement-overview")
def get_engagement_overview():
    """Get overall engagement metrics"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        # Total engagement stats
        stats = db.query(
            sql_func.sum(Post.likes_count).label('total_likes'),
            sql_func.sum(Post.comments_count).label('total_comments'),
            sql_func.count(Post.id).label('total_posts'),
            sql_func.avg(Post.likes_count).label('avg_likes'),
            sql_func.avg(Post.comments_count).label('avg_comments'),
            sql_func.max(Post.likes_count).label('max_likes'),
            sql_func.max(Post.comments_count).label('max_comments'),
        ).first()

        return {
            "total_likes": stats.total_likes or 0,
            "total_comments": stats.total_comments or 0,
            "total_posts": stats.total_posts or 0,
            "avg_likes_per_post": round(float(stats.avg_likes or 0), 2),
            "avg_comments_per_post": round(float(stats.avg_comments or 0), 2),
            "max_likes": stats.max_likes or 0,
            "max_comments": stats.max_comments or 0,
            "engagement_rate": round((float(stats.total_likes or 0) + float(stats.total_comments or 0)) / max(stats.total_posts or 1, 1), 2)
        }
    finally:
        db.close()


@app.get("/analytics/engagement-by-post-type")
def get_engagement_by_post_type():
    """Get engagement breakdown by post type"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        results = db.query(
            Post.post_type,
            sql_func.count(Post.id).label('count'),
            sql_func.sum(Post.likes_count).label('total_likes'),
            sql_func.sum(Post.comments_count).label('total_comments'),
            sql_func.avg(Post.likes_count).label('avg_likes'),
            sql_func.avg(Post.comments_count).label('avg_comments'),
        ).filter(Post.post_type.isnot(None)).group_by(Post.post_type).all()

        return [
            {
                "post_type": r.post_type,
                "count": r.count,
                "total_likes": r.total_likes or 0,
                "total_comments": r.total_comments or 0,
                "avg_likes": round(float(r.avg_likes or 0), 2),
                "avg_comments": round(float(r.avg_comments or 0), 2),
            }
            for r in results
        ]
    finally:
        db.close()


@app.get("/analytics/top-posts-by-likes")
def get_top_posts_by_likes(limit: int = Query(10, le=50)):
    """Get top posts by likes count"""
    db = SessionLocal()
    try:
        posts = db.query(Post).order_by(desc(Post.likes_count)).limit(limit).all()

        return [
            {
                "post_id": p.post_id,
                "shortcode": p.shortcode,
                "owner_username": p.owner_username,
                "caption": (p.caption[:100] + "...") if p.caption and len(p.caption) > 100 else p.caption,
                "post_type": p.post_type,
                "likes_count": p.likes_count,
                "comments_count": p.comments_count,
                "timestamp": p.timestamp.isoformat() if p.timestamp else None,
                "display_url": f"https://picsum.photos/seed/{p.post_id}/800/800",
            }
            for p in posts
        ]
    finally:
        db.close()


@app.get("/analytics/top-posts-by-comments")
def get_top_posts_by_comments(limit: int = Query(10, le=50)):
    """Get top posts by comments count"""
    db = SessionLocal()
    try:
        posts = db.query(Post).order_by(desc(Post.comments_count)).limit(limit).all()

        return [
            {
                "post_id": p.post_id,
                "shortcode": p.shortcode,
                "owner_username": p.owner_username,
                "caption": (p.caption[:100] + "...") if p.caption and len(p.caption) > 100 else p.caption,
                "post_type": p.post_type,
                "likes_count": p.likes_count,
                "comments_count": p.comments_count,
                "timestamp": p.timestamp.isoformat() if p.timestamp else None,
                "display_url": f"https://picsum.photos/seed/{p.post_id}/800/800",
            }
            for p in posts
        ]
    finally:
        db.close()


# ============================================================================
# TIME-BASED ANALYTICS
# ============================================================================

@app.get("/analytics/posts-over-time")
def get_posts_over_time(
    group_by: str = Query("day", description="Group by: hour, day, week, month"),
    days: int = Query(30, le=365, description="Number of days to look back")
):
    """Get posts count over time"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # Use date_trunc for PostgreSQL
        if group_by == "hour":
            date_format = func.date_trunc('hour', Post.timestamp)
        elif group_by == "week":
            date_format = func.date_trunc('week', Post.timestamp)
        elif group_by == "month":
            date_format = func.date_trunc('month', Post.timestamp)
        else:  # day
            date_format = func.date_trunc('day', Post.timestamp)

        results = db.query(
            date_format.label('date'),
            sql_func.count(Post.id).label('count'),
            sql_func.sum(Post.likes_count).label('likes'),
            sql_func.sum(Post.comments_count).label('comments')
        ).filter(
            Post.timestamp >= cutoff_date,
            Post.timestamp.isnot(None)
        ).group_by(date_format).order_by(date_format).all()

        return [
            {
                "period": r.date.isoformat() if r.date else None,
                "count": r.count,
                "likes": r.likes or 0,
                "comments": r.comments or 0
            }
            for r in results
        ]
    finally:
        db.close()


@app.get("/analytics/posting-hours")
def get_posting_hours():
    """Get distribution of posts by hour of day"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        results = db.query(
            func.extract('hour', Post.timestamp).label('hour'),
            sql_func.count(Post.id).label('count'),
            sql_func.avg(Post.likes_count).label('avg_likes')
        ).filter(Post.timestamp.isnot(None)).group_by(
            func.extract('hour', Post.timestamp)
        ).order_by('hour').all()

        # Fill in missing hours with 0
        hour_data = {int(r.hour): {'count': r.count, 'avg_likes': float(r.avg_likes or 0)} for r in results}
        return [
            {
                "hour": h,
                "count": hour_data.get(h, {}).get('count', 0),
                "avg_likes": round(hour_data.get(h, {}).get('avg_likes', 0), 1)
            }
            for h in range(24)
        ]
    finally:
        db.close()


@app.get("/analytics/posting-days")
def get_posting_days():
    """Get distribution of posts by day of week"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        results = db.query(
            func.extract('dow', Post.timestamp).label('day'),
            sql_func.count(Post.id).label('count'),
            sql_func.avg(Post.likes_count).label('avg_likes'),
            sql_func.sum(Post.likes_count).label('total_likes')
        ).filter(Post.timestamp.isnot(None)).group_by(
            func.extract('dow', Post.timestamp)
        ).order_by('day').all()

        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        day_data = {int(r.day): {'count': r.count, 'avg_likes': float(r.avg_likes or 0), 'total_likes': r.total_likes or 0} for r in results}

        return [
            {
                "day_name": day_names[d],
                "day_number": d,
                "count": day_data.get(d, {}).get('count', 0),
                "avg_likes": round(day_data.get(d, {}).get('avg_likes', 0), 1),
                "total_likes": day_data.get(d, {}).get('total_likes', 0)
            }
            for d in range(7)
        ]
    finally:
        db.close()


# ============================================================================
# AUTHOR ANALYTICS
# ============================================================================

@app.get("/analytics/top-authors")
def get_top_authors(limit: int = Query(10, le=50)):
    """Get authors with most posts"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        results = db.query(
            Post.owner_username,
            sql_func.count(Post.id).label('post_count'),
            sql_func.sum(Post.likes_count).label('total_likes'),
            sql_func.sum(Post.comments_count).label('total_comments'),
        ).filter(Post.owner_username.isnot(None)).group_by(
            Post.owner_username
        ).order_by(desc('post_count')).limit(limit).all()

        return [
            {
                "username": r.owner_username,
                "post_count": r.post_count,
                "total_likes": r.total_likes or 0,
                "total_comments": r.total_comments or 0,
            }
            for r in results
        ]
    finally:
        db.close()


@app.get("/analytics/top-authors-by-engagement")
def get_top_authors_by_engagement(limit: int = Query(10, le=50)):
    """Get authors by total engagement (likes + comments)"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        results = db.query(
            Post.owner_username,
            sql_func.count(Post.id).label('post_count'),
            sql_func.sum(Post.likes_count).label('total_likes'),
            sql_func.sum(Post.comments_count).label('total_comments'),
            (sql_func.sum(Post.likes_count) + sql_func.sum(Post.comments_count)).label('total_engagement'),
        ).filter(Post.owner_username.isnot(None)).group_by(
            Post.owner_username
        ).order_by(desc('total_engagement')).limit(limit).all()

        return [
            {
                "username": r.owner_username,
                "post_count": r.post_count,
                "total_likes": r.total_likes or 0,
                "total_comments": r.total_comments or 0,
                "total_engagement": r.total_engagement or 0,
            }
            for r in results
        ]
    finally:
        db.close()


@app.get("/analytics/author-activity")
def get_author_activity(username: str):
    """Get detailed activity for a specific author"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        posts = db.query(Post).filter(Post.owner_username == username).all()

        if not posts:
            raise HTTPException(status_code=404, detail="Author not found")

        return {
            "username": username,
            "post_count": len(posts),
            "total_likes": sum(p.likes_count or 0 for p in posts),
            "total_comments": sum(p.comments_count or 0 for p in posts),
            "avg_likes": round(sum(p.likes_count or 0 for p in posts) / len(posts), 2) if posts else 0,
            "avg_comments": round(sum(p.comments_count or 0 for p in posts) / len(posts), 2) if posts else 0,
            "post_types": list(set(p.post_type for p in posts if p.post_type)),
            "recent_posts": [
                {
                    "post_id": p.post_id,
                    "caption": (p.caption[:100] + "...") if p.caption and len(p.caption) > 100 else p.caption,
                    "likes_count": p.likes_count,
                    "comments_count": p.comments_count,
                    "timestamp": p.timestamp.isoformat() if p.timestamp else None,
                }
                for p in sorted(posts, key=lambda x: x.timestamp or datetime.min, reverse=True)[:5]
            ]
        }
    finally:
        db.close()


# ============================================================================
# COMMENT ANALYTICS
# ============================================================================

@app.get("/analytics/comment-stats")
def get_comment_stats():
    """Get overall comment statistics"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        stats = db.query(
            sql_func.count(Comment.id).label('total_comments'),
            sql_func.sum(Comment.likes_count).label('total_likes'),
            sql_func.avg(Comment.likes_count).label('avg_likes'),
            sql_func.max(Comment.likes_count).label('max_likes'),
        ).first()

        # Count comments with AI results
        ai_analyzed = db.query(Comment).filter(Comment.ai_results.isnot(None)).count()

        return {
            "total_comments": stats.total_comments or 0,
            "total_likes": stats.total_likes or 0,
            "avg_likes_per_comment": round(float(stats.avg_likes or 0), 2),
            "max_likes": stats.max_likes or 0,
            "ai_analyzed": ai_analyzed,
        }
    finally:
        db.close()


@app.get("/analytics/top-commenters")
def get_top_commenters(limit: int = Query(10, le=50)):
    """Get users who comment the most"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        results = db.query(
            Comment.owner_username,
            sql_func.count(Comment.id).label('comment_count'),
            sql_func.sum(Comment.likes_count).label('total_likes'),
        ).filter(Comment.owner_username.isnot(None)).group_by(
            Comment.owner_username
        ).order_by(desc('comment_count')).limit(limit).all()

        return [
            {
                "username": r.owner_username,
                "comment_count": r.comment_count,
                "total_likes": r.total_likes or 0,
            }
            for r in results
        ]
    finally:
        db.close()


@app.get("/analytics/comment-sentiment-breakdown")
def get_comment_sentiment_breakdown():
    """Get sentiment breakdown for comments"""
    db = SessionLocal()
    try:
        comments = db.query(Comment).filter(Comment.ai_results.isnot(None)).all()

        positive = 0
        neutral = 0
        negative = 0

        for comment in comments:
            if comment.ai_results and "sentiment" in comment.ai_results:
                label = comment.ai_results["sentiment"].get("label", "").lower()
                if label == "positive":
                    positive += 1
                elif label == "negative":
                    negative += 1
                else:
                    neutral += 1

        return {
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "total": positive + neutral + negative
        }
    finally:
        db.close()


# ============================================================================
# CONTENT ANALYTICS
# ============================================================================

@app.get("/analytics/content-sources")
def get_content_sources():
    """Get breakdown of content by source"""
    db = SessionLocal()
    try:
        from sqlalchemy import func as sql_func

        results = db.query(
            Post.source,
            sql_func.count(Post.id).label('count'),
            sql_func.sum(Post.likes_count).label('total_likes'),
            sql_func.sum(Post.comments_count).label('total_comments'),
        ).filter(Post.source.isnot(None)).group_by(Post.source).all()

        return [
            {
                "source": r.source,
                "count": r.count,
                "total_likes": r.total_likes or 0,
                "total_comments": r.total_comments or 0,
            }
            for r in results
        ]
    finally:
        db.close()


@app.get("/analytics/caption-length-analysis")
def get_caption_length_analysis():
    """Analyze engagement vs caption length"""
    db = SessionLocal()
    try:
        posts = db.query(Post).filter(Post.caption.isnot(None)).all()

        # Group by caption length ranges
        ranges = {
            "0-50": {"count": 0, "total_likes": 0, "total_comments": 0},
            "51-100": {"count": 0, "total_likes": 0, "total_comments": 0},
            "101-200": {"count": 0, "total_likes": 0, "total_comments": 0},
            "201-500": {"count": 0, "total_likes": 0, "total_comments": 0},
            "500+": {"count": 0, "total_likes": 0, "total_comments": 0},
        }

        for post in posts:
            length = len(post.caption)
            if length <= 50:
                key = "0-50"
            elif length <= 100:
                key = "51-100"
            elif length <= 200:
                key = "101-200"
            elif length <= 500:
                key = "201-500"
            else:
                key = "500+"

            ranges[key]["count"] += 1
            ranges[key]["total_likes"] += post.likes_count or 0
            ranges[key]["total_comments"] += post.comments_count or 0

        return [
            {
                "range": k,
                "count": v["count"],
                "avg_likes": round(v["total_likes"] / v["count"], 2) if v["count"] > 0 else 0,
                "avg_comments": round(v["total_comments"] / v["count"], 2) if v["count"] > 0 else 0,
            }
            for k, v in ranges.items()
        ]
    finally:
        db.close()


@app.get("/analytics/mentions")
def get_mentions_analysis(limit: int = Query(20, le=100)):
    """Get most mentioned accounts"""
    db = SessionLocal()
    try:
        posts = db.query(Post.caption).filter(Post.caption.isnot(None)).all()

        from collections import Counter

        all_mentions = []
        for (caption,) in posts:
            if caption:
                mentions = re.findall(r'@(\w+)', caption)
                all_mentions.extend(mentions)

        mention_counts = Counter(all_mentions).most_common(limit)

        return [
            {"username": mention, "count": count}
            for mention, count in mention_counts
        ]
    finally:
        db.close()


# ============================================================================
# AI ANALYTICS
# ============================================================================

@app.get("/analytics/ai-coverage")
def get_ai_coverage():
    """Get AI analysis coverage statistics"""
    db = SessionLocal()
    try:
        total_posts = db.query(Post).count()
        total_comments = db.query(Comment).count()

        # Count posts/comments with actual sentiment analysis
        # We need to check if ai_results contains 'sentiment' key
        # Fetch and check in Python to avoid DB-specific JSON operators
        posts_with_ai = 0
        comments_with_ai = 0

        # Check posts with ai_results
        posts_with_results = db.query(Post).filter(Post.ai_results.isnot(None)).all()
        for post in posts_with_results:
            if post.ai_results and isinstance(post.ai_results, dict) and 'sentiment' in post.ai_results:
                posts_with_ai += 1

        # Check comments with ai_results
        comments_with_results = db.query(Comment).filter(Comment.ai_results.isnot(None)).all()
        for comment in comments_with_results:
            if comment.ai_results and isinstance(comment.ai_results, dict) and 'sentiment' in comment.ai_results:
                comments_with_ai += 1

        return {
            "posts": {
                "total": total_posts,
                "analyzed": posts_with_ai,
                "pending": total_posts - posts_with_ai,
                "coverage_percent": round((posts_with_ai / total_posts * 100), 1) if total_posts > 0 else 0
            },
            "comments": {
                "total": total_comments,
                "analyzed": comments_with_ai,
                "pending": total_comments - comments_with_ai,
                "coverage_percent": round((comments_with_ai / total_comments * 100), 1) if total_comments > 0 else 0
            }
        }
    finally:
        db.close()


@app.get("/analytics/sentiment-by-source")
def get_sentiment_by_source():
    """Get sentiment breakdown by content source"""
    db = SessionLocal()
    try:
        posts = db.query(Post).filter(
            Post.ai_results.isnot(None),
            Post.source.isnot(None)
        ).all()

        source_sentiment = {}
        for post in posts:
            source = post.source
            if source not in source_sentiment:
                source_sentiment[source] = {"positive": 0, "neutral": 0, "negative": 0}

            if post.ai_results and "sentiment" in post.ai_results:
                label = post.ai_results["sentiment"].get("label", "").lower()
                if label in ["positive", "neutral", "negative"]:
                    source_sentiment[source][label] += 1

        return [
            {
                "source": source,
                "positive": counts["positive"],
                "neutral": counts["neutral"],
                "negative": counts["negative"],
                "total": counts["positive"] + counts["neutral"] + counts["negative"],
            }
            for source, counts in source_sentiment.items()
        ]
    finally:
        db.close()


@app.get("/analytics/sentiment-trend")
def get_sentiment_trend(days: int = Query(30, le=365)):
    """Get sentiment trend over time"""
    db = SessionLocal()
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        posts = db.query(Post).filter(
            Post.ai_results.isnot(None),
            Post.timestamp >= cutoff_date,
            Post.timestamp.isnot(None)
        ).all()

        # Group by date
        date_sentiment = {}
        for post in posts:
            date_str = post.timestamp.strftime("%Y-%m-%d")
            if date_str not in date_sentiment:
                date_sentiment[date_str] = {"positive": 0, "neutral": 0, "negative": 0}

            if post.ai_results and "sentiment" in post.ai_results:
                label = post.ai_results["sentiment"].get("label", "").lower()
                if label in ["positive", "neutral", "negative"]:
                    date_sentiment[date_str][label] += 1

        # Sort by date
        sorted_dates = sorted(date_sentiment.keys())

        return [
            {
                "date": date,
                "positive": date_sentiment[date]["positive"],
                "neutral": date_sentiment[date]["neutral"],
                "negative": date_sentiment[date]["negative"],
            }
            for date in sorted_dates
        ]
    finally:
        db.close()


# ============================================================================
# TARGETS OVERVIEW ANALYTICS
# ============================================================================

@app.get("/analytics/targets-overview")
def get_targets_overview():
    """Get overview of all targets"""
    db = SessionLocal()
    try:
        users_total = db.query(TargetUser).count()
        users_active = db.query(TargetUser).filter(TargetUser.is_active == True).count()

        hashtags_total = db.query(TargetHashtag).count()
        hashtags_active = db.query(TargetHashtag).filter(TargetHashtag.is_active == True).count()

        places_total = db.query(TargetPlace).count()
        places_active = db.query(TargetPlace).filter(TargetPlace.is_active == True).count()

        return {
            "users": {"total": users_total, "active": users_active},
            "hashtags": {"total": hashtags_total, "active": hashtags_active},
            "places": {"total": places_total, "active": places_active},
        }
    finally:
        db.close()


@app.get("/analytics/scraping-activity")
def get_scraping_activity():
    """Get recent scraping activity"""
    db = SessionLocal()
    try:
        # Get recent posts by collected_at
        recent_posts = db.query(Post).order_by(desc(Post.collected_at)).limit(100).all()

        # Group by date
        activity = {}
        for post in recent_posts:
            if post.collected_at:
                date_str = post.collected_at.strftime("%Y-%m-%d")
                if date_str not in activity:
                    activity[date_str] = {"posts": 0, "sources": set()}
                activity[date_str]["posts"] += 1
                if post.source:
                    activity[date_str]["sources"].add(post.source)

        # Sort by date descending
        sorted_dates = sorted(activity.keys(), reverse=True)

        return [
            {
                "date": date,
                "posts_collected": activity[date]["posts"],
                "sources": list(activity[date]["sources"]),
            }
            for date in sorted_dates[:14]  # Last 2 weeks
        ]
    finally:
        db.close()
