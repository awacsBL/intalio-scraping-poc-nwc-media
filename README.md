# Instagram Scraping POC - NWC Media

Instagram data collection and AI analysis system using Apify actors for hashtag tracking, user monitoring, and comment analysis. Includes Arabic summarization and multilingual sentiment analysis.

## Features

- **Data Collection**: Scrape posts, comments, profiles, and search results via Apify
- **Arabic Summarization**: Automatically summarize comments and posts using `fatmaserry/AraT5v2-arabic-summarization`
- **Sentiment Analysis**: Multilingual sentiment detection with `tabularisai/multilingual-sentiment-analysis`
- **Smart Deduplication**: PostgreSQL ON CONFLICT handling for efficient batch inserts
- **Flexible Storage**: JSON fields for AI results and metadata

## Quick Start

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
APIFY_API_TOKEN=your_token_here
POSTGRES_USER=nwc_media
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=instagram_scraper
```

### 2. Launch Services

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

## Testing

### Health Check

```bash
curl http://localhost:8000/
```

### Manual Scraping

```bash
# Scrape hashtag posts (start with small limits)
curl -X POST http://localhost:8000/scrape/hashtags \
  -H "Content-Type: application/json" \
  -d '{"hashtags": ["nwc_media"], "limit": 5}'

# Scrape comments for recent posts
curl -X POST http://localhost:8000/scrape/comments \
  -H "Content-Type: application/json" \
  -d '{"limit_posts": 5, "limit_comments": 20}'

# Check database stats
curl http://localhost:8000/stats
```

### Discovery Pipeline

```bash
# Find accounts, hashtags, and places mentioning your brand
curl -X POST http://localhost:8000/pipeline/discovery \
  -H "Content-Type: application/json" \
  -d '{"search_term": "nwc_media", "limit": 10}'
```

### Full Pipeline

```bash
# Complete workflow: discover, collect posts, collect comments
curl -X POST http://localhost:8000/pipeline/full \
  -H "Content-Type: application/json" \
  -d '{"search_term": "nwc_media", "limit_discovery": 10, "limit_posts": 5, "limit_comments": 20}'

# Monitor progress
docker-compose logs -f scraper
```

### Database Access

```bash
docker-compose exec postgres psql -U nwc_media -d instagram_scraper
```

```sql
SELECT COUNT(*) FROM posts;
SELECT post_id, owner_username, LEFT(caption, 50) FROM posts LIMIT 5;
SELECT COUNT(*) FROM comments;
```

## Project Structure

```
app/
├── config.py          # Environment configuration
├── database.py        # SQLAlchemy setup
├── models.py          # Database models (Post, Comment, Target tables)
├── scraper.py         # Apify client wrapper (6 actors)
├── orchestrator.py    # Data collection workflows
└── main.py            # FastAPI endpoints
```

## Database Schema

### Posts Table

- `post_id` (unique), `shortcode`, `post_url`
- `owner_username`, `owner_id`, `caption`
- `post_type`, `likes_count`, `comments_count`
- `timestamp`, `collected_at`, `source`
- `ai_results` (JSON) - Flexible field for AI analysis

### Comments Table

- `comment_id` (unique), `post_id` (foreign key)
- `comment_text`, `owner_username`, `owner_id`
- `likes_count`, `timestamp`, `collected_at`
- `ai_results` (JSON) - Flexible field for sentiment/analysis

### Target Tables

- `target_users` - Accounts to monitor
- `target_hashtags` - Hashtags to track
- `target_places` - Locations to follow

## API Endpoints

### Basic Operations

**POST `/scrape/hashtags`**

```bash
curl -X POST http://localhost:8000/scrape/hashtags \
  -H "Content-Type: application/json" \
  -d '{"hashtags": ["nwc_media", "water"], "limit": 50}'
```

**POST `/scrape/comments`**

```bash
curl -X POST http://localhost:8000/scrape/comments \
  -H "Content-Type: application/json" \
  -d '{"limit_posts": 10, "limit_comments": 50}'
