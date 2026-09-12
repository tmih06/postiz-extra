import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { normalizePostStatus, toLocalDateKey } from './posts-helpers';
import type { PostGroup, CalendarDayCell } from './types';

export interface PostCalendarGridViewProps {
  posts: PostGroup[];
  calendarMonth: Date;
  calendarDays: CalendarDayCell[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onCellClick: (date: Date) => void;
}

/**
 * Presenter component for Calendar View: renders a monthly 7-column grid with date cells and publication indicators.
 *
 * Wrapped in `React.memo` to prevent re-renders of the 35+ calendar cell DOM tree unless month, posts, or days change.
 */
export const PostCalendarGridView = React.memo(function PostCalendarGridView({
  posts,
  calendarMonth,
  calendarDays,
  onPrevMonth,
  onNextMonth,
  onToday,
  onCellClick,
}: PostCalendarGridViewProps) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-1">
      <div className="shrink-0 flex items-center justify-between rounded-card border border-line bg-surface px-4 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-ink">
            {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={onToday} className="h-7 text-xs rounded-control border-line">
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 rounded-control" onClick={onPrevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-control" onClick={onNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface overflow-hidden shadow-card">
        <div className="grid grid-cols-7 border-b border-line bg-page text-center text-xs font-semibold text-ink-2 py-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-line">
          {calendarDays.map((cell) => {
            const dateKey = toLocalDateKey(cell.date);
            const dayPosts = posts.filter((g) => toLocalDateKey(g.date) === dateKey);
            const isToday = toLocalDateKey(new Date()) === dateKey;

            return (
              <div
                key={cell.date.toISOString()}
                onClick={() => onCellClick(cell.date)}
                className={cn(
                  'min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-hover/70',
                  !cell.isCurrentMonth && 'bg-page/40 text-ink-3',
                  isToday && 'bg-accent-tint/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-medium size-6 flex items-center justify-center rounded-full',
                      isToday
                        ? 'bg-foreground text-background font-bold'
                        : cell.isCurrentMonth
                        ? 'text-ink'
                        : 'text-ink-3'
                    )}
                  >
                    {cell.dayNumber}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-line text-ink-2">
                      {dayPosts.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 mt-1 flex-1 overflow-hidden">
                  {dayPosts.slice(0, 2).map((postGroup) => {
                    const content = postGroup.posts?.[0]?.content?.[0]?.content || 'Post';
                    const rawStatus = normalizePostStatus(postGroup);
                    const isPub = rawStatus === 'published' || rawStatus === 'success';

                    return (
                      <div
                        key={postGroup.group || postGroup.id}
                        className={cn(
                          'text-[10.5px] truncate px-1.5 py-0.5 rounded border leading-tight flex items-center gap-1',
                          isPub
                            ? 'bg-green-tint text-green border-green/20'
                            : 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd] dark:bg-[#082f49] dark:text-[#7dd3fc]'
                        )}
                      >
                        <span className="size-1 rounded-full bg-current shrink-0" />
                        <span className="truncate">{content}</span>
                      </div>
                    );
                  })}
                  {dayPosts.length > 2 && (
                    <span className="text-[10px] text-ink-3 font-medium">
                      +{dayPosts.length - 2} more...
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity text-right">
                  Click to expand
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default PostCalendarGridView;
