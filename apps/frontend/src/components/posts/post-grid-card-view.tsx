import React from 'react';
import {
  LayoutGrid,
  Plus,
  FileText,
  Play,
  Heart,
  MessageSquare,
  Repeat2,
  Bookmark,
  MousePointerClick,
  Eye,
  BarChart3,
  TrendingUp,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { PlatformIcon } from '@/components/primitives/platform-icon';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import {
  getPostAnalytics,
  formatMetricNumber,
  normalizePostStatus,
} from './posts-helpers';
import { SKELETON_CARD_KEYS, type PostGroup } from './types';

export interface PostGridCardViewProps {
  posts: PostGroup[];
  isLoading: boolean;
  gridColumnClass: string;
  onEdit: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  onCreatePost: () => void;
}

/**
 * Presenter component for Grid View: renders high-density cards with analytics tiles and media previews.
 *
 * Wrapped in `React.memo` to eliminate re-renders when parent states change outside the cards.
 */
export const PostGridCardView = React.memo(function PostGridCardView({
  posts,
  isLoading,
  gridColumnClass,
  onEdit,
  onDelete,
  onCreatePost,
}: PostGridCardViewProps) {
  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className={cn('grid gap-4', gridColumnClass)}>
          {SKELETON_CARD_KEYS.map((key) => (
            <div
              key={key}
              className="h-56 rounded-card border border-line bg-surface p-4 flex flex-col justify-between"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Empty className="py-16 bg-surface rounded-card border border-line w-full max-w-lg">
          <EmptyIcon>
            <LayoutGrid className="size-6" />
          </EmptyIcon>
          <EmptyTitle>No posts match filters</EmptyTitle>
          <EmptyDescription>
            Try adjusting your search query, status, or date range filters.
          </EmptyDescription>
          <Button
            onClick={onCreatePost}
            className="mt-4 rounded-control bg-[#ef4444] hover:bg-[#dc2626] text-white"
          >
            <Plus className="size-4 mr-1.5" />
            Create post
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
      <div className={cn('grid gap-4', gridColumnClass)}>
        {posts.map((postGroup) => {
          const groupId = postGroup.group || postGroup.id;
          const primaryPost = postGroup.posts?.[0];
          const content = primaryPost?.content?.[0]?.content || '';
          const images = primaryPost?.content?.[0]?.image || [];
          const primaryImage = images[0]?.path;
          const isVideo =
            primaryImage?.toLowerCase().endsWith('.mp4') ||
            primaryImage?.toLowerCase().endsWith('.mov');

          const dateStr = new Date(postGroup.date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

          const rawStatus = normalizePostStatus(postGroup);
          const isPublished = rawStatus === 'published' || rawStatus === 'success';

          const providers = Array.from(
            new Set(
              postGroup.posts?.map((p) => p.integration?.providerIdentifier).filter(Boolean) || []
            )
          );

          const profileName =
            primaryPost?.integration?.customer?.name ||
            primaryPost?.integration?.name ||
            'Default Profile';

          const analytics = getPostAnalytics(postGroup);

          return (
            <div
              key={groupId}
              className="flex flex-col justify-between rounded-card border border-line bg-surface p-3.5 shadow-card hover:shadow-raised hover:border-line-strong transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <p className="text-[13px] font-medium text-ink line-clamp-2 leading-snug">
                    {content || <span className="italic text-ink-3">No caption</span>}
                  </p>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    {providers.length > 0 ? (
                      providers.map((p) => (
                        <div
                          key={`${groupId}-${p}`}
                          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-page shadow-hairline"
                          title={p}
                        >
                          <PlatformIcon provider={p} className="size-3.5" />
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-ink-3">
                        <PlatformIcon provider="x" className="size-3.5" />
                        <PlatformIcon provider="instagram" className="size-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="text-[11.5px] text-ink-2 font-medium">{dateStr}</div>
                  <div className="text-[11px] text-ink-3 truncate">
                    Profile: <span className="text-ink-2 font-medium">{profileName}</span>
                  </div>
                </div>

                <div className="relative size-16 shrink-0 rounded-control overflow-hidden bg-page border border-line flex items-center justify-center">
                  {primaryImage ? (
                    <>
                      <img src={primaryImage} alt="Thumbnail" className="size-full object-cover" />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="size-3.5 fill-white text-white" />
                        </div>
                      )}
                    </>
                  ) : (
                    <FileText className="size-5 text-ink-3" />
                  )}
                </div>
              </div>

              <div className="my-1.5 rounded-chip bg-inset/60 px-2.5 py-1.5 border border-line-soft">
                <div className="grid grid-cols-4 gap-1 text-[10.5px] font-mono text-ink-2">
                  <span className="flex items-center gap-1 min-w-0" title="Likes">
                    <Heart className="size-2.5 text-red shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Likes</span>
                    <span className="font-semibold text-ink ml-auto">
                      {formatMetricNumber(analytics.likes, isPublished)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0" title="Comments">
                    <MessageSquare className="size-2.5 text-sky-500 shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Cmts</span>
                    <span className="font-semibold text-ink ml-auto">
                      {formatMetricNumber(analytics.comments, isPublished)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0" title="Shares">
                    <Repeat2 className="size-2.5 text-green shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Shrs</span>
                    <span className="font-semibold text-ink ml-auto">
                      {formatMetricNumber(analytics.shares, isPublished)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0" title="Saves">
                    <Bookmark className="size-2.5 text-orange shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Saves</span>
                    <span className="font-semibold text-ink ml-auto">
                      {formatMetricNumber(analytics.saves, isPublished)}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10.5px] font-mono text-ink-2 mt-1 pt-1 border-t border-line-soft/80">
                  <span className="flex items-center gap-1 min-w-0" title="Clicks">
                    <MousePointerClick className="size-2.5 text-ink-3 shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Clicks</span>
                    <span className="font-semibold text-ink ml-auto">
                      {formatMetricNumber(analytics.clicks, isPublished)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0" title="Views">
                    <Eye className="size-2.5 text-accent shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Views</span>
                    <span className="font-semibold text-ink ml-auto">
                      {formatMetricNumber(analytics.views, isPublished)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0" title="Impressions">
                    <BarChart3 className="size-2.5 text-purple-500 shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Impr.</span>
                    <span className="font-semibold text-ink ml-auto">
                      {formatMetricNumber(analytics.impressions, isPublished)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0" title="Reach">
                    <TrendingUp className="size-2.5 text-accent-ink shrink-0" />
                    <span className="text-[9px] text-ink-3 font-sans truncate">Reach</span>
                    <span className="font-semibold text-accent-ink ml-auto">
                      {formatMetricNumber(analytics.reach, isPublished)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-line/60">
                <StatusBadge status={rawStatus} />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-control text-ink-3 hover:text-ink"
                    onClick={() => onEdit(groupId)}
                    title="Edit post"
                  >
                    <Edit3 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-control text-ink-3 hover:text-destructive"
                    onClick={() => onDelete(groupId)}
                    title="Delete post"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PostGridCardView;
