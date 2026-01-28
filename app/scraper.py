"""
Apify Instagram Scraper Client

Integrates with Apify actors for Instagram scraping:
- apify/instagram-hashtag-scraper: Posts/reels by hashtag
- apify/instagram-comment-scraper: Comments from posts
- apify/instagram-search-scraper: Search for accounts, hashtags, places
- apify/instagram-profile-scraper: Profile info + latest posts
- apify/instagram-tagged-scraper: Tagged/mentioned posts
- apify/instagram-hashtag-stats: Hashtag statistics + related hashtags

Pricing: Pay-per-result model (~$2.30 per 1,000 results on paid plans)
Prices change over time AND per-actor, always check the actual actor page for current pricing details.
So the above is just an estimation of the most expensive actor

I set low default limit values to avoid incurring too much costs by accident
"""
from apify_client import ApifyClient
from app.config import APIFY_API_TOKEN
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger('Scraper')


class InstagramScraper:
    """Simple Instagram scraper using Apify actors"""
    
    def __init__(self):
        if not APIFY_API_TOKEN:
            raise ValueError("APIFY_API_TOKEN not set in .env")
        
        self.client = ApifyClient(APIFY_API_TOKEN)
        logger.info("Apify client initialized")
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def _call_actor(self, actor_id: str, run_input: dict) -> dict:
        """Call Apify actor with retry logic"""
        try:
            run = self.client.actor(actor_id).call(run_input=run_input)
            if run is None:
                raise RuntimeError(f"Actor {actor_id} returned None")
            return run
        except Exception as e:
            logger.error(f"Apify actor {actor_id} failed: {e}")
            raise
    
    def scrape_hashtag_posts(
        self,
        hashtags: list[str],
        limit: int = 50,
        results_type: str = 'posts',
        keyword_search: bool = False
    ) -> list[dict]:
        """
        Scrape Instagram posts or reels by hashtag
        Actor: apify/instagram-hashtag-scraper
        
        Required Args:
            hashtags: List of hashtags (with or without # symbol)
            
        Optional Args:
            limit: Max results per hashtag (default: 50)
            results_type: 'posts' or 'reels' (default: 'posts')
            keyword_search: If True, search by keyword instead of hashtag (default: False)
                          Returns slightly different dataset
        
        Free Tier Limitations:
            - Only first page of results available on free plan
            - Upgrade required for pagination
        
        Returns:
            List of post/reel dicts containing:
            
            Common Fields (both posts and reels):
            - Basic: id, shortCode, url, caption, timestamp, type
            - Engagement: likesCount, commentsCount
            - Media: displayUrl, dimensionsHeight, dimensionsWidth
            - Owner: ownerUsername, ownerId, ownerFullName
            - Content: hashtags, mentions, locationName, locationId
            
            Posts-Specific Fields:
            - images[] (array of image URLs)
            - childPosts[] (for carousel posts)
            - productType: 'feed' or 'carousel_container'
            
            Reels-Specific Fields:
            - videoUrl, videoDuration, videoPlayCount
            - igPlayCount, fbPlayCount, fbLikeCount
            - reshareCount, musicInfo{}
            - productType: 'clips'
        """
        from app.config import INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID
        
        if not hashtags:
            raise ValueError("hashtags cannot be empty")
        if limit <= 0:
            raise ValueError("limit must be positive")
        if results_type not in ['posts', 'reels']:
            raise ValueError("results_type must be 'posts' or 'reels'")
        
        logger.info(f"Scraping {results_type} for hashtags: {hashtags}")
        
        run_input = {
            'hashtags': hashtags,
            'resultsType': results_type,
            'resultsLimit': limit,
            'keywordSearch': keyword_search
        }
        
        run = self._call_actor(INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID, run_input)
        dataset_id = run['defaultDatasetId']  # type: ignore
        items = list(self.client.dataset(dataset_id).iterate_items())
        
        logger.info(f"Scraped {len(items)} {results_type}")
        return items
    
    def scrape_post_comments(
        self,
        post_urls: list[str],
        limit: int = 20,
        newest_first: bool = False,
        include_nested: bool = False
    ) -> list[dict]:
        """
        Scrape comments from Instagram posts or reels
        Actor: apify/instagram-comment-scraper
        
        Required Args:
            post_urls: List of Instagram post/reel URLs
        
        Optional Args:
            limit: Max comments per post (default: 20)
                  Note: Total results may exceed limit if include_nested=True
            
            newest_first: Scrape newest comments first (default: False)
                         $ PAID FEATURE - Requires paid plan
            
            include_nested: Include comment replies (default: False)
                           $ PAID FEATURE - Requires paid plan
                           Note: Each reply counts as separate result
        
        Scraping Behavior:
            - Extracts only comments visible to logged-out users
            - Results may differ from logged-in view
            - To verify: open URL in incognito browser
        
        Returns:
            List of comment dicts containing:
            - id, postId, postUrl, text, position (comment order), timestamp
            - likesCount, repliesCount
            - ownerId, ownerUsername, ownerIsVerified, ownerProfilePicUrl
            - replies[] (array of nested comment objects if include_nested=True)
            
            Note: 'position' indicates comment order in the original post
        """
        from app.config import INSTAGRAM_COMMENT_SCRAPER_ACTOR_ID
        
        if not post_urls:
            raise ValueError("post_urls cannot be empty")
        if limit <= 0:
            raise ValueError("limit must be positive")
        
        logger.info(f"Scraping comments for {len(post_urls)} posts")
        
        run_input = {
            'directUrls': post_urls,
            'resultsLimit': limit,
            'isNewestComments': newest_first,
            'includeNestedComments': include_nested
        }
        
        run = self._call_actor(INSTAGRAM_COMMENT_SCRAPER_ACTOR_ID, run_input)
        dataset_id = run['defaultDatasetId']  # type: ignore
        items = list(self.client.dataset(dataset_id).iterate_items())
        
        logger.info(f"Scraped {len(items)} comments")
        return items
    
    def search_instagram(
        self,
        search_terms: list[str] | str,
        limit: int = 10,
        search_type: str = 'user',
        enhance_with_facebook: bool = False
    ) -> list[dict]:
        """
        Search Instagram for profiles, hashtags, or places
        Actor: apify/instagram-search-scraper
        
        Required Args:
            search_terms: Single keyword string OR list of keywords
                         Examples:
                         - Single: "cakes prague" (searches as one term)
                         - List: ["cakes", "prague"] (joined with commas)
                         - Multiple: "restaurant,cafe,bakery" (separate searches)
                         
                         The function automatically handles list-to-string conversion
        
        Optional Args:
            limit: Max results per search term (default: 50)
            search_type: Type to search for (default: 'user')
                        Options: 'user', 'hashtag', 'place'
            
            enhance_with_facebook: Extract Facebook pages for top 10 users (default: False)
                                  May contain business emails - check GDPR compliance
                                  Only works when search_type='user'
        
        Returns for search_type='user':
            List of profile dicts:
            - Account: id, username, url, fullName, biography, externalUrl
            - Stats: followersCount, followsCount, postsCount, verified
            - Business: isBusinessAccount, businessCategoryName
            - Location: city, streetAddress, latitude, longitude, zip
            - Recent: latestPosts (12 posts with details)
        
        Returns for search_type='hashtag':
            List of hashtag dicts:
            - name, id, url, postsCount, postsPerDay, difficulty
            - related (average, frequent, rare hashtags)
        
        Returns for search_type='place':
            List of place dicts:
            - name, category, phone, priceRange, mediaCount
            - Location: lat, lng, address, city, zip
            - Business: hours (status, opening/closing times)
            - Recent: latestPosts (12 posts)
        """
        from app.config import INSTAGRAM_SEARCH_SCRAPER_ACTOR_ID
        
        if not search_terms:
            raise ValueError("search_terms cannot be empty")
        if limit <= 0:
            raise ValueError("limit must be positive")
        if search_type not in ['user', 'hashtag', 'place']:
            raise ValueError("search_type must be 'user', 'hashtag', or 'place'")
        
        search_str = ','.join(search_terms) if isinstance(search_terms, list) else search_terms
        logger.info(f"Searching Instagram ({search_type}): {search_str}")
        
        run_input = {
            'search': search_str,
            'searchType': search_type,
            'searchLimit': limit,
            'enhanceUserSearchWithFacebookPage': enhance_with_facebook
        }
        
        run = self._call_actor(INSTAGRAM_SEARCH_SCRAPER_ACTOR_ID, run_input)
        dataset_id = run['defaultDatasetId']  # type: ignore
        items = list(self.client.dataset(dataset_id).iterate_items())
        
        logger.info(f"Found {len(items)} {search_type} results")
        return items
    
    def scrape_user_posts(
        self,
        usernames: list[str],
        include_about: bool = False
    ) -> list[dict]:
        """
        Scrape Instagram profile data + latest posts
        Actor: apify/instagram-profile-scraper
        
        Required Args:
            usernames: List of Instagram usernames, profile URLs, or profile IDs
        
        Optional Args:
            include_about: Include 'About' section data (default: False)
                          $ PAID FEATURE - Requires paid plan
                          Adds: dateJoined, country, usernameChangeCount, dateVerified
                          Note: Country only available if user filled it
        
        Returns:
            List of profile dicts (one per username) containing:
            
            Basic Profile:
            - id, username, url, fullName, biography, externalUrl(s)
            - profilePicUrl, profilePicUrlHD
            
            Stats:
            - followersCount, followsCount, postsCount
            - highlightReelCount, igtvVideoCount
            - isBusinessAccount, businessCategoryName
            - private, verified, joinedRecently, hasChannel
            
            Content:
            - latestPosts: Array of 12 recent posts with full details
            - latestIgtvVideos: Array of 12 recent IGTV videos
            - relatedProfiles: Array of similar accounts
            
            About Section (if include_about=True, paid only):
            - dateJoined, dateJoinedAsTimestamp
            - country, formerUsernames (count)
            - dateVerified, dateVerifiedAsTimestamp
        """
        from app.config import INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID
        
        if not usernames:
            raise ValueError("usernames cannot be empty")
        
        logger.info(f"Scraping profiles: {usernames}")
        
        run_input = {
            'usernames': usernames,
            'includeAboutSection': include_about
        }
        
        run = self._call_actor(INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID, run_input)
        dataset_id = run['defaultDatasetId']  # type: ignore
        items = list(self.client.dataset(dataset_id).iterate_items())
        
        logger.info(f"Scraped {len(items)} profiles")
        return items
    
    def scrape_mentions(self, usernames: list[str], limit: int = 50) -> list[dict]:
        """
        Scrape posts where users are tagged/mentioned
        Actor: apify/instagram-tagged-scraper
        
        Required Args:
            usernames: List of Instagram usernames or profile URLs
                      The actor scrapes posts where these users are tagged
        
        Optional Args:
            limit: Max tagged posts per username (default: 50)
                  If limit=5 and 2 usernames → 10 total results
        
        Returns:
            List of tagged post dicts containing:
            - Basic: id, type, shortCode, url, caption, timestamp
            - Media: displayUrl, images, dimensions, videoUrl, videoDuration
            - Engagement: likesCount, commentsCount
            - Content: hashtags, mentions, locationName, locationId
            - Comments: firstComment, latestComments (array)
            - Owner: ownerUsername (the tagged user)
        
        Use Cases:
            - Brand monitoring: Find posts mentioning your brand account
            - Influencer tracking: See where influencers are being tagged
            - UGC discovery: Find user-generated content featuring your account
        """
        from app.config import INSTAGRAM_TAGGED_SCRAPER_ACTOR_ID
        
        if not usernames:
            raise ValueError("usernames cannot be empty")
        if limit <= 0:
            raise ValueError("limit must be positive")
        
        logger.info(f"Scraping tagged posts (mentions) for: {usernames}")
        
        run_input = {
            'username': usernames,
            'resultsLimit': limit
        }
        
        run = self._call_actor(INSTAGRAM_TAGGED_SCRAPER_ACTOR_ID, run_input)
        dataset_id = run['defaultDatasetId']  # type: ignore
        items = list(self.client.dataset(dataset_id).iterate_items())
        
        logger.info(f"Scraped {len(items)} tagged posts (mentions)")
        return items
    
    def get_hashtag_stats(
        self,
        hashtags: list[str],
        include_latest: bool = False,
        include_top: bool = False
    ) -> list[dict]:
        """
        Get comprehensive hashtag statistics and related hashtags
        Actor: apify/instagram-hashtag-stats
        
        Required Args:
            hashtags: List of hashtags (with or without # symbol)
        
        Optional Args:
            include_latest: Include latest posts for each hashtag (default: False)
                           $ PAID FEATURE - Requires Starter plan or higher
            
            include_top: Include top/popular posts for each hashtag (default: False)
                        $ PAID FEATURE - Requires Starter plan or higher
        
        Returns:
            List of hashtag stat dicts containing:
            
            Basic Stats:
            - name, id, url, postsCount, postsPerDay, difficulty
            
            Related Hashtags (by literal similarity):
            - frequent: Array of {hash, info} - volume 10M-100M+
            - average: Array of {hash, info} - volume 500K-10M
            - rare: Array of {hash, info} - volume <500K
            
            Related Hashtags (by semantic similarity):
            - relatedFrequent: Array of {hash, info}
            - relatedAverage: Array of {hash, info}
            - relatedRare: Array of {hash, info}
            
            Sample Posts (if include_latest/include_top=True, paid only):
            - latestPosts: Array of recent post objects
            - topPosts: Array of popular post objects
        
        Use Cases:
            - Hashtag discovery: Find related hashtags to expand reach
            - Content strategy: Identify optimal hashtag difficulty levels
            - Trend analysis: Track hashtag popularity over time
            - Competition research: Analyze hashtag usage patterns
        """
        from app.config import INSTAGRAM_HASHTAG_STATS_ACTOR_ID
        
        if not hashtags:
            raise ValueError("hashtags cannot be empty")
        
        logger.info(f"Getting stats for hashtags: {hashtags}")
        
        run_input = {
            'hashtags': hashtags,
            'includeLatestPosts': include_latest,
            'includeTopPosts': include_top
        }
        
        run = self._call_actor(INSTAGRAM_HASHTAG_STATS_ACTOR_ID, run_input)
        dataset_id = run['defaultDatasetId']  # type: ignore
        items = list(self.client.dataset(dataset_id).iterate_items())
        
        logger.info(f"Got stats for {len(items)} hashtags")
        return items
    
    # ============================
    # Incremental Scraping (preparation for when we get paid plan)
    # ============================
    # TODO: Implement once upgraded to paid Apify plan
    # These methods use time-based filtering to scrape only NEW content since last scrape
    
    def scrape_hashtag_posts_incremental(
        self,
        hashtags: list[str],
        since_timestamp: int,  # Unix timestamp in seconds
        limit: int = 100,
        results_type: str = 'posts'
    ) -> list[dict]:
        """
        Scrape only posts created after a specific timestamp (PAID FEATURE)
        
        1. Get last_scraped_at from TargetHashtag table
        2. Pass as since_timestamp to only fetch new posts
        3. Update last_scraped_at after successful scrape
        
        Args:
            hashtags: List of hashtags to scrape
            since_timestamp: Unix timestamp - only return posts after this time
            limit: Max results per hashtag
            results_type: 'posts' or 'reels'
        
        Paid Parameters:
            $ 'minTimestamp': Filter posts by creation time
            $ 'maxTimestamp': Optional upper bound
            $ 'scrollTimes': Control pagination depth
        
        Implementation Notes:
            - Apify actors may call this 'minTimestamp' or 'sinceTimestamp'
            - Check specific actor documentation for exact parameter name
            - Some actors use ISO datetime strings instead of Unix timestamps
            - Test with small limit first to verify behavior
        
        Returns:
            List of posts created after since_timestamp
        
        Example Usage:
            # Get target's last scrape time
            target = db.query(TargetHashtag).filter_by(hashtag='flynas').first()
            last_scrape = int(target.last_scraped_at.timestamp())
            
            # Scrape only new posts
            new_posts = scraper.scrape_hashtag_posts_incremental(
                hashtags=['flynas'],
                since_timestamp=last_scrape,
                limit=100
            )
        """
        from app.config import INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID
        
        # TODO: Verify exact parameter name from Apify documentation
        # Common variations: minTimestamp, sinceTimestamp, afterTimestamp
        raise NotImplementedError(
            "Incremental scraping requires paid Apify plan. "
            "Enable by setting 'minTimestamp' parameter in run_input. "
            "Check actor documentation for exact parameter name."
        )
        
        # Pseudo-implementation:
        # run_input = {
        #     'hashtags': hashtags,
        #     'resultsType': results_type,
        #     'resultsLimit': limit,
        #     'minTimestamp': since_timestamp,  # OR 'sinceTimestamp'
        #     'scrollTimes': 10  # Control pagination depth for large result sets
        # }
        # 
        # run = self._call_actor(INSTAGRAM_HASHTAG_SCRAPER_ACTOR_ID, run_input)
        # dataset_id = run['defaultDatasetId']
        # items = list(self.client.dataset(dataset_id).iterate_items())
        # 
        # logger.info(f"Scraped {len(items)} new {results_type} since {since_timestamp}")
        # return items
    
    def scrape_user_posts_incremental(
        self,
        usernames: list[str],
        since_timestamp: int,
        limit: int = 100
    ) -> list[dict]:
        """
        Scrape only posts from users created after a specific timestamp (PAID FEATURE)
        
        Similar to hashtag incremental scraping but for user profiles
        
        Args:
            usernames: List of Instagram usernames
            since_timestamp: Unix timestamp - only return posts after this time
            limit: Max posts per user
        
        Paid Parameters:
            $ 'minTimestamp': Filter by post creation time
            $ 'maxPosts': Control how many posts to fetch per user
        
        Implementation Notes:
            - Profile scraper may require different approach than hashtag scraper
            - Some actors don't support time filtering on profiles
            - Alternative: Scrape all recent posts, filter client-side
            - Check if actor supports 'since' or 'after' parameters
        
        Returns:
            List of user profile objects with latestPosts filtered by time
        
        Example Usage:
            target = db.query(TargetUser).filter_by(username='competitor').first()
            last_scrape = int(target.last_scraped_at.timestamp())
            
            profiles = scraper.scrape_user_posts_incremental(
                usernames=['competitor'],
                since_timestamp=last_scrape,
                limit=50
            )
        """
        from app.config import INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID
        
        raise NotImplementedError(
            "Incremental user scraping requires paid Apify plan. "
            "May need to scrape all posts and filter by timestamp client-side. "
            "Check if actor supports time-based filtering."
        )
        
        # Pseudo-implementation (if actor supports time filtering):
        # run_input = {
        #     'usernames': usernames,
        #     'maxPosts': limit,
        #     'minTimestamp': since_timestamp  # May not be supported
        # }
        # 
        # run = self._call_actor(INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID, run_input)
        # dataset_id = run['defaultDatasetId']
        # profiles = list(self.client.dataset(dataset_id).iterate_items())
        # 
        # # Filter posts by timestamp client-side if actor doesn't support it
        # for profile in profiles:
        #     if profile.get('latestPosts'):
        #         profile['latestPosts'] = [
        #             post for post in profile['latestPosts']
        #             if post.get('timestamp') and 
        #             datetime.fromisoformat(post['timestamp']).timestamp() > since_timestamp
        #         ]
        # 
        # return profiles
    
    def scrape_comments_incremental(
        self,
        post_urls: list[str],
        since_timestamp: int,
        limit: int = 50
    ) -> list[dict]:
        """
        Scrape ONLY comments created after a specific timestamp (PAID FEATURE)
        
        Useful for monitoring new comments on existing posts without re-scraping all
        
        Args:
            post_urls: List of Instagram post URLs
            since_timestamp: Unix timestamp - only return comments after this time
            limit: Max comments per post
        
        Paid Parameters:
            $ 'isNewestComments': True - Scrape newest first (enables incremental)
            $ 'minTimestamp': Filter comments by creation time
        
        Implementation Strategy:
            1. Use 'isNewestComments': True to get newest first
            2. Scrape until reaching comments older than since_timestamp
            3. Stop early to save costs
        
        Alternative Approach (if no time filter):
            1. Scrape with 'isNewestComments': True
            2. Filter results client-side by timestamp
            3. Track highest comment ID seen per post for next scrape
        
        Returns:
            List of comments created after since_timestamp
        
        Example Usage:
            # For a post last checked 1 hour ago
            one_hour_ago = int((datetime.utcnow() - timedelta(hours=1)).timestamp())
            
            new_comments = scraper.scrape_comments_incremental(
                post_urls=['https://instagram.com/p/ABC123'],
                since_timestamp=one_hour_ago,
                limit=100
            )
        """
        from app.config import INSTAGRAM_COMMENT_SCRAPER_ACTOR_ID
        
        raise NotImplementedError(
            "Incremental comment scraping requires paid Apify plan. "
            "Use 'isNewestComments': True and filter by timestamp. "
            "Consider tracking highest comment ID per post for optimization."
        )
        
        # Pseudo-implementation:
        # run_input = {
        #     'directUrls': post_urls,
        #     'resultsLimit': limit,
        #     'isNewestComments': True,  # PAID FEATURE
        #     'includeNestedComments': False
        # }
        # 
        # run = self._call_actor(INSTAGRAM_COMMENT_SCRAPER_ACTOR_ID, run_input)
        # dataset_id = run['defaultDatasetId']
        # all_comments = list(self.client.dataset(dataset_id).iterate_items())
        # 
        # # Filter by timestamp client-side
        # new_comments = [
        #     comment for comment in all_comments
        #     if comment.get('timestamp') and
        #     datetime.fromisoformat(comment['timestamp']).timestamp() > since_timestamp
        # ]
        # 
        # logger.info(f"Scraped {len(new_comments)} new comments (filtered from {len(all_comments)})")
        # return new_comments

