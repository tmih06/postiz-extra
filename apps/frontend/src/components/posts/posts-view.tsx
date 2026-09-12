import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkspace } from '@/context/workspace.context';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import type { PostGroup } from '@/api/types';
import { Composer } from '@/components/composer/composer';

import { PostListTableView } from './post-list-table-view';
import { PostCalendarGridView } from './post-calendar-grid-view';
import { PostGridCardView } from './post-grid-card-view';
import { CalendarDateDetailDialog } from './calendar-date-detail-dialog';
import { PostsToolbar } from './posts-toolbar';
import { filterAndSortPosts, toLocalDateKey } from './posts-helpers';
import type {
  PostViewMode,
  PostStatusFilter,
  PostSortKey,
  PostsViewProps,
  CalendarDayCell,
} from './types';

// Re-export modular components, types, and helpers for seamless external consumption
export * from './types';
export {
  getPostAnalytics,
  formatMetricNumber,
  filterAndSortPosts,
  toLocalDateKey,
  normalizePostStatus,
} from './posts-helpers';
export { StatusBadge } from './status-badge';
export { PlatformIcon } from '@/components/primitives/platform-icon';
export { PostListTableView } from './post-list-table-view';
export { PostCalendarGridView } from './post-calendar-grid-view';
export { PostGridCardView } from './post-grid-card-view';
export { CalendarDateDetailDialog } from './calendar-date-detail-dialog';
export { PostsToolbar } from './posts-toolbar';

/**
 * Unified Posts section component managing List, Calendar, Grid, and Composer views.
 *
 * Coordinates lifecycle queries across date-bounded calendar ranges and paginated list endpoints,
 * isolates presenter re-renders via stable callback contracts, and applies OR-based platform
 * filtering to the loaded post groups.
 *
 * @param props - Initial view mode, default status filter, initial post group identifier, and navigation callback.
 * @returns Complete unified Posts management view with responsive controls.
 */
