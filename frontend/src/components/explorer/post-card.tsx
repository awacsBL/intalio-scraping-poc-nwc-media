'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Film,
  Layers,
  Play,
  ExternalLink,
} from 'lucide-react';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  viewMode: 'grid' | 'list';
}

const typeIcons = {
  Photo: ImageIcon,
  Video: Film,
  Carousel: Layers,
  Reel: Play,
};

const sentimentColors = {
  positive: 'bg-green-500',
  neutral: 'bg-gray-500',
  negative: 'bg-red-500',
};

export function PostCard({ post, viewMode }: PostCardProps) {
  const router = useRouter();
  const TypeIcon = typeIcons[post.post_type] || ImageIcon;
  const sentiment = post.ai_results?.sentiment?.label;
  const confidence = post.ai_results?.sentiment?.confidence;

  const handleCardClick = () => {
    router.push(`/analysis/${post.post_id}`);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(post.post_url, '_blank', 'noopener,noreferrer');
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
              {post.display_url ? (
                <Image
                  src={post.display_url}
                  alt={post.caption?.slice(0, 50) || 'Instagram post'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <TypeIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-1 left-1">
                <Badge variant="secondary" className="h-5 px-1">
                  <TypeIcon className="h-3 w-3" />
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">@{post.owner_username}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.timestamp
                      ? formatDistanceToNow(new Date(post.timestamp), {
                          addSuffix: true,
                        })
                      : 'Unknown date'}
                  </p>
                </div>
                {sentiment && (
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        sentimentColors[sentiment]
                      )}
                    />
                    <span className="text-xs capitalize">{sentiment}</span>
                    {confidence && (
                      <span className="text-xs text-muted-foreground">
                        ({Math.round(confidence * 100)}%)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                {post.caption || 'No caption'}
              </p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  {post.likes_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments_count.toLocaleString()}
                </div>
                {post.ai_results && (
                  <Badge variant="outline" className="text-xs">
                    AI Analyzed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className="overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {post.display_url ? (
          <Image
            src={post.display_url}
            alt={post.caption?.slice(0, 50) || 'Instagram post'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TypeIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
          <div className="flex items-center gap-1 text-white">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-medium">
              {post.likes_count.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white">
            <MessageCircle className="h-5 w-5 fill-current" />
            <span className="font-medium">
              {post.comments_count.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="h-6">
            <TypeIcon className="h-3 w-3 mr-1" />
            {post.post_type}
          </Badge>
        </div>

        {/* Sentiment indicator */}
        {sentiment && (
          <div className="absolute top-2 right-2">
            <div
              className={cn(
                'h-3 w-3 rounded-full border-2 border-white',
                sentimentColors[sentiment]
              )}
              title={`${sentiment} sentiment (${Math.round((confidence || 0) * 100)}%)`}
            />
          </div>
        )}

        {/* External link - using button instead of anchor to avoid nesting */}
        <button
          onClick={handleExternalClick}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="View on Instagram"
        >
          <Badge variant="secondary" className="h-7 cursor-pointer">
            <ExternalLink className="h-3 w-3" />
          </Badge>
        </button>
      </div>

      {/* Content */}
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm truncate">@{post.owner_username}</p>
          <span className="text-xs text-muted-foreground">
            {post.timestamp
              ? formatDistanceToNow(new Date(post.timestamp), {
                  addSuffix: true,
                })
              : 'Unknown date'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {post.caption || 'No caption'}
        </p>

        {/* Topics */}
        {post.ai_results?.topics && post.ai_results.topics.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {post.ai_results.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
