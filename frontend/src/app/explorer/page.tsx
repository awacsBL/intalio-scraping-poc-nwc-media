'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { PostCard } from '@/components/explorer/post-card';
import { Filters } from '@/components/explorer/filters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store';
import { usePosts } from '@/hooks/useApi';
import { LayoutGrid, List, RefreshCw } from 'lucide-react';
import type { PostFilters } from '@/types';

export default function ExplorerPage() {
  const { viewMode, setViewMode, postFilters, setPostFilters } = useAppStore();
  const [filters, setFilters] = useState<PostFilters>(postFilters);

  const { data: posts, isLoading, refetch } = usePosts(filters);

  const handleFilterChange = useCallback((newFilters: PostFilters) => {
    setFilters(newFilters);
    setPostFilters(newFilters);
  }, [setPostFilters]);

  return (
    <>
      <Header
        title="Data Explorer"
        subtitle="Browse and filter scraped content"
      />
      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <Filters onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      Showing <span className="font-medium">{posts?.length ?? 0}</span> posts
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Posts Grid/List */}
            {isLoading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                    : 'space-y-4'
                }
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    {viewMode === 'grid' ? (
                      <div className="space-y-3">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <Skeleton className="h-28 w-full" />
                    )}
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                    : 'space-y-4'
                }
              >
                {posts.map((post) => (
                  <PostCard key={post.post_id} post={post} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No posts found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or scrape new content
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
