import React from 'react';
import { ArrowUpDown, FileText, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlatformIcon } from '@/components/primitives/platform-icon';
import { StatusBadge } from './status-badge';
import {
  getPostAnalytics,
  formatMetricNumber,
  normalizePostStatus,
} from './posts-helpers';
import { SKELETON_TABLE_KEYS, type PostGroup, type PostSortKey } from './types';

export interface PostListTableViewProps {
  posts: PostGroup[];
  isLoading: boolean;
  sortKey: PostSortKey;
  onSortChange: (key: PostSortKey) => void;
  onEdit: (groupId: string) => void;
  onDelete: (groupId: string) => void;
}

/**
 * Presenter component for List View: renders a data table with post previews and sortable analytics columns.
 *
 * Wrapped in `React.memo` to eliminate table re-renders when parent toolbar or modal states change.
 */
export const PostListTableView = React.memo(function PostListTableView({
  posts,
  isLoading,
  sortKey,
  onSortChange,
  onEdit,
  onDelete,
}: PostListTableViewProps) {
  return (
    <div className="rounded-card border border-line bg-surface overflow-auto flex-1 min-h-0 shadow-card">
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left text-xs text-ink">
          <thead className="sticky top-0 z-10 border-b border-line bg-page text-[11px] uppercase tracking-wider text-ink-2 font-semibold select-none shadow-hairline">
            <tr>
              <th className="py-3 pl-4 pr-3 min-w-[240px]">Post & Preview</th>
              <th className="py-3 px-3 min-w-[120px]">Profile</th>
              <th className="py-3 px-3 min-w-[90px]">Platforms</th>
              <th
                className="py-3 px-3 min-w-[140px] cursor-pointer hover:text-ink"
                onClick={() => onSortChange(sortKey === 'date-desc' ? 'date-asc' : 'date-desc')}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="size-3" />
                </div>
              </th>
              <th className="py-3 px-3 min-w-[100px]">Status</th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('likes-desc')}
              >
                Likes
              </th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('comments-desc')}
              >
                Cmts
              </th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('shares-desc')}
              >
                Shrs
              </th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('saves-desc')}
              >
                Saves
              </th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('clicks-desc')}
              >
                Clicks
              </th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('views-desc')}
              >
                Views
              </th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('impressions-desc')}
              >
                Impr.
              </th>
              <th
                className="py-3 px-2 text-right font-mono cursor-pointer hover:text-ink"
                onClick={() => onSortChange('reach-desc')}
              >
                Reach
              </th>
              <th className="py-3 pr-4 pl-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {isLoading ? (
              SKELETON_TABLE_KEYS.map((key) => (
                <tr key={key}>
                  <td colSpan={14} className="py-4 px-4">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-ink-3">
                  No posts found matching the active filters.
                </td>
              </tr>
            ) : (
              posts.map((postGroup) => {
                const groupId = postGroup.group || postGroup.id;
                const primaryPost = postGroup.posts?.[0];
                const content = primaryPost?.content?.[0]?.content || '';
                const images = primaryPost?.content?.[0]?.image || [];
                const primaryImage = images[0]?.path;
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
                  new Set(postGroup.posts?.map((p) => p.integration?.providerIdentifier).filter(Boolean) || [])
                );

                const profileName =
                  primaryPost?.integration?.customer?.name ||
                  primaryPost?.integration?.name ||
                  'Default Profile';

                const analytics = getPostAnalytics(postGroup);

                return (
                  <tr key={groupId} className="hover:bg-hover/50 transition-colors group">
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-control overflow-hidden bg-page border border-line shrink-0 flex items-center justify-center">
                          {primaryImage ? (
                            <img src={primaryImage} alt="" className="size-full object-cover" />
                          ) : (
                            <FileText className="size-4 text-ink-3" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-ink truncate max-w-[240px]">
                            {content || 'Untitled post'}
                          </span>
                          <span className="font-mono text-[10px] text-ink-3">
                            {groupId.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-ink-2 font-medium whitespace-nowrap">
                      {profileName}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {providers.map((p) => (
                          <PlatformIcon key={`${groupId}-${p}`} provider={p} className="size-3.5" />
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-ink-2 whitespace-nowrap font-medium">
                      {dateStr}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={rawStatus} />
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-medium text-ink">
                      {formatMetricNumber(analytics.likes, isPublished)}
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-medium text-ink">
                      {formatMetricNumber(analytics.comments, isPublished)}
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-medium text-ink">
                      {formatMetricNumber(analytics.shares, isPublished)}
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-medium text-ink">
                      {formatMetricNumber(analytics.saves, isPublished)}
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-medium text-ink">
                      {formatMetricNumber(analytics.clicks, isPublished)}
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-semibold text-ink">
                      {formatMetricNumber(analytics.views, isPublished)}
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-semibold text-ink">
                      {formatMetricNumber(analytics.impressions, isPublished)}
                    </td>

                    <td className="py-3 px-2 text-right font-mono font-semibold text-accent-ink">
                      {formatMetricNumber(analytics.reach, isPublished)}
                    </td>

                    <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default PostListTableView;
