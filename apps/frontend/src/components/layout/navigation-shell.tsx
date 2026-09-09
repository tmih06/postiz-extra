import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { ProfileSelector } from '@/components/workspace/profile-selector';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  PenSquare,
  Calendar,
  ListFilter,
  FileText,
  Image as ImageIcon,
  Clock,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkspaceView =
  | 'composer'
  | 'scheduled'
  | 'calendar'
  | 'list'
  | 'drafts'
  | 'media';

interface NavigationShellProps {
  currentView: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
  children: React.ReactNode;
}

export function NavigationShell({
  currentView,
  onNavigate,
  children,
}: NavigationShellProps) {
  const { user, logout } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'composer' as const, label: 'Composer', icon: PenSquare },
    { id: 'scheduled' as const, label: 'Upcoming', icon: Clock },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'list' as const, label: 'Publications', icon: ListFilter },
    { id: 'drafts' as const, label: 'Drafts', icon: FileText },
    { id: 'media' as const, label: 'Media Library', icon: ImageIcon },
  ];

  const handleNavClick = (view: WorkspaceView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card shrink-0 select-none">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="size-7 rounded bg-foreground flex items-center justify-center text-background font-black text-sm tracking-tighter">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none">
                POSTIZ
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5 tracking-wider uppercase">
                Publishing Workspace
              </span>
            </div>
          </div>

          <ProfileSelector />
        </div>

        <Separator className="my-2" />

        <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]',
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('size-4', isActive ? 'text-background' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <Separator className="my-2" />

        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="size-8">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold truncate leading-none">
                {user?.name || 'Creator'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate font-mono mt-1">
                {user?.email || ''}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Log out"
            className="size-8 text-muted-foreground hover:text-foreground shrink-0"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="lg:hidden flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-foreground flex items-center justify-center text-background font-black text-xs">
              P
            </div>
            <span className="font-bold text-sm tracking-tight">POSTIZ</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-card p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <ProfileSelector />
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} className="text-xs">
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
