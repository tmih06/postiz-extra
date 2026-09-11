import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/workspace.context';
import type { CustomerProfile } from '@/api/types';
import {
  AnimatedSquarePen,
  AnimatedSparkles,
  AnimatedImage,
  AnimatedBarChart,
  AnimatedShare,
  AnimatedPuzzle,
  AnimatedSettings,
  AnimatedSearch,
  AnimatedChevronDown,
  AnimatedCheck,
  AnimatedPlus,
  AnimatedThemeToggle,
  AnimatedCollapseToggle,
  AnimatedLogOut,
  AnimatedX,
  AnimatedLayoutGrid,
  AnimatedLayers,
} from '@/components/ui/animated-icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarGlideHighlight } from './sidebar-glide-highlight';

/**
 * Identifier union of all navigable top-level workspace views.
 */
export type WorkspaceView =
  | 'posts'
  | 'agent'
  | 'media'
  | 'analytics'
  | 'channels'
  | 'plugs'
  | 'settings';

/**
 * Specification for a secondary sub-navigation item.
 */
export interface NavSubItem {
  /** Unique sub-item identifier. */
  id: string;
  /** Display text label. */
  label: string;
  /** Icon component with animation support. */
  icon: React.ComponentType<{ className?: string; isHovered?: boolean }>;
  /** Target workspace view. */
  view: WorkspaceView;
  /** Optional query string options. */
  search?: string;
}

/**
 * Specification for a single primary sidebar navigation item.
 */
export interface NavItem {
  /** Unique view identifier matched against active `currentView`. */
  id: WorkspaceView;
  /** Display text in expanded sidebar mode and accessibility title tooltip. */
  label: string;
  /** Animated icon component rendered in the navigation row. */
  icon: React.ComponentType<{ className?: string; isHovered?: boolean }>;
  /** Optional badge indicator label (e.g. 'AI'). */
  badge?: string;
  /** Optional nested sub-navigation destinations. */
  subItems?: NavSubItem[];
}

/**
 * Configuration properties for the `SidebarNav` root navigation component.
 */
export interface SidebarNavProps {
  /** Currently active workspace view identifier. */
  currentView: WorkspaceView;
  /** Callback invoked when the user selects a navigation row or view trigger. */
  onNavigate: (view: WorkspaceView, options?: { search?: string }) => void;
  /** Optional callback invoked when selecting a recent post item. */
  onSelectRecent?: (postId: string) => void;
  /** Additional CSS class names applied to the root `<aside>` container. */
  className?: string;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'channels', label: 'Connections', icon: AnimatedShare },
  {
    id: 'posts',
    label: 'Posts',
    icon: AnimatedSquarePen,
    subItems: [
      { id: 'overview', label: 'Overview', icon: AnimatedLayoutGrid, view: 'posts' },
      { id: 'queues', label: 'Queues', icon: AnimatedLayers, view: 'posts', search: '?status=scheduled' },
    ],
  },
  { id: 'agent', label: 'AI Studio', icon: AnimatedSparkles, badge: 'AI' },
  { id: 'media', label: 'Media Library', icon: AnimatedImage },
  { id: 'analytics', label: 'Analytics', icon: AnimatedBarChart },
  { id: 'plugs', label: 'Integrations', icon: AnimatedPuzzle },
  { id: 'settings', label: 'Settings', icon: AnimatedSettings },
];
/**
 * Properties for the workspace profile selection popover.
 */
interface WorkspaceDropdownProps {
  /** List of customer/brand profiles available in the current workspace. */
  customers: CustomerProfile[];
  /** Currently active customer profile, or `null` if representing 'All Profiles'. */
  selectedCustomer: CustomerProfile | null;
  /** Callback triggered when selecting a customer profile or 'All Profiles'. */
  onSelectCustomer: (customer: CustomerProfile | null) => void;
  /** Callback to navigate to settings/management view. */
  onManage: () => void;
}

/**
 * Renders the popover menu allowing users to switch between brand profiles or navigate to profile management.
 *
 * @param props - Dropdown state, customer collection, and selection handlers.
 * @returns Rendered floating profile switcher menu.
 */
