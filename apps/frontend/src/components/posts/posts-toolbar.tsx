import React from 'react';
import {
  Search,
  X,
  ChevronDown,
  CalendarDays,
  ArrowUpDown,
  List,
  Calendar as CalendarIcon,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { PlatformIcon } from '@/components/primitives/platform-icon';
import { cn } from '@/lib/utils';
import {
  SORT_LABELS,
  DATE_LABELS,
  type PostViewMode,
  type PostStatusFilter,
  type PostSortKey,
} from './types';
import type { CustomerProfile } from '@/api/types';

export interface PostsToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: PostViewMode;
  onViewModeChange: (m: PostViewMode) => void;
  columns: number;
  onColumnsChange: (updater: (c: number) => number) => void;
  statusFilter: PostStatusFilter;
  onStatusChange: (s: PostStatusFilter) => void;
  platformFilter: string;
  onPlatformChange: (p: string) => void;
  profileFilter: string;
  onProfileChange: (pr: string) => void;
  dateFilter: string;
  onDateChange: (d: string) => void;
  sortKey: PostSortKey;
  onSortChange: (k: PostSortKey) => void;
  customers: CustomerProfile[];
}

/**
 * Presenter component for the top filter toolbar, view switcher, and multi-dimensional sort control.
 *
 * Wrapped in `React.memo` to eliminate unnecessary re-renders when data tables or calendar grids update.
 */
export const PostsToolbar = React.memo(function PostsToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  columns,
  onColumnsChange,
  statusFilter,
  onStatusChange,
  platformFilter,
  onPlatformChange,
  profileFilter,
  onProfileChange,
  dateFilter,
  onDateChange,
  sortKey,
  onSortChange,
  customers,
}: PostsToolbarProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-2.5 shadow-card flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar select-none">
      {/* Left: Search input + Filter pills all in one line */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="relative w-52 sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-3" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-control border border-line bg-page pl-8 pr-7 text-xs text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none select-text"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1 capitalize',
                  statusFilter !== 'all' && 'border-line-strong text-ink font-semibold bg-surface'
                )}
              >
                <span>{statusFilter === 'all' ? 'All statuses' : statusFilter}</span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => onStatusChange('all')}>All statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('scheduled')}>Scheduled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('published')}>Published</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('draft')}>Drafts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('failed')}>Failed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1 capitalize',
                  platformFilter !== 'all' && 'border-line-strong text-ink font-semibold bg-surface'
                )}
              >
                <span>{platformFilter === 'all' ? 'All platforms' : platformFilter}</span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={() => onPlatformChange('all')}>All platforms</DropdownMenuItem>
              <DropdownMenuSeparator />
              {['x', 'instagram', 'tiktok', 'youtube', 'facebook', 'linkedin'].map((p) => (
                <DropdownMenuItem key={p} onClick={() => onPlatformChange(p)} className="capitalize">
                  <PlatformIcon provider={p} className="mr-2 size-3.5" />
                  {p === 'x' ? 'Twitter / X' : p}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1',
                  profileFilter !== 'all' && 'border-line-strong text-ink font-semibold bg-surface'
                )}
              >
                <span>
                  {profileFilter === 'all'
                    ? 'All profiles'
                    : customers.find((c) => c.id === profileFilter)?.name || 'Profile'}
                </span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => onProfileChange('all')}>All profiles</DropdownMenuItem>
              <DropdownMenuSeparator />
              {customers.map((c) => (
                <DropdownMenuItem key={c.id} onClick={() => onProfileChange(c.id)}>
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1',
                  dateFilter !== 'all' && 'border-line-strong text-ink font-semibold bg-surface'
                )}
              >
                <CalendarDays className="size-3.5 text-ink-3" />
                <span>{DATE_LABELS[dateFilter] || 'All dates'}</span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => onDateChange('all')}>All dates</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateChange('today')}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateChange('next7')}>Next 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateChange('past30')}>Past 30 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right: Sort dropdown + View Mode Switcher + Density Stepper */}
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1"
            >
              <ArrowUpDown className="size-3 text-ink-3" />
              <span>{SORT_LABELS[sortKey] || 'Sorted'}</span>
              <ChevronDown className="size-3.5 text-ink-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onSortChange('date-desc')}>Time: Newest first</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('date-asc')}>Time: Oldest first</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSortChange('views-desc')}>Most Views</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('impressions-desc')}>Most Impressions</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('reach-desc')}>Most Reach</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('likes-desc')}>Most Likes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('comments-desc')}>Most Comments</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('shares-desc')}>Most Shares</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('clicks-desc')}>Most Clicks</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center rounded-control border border-line bg-page p-0.5 shadow-hairline">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'flex h-7 items-center gap-1.5 px-2.5 rounded-[6px] text-xs font-semibold transition-colors',
              viewMode === 'list' ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
            )}
            title="List Table View"
          >
            <List className="size-3.5" />
            <span>List</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('calendar')}
            className={cn(
              'flex h-7 items-center gap-1.5 px-2.5 rounded-[6px] text-xs font-semibold transition-colors',
              viewMode === 'calendar' ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
            )}
            title="Calendar View"
          >
            <CalendarIcon className="size-3.5" />
            <span>Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'flex h-7 items-center gap-1.5 px-2.5 rounded-[6px] text-xs font-semibold transition-colors',
              viewMode === 'grid' ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
            )}
            title="Grid View"
          >
            <LayoutGrid className="size-3.5" />
            <span>Grid</span>
          </button>
        </div>

        {viewMode === 'grid' && (
          <div className="flex items-center rounded-control border border-line bg-page px-1 h-7 shadow-hairline text-ink text-xs font-mono select-none">
            <button
              type="button"
              onClick={() => onColumnsChange((c) => Math.max(2, c - 1))}
              disabled={columns <= 2}
              className="px-1.5 py-0.5 text-ink-3 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="px-1.5 font-semibold text-[11px]">{columns}</span>
            <button
              type="button"
              onClick={() => onColumnsChange((c) => Math.min(5, c + 1))}
              disabled={columns >= 5}
              className="px-1.5 py-0.5 text-ink-3 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default PostsToolbar;
