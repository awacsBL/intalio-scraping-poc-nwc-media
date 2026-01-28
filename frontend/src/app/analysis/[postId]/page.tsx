'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PostDetail } from '@/components/analysis/post-detail';
import { CommentsSection } from '@/components/analysis/comments-section';
import { Button } from '@/components/ui/button';
import { usePost, usePostComments } from '@/hooks/useApi';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default function PostAnalysisPage({ params }: PageProps) {
  const { postId } = use(params);
  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = usePostComments(postId);

  return (
    <>
      <Header
        title="Post Analysis"
        subtitle={post ? `@${post.owner_username}` : 'Loading...'}
      />
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/explorer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explorer
          </Link>
        </Button>

        {/* Post Detail */}
        <PostDetail post={post} isLoading={postLoading} />

        {/* Comments Section */}
        <CommentsSection
          comments={comments ?? []}
          isLoading={commentsLoading}
        />
      </div>
    </>
  );
}