function WorkspaceDropdown({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onManage,
}: WorkspaceDropdownProps) {
  return (
    <div
      className="absolute left-0 top-full z-50 mt-1 w-60 rounded-card border border-line bg-surface p-1.5 shadow-overlay backdrop-blur-md"
      style={{ animation: 'pop-in 160ms cubic-bezier(0.23,1,0.32,1) both' }}
    >
      <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        Switch Brand Profile
      </div>

      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onSelectCustomer(null)}
          className={cn(
            'flex w-full items-center justify-between rounded-control px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors',
            !selectedCustomer
              ? 'bg-hover-2 text-ink font-semibold'
              : 'text-ink-2 hover:bg-hover'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-line font-bold text-[10px]">
              P
            </span>
            <span>All Profiles</span>
          </div>
          {!selectedCustomer && <AnimatedCheck className="size-3.5 text-accent" />}
        </button>

        {customers.map((c) => {
          const isSelected = selectedCustomer?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCustomer(c)}
              className={cn(
                'flex w-full items-center justify-between rounded-control px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors',
                isSelected
                  ? 'bg-hover-2 text-ink font-semibold'
                  : 'text-ink-2 hover:bg-hover'
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-line/80 font-bold text-[10px]">
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{c.name}</span>
              </div>
              {isSelected && <AnimatedCheck className="size-3.5 text-accent shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 border-t border-line-soft pt-1.5">
        <button
          type="button"
          onClick={onManage}
          className="flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-2 hover:bg-hover hover:text-ink transition-colors"
        >
          <AnimatedPlus className="size-3.5 text-ink-3" />
          <span>Manage Profiles & Teams</span>
        </button>
      </div>
    </div>
  );
}
/**
 * Properties for the quick search input / toggle button inside the sidebar.
 */
interface QuickSearchProps {
  /** Whether the parent sidebar is currently collapsed to icon-only mode. */
  collapsed: boolean;
  /** Whether the inline search text field is active and expanded. */
  searchOpen: boolean;
  /** Current search query string filter. */
  searchQuery: string;
  /** React ref to the search input element for imperative autofocus. */
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  /** Callback to activate inline search mode. */
  onOpenSearch: () => void;
  /** Callback to close inline search mode and clear query. */
  onCloseSearch: () => void;
  /** Callback when the search filter input text changes. */
  onChangeQuery: (query: string) => void;
}

/**
 * Renders either a compact/expanded search trigger button or an inline search input
 * allowing quick filtering of sidebar navigation links.
 *
 * @param props - Search state flags, text query, and toggle handlers.
 * @returns Quick search button or active input element.
 */
function QuickSearch({
  collapsed,
  searchOpen,
  searchQuery,
  searchInputRef,
  onOpenSearch,
  onCloseSearch,
  onChangeQuery,
}: QuickSearchProps) {
  if (searchOpen && !collapsed) {
    return (
      <div className="px-2 py-1">
        <div className="relative flex items-center">
          <AnimatedSearch className="absolute left-2.5 size-3.5 text-ink-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Jump to..."
            className="h-8 w-full rounded-control border border-line bg-page pl-8 pr-7 text-[13px] text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none"
          />
          <button
            type="button"
            onClick={onCloseSearch}
            className="absolute right-2 text-ink-3 hover:text-ink"
          >
            <AnimatedX className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex h-8 w-full items-center rounded-control border border-line/60 bg-page/60 px-1.5 text-left text-[13px] text-ink-3 transition-colors hover:border-line hover:bg-hover hover:text-ink overflow-hidden"
        title={collapsed ? 'Search' : undefined}
      >
        <span className="flex size-7 shrink-0 items-center justify-center">
          <AnimatedSearch className="size-3.5" />
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="ml-1.5 flex flex-1 items-center justify-between overflow-hidden"
            >
              <span>Search</span>
              <span className="font-mono text-[10.5px] rounded border border-line bg-surface px-1 py-0.2 text-ink-3">
                ⌘K
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

interface SidebarNavItemRowProps {
  item: NavItem;
  currentView: WorkspaceView;
  collapsed: boolean;
  hoveredNavId: WorkspaceView | null;
  postsExpanded: boolean;
  onHover: (id: WorkspaceView | null) => void;
  onTogglePosts: () => void;
  onNavigate: (view: WorkspaceView, options?: { search?: string }) => void;
}

/**
 * Renders a single sidebar navigation row or expandable section with nested destinations.
 */
function SidebarNavItemRow({
  item,
  currentView,
  collapsed,
  hoveredNavId,
  postsExpanded,
  onHover,
  onTogglePosts,
  onNavigate,
}: SidebarNavItemRowProps) {
  const Icon = item.icon;
  const isPostItem = item.id === 'posts';
  const isActive = currentView === item.id;
  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);

  const handleClick = () => {
    if (isPostItem && hasSubItems && !collapsed) {
      onNavigate(item.id);
      if (!postsExpanded) onTogglePosts();
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div className="flex flex-col">
      <button
        data-nav-row
        type="button"
        onClick={handleClick}
        onMouseEnter={() => onHover(item.id)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          'relative z-10 flex h-8 items-center rounded-[7px] text-left transition-colors',
          'px-1.5',
          isActive && (!hasSubItems || collapsed)
            ? 'bg-hover-2 font-semibold text-ink group-hover/glide:bg-transparent'
            : isActive
            ? 'text-ink font-semibold'
            : 'text-ink-2 hover:text-ink font-medium'
        )}
        title={collapsed ? item.label : undefined}
      >
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center',
            isActive ? 'text-ink' : 'text-ink-2'
          )}
        >
          <Icon className="size-4" isHovered={hoveredNavId === item.id} />
        </span>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="ml-1.5 flex flex-1 items-center justify-between overflow-hidden"
            >
              <span className="truncate text-[13.5px] tracking-tight">
                {item.label}
              </span>
              {hasSubItems ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePosts();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onTogglePosts();
                    }
                  }}
                  className="p-1 text-ink-3 hover:text-ink transition-transform cursor-pointer"
                >
                  <AnimatedChevronDown
                    className={cn(
                      'size-3.5 transition-transform duration-200',
                      postsExpanded ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </span>
              ) : item.badge ? (
                <span className="ml-auto rounded-full bg-accent-tint px-1.5 py-0.5 text-[10px] font-bold text-accent-ink uppercase leading-none">
                  {item.badge}
                </span>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Render Expandable Sub-items with smooth sliding collapse/expand */}
      <AnimatePresence initial={false}>
        {!collapsed && hasSubItems && postsExpanded && (
          <motion.div
            key="sub-items-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.16, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.1 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 pl-2.5 pt-0.5 pb-0.5">
          {item.subItems?.map((sub) => {
            const SubIcon = sub.icon;
            const isQueueSub = sub.id === 'queues';
            const isQueueActive =
              typeof window !== 'undefined' &&
              window.location.search.includes('status=scheduled');
            const isSubActive = isQueueSub
              ? isQueueActive
              : currentView === 'posts' && !isQueueActive;
            return (
              <button
                key={sub.id}
                data-nav-row
                type="button"
                onMouseEnter={() => setHoveredSubId(sub.id)}
                onMouseLeave={() => setHoveredSubId(null)}
                onClick={() =>
                  onNavigate(
                    sub.view,
                    sub.search ? { search: sub.search } : undefined
                  )
                }
                className={cn(
                  'relative z-10 flex h-7 items-center rounded-[6px] text-left transition-colors pl-6 pr-2 text-[12.5px]',
                  isSubActive
                    ? 'bg-hover-2 font-semibold text-ink shadow-xs'
                    : 'text-ink-2 hover:text-ink hover:bg-hover font-medium'
                )}
              >
                <SubIcon
                  className="size-3.5 mr-2 shrink-0 text-ink-3"
                  isHovered={hoveredSubId === sub.id}
                />
                <span className="truncate">{sub.label}</span>
              </button>
            );
          })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
/**
 * Renders the primary collapsible application navigation sidebar.
 *
 * Features:
 * - Collapsible state (expanded 240px vs collapsed 56px icon-only rail).
 * - Gliding physics hover highlight overlay via `SidebarGlideHighlight`.
 * - Brand & Workspace profile switcher with interactive popover.
 * - Interactive quick search / jump filter across navigation destinations.
 * - Theme toggle (dark/light mode syncing with document root and `localStorage`).
 * - User profile info with sign-out trigger.
 * - Instant font-weight bolding on active nav items using `transition-colors` without interpolation lag.
 *
 * @param props - Navigation state (`currentView`), navigation callback, and optional styling.
 * @returns Rendered sidebar `<aside>` element.
 */
export function SidebarNav({
  currentView,
  onNavigate,
  onSelectRecent: _onSelectRecent,
  className = '',
}: SidebarNavProps) {
  const { user, customers, selectedCustomerId, setSelectedCustomerId, logout } = useWorkspace();
  const selectedCustomer = customers.find((c: CustomerProfile) => c.id === selectedCustomerId) || null;
  const setSelectedCustomer = (customer: CustomerProfile | null) => {
    setSelectedCustomerId(customer ? customer.id : 'all');
  };
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [hoveredNavId, setHoveredNavId] = useState<WorkspaceView | null>(null);
  const [postsExpanded, setPostsExpanded] = useState(true);
  const [themeHovered, setThemeHovered] = useState(false);
  const [collapseHovered, setCollapseHovered] = useState(false);
  const [wsHovered, setWsHovered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close workspace dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(e.target as Node)
      ) {
        setWorkspaceMenuOpen(false);
      }
    };
    if (workspaceMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [workspaceMenuOpen]);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleOpenSearch = () => {
    if (collapsed) {
      setCollapsed(false);
    }
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const filteredNavItems = searchQuery
    ? PRIMARY_NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : PRIMARY_NAV_ITEMS;

  const currentBrandName = selectedCustomer?.name || 'Personal Brand';
  const brandMonogram = currentBrandName.charAt(0).toUpperCase();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'P';

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full border-r border-line bg-surface select-none transition-[width] duration-300',
        collapsed ? 'w-[56px]' : 'w-[240px]',
        className
      )}
      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
    >
        {/* Brand & Workspace Switcher */}
        <div className="relative p-2 pb-2">
          <div ref={workspaceMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              onMouseEnter={() => setWsHovered(true)}
              onMouseLeave={() => setWsHovered(false)}
              className="flex w-full items-center rounded-control p-1.5 text-left transition-colors hover:bg-hover"
              title={currentBrandName}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-foreground text-background font-black text-xs shadow-hairline">
                {brandMonogram}
              </div>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="ml-2 flex min-w-0 flex-1 items-center justify-between overflow-hidden"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-bold tracking-tight text-ink leading-none">
                        {currentBrandName}
                      </span>
                      <span className="truncate text-[10.5px] font-medium text-ink-3 mt-1 leading-none">
                        Postiz Workspace
                      </span>
                    </div>
                    <AnimatedChevronDown isHovered={wsHovered} className="size-3.5 shrink-0 text-ink-3 ml-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

          {/* Workspace Dropdown */}
          {workspaceMenuOpen && (
            <WorkspaceDropdown
              customers={customers}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={(c) => {
                setSelectedCustomer(c);
                setWorkspaceMenuOpen(false);
              }}
              onManage={() => {
                setWorkspaceMenuOpen(false);
                onNavigate('settings');
              }}
            />
          )}
        </div>
      </div>

      {/* Quick Search */}
      <QuickSearch
        collapsed={collapsed}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        searchInputRef={searchInputRef}
        onOpenSearch={handleOpenSearch}
        onCloseSearch={() => {
          setSearchQuery('');
          setSearchOpen(false);
        }}
        onChangeQuery={setSearchQuery}
      />

      {/* Navigation List */}
      <nav ref={navRef} className="relative flex-1 overflow-y-auto px-2 py-2 hide-scrollbar">
        <SidebarGlideHighlight containerRef={navRef} itemSelector="[data-nav-row]" />
        <div className="flex flex-col gap-0.5">
          {filteredNavItems.map((item) => (
            <SidebarNavItemRow
              key={item.id}
              item={item}
              currentView={currentView}
              collapsed={collapsed}
              hoveredNavId={hoveredNavId}
              postsExpanded={postsExpanded}
              onHover={setHoveredNavId}
              onTogglePosts={() => setPostsExpanded((p) => !p)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* Footer Controls: Theme, Collapse, User */}
        {/* Footer Controls: Theme, Collapse, User */}
        <div className="border-t border-line p-2 flex flex-col gap-1">
          <div
            className="relative w-full transition-[height] duration-300"
            style={{
              height: collapsed ? '60px' : '28px',
              transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <button
              type="button"
              onClick={toggleTheme}
              onMouseEnter={() => setThemeHovered(true)}
              onMouseLeave={() => setThemeHovered(false)}
              className="absolute left-1.5 top-0 flex size-7 items-center justify-center rounded-control text-ink-3 hover:bg-hover hover:text-ink transition-colors shrink-0"
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              <AnimatedThemeToggle isDark={isDark} isHovered={themeHovered} className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              onMouseEnter={() => setCollapseHovered(true)}
              onMouseLeave={() => setCollapseHovered(false)}
              className="absolute right-1.5 flex size-7 items-center justify-center rounded-control text-ink-3 hover:bg-hover hover:text-ink shrink-0"
              style={{
                top: collapsed ? '32px' : '0px',
                transition: 'top 300ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 150ms ease, color 150ms ease',
              }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <AnimatedCollapseToggle collapsed={collapsed} isHovered={collapseHovered} className="size-3.5" />
            </button>
          </div>

          {/* User profile row */}
          <div className="flex items-center rounded-control p-1.5 text-left transition-colors hover:bg-hover/70 min-h-[36px] overflow-hidden">
            <Avatar className="size-7 border border-line shrink-0">
              <AvatarFallback className="text-[11px] font-bold bg-muted text-ink">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="ml-2.5 flex flex-1 min-w-0 flex-col justify-center leading-tight overflow-hidden"
                >
                  <span className="text-[12.5px] font-semibold text-ink truncate">
                    {user?.name || 'Creator'}
                  </span>
                  <span className="text-[10px] text-ink-3 truncate font-mono">
                    {user?.email || 'admin@postiz.com'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  type="button"
                  onClick={() => {
                    logout().catch(() => {});
                  }}
                  className="size-6 shrink-0 flex items-center justify-center rounded text-ink-3 hover:bg-red-tint hover:text-red transition-colors ml-1"
                  title="Sign out"
                >
                  <AnimatedLogOut className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
    </aside>
  );
}

export default SidebarNav;
