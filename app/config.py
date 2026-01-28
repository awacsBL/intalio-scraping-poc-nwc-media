import os
from pathlib import Path
from dotenv import load_dotenv
import torch

# Load .env from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Database
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Apify
APIFY_API_TOKEN = os.getenv('APIFY_API_TOKEN')
if not APIFY_API_TOKEN:
    raise ValueError("APIFY_API_TOKEN environment variable is required")
INSTAGRAM_SEARCH_SCRAPER_ACTOR_ID = os.getenv('INSTAGRAM_SEARCH_SCRAPER_ACTOR_ID', '')
INSTAGRAM_HASHTAG_STATS_ACTOR_ID = os.getenv('INSTAGRAM_HASHTAG_STATS_ACTOR_ID', '')
INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID = os.getenv('INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID', '')
INSTAGRAM_POST_SCRAPER_ACTOR_ID = os.getenv('INSTAGRAM_POST_SCRAPER_ACTOR_ID', '')
INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID = os.getenv('INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID', '')
INSTAGRAM_TAGGED_SCRAPER_ACTOR_ID = os.getenv('INSTAGRAM_TAGGED_SCRAPER_ACTOR_ID', '')
INSTAGRAM_COMMENT_SCRAPER_ACTOR_ID = os.getenv('INSTAGRAM_COMMENT_SCRAPER_ACTOR_ID', '')

# AI Services Configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Model names
SUMMARIZATION_MODEL = "fatmaserry/AraT5v2-arabic-summarization"
SENTIMENT_MODEL = "tabularisai/multilingual-sentiment-analysis"

# Summarization parameters
SUMMARY_CONFIG = {
    "max_input_length": 1024,
    "max_output_length": 150,
    "num_beams": 4,
    "min_length": 20,
    "short_summary_max_length": 50,  # For single comment summaries
    "time_period_max_length": 300,  # For time period/weekly summaries
}

# Sentiment parameters
SENTIMENT_CONFIG = {
    "max_length": 512,
    "truncation": True,
    "padding": True,
}

# Business logic thresholds
LONG_COMMENT_THRESHOLD = 100  # Characters
SUMMARY_TIME_WINDOW_DAYS = 7  # Days to look back for time-based summary
SENTIMENT_POSITIVE_THRESHOLD = 0.2  # Average score threshold for positive sentiment
SENTIMENT_NEGATIVE_THRESHOLD = -0.2  # Average score threshold for negative sentiment
SENTIMENT_TIME_PERIOD_THRESHOLD = 20  # Percentage threshold for time period sentiment (0-100)
