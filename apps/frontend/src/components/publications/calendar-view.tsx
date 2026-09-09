import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { PostGroup } from '@/api/types';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  onSelectPost?: (group: string) => void;
}

export function CalendarView({ onSelectPost }: CalendarViewProps) {
  const { api, selectedCustomerId } = useWorkspace();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [posts, setPosts] = useState<PostGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const monthRange = useMemo(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [year, month]);

  const fetchCalendarPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getPosts({
        startDate: monthRange.startDate,
        endDate: monthRange.endDate,
        customer: selectedCustomerId === 'all' ? undefined : selectedCustomerId,
      });
      setPosts(res ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [api, monthRange, selectedCustomerId]);

  useEffect(() => {
    fetchCalendarPosts();
  }, [fetchCalendarPosts]);

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dayNumber: number;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, totalDaysInPrevMonth - i),
        isCurrentMonth: false,
        dayNumber: totalDaysInPrevMonth - i,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    return days;
  }, [year, month]);

  const getPostsForDay = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();

    return posts.filter((p) => {
      const pDate = new Date(p.date);
      return (
        pDate.getFullYear() === y &&
        pDate.getMonth() === m &&
        pDate.getDate() === d
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Publishing Calendar
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize scheduled posts and cadence across days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs h-8"
          >
            Today
          </Button>

          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="size-7"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-semibold px-2 min-w-[120px] text-center">
              {monthName}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="size-7"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Calendar Grid Card */}
      <Card className="border border-border bg-card shadow-sm overflow-hidden">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
          {weekDayNames.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border border-b border-border">
          {calendarDays.map((dayObj, index) => {
            const dayPosts = getPostsForDay(dayObj.date);
            const isToday =
              new Date().toDateString() === dayObj.date.toDateString();

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[110px] p-2 flex flex-col gap-1.5 transition-colors',
                  !dayObj.isCurrentMonth && 'bg-muted/15 text-muted-foreground/40',
                  isToday && 'bg-accent/40 font-semibold'
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full text-xs font-medium',
                      isToday
                        ? 'bg-primary text-primary-foreground font-bold'
                        : dayObj.isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {dayObj.dayNumber}
                  </span>

                  {dayPosts.length > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 overflow-y-auto max-h-[90px] pt-1">
                  {dayPosts.map((post) => {
                    const groupId = post.group || post.id;
                    const primaryPost = post.posts?.[0];
                    const content = primaryPost?.content?.[0]?.content || '';
                    const timeStr = new Date(post.date).toLocaleTimeString(
                      undefined,
                      { hour: '2-digit', minute: '2-digit' }
                    );

                    return (
                      <div
                        key={groupId}
                        onClick={() => onSelectPost?.(groupId)}
                        className="cursor-pointer rounded border border-border bg-background p-1.5 text-[11px] hover:border-foreground transition-colors shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
                          <span className="font-mono">{timeStr}</span>
                          <span className="uppercase text-[9px] font-semibold">
                            {post.type}
                          </span>
                        </div>
                        <p className="truncate text-foreground/90 font-medium mt-0.5">
                          {content || 'Post draft'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
