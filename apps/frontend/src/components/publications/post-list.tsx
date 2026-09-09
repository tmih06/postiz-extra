import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ListFilter,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import type { PostGroup, PostDetailItem } from '@/api/types';
import { cn } from '@/lib/utils';

interface PostListProps {
  initialStateFilter?: 'all' | 'scheduled' | 'draft' | 'published';
  onEditPost?: (group: string) => void;
}

export function PostList({
  initialStateFilter = 'all',
  onEditPost,
}: PostListProps) {
  const { api, selectedCustomerId } = useWorkspace();
  const [posts, setPosts] = useState<PostGroup[]>([]);
  const [stateFilter, setStateFilter] = useState<string>(initialStateFilter);
  const [page, setPage] = useState(0);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getPostsList({
        page,
        limit,
        state: stateFilter === 'all' ? undefined : stateFilter,
        customer: selectedCustomerId === 'all' ? undefined : selectedCustomerId,
      });
      setPosts(res.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [api, page, limit, stateFilter, selectedCustomerId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (group: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(group);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS' || s === 'PUBLISHED') {
      return (
        <Badge variant="secondary" className="font-mono text-[10px] gap-1">
          <CheckCircle2 className="size-3" /> Published
        </Badge>
      );
    }
    if (s === 'ERROR' || s === 'FAILED') {
      return (
        <Badge variant="destructive" className="font-mono text-[10px] gap-1">
          <AlertCircle className="size-3" /> Failed
        </Badge>
      );
    }
    if (s === 'DRAFT') {
      return (
        <Badge variant="outline" className="font-mono text-[10px] gap-1">
          <FileText className="size-3" /> Draft
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="font-mono text-[10px] gap-1 text-muted-foreground">
        <Clock className="size-3" /> Scheduled
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Publications & Outcomes
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inspect publishing history, scheduled items, and per-channel delivery statuses.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-border p-1 bg-card">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Drafts' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setStateFilter(item.id);
                setPage(0);
              }}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                stateFilter === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Posts Listing */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Empty className="py-16">
          <EmptyIcon>
            <ListFilter className="size-6" />
          </EmptyIcon>
          <EmptyTitle>No posts found</EmptyTitle>
          <EmptyDescription>
            There are no {stateFilter === 'all' ? '' : stateFilter} posts for this profile view.
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((postGroup) => {
            const groupId = postGroup.group || postGroup.id;
            const primaryPost = postGroup.posts?.[0];
            const content = primaryPost?.content?.[0]?.content || '';
            const images = primaryPost?.content?.[0]?.image || [];
            const dateStr = new Date(postGroup.date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <Card
                key={groupId}
                className="border border-border bg-card shadow-sm hover:border-foreground/40 transition-colors"
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span className="font-medium text-foreground">{dateStr}</span>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground/80">
                      ({postGroup.type})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onEditPost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPost(groupId)}
                        className="h-7 text-xs gap-1"
                      >
                        <Edit3 className="size-3" /> Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(groupId)}
                      className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                    >
                      <Trash2 className="size-3" /> Delete
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Content Preview */}
                  <div className="flex gap-4">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap flex-1 leading-relaxed line-clamp-3 font-normal">
                      {content || <span className="italic text-muted-foreground">No text content</span>}
                    </p>

                    {images.length > 0 && (
                      <div className="size-16 rounded-md border border-border overflow-hidden bg-muted shrink-0">
                        <img
                          src={images[0].path}
                          alt="thumbnail"
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {/* Channel Delivery Outcomes */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Destinations & Delivery Outcomes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(postGroup.posts ?? []).map((chPost: PostDetailItem) => {
                        const channelName = chPost.integration?.name || 'Channel';
                        const provider = chPost.integration?.providerIdentifier || '';
                        const status = chPost.status || 'PENDING';
                        const errorDetail = chPost.errorMessage || chPost.error;

                        return (
                          <div
                            key={chPost.id}
                            className="flex flex-col gap-1 rounded-lg border border-border bg-background p-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate max-w-[120px]">
                                {channelName}
                              </span>
                              {provider && (
                                <Badge variant="outline" className="font-mono text-[9px] uppercase">
                                  {provider}
                                </Badge>
                              )}
                              {getStatusBadge(status)}
                            </div>
                            {errorDetail && (
                              <span className="text-[10px] text-destructive max-w-xs break-words">
                                {errorDetail}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          Page {page + 1}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="size-3.5" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={posts.length < limit || isLoading}
            className="h-8 gap-1 text-xs"
          >
            Next <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
