from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(String, unique=True, nullable=False, index=True)
    shortcode = Column(String)
    post_url = Column(String)
    
    owner_username = Column(String, index=True)
    owner_id = Column(String)
    caption = Column(Text)
    post_type = Column(String)  # Photo, Video, Carousel, Reel
    
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    
    timestamp = Column(DateTime, index=True)  # When post was created on Instagram
    collected_at = Column(DateTime, default=datetime.utcnow)  # When was it scraped
    
    source = Column(String)  # 'hashtag/user/mentions scraper etc.'
    
    # AI Results
    ai_results = Column(JSON, nullable=True)
    # Potential structure (I say potential because this is flexible, can be changed later):
    # {
    #   "sentiment": {"score": 0.8, "label": "positive"},
    #   "summary": "User loves the service...",
    #   "topics": ["service", "experience"],
    #   "processed_at": "2025-12-15T10:00:00Z"
    # }
    
    # Relationships
    comments = relationship('Comment', back_populates='post', cascade='all, delete-orphan')


class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    comment_id = Column(String, unique=True, nullable=False, index=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False, index=True)
    comment_text = Column(Text, nullable=False)
    
    owner_username = Column(String)
    owner_id = Column(String)
    
    likes_count = Column(Integer, default=0)
    
    timestamp = Column(DateTime, index=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    
    # AI Results
    ai_results = Column(JSON, nullable=True)
    # Potential structure (I say potential because this is flexible, can be changed later):
    # {
    #   "sentiment": {"score": -0.5, "label": "negative", "confidence": 0.85},
    #   "summary": "Customer complains about delayed flight",
    #   "language": "ar",
    #   "processed_at": "2025-12-15T10:00:00Z"
    # }
    
    # Relationships
    post = relationship('Post', back_populates='comments')


class WeeklyReport(Base):
    __tablename__ = 'weekly_reports'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Week identification (weeks start on Sunday)
    week_start_date = Column(DateTime, nullable=False, index=True)  # Sunday 00:00:00
    week_end_date = Column(DateTime, nullable=False)  # Saturday 23:59:59
    year = Column(Integer, nullable=False, index=True)
    week_number = Column(Integer, nullable=False, index=True)  # ISO week number
    
    # Content statistics
    post_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    
    # Summary
    summary = Column(Text, nullable=True)  # AI-generated summary of the week
    
    # Sentiment aggregation
    sentiment_label = Column(String, nullable=True)  # Overall: positive/neutral/negative
    sentiment_score = Column(Integer, default=0)  # -100 to +100 scale
    sentiment_breakdown = Column(JSON, nullable=True)  # {positive: X, neutral: Y, negative: Z}
    
    # Metadata
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<WeeklyReport(week={self.week_number}, year={self.year}, posts={self.post_count})>"


class TargetUser(Base):
    __tablename__ = 'target_users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(String, index=True)  # Instagram user ID if known
    
    display_name = Column(String)
    profile_url = Column(String)
    follower_count = Column(Integer)
    is_verified = Column(Boolean, default=False)
    
    priority = Column(Integer, default=5, index=True)  # 1=highest, 10=lowest
    is_active = Column(Boolean, default=True, index=True)  # Whether to actively monitor
    added_at = Column(DateTime, default=datetime.utcnow)
    last_scraped_at = Column(DateTime, nullable=True)
    
    notes = Column(Text, nullable=True)  # Why this user is being monitored
    tags = Column(JSON, nullable=True)  # ["competitor", "influencer", "partner"]


class TargetHashtag(Base):
    __tablename__ = 'target_hashtags'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hashtag = Column(String, unique=True, nullable=False, index=True)  # Without the '#'
    
    post_count = Column(Integer)  # Total posts with this hashtag
    
    priority = Column(Integer, default=5, index=True)  # 1=highest, 10=lowest
    is_active = Column(Boolean, default=True, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    last_scraped_at = Column(DateTime, nullable=True)
    
    notes = Column(Text, nullable=True)  # Campaign name, reason for tracking
    tags = Column(JSON, nullable=True)  # ["campaign_flynas2025", "brand", "competitive"]


class TargetPlace(Base):
    __tablename__ = 'target_places'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    place_name = Column(String, nullable=False, index=True)
    place_id = Column(String, unique=True, nullable=False, index=True)  # Instagram location ID
    
    city = Column(String)
    country = Column(String)
    latitude = Column(String)
    longitude = Column(String)
    post_count = Column(Integer)  # Total posts at this location
    
    priority = Column(Integer, default=5, index=True)  # 1=highest, 10=lowest
    is_active = Column(Boolean, default=True, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    last_scraped_at = Column(DateTime, nullable=True)
    
    notes = Column(Text, nullable=True)  # Airport, destination, lounge
    tags = Column(JSON, nullable=True)  # ["airport", "destination", "lounge"]


class JobSchedule(Base):
    __tablename__ = 'job_schedules'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, unique=True, nullable=False, index=True)  # e.g., 'scrape_targets'
    name = Column(String)  # Display name
    is_active = Column(Boolean, default=True)
    
    # Schedule Configuration
    schedule_type = Column(String, default='interval')  # 'interval' or 'specific_time'
    
    # For 'interval' type
    interval_minutes = Column(Integer, nullable=True)
    
    # For 'specific_time' type
    hour = Column(Integer, nullable=True)  # 0-23
    minute = Column(Integer, nullable=True)  # 0-59
    day_of_week = Column(String, nullable=True)  # 'mon', 'tue', etc. or '*'
    day_of_month = Column(String, nullable=True)  # '1', '15', etc. or '*'
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class JobExecution(Base):
    __tablename__ = 'job_executions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, index=True) # ID of the scheduled job
    status = Column(String) # running, completed, failed
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    result_summary = Column(JSON, nullable=True) # e.g. {posts_added: 5}
    error_message = Column(Text, nullable=True)
