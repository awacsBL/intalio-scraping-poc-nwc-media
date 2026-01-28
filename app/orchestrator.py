# type: ignore  # SQLAlchemy Column type annotations have known limitations with type checkers
from app.scraper import InstagramScraper
from app.database import SessionLocal
from app.models import Post, Comment, WeeklyReport, TargetUser, TargetHashtag, TargetPlace
from typing import Optional, List, Dict
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timedelta
import logging
import pandas as pd

logger = logging.getLogger("Orchestrator")


class ScrapingOrchestrator:
    def __init__(self):
        self.scraper = InstagramScraper()
        # Lazy loading for AI services
        self._summarization_service = None
        self._sentiment_service = None
    
    @property
    def summarization_service(self):
        if self._summarization_service is None:
            from app.services.ai import SummarizationService
            self._summarization_service = SummarizationService()
        return self._summarization_service
    
    @property
    def sentiment_service(self):
        if self._sentiment_service is None:
            from app.services.ai import SentimentService
            self._sentiment_service = SentimentService()
        return self._sentiment_service
    
    def scrape_hashtags(self, hashtags: list[str], limit: int = 10) -> dict:
        """
        Scrape posts for hashtags and store in database
        
        Args:
            hashtags: List of hashtag strings
            limit: Max posts per hashtag
            
        Returns:
            Summary dict with counts
        """
        db = SessionLocal()
        
        try:
            logger.info(f"Starting hashtag scrape: {hashtags}")
            posts_data = self.scraper.scrape_hashtag_posts(hashtags, limit)
            
            if not posts_data:
                return {'success': True, 'posts_added': 0, 'posts_skipped': 0, 'hashtags': hashtags}
            
            df = pd.DataFrame(posts_data)
            df['post_id'] = df['id'].fillna(df['shortCode'])
            
            # Validate post_id exists
            if df['post_id'].isna().any():
                invalid_count = df['post_id'].isna().sum()
                logger.warning(f"Found {invalid_count} posts without id or shortCode, dropping them")
                df = df.dropna(subset=['post_id'])
            
            if len(df) == 0:
                return {'success': True, 'posts_added': 0, 'posts_skipped': 0, 'hashtags': hashtags}
            
            df['source'] = 'hashtag'
            
            df = df.rename(columns={
                'shortCode': 'shortcode',
                'url': 'post_url',
                'ownerUsername': 'owner_username',
                'ownerId': 'owner_id',
                'type': 'post_type',
                'likesCount': 'likes_count',
                'commentsCount': 'comments_count'
            })
            
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            df['caption'] = df['caption'].fillna('')
            df['likes_count'] = df['likes_count'].fillna(0).astype(int)
            df['comments_count'] = df['comments_count'].fillna(0).astype(int)
            
            existing_df = pd.read_sql(
                db.query(Post.post_id).filter(Post.post_id.in_(df['post_id'].tolist())).statement,
                db.bind  # type: ignore
            )
            
            new_df = df[~df['post_id'].isin(existing_df['post_id'])]
            posts_skipped = len(df) - len(new_df)
            
            if len(new_df) > 0:
                # Use PostgreSQL's ON CONFLICT for efficient duplicate handling
                records = new_df[['post_id', 'shortcode', 'post_url', 'owner_username', 'owner_id', 
                                  'caption', 'post_type', 'likes_count', 'comments_count', 'timestamp', 'source']].to_dict('records')
                
                stmt = insert(Post.__table__).values(records)
                stmt = stmt.on_conflict_do_nothing(index_elements=['post_id'])
                result = db.execute(stmt)
                actual_inserted = result.rowcount  # type: ignore
                logger.info(f"Batch inserted {actual_inserted} posts ({len(new_df) - actual_inserted} duplicates from race condition)")
            
            db.commit()
            logger.info(f"Hashtag scrape complete: {len(new_df)} added, {posts_skipped} skipped")
            
            return {
                'success': True,
                'posts_added': len(new_df),
                'posts_skipped': posts_skipped,
                'hashtags': hashtags
            }
            
        except Exception as e:
            logger.error(f"Error in hashtag scrape: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def scrape_comments_for_posts(self, limit_posts: int = 10, limit_comments: int = 10) -> dict:
        """
        Scrape comments for recent posts that don't have comments yet
        
        Args:
            limit_posts: Max posts to scrape comments for
            limit_comments: Max comments per post
            
        Returns:
            Summary dict
        """
        db = SessionLocal()
        
        try:
            logger.info(f"Starting comment scrape for recent posts")
            
            posts_without_comments = db.query(Post)\
                .filter(Post.comments_count > 0)\
                .filter(~Post.comments.any())\
                .order_by(Post.timestamp.desc())\
                .limit(limit_posts)\
                .all()
            
            if not posts_without_comments:
                logger.info("No posts need comment scraping")
                return {'success': True, 'comments_added': 0, 'posts_processed': 0}
            
            post_urls: list[str] = [str(p.post_url) for p in posts_without_comments]
            comments_data = self.scraper.scrape_post_comments(post_urls, limit_comments)
            
            if not comments_data:
                return {'success': True, 'comments_added': 0, 'posts_processed': len(posts_without_comments)}
            
            df = pd.DataFrame(comments_data)
            
            # Validate required columns
            if 'postUrl' not in df.columns:
                logger.error("Comments data missing 'postUrl' field")
                return {'success': False, 'error': 'Missing postUrl field', 'comments_added': 0, 'posts_processed': len(posts_without_comments)}
            
            # Rename columns (handle optional fields)
            # Kind of bajj while scraping comments la2enno it can find comments
            # with no owners sometimes (deleted accounts, switched to private, etc.)
            rename_map = {
                'id': 'comment_id',
                'text': 'comment_text',
                'likesCount': 'likes_count'
            }
            if 'ownerUsername' in df.columns:
                rename_map['ownerUsername'] = 'owner_username'
            if 'ownerId' in df.columns:
                rename_map['ownerId'] = 'owner_id'
            
            df = df.rename(columns=rename_map)
            
            # Add missing optional columns
            if 'owner_username' not in df.columns:
                df['owner_username'] = None
            if 'owner_id' not in df.columns:
                df['owner_id'] = None
            
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            df['comment_text'] = df['comment_text'].fillna('')
            df['likes_count'] = df['likes_count'].fillna(0).astype(int)
            
            # Ensure post URLs are strings to avoid PostgreSQL type errors
            post_urls_to_check = [str(url) for url in df['postUrl'].unique().tolist() if url]
            
            posts_df = pd.read_sql(
                db.query(Post.id, Post.post_url).filter(Post.post_url.in_(post_urls_to_check)).statement,
                db.bind  # type: ignore
            )
            posts_map = dict(zip(posts_df['post_url'], posts_df['id'])) # Basically a JOIN between scraped data and existing database records for Foreign Key
            df['post_id'] = df['postUrl'].map(posts_map)
            
            # Log unmapped comments
            unmapped_count = df['post_id'].isna().sum()
            if unmapped_count > 0:
                logger.warning(f"Could not map {unmapped_count} comments to database posts (URLs not found)")
            df = df.dropna(subset=['post_id'])
            
            existing_df = pd.read_sql(
                db.query(Comment.comment_id).filter(Comment.comment_id.in_(df['comment_id'].tolist())).statement,
                db.bind  # type: ignore
            )
            
            new_df = df[~df['comment_id'].isin(existing_df['comment_id'])]
            comments_skipped = len(df) - len(new_df)
            
            if len(new_df) > 0:
                # Use PostgreSQL's ON CONFLICT for efficient duplicate handling
                records = new_df[['comment_id', 'post_id', 'comment_text', 'owner_username', 
                                  'owner_id', 'likes_count', 'timestamp']].to_dict('records')
                
                stmt = insert(Comment.__table__).values(records)
                stmt = stmt.on_conflict_do_nothing(index_elements=['comment_id'])
                result = db.execute(stmt)
                actual_inserted = result.rowcount
                logger.info(f"Batch inserted {actual_inserted} comments ({len(new_df) - actual_inserted} duplicates from race condition)")
            
            db.commit()
            logger.info(f"Comment scrape complete: {len(new_df)} added, {comments_skipped} skipped")
            
            return {
                'success': True,
                'comments_added': len(new_df),
                'comments_skipped': comments_skipped,
                'posts_processed': len(posts_without_comments)
            }
            
        except Exception as e:
            logger.error(f"Error in comment scrape: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def run_discovery_pipeline(
        self, 
        search_term: str, 
        limit_users: int = 20,
        limit_hashtags: int = 10,
        limit_places: int = 5,
        max_hashtags_for_stats: int = 10
    ) -> dict:
        """
        Complete discovery pipeline:
        1. Search Instagram for brand mentions
        2. Get hashtag statistics
        3. Return discovered targets
        
        Args:
            search_term: Brand name to search for (e.g., 'flynas')
            limit_users: Max user accounts to discover
            limit_hashtags: Max hashtags to discover
            limit_places: Max places to discover
            max_hashtags_for_stats: Max hashtags to get stats for (default: 10)
            
        Returns:
            Summary of discovered targets
        """
        logger.info(f"Starting discovery pipeline for: {search_term}")
        
        try:
            # Step 1: Search Instagram for all types
            logger.info("Step 1: Searching Instagram...")
            
            # Search for users
            user_results = self.scraper.search_instagram(
                [search_term],
                limit=limit_users,
                search_type='user'
            )
            discovered_accounts = [acc.get('username') for acc in user_results if acc.get('username')]
            
            # Search for hashtags
            hashtag_results = self.scraper.search_instagram(
                [search_term],
                limit=limit_hashtags,
                search_type='hashtag'
            )
            discovered_hashtags = [tag.get('name') for tag in hashtag_results if tag.get('name')]
            
            # Search for places
            place_results = self.scraper.search_instagram(
                [search_term],
                limit=limit_places,
                search_type='place'
            )
            discovered_places = [place.get('name') for place in place_results if place.get('name')]
            
            logger.info(f"Found {len(discovered_accounts)} accounts, {len(discovered_hashtags)} hashtags, {len(discovered_places)} places")
            
            # Step 2: Get hashtag stats for discovered hashtags
            related_hashtags = []
            if discovered_hashtags:
                logger.info("Step 2: Getting hashtag statistics...")
                # Limit to max_hashtags_for_stats to control API costs
                hashtags_to_analyze: list[str] = [h for h in discovered_hashtags[:max_hashtags_for_stats] if h]
                hashtag_stats = self.scraper.get_hashtag_stats(hashtags_to_analyze)
                
                # Extract related hashtags from stats (combine all types)
                for stat in hashtag_stats:
                    for freq_type in ['frequent', 'average', 'rare', 'relatedFrequent', 'relatedAverage', 'relatedRare']:
                        if stat.get(freq_type):
                            related_hashtags.extend([tag.get('hash', '').lstrip('#') for tag in stat[freq_type] if tag.get('hash')])
                
                related_hashtags = list(set(related_hashtags))
                logger.info(f"Found {len(related_hashtags)} related hashtags")
            
            result = {
                'success': True,
                'search_term': search_term,
                'discovered': {
                    'accounts': discovered_accounts,
                    'hashtags': discovered_hashtags,
                    'places': discovered_places,
                    'related_hashtags': related_hashtags
                },
                'counts': {
                    'accounts': len(discovered_accounts),
                    'hashtags': len(discovered_hashtags),
                    'places': len(discovered_places),
                    'related_hashtags': len(related_hashtags)
                }
            }
            
            logger.info(f"Discovery pipeline complete!")
            return result
            
        except Exception as e:
            logger.error(f"Error in discovery pipeline: {e}")
            raise
    
    def run_full_collection_pipeline(
        self,
        search_term: str,
        limit_discovery_users: int = 10,
        limit_discovery_hashtags: int = 5,
        limit_discovery_places: int = 0, # currently even if it scrapes places we don't actually use them for post scraping
        max_users_to_scrape: int = 3,
        max_hashtags_to_scrape: int = 5,
        limit_posts_per_target: int = 10,
        max_posts_for_comments: Optional[int] = 20,
        limit_comments: int = 10
    ) -> dict:
        """
        End-to-end scraping pipeline:
        1. Discovery (search + hashtag stats)
        2. Collect posts (from hashtags, users, mentions)
        3. Collect comments
        
        Args:
            search_term: Brand name to search for
            limit_discovery_users: Max users to discover
            limit_discovery_hashtags: Max hashtags to discover
            limit_discovery_places: Max places to discover
            max_users_to_scrape: Max users to collect posts from (cost control)
            max_hashtags_to_scrape: Max hashtags to collect posts from (cost control)
            limit_posts_per_target: Max posts per hashtag/user
            max_posts_for_comments: Max posts to scrape comments for (None = all posts needing comments)
            limit_comments: Max comments per post
            
        Returns:
            Complete pipeline summary
        """
        db = SessionLocal()
        
        try:
            logger.info(f"Starting collection pipeline for: {search_term}")
            
            # Phase 1: Discovery
            discovery = self.run_discovery_pipeline(
                search_term, 
                limit_users=limit_discovery_users,
                limit_hashtags=limit_discovery_hashtags,
                limit_places=limit_discovery_places
            )
            
            discovered_hashtags = discovery['discovered']['hashtags']
            discovered_accounts = discovery['discovered']['accounts']
            
            # Phase 2: Collect Posts
            
            posts_added = 0
            posts_skipped = 0
            
            all_posts_data = []
            
            if discovered_hashtags:
                logger.info(f"Collecting posts from {min(len(discovered_hashtags), max_hashtags_to_scrape)} of {len(discovered_hashtags)} discovered hashtags...")
                hashtag_posts = self.scraper.scrape_hashtag_posts(
                    discovered_hashtags[:max_hashtags_to_scrape], 
                    limit_posts_per_target
                )
                for post in hashtag_posts:
                    post['source'] = 'hashtag'
                    all_posts_data.append(post)
            
            if discovered_accounts:
                logger.info(f"Collecting posts from {min(len(discovered_accounts), max_users_to_scrape)} of {len(discovered_accounts)} discovered users...")
                user_profiles = self.scraper.scrape_user_posts(discovered_accounts[:max_users_to_scrape])
                
                # Extract posts from profile data (scraper returns profiles with nested latestPosts)
                for profile in user_profiles:
                    if profile.get('latestPosts'):
                        for post in profile['latestPosts']:
                            post['source'] = 'user_profile'
                            all_posts_data.append(post)
            
            logger.info(f"Collecting posts where {search_term} is mentioned...")
            mention_posts = self.scraper.scrape_mentions([search_term], limit_posts_per_target)
            for post in mention_posts:
                post['source'] = 'mentions'
                all_posts_data.append(post)
            
            if all_posts_data:
                df = pd.DataFrame(all_posts_data)
                df['post_id'] = df['id'].fillna(df['shortCode'])
                
                # Validate post_id exists
                if df['post_id'].isna().any():
                    invalid_count = df['post_id'].isna().sum()
                    logger.warning(f"Found {invalid_count} posts without id or shortCode, dropping them")
                    df = df.dropna(subset=['post_id'])
                
                if len(df) == 0:
                    logger.warning("No valid posts to insert after validation")
                else:
                    df = df.rename(columns={
                        'shortCode': 'shortcode',
                        'url': 'post_url',
                        'ownerUsername': 'owner_username',
                        'ownerId': 'owner_id',
                        'type': 'post_type',
                        'likesCount': 'likes_count',
                        'commentsCount': 'comments_count'
                    })
                    
                    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
                    df['caption'] = df['caption'].fillna('')
                    df['likes_count'] = df['likes_count'].fillna(0).astype(int)
                    df['comments_count'] = df['comments_count'].fillna(0).astype(int)
                    
                    existing_df = pd.read_sql(
                        db.query(Post.post_id).filter(Post.post_id.in_(df['post_id'].tolist())).statement,
                        db.bind  # type: ignore
                    )
                    
                    new_df = df[~df['post_id'].isin(existing_df['post_id'])]
                    posts_skipped = len(df) - len(new_df)
                    
                    if len(new_df) > 0:
                        # Use PostgreSQL's ON CONFLICT for efficient duplicate handling
                        records = new_df[['post_id', 'shortcode', 'post_url', 'owner_username', 'owner_id',
                                          'caption', 'post_type', 'likes_count', 'comments_count', 'timestamp', 'source']].to_dict('records')
                        
                        stmt = insert(Post.__table__).values(records)
                        stmt = stmt.on_conflict_do_nothing(index_elements=['post_id'])
                        result = db.execute(stmt)
                        posts_added = result.rowcount
                        logger.info(f"Batch inserted {posts_added} posts ({len(new_df) - posts_added} duplicates from race condition)")
                    
                    posts_added = len(new_df)
                    db.commit()
                    logger.info(f"Added {posts_added} posts total, {posts_skipped} skipped")
            
            # Phase 3: Collect Comments
            
            # If max_posts_for_comments is None, count all posts needing comments
            if max_posts_for_comments is None:
                posts_needing_comments = db.query(Post)\
                    .filter(Post.comments_count > 0)\
                    .filter(~Post.comments.any())\
                    .count()
                posts_to_scrape = posts_needing_comments
                logger.info(f"Scraping comments for all {posts_needing_comments} posts needing comments")
            else:
                posts_to_scrape = max_posts_for_comments
                logger.info(f"Scraping comments for up to {max_posts_for_comments} posts")
            
            comment_result = self.scrape_comments_for_posts(
                limit_posts=posts_to_scrape,
                limit_comments=limit_comments
            )
            
            # Final Summary
            
            return {
                'success': True,
                'search_term': search_term,
                'discovery': discovery['counts'],
                'posts': {
                    'added': posts_added,
                    'skipped': posts_skipped,
                    'total': posts_added + posts_skipped
                },
                'comments': comment_result
            }
            
        except Exception as e:
            logger.error(f"Error in full pipeline: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    # ============================
    # TARGET MANAGEMENT METHODS
    # ============================
    
    def save_discovered_targets(
        self,
        hashtags: Optional[List[str]] = None,
        usernames: Optional[List[str]] = None,
        places: Optional[List[Dict]] = None,
        priority: int = 5,
        notes: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> dict:
        """
        Save discovered items as targets for future monitoring
        
        Args:
            hashtags: List of hashtag names (without #)
            usernames: List of Instagram usernames
            places: List of place dicts with place_id and place_name
            priority: Priority level (1=highest, 10=lowest)
            notes: Optional notes about why these targets are being added
            tags: Optional tags for categorization
            
        Returns:
            Summary of targets added
        """
        db = SessionLocal()
        
        try:
            added_hashtags = 0
            added_users = 0
            added_places = 0
            
            if hashtags:
                for hashtag in hashtags:
                    existing = db.query(TargetHashtag).filter(
                        TargetHashtag.hashtag == hashtag
                    ).first()
                    
                    if not existing:
                        target = TargetHashtag(
                            hashtag=hashtag,
                            priority=priority,
                            notes=notes,
                            tags=tags
                        )
                        db.add(target)
                        added_hashtags += 1  # type: ignore
            
            if usernames:
                for username in usernames:
                    existing = db.query(TargetUser).filter(
                        TargetUser.username == username
                    ).first()
                    
                    if not existing:
                        target = TargetUser(
                            username=username,
                            priority=priority,
                            notes=notes,
                            tags=tags
                        )
                        db.add(target)
                        added_users += 1
            
            if places:
                for place in places:
                    if not place.get('place_id'):
                        continue
                        
                    existing = db.query(TargetPlace).filter(
                        TargetPlace.place_id == place['place_id']
                    ).first()
                    
                    if not existing:
                        target = TargetPlace(
                            place_id=place['place_id'],
                            place_name=place.get('place_name', place['place_id']),
                            city=place.get('city'),
                            country=place.get('country'),
                            priority=priority,
                            notes=notes,
                            tags=tags
                        )
                        db.add(target)
                        added_places += 1
            
            db.commit()
            
            logger.info(f"Saved targets: {added_hashtags} hashtags, {added_users} users, {added_places} places")
            
            return {
                'success': True,
                'added': {
                    'hashtags': added_hashtags,
                    'users': added_users,
                    'places': added_places
                }
            }
            
        except Exception as e:
            logger.error(f"Error saving targets: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def get_active_targets(self, target_type: str = 'all') -> dict:
        """
        Get active targets from database, sorted by priority
        
        Args:
            target_type: 'hashtags', 'users', 'places', or 'all'
            
        Returns:
            Dict with lists of active targets
        """
        db = SessionLocal()
        
        try:
            result = {}
            
            if target_type in ['hashtags', 'all']:
                hashtags = db.query(TargetHashtag)\
                    .filter(TargetHashtag.is_active == True)\
                    .order_by(TargetHashtag.priority, TargetHashtag.hashtag)\
                    .all()
                result['hashtags'] = [h.hashtag for h in hashtags]
            
            if target_type in ['users', 'all']:
                users = db.query(TargetUser)\
                    .filter(TargetUser.is_active == True)\
                    .order_by(TargetUser.priority, TargetUser.username)\
                    .all()
                result['users'] = [u.username for u in users]
            
            if target_type in ['places', 'all']:
                places = db.query(TargetPlace)\
                    .filter(TargetPlace.is_active == True)\
                    .order_by(TargetPlace.priority, TargetPlace.place_name)\
                    .all()
                result['places'] = [{'place_id': p.place_id, 'place_name': p.place_name} for p in places]
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting active targets: {e}")
            raise
        finally:
            db.close()
    
    def update_target(
        self,
        target_type: str,
        identifier: str,  # hashtag name, username, or place_id
        priority: Optional[int] = None,
        is_active: Optional[bool] = None,
        notes: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> dict:
        """
        Update target metadata (priority, active status, notes, tags)
        
        Args:
            target_type: 'hashtag', 'user', or 'place'
            identifier: The hashtag name, username, or place_id
            priority: New priority (1-10, optional)
            is_active: New active status (optional)
            notes: New notes (optional)
            tags: New tags list (optional)
        
        Returns:
            Updated target info
        
        Example:
            # Deactivate a hashtag
            orchestrator.update_target('hashtag', 'flynas', is_active=False)
            
            # Change priority and add note
            orchestrator.update_target('user', 'competitor',
                                      priority=1, notes='High priority competitor')
        """
        db = SessionLocal()
        
        try:
            if target_type == 'hashtag':
                target = db.query(TargetHashtag).filter(
                    TargetHashtag.hashtag == identifier
                ).first()
            elif target_type == 'user':
                target = db.query(TargetUser).filter(
                    TargetUser.username == identifier
                ).first()
            elif target_type == 'place':
                target = db.query(TargetPlace).filter(
                    TargetPlace.place_id == identifier
                ).first()
            else:
                raise ValueError(f"Invalid target_type: {target_type}")
            
            if not target:
                raise ValueError(f"{target_type} '{identifier}' not found")
            
            if priority is not None:
                target.priority = priority  # type: ignore
            if is_active is not None:
                target.is_active = is_active  # type: ignore
            if notes is not None:
                target.notes = notes  # type: ignore
            if tags is not None:
                target.tags = tags  # type: ignore
            
            db.commit()
            db.refresh(target) # this makes sure that the target object has the latest data from DB before returning
            
            logger.info(f"Updated {target_type} '{identifier}'")
            
            return {
                'success': True,
                'target_type': target_type,
                'identifier': identifier,
                'priority': target.priority,
                'is_active': target.is_active,
                'notes': target.notes,
                'tags': target.tags
            }
            
        except Exception as e:
            logger.error(f"Error updating target: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def activate_target(self, target_type: str, identifier: str) -> dict:
        """
        Activate a target for scraping
        
        Args:
            target_type: 'hashtag', 'user', or 'place'
            identifier: The hashtag name, username, or place_id
        
        Returns:
            Success message
        """
        return self.update_target(target_type, identifier, is_active=True)
    
    def deactivate_target(self, target_type: str, identifier: str) -> dict:
        """
        Deactivate a target to stop scraping it in later runs
        
        Args:
            target_type: 'hashtag', 'user', or 'place'
            identifier: The hashtag name, username, or place_id
        
        Returns:
            Success message
        """
        return self.update_target(target_type, identifier, is_active=False)
    
    def delete_target(self, target_type: str, identifier: str) -> dict:
        """
        Permanently delete a target from the database
        
        Args:
            target_type: 'hashtag', 'user', or 'place'
            identifier: The hashtag name, username, or place_id
        
        Returns:
            Success message
        """
        db = SessionLocal()
        
        try:
            if target_type == 'hashtag':
                target = db.query(TargetHashtag).filter(
                    TargetHashtag.hashtag == identifier
                ).first()
            elif target_type == 'user':
                target = db.query(TargetUser).filter(
                    TargetUser.username == identifier
                ).first()
            elif target_type == 'place':
                target = db.query(TargetPlace).filter(
                    TargetPlace.place_id == identifier
                ).first()
            else:
                raise ValueError(f"Invalid target_type: {target_type}")
            
            if not target:
                raise ValueError(f"{target_type} '{identifier}' not found")
            
            db.delete(target)
            db.commit()
            
            logger.info(f"Deleted {target_type} '{identifier}'")
            
            return {
                'success': True,
                'message': f"Deleted {target_type} '{identifier}'"
            }
            
        except Exception as e:
            logger.error(f"Error deleting target: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def list_all_targets(
        self,
        target_type: str = 'all',
        include_inactive: bool = False
    ) -> dict:
        """
        List all targets with their metadata
        
        Args:
            target_type: 'hashtags', 'users', 'places', or 'all'
            include_inactive: Include inactive targets (default: False)
        
        Returns:
            Dict with detailed target information
        """
        db = SessionLocal()
        
        try:
            result = {}
            
            if target_type in ['hashtags', 'all']:
                query = db.query(TargetHashtag)
                if not include_inactive:
                    query = query.filter(TargetHashtag.is_active == True)
                
                hashtags = query.order_by(TargetHashtag.priority, TargetHashtag.hashtag).all()
                result['hashtags'] = [{
                    'hashtag': h.hashtag,
                    'priority': h.priority,
                    'is_active': h.is_active,
                    'post_count': h.post_count,
                    'last_scraped_at': h.last_scraped_at.isoformat() if h.last_scraped_at else None,
                    'notes': h.notes,
                    'tags': h.tags
                } for h in hashtags]
            
            if target_type in ['users', 'all']:
                query = db.query(TargetUser)
                if not include_inactive:
                    query = query.filter(TargetUser.is_active == True)
                
                users = query.order_by(TargetUser.priority, TargetUser.username).all()
                result['users'] = [{
                    'username': u.username,
                    'priority': u.priority,
                    'is_active': u.is_active,
                    'display_name': u.display_name,
                    'follower_count': u.follower_count,
                    'is_verified': u.is_verified,
                    'last_scraped_at': u.last_scraped_at.isoformat() if u.last_scraped_at else None,
                    'notes': u.notes,
                    'tags': u.tags
                } for u in users]
            
            if target_type in ['places', 'all']:
                query = db.query(TargetPlace)
                if not include_inactive:
                    query = query.filter(TargetPlace.is_active == True)
                
                places = query.order_by(TargetPlace.priority, TargetPlace.place_name).all()
                result['places'] = [{
                    'place_id': p.place_id,
                    'place_name': p.place_name,
                    'priority': p.priority,
                    'is_active': p.is_active,
                    'city': p.city,
                    'country': p.country,
                    'last_scraped_at': p.last_scraped_at.isoformat() if p.last_scraped_at else None,
                    'notes': p.notes,
                    'tags': p.tags
                } for p in places]
            
            return result
            
        except Exception as e:
            logger.error(f"Error listing targets: {e}")
            raise
        finally:
            db.close()
    
    def run_target_based_pipeline(
        self,
        limit_posts_per_target: int = 10,
        max_posts_for_comments: Optional[int] = 20,
        limit_comments: int = 10,
        update_metadata: bool = True
    ) -> dict:
        """
        Scraping pipeline that uses targets from the database
        
        1. Get active targets from TargetUser/TargetHashtag/TargetPlace tables
        2. Scrape posts from those targets, sorted by priority
        3. Scrape comments for recent posts
        4. Update last_scraped_at timestamps
        
        Args:
            limit_posts_per_target: Max posts to scrape per target
            max_posts_for_comments: Max posts to scrape comments for (None = all)
            limit_comments: Max comments per post
            update_metadata: Whether to update last_scraped_at timestamps
            
        Returns:
            Pipeline summary with statistics
        """
        db = SessionLocal()
        
        try:
            logger.info("Starting target-based scraping pipeline...")
            
            targets = self.get_active_targets('all')
            
            if not any(targets.values()):
                return {
                    'success': True,
                    'message': 'No active targets found in database',
                    'posts': {'added': 0, 'skipped': 0},
                    'comments': {}
                }
            
            logger.info(f"Found {len(targets.get('hashtags', []))} hashtags, "
                       f"{len(targets.get('users', []))} users, "
                       f"{len(targets.get('places', []))} places")
            
            all_posts_data = []
            posts_added = 0
            posts_skipped = 0
            
            # Scrape from hashtags
            if targets.get('hashtags'):
                logger.info(f"Scraping posts from {len(targets['hashtags'])} hashtags...")
                hashtag_posts = self.scraper.scrape_hashtag_posts(
                    targets['hashtags'],
                    limit_posts_per_target
                )
                for post in hashtag_posts:
                    post['source'] = 'target_hashtag'
                    all_posts_data.append(post)
            
            # Scrape from users
            if targets.get('users'):
                logger.info(f"Scraping posts from {len(targets['users'])} users...")
                user_profiles = self.scraper.scrape_user_posts(targets['users'])
                
                for profile in user_profiles:
                    if profile.get('latestPosts'):
                        for post in profile['latestPosts']:
                            post['source'] = 'target_user'
                            all_posts_data.append(post)
            
            # Scrape from places
            # TODO: I will implement place-based scraping later :3
            if targets.get('places'):
                logger.info(f"Place scraping not yet implemented, skipping {len(targets['places'])} places")
            
            # Process and store posts
            if all_posts_data:
                df = pd.DataFrame(all_posts_data)
                df['post_id'] = df['id'].fillna(df['shortCode'])
                
                if df['post_id'].isna().any():
                    invalid_count = df['post_id'].isna().sum()
                    logger.warning(f"Found {invalid_count} posts without id or shortCode, dropping them")
                    df = df.dropna(subset=['post_id'])
                
                if len(df) > 0:
                    df = df.rename(columns={
                        'shortCode': 'shortcode',
                        'url': 'post_url',
                        'ownerUsername': 'owner_username',
                        'ownerId': 'owner_id',
                        'type': 'post_type',
                        'likesCount': 'likes_count',
                        'commentsCount': 'comments_count'
                    })
                    
                    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
                    df['caption'] = df['caption'].fillna('')
                    df['likes_count'] = df['likes_count'].fillna(0).astype(int)
                    df['comments_count'] = df['comments_count'].fillna(0).astype(int)
                    
                    existing_df = pd.read_sql(
                        db.query(Post.post_id).filter(Post.post_id.in_(df['post_id'].tolist())).statement,
                        db.bind  # type: ignore
                    )
                    
                    new_df = df[~df['post_id'].isin(existing_df['post_id'])]
                    posts_skipped = len(df) - len(new_df)
                    
                    if len(new_df) > 0:
                        records = new_df[['post_id', 'shortcode', 'post_url', 'owner_username', 
                                        'owner_id', 'caption', 'post_type', 'likes_count', 
                                        'comments_count', 'timestamp', 'source']].to_dict('records')
                        
                        db.bulk_insert_mappings(Post, records)
                        db.commit()
                        posts_added = len(records)
                        logger.info(f"Inserted {posts_added} new posts from targets")
            
            if max_posts_for_comments is None:
                posts_to_scrape = db.query(Post).filter(Post.comments_count > 0).filter(
                    ~db.query(Comment).filter(Comment.post_id == Post.id).exists()
                ).count()
            else:
                posts_to_scrape = min(
                    max_posts_for_comments,
                    db.query(Post).filter(Post.comments_count > 0).count()
                )
            
            comment_result = self.scrape_comments_for_posts(
                limit_posts=posts_to_scrape,
                limit_comments=limit_comments
            )
            
            if update_metadata:
                now = datetime.utcnow()
                
                if targets.get('hashtags'):
                    db.query(TargetHashtag).filter(
                        TargetHashtag.hashtag.in_(targets['hashtags'])
                    ).update({'last_scraped_at': now}, synchronize_session=False)
                
                if targets.get('users'):
                    db.query(TargetUser).filter(
                        TargetUser.username.in_(targets['users'])
                    ).update({'last_scraped_at': now}, synchronize_session=False)
                
                if targets.get('places'):
                    place_ids = [p['place_id'] for p in targets['places']]
                    db.query(TargetPlace).filter(
                        TargetPlace.place_id.in_(place_ids)
                    ).update({'last_scraped_at': now}, synchronize_session=False)
                
                db.commit()
                logger.info("Updated last_scraped_at timestamps for all targets")
            
            return {
                'success': True,
                'targets': {
                    'hashtags': len(targets.get('hashtags', [])),
                    'users': len(targets.get('users', [])),
                    'places': len(targets.get('places', []))
                },
                'posts': {
                    'added': posts_added,
                    'skipped': posts_skipped,
                    'total': posts_added + posts_skipped
                },
                'comments': comment_result
            }
            
        except Exception as e:
            logger.error(f"Error in target-based pipeline: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    # ============================
    # Incremental Scraping (preparation for when we get paid plan)
    # ============================
    # TODO: Implement once upgraded to paid Apify plan
    
    def run_incremental_scraping_pipeline(
        self,
        target_types: List[str] = ['hashtags', 'users'],
        limit_posts_per_target: int = 100,
        scrape_comments: bool = True,
        limit_comments: int = 50
    ) -> dict:
        """
        Incremental scraping using last_scraped_at timestamps (PAID FEATURE)
        
        1. Gets active targets with their last_scraped_at timestamps
        2. Uses incremental scraping to fetch ONLY new content since last scrape
        3. Reduces API costs by avoiding re-scraping old content
        4. Updates last_scraped_at after successful scrape
        
        Args:
            target_types: Which target types to scrape ['hashtags', 'users', 'places']
            limit_posts_per_target: Max NEW posts to fetch per target
            scrape_comments: Whether to also scrape new comments on recent posts
            limit_comments: Max NEW comments per post
        
        Workflow:
            1. Query targets with last_scraped_at NOT NULL (previously scraped)
            2. Convert last_scraped_at to Unix timestamp
            3. Call scraper.scrape_*_incremental(since_timestamp=...)
            4. Store only new results
            5. Update last_scraped_at to now
        
        Returns:
            Pipeline summary with counts of new content scraped
        
        Example Usage:
            # Run daily to catch new content
            result = orchestrator.run_incremental_scraping_pipeline(
                target_types=['hashtags', 'users'],
                limit_posts_per_target=200,
                scrape_comments=True
            )
        """
        db = SessionLocal()
        
        try:
            logger.info("Starting incremental scraping pipeline (REQUIRES PAID PLAN)")
            
            new_posts_count = 0
            new_comments_count = 0
            targets_scraped = {'hashtags': 0, 'users': 0, 'places': 0}
            
            # Scrape hashtags incrementally
            if 'hashtags' in target_types:
                hashtag_targets = db.query(TargetHashtag)\
                    .filter(TargetHashtag.is_active == True)\
                    .filter(TargetHashtag.last_scraped_at.isnot(None))\
                    .order_by(TargetHashtag.priority)\
                    .all()
                
                for target in hashtag_targets:
                    since_timestamp = int(target.last_scraped_at.timestamp())
                    
                    # TODO: Uncomment when paid plan enabled (also needs verification, can't check myself without paid plan)
                    # try:
                    #     new_posts = self.scraper.scrape_hashtag_posts_incremental(
                    #         hashtags=[target.hashtag],
                    #         since_timestamp=since_timestamp,
                    #         limit=limit_posts_per_target
                    #     )
                    #     
                    #     # Process and store new posts
                    #     if new_posts:
                    #         # ... insert into database (similar to existing pipeline)
                    #         new_posts_count += len(new_posts)
                    #     
                    #     # Update timestamp
                    #     target.last_scraped_at = datetime.utcnow()
                    #     targets_scraped['hashtags'] += 1
                    #     
                    # except Exception as e:
                    #     logger.error(f"Error scraping hashtag {target.hashtag}: {e}")
                    #     continue
                    
                    logger.info(f"Would scrape #{target.hashtag} since {target.last_scraped_at}")
                    targets_scraped['hashtags'] += 1
            
            # Scrape users incrementally
            if 'users' in target_types:
                user_targets = db.query(TargetUser)\
                    .filter(TargetUser.is_active == True)\
                    .filter(TargetUser.last_scraped_at.isnot(None))\
                    .order_by(TargetUser.priority)\
                    .all()
                
                for target in user_targets:
                    since_timestamp = int(target.last_scraped_at.timestamp())
                    
                    # TODO: Uncomment when paid plan enabled
                    # try:
                    #     profiles = self.scraper.scrape_user_posts_incremental(
                    #         usernames=[target.username],
                    #         since_timestamp=since_timestamp,
                    #         limit=limit_posts_per_target
                    #     )
                    #     
                    #     # Extract and store new posts from profiles
                    #     for profile in profiles:
                    #         if profile.get('latestPosts'):
                    #             # ... insert into database
                    #             new_posts_count += len(profile['latestPosts'])
                    #     
                    #     # Update timestamp
                    #     target.last_scraped_at = datetime.utcnow()
                    #     targets_scraped['users'] += 1
                    #     
                    # except Exception as e:
                    #     logger.error(f"Error scraping user {target.username}: {e}")
                    #     continue
                    
                    logger.info(f"[DRY RUN] Would scrape @{target.username} since {target.last_scraped_at}")
                    targets_scraped['users'] += 1
            
            # Scrape new comments on recent posts
            if scrape_comments:
                # Get posts from last 7 days that might have new comments
                cutoff = datetime.utcnow() - timedelta(days=7)
                recent_posts = db.query(Post)\
                    .filter(Post.timestamp >= cutoff)\
                    .filter(Post.comments_count > 0)\
                    .all()
                
                for post in recent_posts:
                    # Get highest timestamp of existing comments
                    latest_comment = db.query(Comment)\
                        .filter(Comment.post_id == post.id)\
                        .order_by(Comment.timestamp.desc())\
                        .first()
                    
                    if latest_comment:
                        since_timestamp = int(latest_comment.timestamp.timestamp())
                    else:
                        since_timestamp = int(post.timestamp.timestamp())
                    
                    # TODO: Uncomment when paid plan enabled
                    # try:
                    #     new_comments = self.scraper.scrape_comments_incremental(
                    #         post_urls=[post.post_url],
                    #         since_timestamp=since_timestamp,
                    #         limit=limit_comments
                    #     )
                    #     
                    #     # Store new comments
                    #     if new_comments:
                    #         # ... insert into database
                    #         new_comments_count += len(new_comments)
                    #     
                    # except Exception as e:
                    #     logger.error(f"Error scraping comments for post {post.post_id}: {e}")
                    #     continue
                    
                    logger.debug(f"[DRY RUN] Would scrape new comments for post {post.post_id}")
            
            db.commit()
            
            return {
                'success': True,
                'mode': 'DRY_RUN (requires paid plan)',
                'targets_checked': targets_scraped,
                'new_posts': new_posts_count,
                'new_comments': new_comments_count,
                'message': 'Incremental scraping requires paid Apify plan. '
                          'Uncomment code in run_incremental_scraping_pipeline() and '
                          'implement scraper incremental methods after upgrade.'
            }
            
        except Exception as e:
            logger.error(f"Error in incremental scraping pipeline: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    # ============================
    # AI SERVICES METHODS
    # ============================
    
    def summarize_post_comments(
        self, 
        post_id: int,
        prioritize_engagement: bool = True
    ) -> dict:
        """
        Summarize all comments under a post
        
        Args:
            post_id: Database ID of the post
            prioritize_engagement: If True, weight high-engagement comments more
            
        Returns:
            Summary result with metadata
        """
        db = SessionLocal()
        
        try:
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                raise ValueError(f"Post {post_id} not found")
            
            comments = db.query(Comment).filter(Comment.post_id == post_id).all()
            
            if not comments:
                return {
                    'success': True,
                    'summary': 'No comments to summarize',
                    'comment_count': 0
                }
            
            if prioritize_engagement:
                # Sort by likes, take top comments
                sorted_comments = sorted(comments, key=lambda c: c.likes_count, reverse=True)
                # Take top 50% or at least 10 comments
                top_count = max(len(comments) // 2, min(10, len(comments)))
                selected_comments = sorted_comments[:top_count]
            else:
                selected_comments = comments
            
            combined_text = "\n".join([
                f"تعليق: {c.comment_text}" for c in selected_comments
            ])
            
            summary = self.summarization_service.summarize(combined_text, max_length=200)
            
            # Storing in DB
            if post.ai_results is None:
                post.ai_results = {}
            
            post.ai_results['comment_summary'] = {
                'summary': summary,
                'comment_count': len(selected_comments),
                'total_comments': len(comments),
                'prioritized': prioritize_engagement,
                'generated_at': datetime.utcnow().isoformat()
            }
            db.commit()
            
            logger.info(f"Summarized {len(selected_comments)} comments for post {post_id}")
            
            return {
                'success': True,
                'summary': summary,
                'comment_count': len(selected_comments),
                'total_comments': len(comments)
            }
            
        except Exception as e:
            logger.error(f"Error summarizing post comments: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def summarize_long_comment(self, comment_id: int) -> dict:
        """
        Summarize a single long comment
        
        Args:
            comment_id: Database ID of the comment
            
        Returns:
            Summary result
        """
        from app.config import LONG_COMMENT_THRESHOLD, SUMMARY_CONFIG
        
        db = SessionLocal()
        
        try:
            comment = db.query(Comment).filter(Comment.id == comment_id).first()
            if not comment:
                raise ValueError(f"Comment {comment_id} not found")
            
            if len(comment.comment_text) < LONG_COMMENT_THRESHOLD:
                return {
                    'success': True,
                    'summary': comment.comment_text,
                    'is_summarized': False,
                    'reason': f'Comment shorter than {LONG_COMMENT_THRESHOLD} characters'
                }
            
            summary = self.summarization_service.summarize(
                comment.comment_text,
                max_length=SUMMARY_CONFIG["short_summary_max_length"]
            )
            
            # Storing in DB
            if comment.ai_results is None:
                comment.ai_results = {}
            
            comment.ai_results['summary'] = {
                'text': summary,
                'original_length': len(comment.comment_text),
                'summary_length': len(summary),
                'generated_at': datetime.utcnow().isoformat()
            }
            db.commit()
            
            return {
                'success': True,
                'summary': summary,
                'is_summarized': True,
                'original_length': len(comment.comment_text)
            }
            
        except Exception as e:
            logger.error(f"Error summarizing comment: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def summarize_time_period(self, days: int = 7, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
        """
        Summarize all posts and comments from a time period
        
        Args:
            days: Number of days to look back (used if start_date/end_date not provided)
            start_date: Optional start date for the period
            end_date: Optional end date for the period
            
        Returns:
            Summary result with statistics
        """
        from app.config import SUMMARY_CONFIG
        
        db = SessionLocal()
        
        try:
            # Use provided date range or calculate from days
            if start_date and end_date:
                cutoff_date = start_date
                end_datetime = end_date
            else:
                cutoff_date = datetime.utcnow() - timedelta(days=days)
                end_datetime = datetime.utcnow()
            
            # Fetch recent posts
            recent_posts = db.query(Post)\
                .filter(Post.timestamp >= cutoff_date, Post.timestamp <= end_datetime)\
                .order_by(Post.timestamp.desc())\
                .all()
            
            if not recent_posts:
                return {
                    'success': True,
                    'summary': f'No posts found in the specified period',
                    'post_count': 0,
                    'comment_count': 0
                }
            
            # Gather all captions and top comments
            all_texts = []
            total_comments = 0
            
            for post in recent_posts:
                if post.caption:
                    all_texts.append(f"منشور: {post.caption}")
                
                # Get top 3 comments per post
                top_comments = db.query(Comment)\
                    .filter(Comment.post_id == post.id)\
                    .order_by(Comment.likes_count.desc())\
                    .limit(3)\
                    .all()
                
                for comment in top_comments:
                    all_texts.append(f"تعليق: {comment.comment_text}")
                    total_comments += 1
            
            combined_text = "\n".join(all_texts)
            summary = self.summarization_service.summarize(
                combined_text,
                max_length=SUMMARY_CONFIG["time_period_max_length"]
            )
            
            result = {
                'success': True,
                'summary': summary,
                'post_count': len(recent_posts),
                'comment_count': total_comments,
                'date_range': {
                    'from': cutoff_date.isoformat(),
                    'to': end_datetime.isoformat()
                }
            }
            
            if not (start_date and end_date):
                result['time_period_days'] = days
            
            logger.info(f"Generated time period summary from {cutoff_date} to {end_datetime}")
            return result
            
        except Exception as e:
            logger.error(f"Error generating time period summary: {e}")
            raise
        finally:
            db.close()
    
    def analyze_comment_sentiment(self, comment_id: int) -> dict:
        """
        Analyze sentiment for a single comment
        
        Args:
            comment_id: Database ID of the comment
            
        Returns:
            Sentiment result
        """
        db = SessionLocal()
        
        try:
            comment = db.query(Comment).filter(Comment.id == comment_id).first()
            if not comment:
                raise ValueError(f"Comment {comment_id} not found")
            
            # Analyze sentiment
            sentiment = self.sentiment_service.analyze(comment.comment_text)
            
            # Store in database
            if comment.ai_results is None:
                comment.ai_results = {}
            
            comment.ai_results['sentiment'] = {
                'label': sentiment.label,
                'score': sentiment.score,
                'analyzed_at': datetime.utcnow().isoformat()
            }
            db.commit()
            
            return {
                'success': True,
                'comment_id': comment_id,
                'sentiment': sentiment.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing comment sentiment: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def analyze_post_sentiment(self, post_id: int) -> dict:
        """
        Analyze overall sentiment for a post based on its comments
        
        Args:
            post_id: Database ID of the post
            
        Returns:
            Aggregated sentiment result
        """
        db = SessionLocal()
        
        try:
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                raise ValueError(f"Post {post_id} not found")
            
            comments = db.query(Comment).filter(Comment.post_id == post_id).all()
            
            if not comments:
                return {
                    'success': True,
                    'post_id': post_id,
                    'sentiment': {'label': 'neutral', 'score': 0.0},
                    'comment_count': 0,
                    'breakdown': {}
                }
            
            # Batch analyze all comments
            texts = [c.comment_text for c in comments]
            sentiments = self.sentiment_service.batch_analyze(texts)
            
            # Calculate aggregated sentiment
            sentiment_counts = {'positive': 0, 'neutral': 0, 'negative': 0}
            total_score = 0.0
            
            for sentiment in sentiments:
                sentiment_counts[sentiment.label] += 1
                # Weight: positive=1, neutral=0, negative=-1
                weight = {'positive': 1, 'neutral': 0, 'negative': -1}[sentiment.label]
                total_score += weight * sentiment.score
            
            # Determine overall sentiment
            from app.config import SENTIMENT_POSITIVE_THRESHOLD, SENTIMENT_NEGATIVE_THRESHOLD
            avg_score = total_score / len(sentiments)
            if avg_score > SENTIMENT_POSITIVE_THRESHOLD:
                overall_label = 'positive'
            elif avg_score < SENTIMENT_NEGATIVE_THRESHOLD:
                overall_label = 'negative'
            else:
                overall_label = 'neutral'
            
            # Store in database
            if post.ai_results is None:
                post.ai_results = {}
            
            post.ai_results['sentiment'] = {
                'label': overall_label,
                'score': abs(avg_score),
                'breakdown': sentiment_counts,
                'comment_count': len(comments),
                'analyzed_at': datetime.utcnow().isoformat()
            }
            db.commit()
            
            # Store individual comment sentiments
            for comment, sentiment in zip(comments, sentiments):
                if comment.ai_results is None:
                    comment.ai_results = {}
                comment.ai_results['sentiment'] = sentiment.to_dict()
            db.commit()
            
            logger.info(f"Analyzed sentiment for post {post_id} ({len(comments)} comments)")
            
            return {
                'success': True,
                'post_id': post_id,
                'sentiment': {
                    'label': overall_label,
                    'score': round(abs(avg_score), 4)
                },
                'comment_count': len(comments),
                'breakdown': sentiment_counts,
                'sentiment_breakdown': sentiment_counts,
                'overall_label': overall_label,
                'average_score': round(abs(avg_score), 4)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing post sentiment: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def analyze_all_posts_sentiment(self, batch_size: int = 50) -> dict:
        """
        Analyze sentiment for all posts without sentiment data (using captions)

        Args:
            batch_size: Number of posts to process per batch

        Returns:
            Processing summary
        """
        db = SessionLocal()

        try:
            # Find posts without sentiment analysis that have captions
            all_posts = db.query(Post).filter(Post.caption.isnot(None), Post.caption != '').all()
            posts = []
            for post in all_posts:
                if post.ai_results is None or not isinstance(post.ai_results, dict) or 'sentiment' not in post.ai_results:
                    posts.append(post)
                    if len(posts) >= batch_size:
                        break

            if not posts:
                return {
                    'success': True,
                    'processed': 0,
                    'message': 'All posts already analyzed',
                    'results': []
                }

            # Batch analyze captions
            texts = [p.caption for p in posts]
            sentiments = self.sentiment_service.batch_analyze(texts)

            # Store results and build response for frontend
            results = []
            for post, sentiment in zip(posts, sentiments):
                if post.ai_results is None:
                    post.ai_results = {}
                post.ai_results['sentiment'] = {
                    **sentiment.to_dict(),
                    'analyzed_at': datetime.utcnow().isoformat()
                }

                # Also generate a summary for the caption if it's long enough
                if len(post.caption) > 100:
                    try:
                        summary = self.summarization_service.summarize(
                            post.caption,
                            max_length=100
                        )
                        post.ai_results['summary'] = summary
                    except Exception as e:
                        logger.warning(f"Failed to summarize post {post.id}: {e}")

                # Add to results for frontend display
                results.append({
                    'post_id': post.id,
                    'text_preview': post.caption[:100] + '...' if len(post.caption) > 100 else post.caption,
                    'sentiment': sentiment.to_dict()
                })

            db.commit()

            logger.info(f"Analyzed sentiment for {len(posts)} posts")

            return {
                'success': True,
                'processed': len(posts),
                'sentiment_breakdown': {
                    'positive': sum(1 for s in sentiments if s.label == 'positive'),
                    'neutral': sum(1 for s in sentiments if s.label == 'neutral'),
                    'negative': sum(1 for s in sentiments if s.label == 'negative')
                },
                'results': results
            }

        except Exception as e:
            logger.error(f"Error in batch post sentiment analysis: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def analyze_all_comments_sentiment(self, batch_size: int = 50) -> dict:
        """
        Analyze sentiment for all comments without sentiment data
        
        Args:
            batch_size: Number of comments to process per batch
            
        Returns:
            Processing summary
        """
        db = SessionLocal()
        
        try:
            # Find comments without sentiment analysis
            from sqlalchemy import func, cast, String, or_, not_
            from sqlalchemy.dialects.postgresql import JSONB
            
            # Query comments without sentiment analysis
            # Cast to JSONB for proper operator support, or use simpler approach
            comments = db.query(Comment)\
                .filter(
                    or_(
                        Comment.ai_results == None,
                        not_(cast(Comment.ai_results, JSONB).has_key('sentiment'))
                    )
                )\
                .limit(batch_size)\
                .all()
            
            if not comments:
                return {
                    'success': True,
                    'processed': 0,
                    'message': 'All comments already analyzed',
                    'results': []
                }

            # Batch analyze
            texts = [c.comment_text for c in comments]
            sentiments = self.sentiment_service.batch_analyze(texts)

            # Store results and build response for frontend
            results = []
            for comment, sentiment in zip(comments, sentiments):
                if comment.ai_results is None:
                    comment.ai_results = {}
                comment.ai_results['sentiment'] = {
                    **sentiment.to_dict(),
                    'analyzed_at': datetime.utcnow().isoformat()
                }
                # Add to results for frontend display
                results.append({
                    'comment_id': comment.id,
                    'text_preview': comment.comment_text[:100] + '...' if len(comment.comment_text) > 100 else comment.comment_text,
                    'sentiment': sentiment.to_dict()
                })

            db.commit()

            logger.info(f"Analyzed sentiment for {len(comments)} comments")

            return {
                'success': True,
                'processed': len(comments),
                'sentiment_breakdown': {
                    'positive': sum(1 for s in sentiments if s.label == 'positive'),
                    'neutral': sum(1 for s in sentiments if s.label == 'neutral'),
                    'negative': sum(1 for s in sentiments if s.label == 'negative')
                },
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Error in batch sentiment analysis: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def generate_weekly_report(self, year: int, week_number: int) -> dict:
        """
        Generate and store a weekly report with summary and sentiment analysis
        Weeks start on Sunday and end on Saturday
        
        Args:
            year: Year for the report
            week_number: ISO week number (1-53)
            
        Returns:
            Report data including summary and sentiment
        """
        db = SessionLocal()
        
        try:
            # Calculate week boundaries (Sunday to Saturday)
            # ISO week 1 is the week containing the first Thursday
            jan_4 = datetime(year, 1, 4)
            week_start = jan_4 - timedelta(days=jan_4.weekday() + 1)  # Previous Sunday
            week_start = week_start + timedelta(weeks=week_number - 1)
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            
            week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
            
            # Check if report already exists
            existing_report = db.query(WeeklyReport).filter(
                WeeklyReport.year == year,
                WeeklyReport.week_number == week_number
            ).first()
            
            # Use existing methods to get summary and sentiment
            summary_result = self.summarize_time_period(
                start_date=week_start,
                end_date=week_end
            )
            
            sentiment_result = self.analyze_time_period_sentiment(
                start_date=week_start,
                end_date=week_end
            )
            
            # Create or update report
            report_data = {
                'year': year,
                'week_number': week_number,
                'week_start_date': week_start,
                'week_end_date': week_end,
                'post_count': summary_result['post_count'],
                'comment_count': summary_result['comment_count'],
                'summary': summary_result['summary'],
                'sentiment_label': sentiment_result['sentiment_label'],
                'sentiment_score': sentiment_result['sentiment_score'],
                'sentiment_breakdown': sentiment_result['sentiment_breakdown'],
                'generated_at': datetime.utcnow()
            }
            
            if existing_report:
                for key, value in report_data.items():
                    setattr(existing_report, key, value)
            else:
                existing_report = WeeklyReport(**report_data)
                db.add(existing_report)
            
            db.commit()
            db.refresh(existing_report)
            
            logger.info(f"Generated weekly report for {year}-W{week_number}")
            
            return {
                'success': True,
                'report_id': existing_report.id,
                **report_data
            }
            
        except Exception as e:
            logger.error(f"Error generating weekly report: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def analyze_time_period_sentiment(self, days: int = 7, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
        """
        Analyze sentiment distribution across a time period
        
        Args:
            days: Number of days to look back (used if start_date/end_date not provided)
            start_date: Optional start date for the period
            end_date: Optional end date for the period
            
        Returns:
            Sentiment analysis with breakdown and statistics
        """
        db = SessionLocal()
        
        try:
            # Use provided date range or calculate from days
            if start_date and end_date:
                cutoff_date = start_date
                end_datetime = end_date
            else:
                cutoff_date = datetime.utcnow() - timedelta(days=days)
                end_datetime = datetime.utcnow()
            
            # Fetch posts from time period
            posts = db.query(Post).filter(
                Post.timestamp >= cutoff_date,
                Post.timestamp <= end_datetime
            ).all()
            
            if not posts:
                return {
                    'success': True,
                    'sentiment_label': 'neutral',
                    'sentiment_score': 0,
                    'sentiment_breakdown': {'positive': 0, 'neutral': 0, 'negative': 0},
                    'post_count': 0,
                    'comment_count': 0,
                    'message': f'No content found in the specified period'
                }
            
            # Gather all text content
            all_texts = []
            total_comments = 0
            
            for post in posts:
                if post.caption:
                    all_texts.append(post.caption)
                
                comments = db.query(Comment).filter(
                    Comment.post_id == post.id,
                    Comment.timestamp >= cutoff_date,
                    Comment.timestamp <= end_datetime
                ).all()
                
                for comment in comments:
                    all_texts.append(comment.comment_text)
                    total_comments += 1
            
            if not all_texts:
                return {
                    'success': True,
                    'sentiment_label': 'neutral',
                    'sentiment_score': 0,
                    'sentiment_breakdown': {'positive': 0, 'neutral': 0, 'negative': 0},
                    'post_count': len(posts),
                    'comment_count': 0,
                    'message': 'No text content to analyze'
                }
            
            # Analyze sentiment
            sentiment_results = self.sentiment_service.batch_analyze(all_texts)
            
            # Calculate breakdown
            sentiment_counts = {
                'positive': sum(1 for s in sentiment_results if s.label == 'positive'),
                'neutral': sum(1 for s in sentiment_results if s.label == 'neutral'),
                'negative': sum(1 for s in sentiment_results if s.label == 'negative')
            }
            
            total_sentiments = len(sentiment_results)
            sentiment_score = int(
                (sentiment_counts['positive'] - sentiment_counts['negative']) / total_sentiments * 100
            )
            
            # Determine overall label
            from app.config import SENTIMENT_TIME_PERIOD_THRESHOLD
            if sentiment_score > SENTIMENT_TIME_PERIOD_THRESHOLD:
                overall_label = 'positive'
            elif sentiment_score < -SENTIMENT_TIME_PERIOD_THRESHOLD:
                overall_label = 'negative'
            else:
                overall_label = 'neutral'
            
            logger.info(f"Analyzed sentiment from {cutoff_date} to {end_datetime}: {overall_label} ({sentiment_score})")
            
            result = {
                'success': True,
                'sentiment_label': overall_label,
                'sentiment_score': sentiment_score,
                'sentiment_breakdown': sentiment_counts,
                'post_count': len(posts),
                'comment_count': total_comments,
                'date_range': {
                    'from': cutoff_date.isoformat(),
                    'to': end_datetime.isoformat()
                }
            }
            
            if not (start_date and end_date):
                result['time_period_days'] = days
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing time period sentiment: {e}")
            raise
        finally:
            db.close()
