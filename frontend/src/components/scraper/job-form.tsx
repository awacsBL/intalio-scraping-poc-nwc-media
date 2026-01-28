'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Hash, User, Link, Loader2, Play, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { useScrapeHashtags, useScrapeComments, useDiscoveryPipeline, useFullPipeline, useDiscoverAndSave } from '@/hooks/useApi';

export function JobForm() {
  const [activeTab, setActiveTab] = useState('hashtag');

  // Form states
  const [hashtags, setHashtags] = useState('');
  const [postsLimit, setPostsLimit] = useState('50');
  const [commentsPostsLimit, setCommentsPostsLimit] = useState('10');
  const [commentsPerPost, setCommentsPerPost] = useState('50');
  const [searchTerm, setSearchTerm] = useState('');
  const [discoveryLimit, setDiscoveryLimit] = useState('30');

  // Options
  const [downloadMedia, setDownloadMedia] = useState(false);
  const [fetchComments, setFetchComments] = useState(true);
  const [runAIAnalysis, setRunAIAnalysis] = useState(true);

  // Mutations
  const scrapeHashtagsMutation = useScrapeHashtags();
  const scrapeCommentsMutation = useScrapeComments();
  const discoveryMutation = useDiscoveryPipeline();
  const fullPipelineMutation = useFullPipeline();
  const discoverAndSaveMutation = useDiscoverAndSave();

  const handleHashtagScrape = async () => {
    const hashtagList = hashtags
      .split(/[,\n]/)
      .map((h) => h.trim().replace(/^#/, ''))
      .filter((h) => h.length > 0);

    if (hashtagList.length === 0) {
      toast.error('Please enter at least one hashtag');
      return;
    }

    try {
      await scrapeHashtagsMutation.mutateAsync({
        hashtags: hashtagList,
        limit: parseInt(postsLimit),
        download_media: downloadMedia,
        fetch_comments: fetchComments,
        run_ai_analysis: runAIAnalysis,
      });
      toast.success('Hashtag scraping job started!');
      setHashtags('');
    } catch {
      toast.error('Failed to start scraping job');
    }
  };

  const handleCommentsScrape = async () => {
    try {
      await scrapeCommentsMutation.mutateAsync({
        limit_posts: parseInt(commentsPostsLimit),
        limit_comments: parseInt(commentsPerPost),
      });
      toast.success('Comments scraping job started!');
    } catch {
      toast.error('Failed to start comments scraping');
    }
  };

  const handleDiscovery = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      await discoveryMutation.mutateAsync({
        search_term: searchTerm.trim(),
        limit: parseInt(discoveryLimit),
      });
      toast.success('Discovery pipeline started!');
      setSearchTerm('');
    } catch {
      toast.error('Failed to start discovery');
    }
  };

  const handleDiscoverAndSave = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      await discoverAndSaveMutation.mutateAsync({
        search_term: searchTerm.trim(),
        limit: parseInt(discoveryLimit),
      });
      toast.success('Discovery and Save job started!');
      setSearchTerm('');
    } catch {
      toast.error('Failed to start discovery and save');
    }
  };

  const handleFullPipeline = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      await fullPipelineMutation.mutateAsync({
        search_term: searchTerm.trim(),
        discovery_limit: parseInt(discoveryLimit),
        posts_per_hashtag: parseInt(postsLimit),
        comments_limit_posts: parseInt(commentsPostsLimit),
        comments_limit_per_post: parseInt(commentsPerPost),
      });
      toast.success('Full pipeline started! This may take 3-10 minutes.');
      setSearchTerm('');
    } catch {
      toast.error('Failed to start full pipeline');
    }
  };

  const isLoading =
    scrapeHashtagsMutation.isPending ||
    scrapeCommentsMutation.isPending ||
    discoveryMutation.isPending ||
    fullPipelineMutation.isPending ||
    discoverAndSaveMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Scraping Job</CardTitle>
        <CardDescription>
          Configure and start a new Instagram scraping job
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hashtag">
              <Hash className="h-4 w-4 mr-2" />
              Hashtags
            </TabsTrigger>
            <TabsTrigger value="comments">
              <User className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="discovery">
              <Link className="h-4 w-4 mr-2" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="full">
              <Rocket className="h-4 w-4 mr-2" />
              Full Pipeline
            </TabsTrigger>
          </TabsList>

          {/* Hashtag Scraping */}
          <TabsContent value="hashtag" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Textarea
                id="hashtags"
                placeholder="nwc_media, water, sustainability (comma or newline separated)"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Enter hashtags without # symbol, separated by commas or new lines
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="posts-limit">Posts per hashtag</Label>
              <Select value={postsLimit} onValueChange={setPostsLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 posts</SelectItem>
                  <SelectItem value="50">50 posts</SelectItem>
                  <SelectItem value="100">100 posts</SelectItem>
                  <SelectItem value="200">200 posts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleHashtagScrape}
              disabled={isLoading}
            >
              {scrapeHashtagsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Hashtag Scraping
            </Button>
          </TabsContent>

          {/* Comments Scraping */}
          <TabsContent value="comments" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Posts to process</Label>
              <Select value={commentsPostsLimit} onValueChange={setCommentsPostsLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 posts</SelectItem>
                  <SelectItem value="10">10 posts</SelectItem>
                  <SelectItem value="25">25 posts</SelectItem>
                  <SelectItem value="50">50 posts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Scrapes comments from posts that don&apos;t have comments yet
              </p>
            </div>
            <div className="space-y-2">
              <Label>Comments per post</Label>
              <Select value={commentsPerPost} onValueChange={setCommentsPerPost}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 comments</SelectItem>
                  <SelectItem value="50">50 comments</SelectItem>
                  <SelectItem value="100">100 comments</SelectItem>
                  <SelectItem value="200">200 comments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleCommentsScrape}
              disabled={isLoading}
            >
              {scrapeCommentsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Comment Scraping
            </Button>
          </TabsContent>

          {/* Discovery Pipeline */}
          <TabsContent value="discovery" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="search-term">Search Term</Label>
              <Input
                id="search-term"
                placeholder="nwc_media"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Discovers accounts, hashtags, and places related to this term
              </p>
            </div>
            <div className="space-y-2">
              <Label>Results limit</Label>
              <Select value={discoveryLimit} onValueChange={setDiscoveryLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="30">30 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="w-full"
                onClick={handleDiscovery}
                disabled={isLoading}
              >
                {discoveryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Discovery
              </Button>
              <Button
                className="w-full"
                onClick={handleDiscoverAndSave}
                disabled={isLoading}
                variant="secondary"
              >
                {discoverAndSaveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4 mr-2" />
                )}
                Discover & Save
              </Button>
            </div>
          </TabsContent>

          {/* Full Pipeline */}
          <TabsContent value="full" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="full-search">Search Term</Label>
              <Input
                id="full-search"
                placeholder="nwc_media"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discovery limit</Label>
                <Select value={discoveryLimit} onValueChange={setDiscoveryLimit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Posts per hashtag</Label>
                <Select value={postsLimit} onValueChange={setPostsLimit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Runs discovery, then scrapes posts from found hashtags, and finally collects comments. Takes 3-10 minutes.
            </p>
            <Button
              className="w-full"
              onClick={handleFullPipeline}
              disabled={isLoading}
            >
              {fullPipelineMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4 mr-2" />
              )}
              Start Full Pipeline
            </Button>
          </TabsContent>
        </Tabs>

        {/* Options */}
        <div className="mt-6 pt-6 border-t space-y-4">
          <h4 className="text-sm font-medium">Options</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="download-media">Download Media</Label>
              <p className="text-xs text-muted-foreground">
                Save images and videos locally
              </p>
            </div>
            <Switch
              id="download-media"
              checked={downloadMedia}
              onCheckedChange={setDownloadMedia}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="fetch-comments">Fetch Comments</Label>
              <p className="text-xs text-muted-foreground">
                Automatically scrape comments after posts
              </p>
            </div>
            <Switch
              id="fetch-comments"
              checked={fetchComments}
              onCheckedChange={setFetchComments}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="run-ai">Run AI Analysis</Label>
              <p className="text-xs text-muted-foreground">
                Automatically analyze content after scraping
              </p>
            </div>
            <Switch
              id="run-ai"
              checked={runAIAnalysis}
              onCheckedChange={setRunAIAnalysis}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
