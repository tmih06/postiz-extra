import React from 'react';
import { CalendarDays, Edit3, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PlatformIcon } from '@/components/primitives/platform-icon';
import { StatusBadge } from './status-badge';
import {
  getPostAnalytics,
  formatMetricNumber,
  normalizePostStatus,
} from './posts-helpers';
import type { PostGroup } from './types';

export interface CalendarDateDetailDialogProps {
  selectedDate: Date | null;
  posts: PostGroup[];
  onClose: () => void;
  onEdit: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  onScheduleNew: () => void;
}

/**
 * Presenter component for Date Detail modal: expands a calendar cell to inspect and manage all posts for that day.
 *
 * Wrapped in `React.memo` to avoid re-rendering unless the selected date or post list changes.
 */
export const CalendarDateDetailDialog = React.memo(function CalendarDateDetailDialog({
  selectedDate,
  posts,
  onClose,
  onEdit,
  onDelete,
  onScheduleNew,
}: CalendarDateDetailDialogProps) {
  return (
    <Dialog open={Boolean(selectedDate)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5 text-accent" />
            Posts for{' '}
            {selectedDate?.toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </DialogTitle>
          <DialogDescription>
            {posts.length} post{posts.length === 1 ? '' : 's'} scheduled or published on this date.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-3">
          {posts.length === 0 ? (
            <div className="py-8 text-center text-ink-3 text-sm">
              No posts scheduled for this day yet. Click below to schedule one.
            </div>
          ) : (
            posts.map((postGroup) => {
              const groupId = postGroup.group || postGroup.id;
              const primaryPost = postGroup.posts?.[0];
              const content = primaryPost?.content?.[0]?.content || '';
              const images = primaryPost?.content?.[0]?.image || [];
              const primaryImage = images[0]?.path;
              const rawStatus = normalizePostStatus(postGroup);
              const isPub = rawStatus === 'published' || rawStatus === 'success';
              const analytics = getPostAnalytics(postGroup);
              const providers = Array.from(
                new Set(
                  postGroup.posts?.map((p) => p.integration?.providerIdentifier).filter(Boolean) || []
                )
              );

              return (
                <div
                  key={groupId}
                  className="rounded-card border border-line bg-page p-3 flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={rawStatus} />
                        <div className="flex items-center gap-1">
                          {providers.map((p) => (
                            <PlatformIcon
                              key={`${groupId}-${p}`}
                              provider={p}
                              className="size-3.5"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-ink line-clamp-2">
                        {content || 'Untitled post'}
                      </p>
                    </div>

                    {primaryImage && (
                      <div className="size-14 rounded-control overflow-hidden shrink-0 border border-line bg-surface">
                        <img src={primaryImage} alt="" className="size-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center rounded-control bg-surface p-2 border border-line text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Likes</span>
                      <span className="font-semibold text-ink">
                        {formatMetricNumber(analytics.likes, isPub)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Cmts</span>
                      <span className="font-semibold text-ink">
                        {formatMetricNumber(analytics.comments, isPub)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Shrs</span>
                      <span className="font-semibold text-ink">
                        {formatMetricNumber(analytics.shares, isPub)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Saves</span>
                      <span className="font-semibold text-ink">
                        {formatMetricNumber(analytics.saves, isPub)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Clicks</span>
                      <span className="font-semibold text-ink">
                        {formatMetricNumber(analytics.clicks, isPub)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Views</span>
                      <span className="font-semibold text-ink">
                        {formatMetricNumber(analytics.views, isPub)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Impr.</span>
                      <span className="font-semibold text-ink">
                        {formatMetricNumber(analytics.impressions, isPub)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ink-3 block font-sans">Reach</span>
                      <span className="font-semibold text-accent-ink">
                        {formatMetricNumber(analytics.reach, isPub)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(groupId)}
                      className="h-7 text-xs rounded-control gap-1"
                    >
                      <Edit3 className="size-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(groupId)}
                      className="h-7 text-xs rounded-control text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="outline" onClick={onClose} className="rounded-control">
            Close
          </Button>
          <Button
            onClick={onScheduleNew}
            className="rounded-control bg-[#ef4444] hover:bg-[#dc2626] text-white gap-1.5"
          >
            <Plus className="size-4" />
            Schedule post for this date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default CalendarDateDetailDialog;
