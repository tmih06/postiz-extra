import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { SidebarNav, type WorkspaceView } from '@/components/primitives/sidebar-nav';
import { Button } from '@/components/ui/button';
import {
  PenSquare,
  Sparkles,
  Image as ImageIcon,
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
  onNavigate: (view: WorkspaceView, options?: { search?: string }) => void;
  children: React.ReactNode;
}

const MOBILE_NAV_ITEMS: { id: WorkspaceView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'channels', label: 'Connections', icon: Share2 },
  { id: 'posts', label: 'Posts', icon: PenSquare },
  { id: 'agent', label: 'AI Studio', icon: Sparkles },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'plugs', label: 'Integrations', icon: Puzzle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Top-level responsive navigation shell providing the main application frame,
 * desktop collapsible sidebar, mobile navigation header and drawer, and view outlet.
 *
 * Manages responsive navigation transitions between core workspace views (composer,
 * calendar, publications, media, analytics, settings) and exposes session-level actions
 * like user logout while displaying current workspace user details.
 *
 * Invariants:
 * - Automatically closes mobile menu drawer upon navigating to any view.
 * - Renders desktop sidebar on large breakpoints (`lg:flex`) and switches to mobile
 *   header/drawer overlay on smaller viewports.
 *
 * @param props.currentView - Active workspace tab identifier controlling highlighted nav items.
 * @param props.onNavigate - Callback invoked with selected view id when navigation links are clicked.
 * @param props.children - Main view content rendered inside the scrollable content canvas.
 */
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
    <div className="flex h-screen h-dvh w-screen overflow-hidden bg-transparent text-ink antialiased">
      {/* Desktop Collapsible Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <SidebarNav currentView={currentView} onNavigate={onNavigate} />
      </div>

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 h-full">
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
                onClick={() => {
                  logout().catch(() => {});
                }}
                className="text-xs text-red hover:bg-red-tint hover:text-red"
              >
                <LogOut className="size-3.5 mr-1" /> Log out
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area: edge-to-edge locked viewport without page scroll */}
        <main className="flex-1 overflow-y-auto min-h-0 min-w-0 p-3 sm:p-5 lg:p-6 flex flex-col">
          <div className="w-full h-full flex flex-col min-h-0 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default NavigationShell;
