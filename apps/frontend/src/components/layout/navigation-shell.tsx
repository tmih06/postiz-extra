import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { SidebarNav, type WorkspaceView } from '@/components/primitives/sidebar-nav';
import { Button } from '@/components/ui/button';
import {
  PenSquare,
  Sparkles,
  Calendar,
  ListFilter,
  FileText,
  Image as ImageIcon,
  Clock,
  BarChart3,
  Share2,
  Puzzle,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type { WorkspaceView };

interface NavigationShellProps {
  currentView: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
  children: React.ReactNode;
}

const MOBILE_NAV_ITEMS: { id: WorkspaceView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'composer', label: 'Composer', icon: PenSquare },
  { id: 'agent', label: 'AI Studio', icon: Sparkles },
  { id: 'scheduled', label: 'Upcoming', icon: Clock },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'list', label: 'Publications', icon: ListFilter },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'channels', label: 'Social Channels', icon: Share2 },
  { id: 'plugs', label: 'Integrations', icon: Puzzle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function NavigationShell({
  currentView,
  onNavigate,
  children,
}: NavigationShellProps) {
  const { user, logout } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: WorkspaceView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-transparent text-ink antialiased">
      {/* Desktop Collapsible Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <SidebarNav currentView={currentView} onNavigate={onNavigate} />
      </div>

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex h-14 items-center justify-between border-b border-line bg-surface/90 backdrop-blur-md px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-[7px] bg-foreground flex items-center justify-center text-background font-black text-xs">
              P
            </div>
            <span className="font-bold text-sm tracking-tight text-ink">POSTIZ</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-control border-line"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-line bg-surface p-4 flex flex-col gap-3 shadow-overlay z-50">
            <nav className="grid grid-cols-2 gap-1.5">
              {MOBILE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-control px-2.5 py-2 text-[13px] font-medium transition-colors text-left',
                      isActive
                        ? 'bg-foreground text-background font-semibold'
                        : 'text-ink-2 hover:bg-hover hover:text-ink'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="pt-2 flex items-center justify-between border-t border-line-soft">
              <span className="text-xs text-ink-3 truncate">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs text-red hover:bg-red-tint hover:text-red"
              >
                <LogOut className="size-3.5 mr-1" /> Log out
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default NavigationShell;
