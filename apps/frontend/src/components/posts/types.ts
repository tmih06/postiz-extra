export type { PostGroup, CustomerProfile } from '@/api/types';
import type { WorkspaceView } from '@/components/layout/navigation-shell';

/**
 * View mode options for the unified Posts section.
 */
export type PostViewMode = 'list' | 'calendar' | 'grid' | 'composer';

/**
 * Status filter options aligning with supported backend post lifecycle states.
 */
export type PostStatusFilter = 'all' | 'scheduled' | 'published' | 'draft';

/**
 * Temporal sort options for ordering post cards, tables, and views.
 */
export type PostSortKey = 'date-desc' | 'date-asc';

/**
 * Date range filter presets for the posts toolbar.
 */
export type PostDateRangeFilter = 'all' | 'today' | 'next7' | 'past30';

/**
 * Performance analytics metrics structure representing engagement data or truthful unavailable state.
 */
export interface PostAnalyticsMetrics {
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clicks: number | null;
  views: number | null;
  impressions: number | null;
  reach: number | null;
}

/**
 * Filter and sorting criteria passed to the post processor.
 *
 * `platformFilter` contains zero or more provider identifiers. An empty array means all platforms;
 * multiple identifiers are OR-matched so a post from any selected platform remains visible.
 */
export interface FilterCriteria {
  statusFilter: PostStatusFilter;
  platformFilter: string[];
  profileFilter: string;
  searchQuery: string;
  dateFilter: string;
  sortKey: PostSortKey;
}

/**
 * Calendar day cell metadata used by the calendar grid view.
 */
export interface CalendarDayCell {
  date: Date;
  isCurrentMonth: boolean;
  dayNumber: number;
}

/**
 * Props accepted by the unified `PostsView` workspace screen.
 */
export interface PostsViewProps {
  /** Initial view mode ('list', 'calendar', 'grid', 'composer'). Defaults to 'list'. */
  initialViewMode?: PostViewMode;
  /** Initial status filter ('all', 'scheduled', 'published', 'draft'). Defaults to 'all'. */
  initialStatusFilter?: PostStatusFilter;
  /** Optional initial post group ID to load into composer mode. */
  initialGroupId?: string;
  /** Callback for outer workspace navigation. */
  onNavigate?: (view: WorkspaceView, options?: { search?: string }) => void;
}

export const SKELETON_TABLE_KEYS = [
  'row-sk-1',
  'row-sk-2',
  'row-sk-3',
  'row-sk-4',
  'row-sk-5',
];
export const SKELETON_CARD_KEYS = [
  'card-sk-1',
  'card-sk-2',
  'card-sk-3',
  'card-sk-4',
  'card-sk-5',
  'card-sk-6',
];

export const SORT_LABELS: Record<PostSortKey, string> = {
  'date-desc': 'Time: Newest',
  'date-asc': 'Time: Oldest',
};

export const DATE_LABELS: Record<string, string> = {
  all: 'All dates',
  today: 'Today',
  next7: 'Next 7 days',
  past30: 'Past 30 days',
};
