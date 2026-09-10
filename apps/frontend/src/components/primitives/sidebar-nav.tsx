import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/workspace.context';
import type { CustomerProfile } from '@/api/types';
import {
  PenSquare,
  Sparkles,
  Clock,
  Calendar,
  ListFilter,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Share2,
  Puzzle,
  Settings,
  Search,
  ChevronDown,
  Check,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
  LogOut,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GlideMenu } from './glide-menu';

export type WorkspaceView =
  | 'composer'
  | 'agent'
  | 'scheduled'
  | 'calendar'
  | 'list'
  | 'drafts'
  | 'media'
  | 'analytics'
  | 'channels'
  | 'plugs'
  | 'settings';

export interface NavItem {
  id: WorkspaceView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface SidebarNavProps {
  currentView: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
  onSelectRecent?: (postId: string) => void;
  className?: string;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'composer', label: 'Composer', icon: PenSquare },
  { id: 'agent', label: 'AI Studio', icon: Sparkles, badge: 'AI' },
  { id: 'scheduled', label: 'Scheduled', icon: Clock },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'list', label: 'Publications', icon: ListFilter },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'channels', label: 'Social Channels', icon: Share2 },
  { id: 'plugs', label: 'Integrations', icon: Puzzle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface WorkspaceDropdownProps {
  customers: CustomerProfile[];
  selectedCustomer: CustomerProfile | null;
  onSelectCustomer: (customer: CustomerProfile | null) => void;
  onManage: () => void;
}

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
          {!selectedCustomer && <Check className="size-3.5 text-accent" />}
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
              {isSelected && <Check className="size-3.5 text-accent shrink-0" />}
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
          <Plus className="size-3.5 text-ink-3" />
          <span>Manage Profiles & Teams</span>
        </button>
      </div>
    </div>
  );
}
interface QuickSearchProps {
  collapsed: boolean;
  searchOpen: boolean;
  searchQuery: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (query: string) => void;
}

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
          <Search className="absolute left-2.5 size-3.5 text-ink-3 pointer-events-none" />
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
            <X className="size-3.5" />
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
          <Search className="size-3.5" />
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
export function SidebarNav({
  currentView,
  onNavigate,
  onSelectRecent: _onSelectRecent,
  className = '',
}: SidebarNavProps) {
  const { user, customers, selectedCustomer, setSelectedCustomer, logout } = useWorkspace();
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
        'relative flex flex-col border-r border-line bg-surface select-none transition-[width] duration-300',
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
              className="flex w-full items-center rounded-control p-1.5 text-left transition-colors hover:bg-hover active:scale-[0.98]"
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
                    <ChevronDown className="size-3.5 shrink-0 text-ink-3 ml-1" />
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
      <nav className="flex-1 overflow-y-auto px-2 py-2 hide-scrollbar">
        <GlideMenu
          rowSelector="[data-nav-row]"
          highlightClassName="rounded-[7px] bg-hover"
          className="flex flex-col gap-0.5"
        >
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                data-nav-row
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'relative z-10 flex h-8 items-center rounded-[7px] text-left transition-all active:scale-[0.98]',
                  'px-1.5',
                  isActive
                    ? 'bg-hover-2 font-semibold text-ink group-hover/glide:bg-transparent'
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
                  <Icon className="size-4" />
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
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-accent-tint px-1.5 py-0.5 text-[10px] font-bold text-accent-ink uppercase leading-none">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </GlideMenu>
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
              className="absolute left-1.5 top-0 flex size-7 items-center justify-center rounded-control text-ink-3 hover:bg-hover hover:text-ink transition-colors shrink-0"
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="absolute right-1.5 flex size-7 items-center justify-center rounded-control text-ink-3 hover:bg-hover hover:text-ink shrink-0"
              style={{
                top: collapsed ? '32px' : '0px',
                transition: 'top 300ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 150ms ease, color 150ms ease',
              }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeft className="size-3.5" />
              ) : (
                <PanelLeftClose className="size-3.5" />
              )}
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
                  <LogOut className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
    </aside>
  );
}

export default SidebarNav;