export function PostsView({
  initialViewMode = 'list',
  initialStatusFilter = 'all',
  initialGroupId,
  onNavigate,
}: PostsViewProps) {
  const { api, selectedCustomerId, customers } = useWorkspace();

  const [viewMode, setViewMode] = useState<PostViewMode>(initialViewMode);
  const [statusFilter, setStatusFilter] =
    useState<PostStatusFilter>(initialStatusFilter);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<PostSortKey>('date-desc');
  const [columns, setColumns] = useState<number>(4);
  const [editingGroupId, setEditingGroupId] = useState<string | undefined>(
    initialGroupId
  );
  const [schedulingDate, setSchedulingDate] = useState<Date | undefined>(
    undefined
  );

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(
    null
  );
  const [calendarDatePosts, setCalendarDatePosts] = useState<PostGroup[]>([]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  const [posts, setPosts] = useState<PostGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  useEffect(() => {
    if (initialStatusFilter) setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialGroupId) {
      setEditingGroupId(initialGroupId);
      setViewMode('composer');
    }
  }, [initialGroupId]);

  const calendarRange = useMemo(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    // Cover full month plus padding from adjacent months displayed in the 7-column grid
    const start = new Date(y, m - 1, 20, 0, 0, 0, 0);
    const end = new Date(y, m + 1, 15, 23, 59, 59, 999);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [calendarMonth]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (viewMode === 'calendar') {
        const res = await api.getPosts({
          startDate: calendarRange.startDate,
          endDate: calendarRange.endDate,
          customer:
            selectedCustomerId === 'all' ? undefined : selectedCustomerId,
        });
        setPosts(res ?? []);
      } else {
        const res = await api.getPostsList({
          page: 0,
          limit: 100,
          state: statusFilter === 'all' ? undefined : statusFilter,
          customer:
            selectedCustomerId === 'all' ? undefined : selectedCustomerId,
        });
        setPosts(res.posts ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [api, viewMode, calendarRange, statusFilter, selectedCustomerId]);

  useEffect(() => {
    if (viewMode !== 'composer') {
      fetchPosts().catch(() => {});
    }
  }, [fetchPosts, viewMode]);

  const handleDeletePost = useCallback(
    async (groupId: string): Promise<boolean> => {
      if (!window.confirm('Are you sure you want to delete this post?'))
        return false;
      try {
        await api.deletePost(groupId);
        setPosts((prev) => prev.filter((p) => (p.group || p.id) !== groupId));
        setCalendarDatePosts((prev) =>
          prev.filter((p) => (p.group || p.id) !== groupId)
        );
        await fetchPosts();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete post');
        return false;
      }
    },
    [api, fetchPosts]
  );
  const handleDeletePostAction = useCallback(
    (groupId: string) => {
      handleDeletePost(groupId).catch(() => {});
    },
    [handleDeletePost]
  );

  const handleEditPost = useCallback((groupId: string) => {
    setEditingGroupId(groupId);
    setSchedulingDate(undefined);
    setViewMode('composer');
  }, []);

  const handleCreatePost = useCallback(() => {
    setEditingGroupId(undefined);
    setSchedulingDate(undefined);
    setViewMode('composer');
  }, []);

  const handleBackToPosts = useCallback(() => {
    setEditingGroupId(undefined);
    setSchedulingDate(undefined);
    setViewMode('list');
  }, []);

  const handlePostSuccess = useCallback(() => {
    setEditingGroupId(undefined);
    setSchedulingDate(undefined);
    setViewMode('list');
  }, []);

  const handlePrevMonth = useCallback(() => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  const handleToday = useCallback(() => {
    setCalendarMonth(new Date());
  }, []);
  const processedPosts = useMemo(() => {
    return filterAndSortPosts(posts, {
      statusFilter,
      platformFilter,
      profileFilter,
      searchQuery,
      dateFilter,
      sortKey,
    });
  }, [
    posts,
    statusFilter,
    platformFilter,
    profileFilter,
    searchQuery,
    dateFilter,
    sortKey,
  ]);

  const handleCalendarCellClick = useCallback(
    (date: Date) => {
      const targetKey = toLocalDateKey(date);
      const matches = processedPosts.filter(
        (g) => toLocalDateKey(g.date) === targetKey
      );
      setSelectedCalendarDate(date);
      setCalendarDatePosts(matches);
    },
    [processedPosts]
  );

  const handleCloseCalendarDialog = useCallback(() => {
    setSelectedCalendarDate(null);
  }, []);

  const handleScheduleNewFromCalendar = useCallback(() => {
    if (selectedCalendarDate) {
      setSchedulingDate(selectedCalendarDate);
    }
    setSelectedCalendarDate(null);
    setEditingGroupId(undefined);
    setViewMode('composer');
  }, [selectedCalendarDate]);
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDayCell[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, totalDaysInPrevMonth - i),
        isCurrentMonth: false,
        dayNumber: totalDaysInPrevMonth - i,
      });
    }

    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    return days;
  }, [calendarMonth]);

  const gridColumnClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : columns === 5
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-3 sm:gap-4 overflow-hidden">
      {error && (
        <div className="shrink-0 rounded-control bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
          {error}
        </div>
      )}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Posts
          </h1>
          <p className="text-sm text-ink-2 mt-0.5">
            Manage your drafts, scheduled queues, publications, and analytics in
            one place
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {viewMode === 'composer' ? (
            <Button
              variant="outline"
              onClick={handleBackToPosts}
              className="rounded-control border-line bg-surface hover:bg-hover text-ink shadow-hairline gap-1.5"
            >
              <ArrowLeft className="size-4" />
              Back to posts
            </Button>
          ) : (
            <Button
              onClick={handleCreatePost}
              className="rounded-control bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium shadow-sm transition-all gap-1.5"
            >
              <Plus className="size-4" />
              Create post
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {viewMode !== 'composer' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 54 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden shrink-0"
          >
            <PostsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              columns={columns}
              onColumnsChange={setColumns}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              platformFilter={platformFilter}
              onPlatformChange={setPlatformFilter}
              profileFilter={profileFilter}
              onProfileChange={setProfileFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
              sortKey={sortKey}
              onSortChange={setSortKey}
              customers={customers}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            {viewMode === 'composer' ? (
              <div className="flex-1 min-h-0 overflow-y-auto rounded-card border border-line bg-surface p-4 shadow-card">
                <Composer
                  initialGroup={editingGroupId}
                  initialDate={schedulingDate}
                  onPostSuccess={handlePostSuccess}
                  onNavigate={onNavigate}
                />
              </div>
            ) : viewMode === 'calendar' ? (
              <PostCalendarGridView
                posts={processedPosts}
                calendarMonth={calendarMonth}
                calendarDays={calendarDays}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
                onCellClick={handleCalendarCellClick}
              />
            ) : viewMode === 'grid' ? (
              <PostGridCardView
                posts={processedPosts}
                isLoading={isLoading}
                gridColumnClass={gridColumnClass}
                onEdit={handleEditPost}
                onDelete={handleDeletePostAction}
                onCreatePost={handleCreatePost}
              />
            ) : (
              <PostListTableView
                posts={processedPosts}
                isLoading={isLoading}
                sortKey={sortKey}
                onSortChange={setSortKey}
                onEdit={handleEditPost}
                onDelete={handleDeletePostAction}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CalendarDateDetailDialog
        selectedDate={selectedCalendarDate}
        posts={calendarDatePosts}
        onClose={handleCloseCalendarDialog}
        onEdit={handleEditPost}
        onDelete={handleDeletePostAction}
        onScheduleNew={handleScheduleNewFromCalendar}
      />
    </div>
  );
}

export default PostsView;