```

**GET `/stats`**

```bash
curl http://localhost:8000/stats
```

### AI Services Endpoints

**POST `/ai/summarize/post/{post_id}`** - Summarize all comments under a post

```bash
# Prioritize high-engagement comments
curl -X POST "http://localhost:8000/ai/summarize/post/1?prioritize_engagement=true"
```

**POST `/ai/summarize/comment/{comment_id}`** - Summarize long comment (>100 chars)

```bash
curl -X POST http://localhost:8000/ai/summarize/comment/5
```

**POST `/ai/summarize/period`** - Summarize content from last N days

```bash
curl -X POST "http://localhost:8000/ai/summarize/period?days=7"
```

**POST `/ai/sentiment/comment/{comment_id}`** - Analyze single comment sentiment

```bash
curl -X POST http://localhost:8000/ai/sentiment/comment/5
```

**POST `/ai/sentiment/post/{post_id}`** - Analyze post sentiment (aggregated)

```bash
curl -X POST http://localhost:8000/ai/sentiment/post/1
```

**POST `/ai/sentiment/batch`** - Batch process unanalyzed comments

```bash
curl -X POST "http://localhost:8000/ai/sentiment/batch?batch_size=100"
```

### Pipeline Workflows

**POST `/pipeline/discovery`**

Discovers accounts, hashtags, and places mentioning your brand. Returns related hashtags for expanded tracking.

```bash
curl -X POST http://localhost:8000/pipeline/discovery \
  -H "Content-Type: application/json" \
  -d '{"search_term": "nwc_media", "limit": 30}'
```

Response includes discovered accounts, hashtags, places, and related hashtags with counts.

**POST `/pipeline/full`**

Complete end-to-end pipeline:

1. Discovery (search + hashtag stats)
2. Collect posts (hashtags + user profiles + mentions)
3. Collect comments for all posts

```bash
curl -X POST http://localhost:8000/pipeline/full \
  -H "Content-Type: application/json" \
  -d '{"search_term": "nwc_media", "limit_discovery": 30, "limit_posts": 20, "limit_comments": 50}'
```

This operation runs in the background. Monitor logs for progress.

## Pipeline Architecture

The system uses 6 Apify actors:

**Discovery Phase:**

- Instagram Search Scraper (accounts, hashtags, places)
- Hashtag Stats Scraper (related hashtags)

**Collection Phase:**

- Hashtag Post Scraper (posts from hashtags)
- Profile Scraper (posts from user accounts)
- Tagged/Mentions Scraper (posts mentioning brand)

**Analysis Phase:**

- Comment Scraper (comments for collected posts)

## AI Results Integration

The `ai_results` JSON field allows flexible storage of analysis data:

```python
from app.database import SessionLocal
from app.models import Comment

db = SessionLocal()
comment = db.query(Comment).first()
comment.ai_results = {
    "sentiment": {"score": 0.75, "label": "positive", "confidence": 0.92},
    "summary": "Customer praises flight experience",
    "language": "ar",
    "processed_at": "2025-12-15T10:00:00Z"
}
db.commit()
```

## Cost Management

Apify pricing (pay-per-use):

- Hashtag Posts: $2.30/1k posts
- Comments: $2.30/1k comments
- Search: $1.50-2.30/1k results
- Profile: $1.60/1k profiles
- Mentions: $1.50/1k posts
- Stats: Pay per event

Always test with small limits first (e.g., `limit=5`).

## Local Development

Without Docker:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure local database in .env
DATABASE_URL=postgresql://nwc_media:nwc_media123@localhost:5432/instagram_scraper

uvicorn app.main:app --reload
```

## Production Deployment

1. Update credentials in `.env` with strong passwords
2. Never commit `.env` to version control
3. Use environment-specific `.env` files for staging/production
4. Consider using Docker secrets or external secret managers
5. Implement rate limiting and cost controls

## Monitoring

View container logs:

```bash
docker-compose logs -f scraper
docker-compose logs -f postgres
```

Database statistics:

```bash
curl http://localhost:8000/stats
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open browser at `http://localhost:3000`
