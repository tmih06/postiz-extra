import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ChevronDown,
  CalendarDays,
  ArrowUpDown,
  List,
  Calendar as CalendarIcon,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
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
const VIEW_MODES = [
  { id: 'list', label: 'List', icon: List },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'grid', label: 'Grid', icon: LayoutGrid },
] as const;
const PLATFORM_OPTIONS = [
  { value: 'x', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
] as const;
/**
 * Converts the selected provider identifiers into the compact toolbar label.
 *
 * An empty selection represents all platforms, one selection uses its display name, and multiple
 * selections use a count so the trigger remains readable at narrow widths.
 *
 * @param selectedPlatforms - Provider identifiers currently included in the local filter.
 * @returns Human-readable platform filter label for the toolbar trigger.
 */
function getPlatformFilterLabel(selectedPlatforms: string[]): string {
  if (selectedPlatforms.length === 0) return 'All platforms';
  if (selectedPlatforms.length > 1)
    return `${selectedPlatforms.length} platforms`;

  return (
    PLATFORM_OPTIONS.find((platform) => platform.value === selectedPlatforms[0])
      ?.label ??
    selectedPlatforms[0] ??
    'Platform'
  );
}

export interface PostsToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: PostViewMode;
  onViewModeChange: (m: PostViewMode) => void;
  columns: number;
  onColumnsChange: (updater: (c: number) => number) => void;
  statusFilter: PostStatusFilter;
  onStatusChange: (s: PostStatusFilter) => void;
  platformFilter: string[];
  onPlatformChange: (platforms: string[]) => void;
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
 * Implements smooth morphing animations for view mode transitions via a spring-animated layout pill,
 * fluid expansion and contraction for the grid density stepper, and a persistent multi-platform
 * checkbox menu whose selected providers are OR-matched by the posts processor.
 *
 * @param props - Toolbar state handlers for search, filters, view mode, density, and sorting. An
 * empty `platformFilter` shows posts from every platform.
 * @returns Fluid interactive toolbar card with tactile button feedback and morphing layout.
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
  const hasActiveFilters =
    statusFilter !== 'all' ||
    platformFilter.length > 0 ||
    profileFilter !== 'all' ||
    dateFilter !== 'all';

  const platformLabel = getPlatformFilterLabel(platformFilter);

  const handlePlatformToggle = React.useCallback(
    (platform: string) => {
      const nextPlatforms = platformFilter.includes(platform)
        ? platformFilter.filter((selected) => selected !== platform)
        : [...platformFilter, platform];
      onPlatformChange(nextPlatforms);
    },
    [onPlatformChange, platformFilter]
  );

  const handleResetFilters = React.useCallback(() => {
    onStatusChange('all');
    onPlatformChange([]);
    onProfileChange('all');
    onDateChange('all');
  }, [onStatusChange, onPlatformChange, onProfileChange, onDateChange]);
  return (
    <motion.div className="rounded-card border border-line bg-surface p-2.5 shadow-card flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar select-none">
      {/* Left: Search input + Filter pills all in one line */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="relative w-52 sm:w-64 shrink-0 transition-all duration-200">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-3" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-control border border-line bg-page pl-8 pr-7 text-xs text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none select-text transition-colors"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink active:scale-90 transition-colors"
                title="Clear search"
              >
                <X className="size-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1 capitalize transition-colors duration-200',
                  statusFilter !== 'all' &&
                    'border-line-strong text-ink font-semibold bg-surface shadow-sm'
                )}
              >
                <span>
                  {statusFilter === 'all' ? 'All statuses' : statusFilter}
                </span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => onStatusChange('all')}>
                All statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('scheduled')}>
                Scheduled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('published')}>
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('draft')}>
                Drafts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1 capitalize transition-colors duration-200',
                  platformFilter.length > 0 &&
                    'border-line-strong text-ink font-semibold bg-surface shadow-sm'
                )}
              >
                <span>{platformLabel}</span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuCheckboxItem
                checked={platformFilter.length === 0}
                onCheckedChange={() => onPlatformChange([])}
                onSelect={(event) => event.preventDefault()}
              >
                All platforms
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {PLATFORM_OPTIONS.map((platform) => (
                <DropdownMenuCheckboxItem
                  key={platform.value}
                  checked={platformFilter.includes(platform.value)}
                  onCheckedChange={() => handlePlatformToggle(platform.value)}
                  onSelect={(event) => event.preventDefault()}
                >
                  <PlatformIcon
                    provider={platform.value}
                    className="mr-2 size-3.5"
                  />
                  {platform.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1 transition-colors duration-200',
                  profileFilter !== 'all' &&
                    'border-line-strong text-ink font-semibold bg-surface shadow-sm'
                )}
              >
                <span>
                  {profileFilter === 'all'
                    ? 'All profiles'
                    : customers.find((c) => c.id === profileFilter)?.name ||
                      'Profile'}
                </span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => onProfileChange('all')}>
                All profiles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {customers.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => onProfileChange(c.id)}
                >
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
                  'h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1 transition-colors duration-200',
                  dateFilter !== 'all' &&
                    'border-line-strong text-ink font-semibold bg-surface shadow-sm'
                )}
              >
                <CalendarDays className="size-3.5 text-ink-3" />
                <span>{DATE_LABELS[dateFilter] || 'All dates'}</span>
                <ChevronDown className="size-3.5 text-ink-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => onDateChange('all')}>
                All dates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateChange('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateChange('next7')}>
                Next 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDateChange('past30')}>
                Past 30 days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AnimatePresence initial={false}>
            {hasActiveFilters && (
              <motion.button
                layout="position"
                type="button"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 58 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleResetFilters}
                className="overflow-hidden flex items-center gap-1 h-8 rounded-chip border border-dashed border-line-strong bg-hover/80 px-2 text-[11px] font-medium text-ink-2 hover:text-ink hover:bg-hover active:scale-95 transition-colors shadow-hairline shrink-0"
                title="Reset all active filters"
              >
                <RotateCcw className="size-3 shrink-0 text-ink-3" />
                <span className="whitespace-nowrap">Reset</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Right: Sort dropdown + View Mode Switcher + Density Stepper */}
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-chip border-line bg-page px-2.5 text-[12px] font-medium text-ink-2 hover:text-ink shadow-hairline gap-1 transition-colors duration-200"
            >
              <ArrowUpDown className="size-3 text-ink-3" />
              <span>{SORT_LABELS[sortKey] || 'Sorted'}</span>
              <ChevronDown className="size-3.5 text-ink-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onSortChange('date-desc')}>
              Time: Newest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('date-asc')}>
              Time: Oldest first
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative flex items-center rounded-control border border-line bg-page p-0.5 shadow-hairline">
          {VIEW_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onViewModeChange(mode.id)}
                className={cn(
                  'relative flex h-7 items-center gap-1.5 px-2.5 rounded-[6px] text-xs font-semibold select-none transition-colors duration-150 outline-none active:scale-95',
                  isActive ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
                )}
                title={`${mode.label} View`}
              >
                {isActive && (
                  <motion.span
                    layoutId="posts-view-mode-pill"
                    className="absolute inset-0 rounded-[6px] bg-surface shadow-sm border border-line/60"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  <span>{mode.label}</span>
                </span>
              </button>
            );
          })}

          <motion.div
            animate={{
              width: viewMode === 'grid' ? 72 : 0,
              opacity: viewMode === 'grid' ? 1 : 0,
            }}
            transition={{
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-hidden={viewMode !== 'grid'}
            className="h-7 shrink-0 overflow-hidden flex items-center justify-center self-center"
          >
            <div className="flex h-7 w-[72px] shrink-0 items-center justify-center border-l border-line/70 pl-1 px-0.5 text-ink text-xs font-mono select-none whitespace-nowrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onColumnsChange((c) => Math.max(2, c - 1));
                }}
                disabled={columns <= 2 || viewMode !== 'grid'}
                className="flex h-7 items-center justify-center px-1 leading-none text-ink-3 hover:text-ink active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                title="Decrease grid columns"
              >
                −
              </button>
              <motion.span
                key={columns}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex h-7 min-w-[12px] items-center justify-center px-1 text-center font-semibold text-[11px] leading-none"
              >
                {columns}
              </motion.span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onColumnsChange((c) => Math.min(5, c + 1));
                }}
                disabled={columns >= 5 || viewMode !== 'grid'}
                className="flex h-7 items-center justify-center px-1 leading-none text-ink-3 hover:text-ink active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                title="Increase grid columns"
              >
                +
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

export default PostsToolbar;
