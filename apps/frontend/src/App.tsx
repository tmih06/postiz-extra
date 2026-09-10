import React, { useState, useEffect } from 'react';
import { WorkspaceProvider, useWorkspace } from '@/context/workspace.context';
import { NavigationShell, type WorkspaceView } from '@/components/layout/navigation-shell';
import { Composer } from '@/components/composer/composer';
import { PostList } from '@/components/publications/post-list';
import { CalendarView } from '@/components/publications/calendar-view';
import { PostizHarness } from '@/components/harness/postiz-harness';
import { MediaView } from '@/components/media/media-view';
import { AnalyticsView } from '@/components/analytics/analytics-view';
import { ChannelsView } from '@/components/channels/channels-view';
import { PlugsView } from '@/components/plugs/plugs-view';
import { SettingsView } from '@/components/settings/settings-view';
import { LoginView } from '@/components/auth/login-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Agentation } from 'agentation';
/**
 * Internal workspace router orchestrating view switching, browser history synchronization,
 * loading states, and unauthenticated redirects.
 *
 * Listens to `popstate` events to support browser back/forward navigation across views
 * (`/composer`, `/calendar`, `/scheduled`, `/list`, `/drafts`, `/media`, `/agent`, `/analytics`, `/channels`, `/plugs`, `/settings`).
 * Renders the `LoginView` when user is unauthenticated, a skeleton placeholder during initial load,
 * or `NavigationShell` with the active view.
 */
function WorkspaceRouter() {
  const { user, isLoading } = useWorkspace();
  const [currentView, setCurrentView] = useState<WorkspaceView>(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'calendar') return 'calendar';
    if (path === 'scheduled') return 'scheduled';
    if (path === 'list') return 'list';
    if (path === 'drafts') return 'drafts';
    if (path === 'media') return 'media';
    if (path === 'agent' || path === 'harness') return 'agent';
    if (path === 'analytics') return 'analytics';
    if (path === 'channels' || path === 'integrations') return 'channels';
    if (path === 'plugs' || path === 'third-party') return 'plugs';
    if (path === 'settings') return 'settings';
    return 'composer';
  });
  const [editingGroupId, setEditingGroupId] = useState<string | undefined>(undefined);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'calendar') setCurrentView('calendar');
      else if (path === 'scheduled') setCurrentView('scheduled');
      else if (path === 'list') setCurrentView('list');
      else if (path === 'drafts') setCurrentView('drafts');
      else if (path === 'media') setCurrentView('media');
      else if (path === 'agent' || path === 'harness') setCurrentView('agent');
      else if (path === 'analytics') setCurrentView('analytics');
      else if (path === 'channels' || path === 'integrations') setCurrentView('channels');
      else if (path === 'plugs' || path === 'third-party') setCurrentView('plugs');
      else if (path === 'settings') setCurrentView('settings');
      else setCurrentView('composer');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /**
   * Navigates to a specific workspace view and updates browser URL via `history.pushState`.
   *
   * @param view - Target workspace view identifier.
   */
  const handleNavigate = (view: WorkspaceView) => {
    setCurrentView(view);
    const newPath = view === 'composer' ? '/' : `/${view}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Card className="border border-border">
            <CardContent className="p-6 flex flex-col gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={() => handleNavigate('composer')} />;
  }

  return (
    <NavigationShell currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'composer' && (
        <Composer
          initialGroup={editingGroupId}
          onPostSuccess={() => {
            setEditingGroupId(undefined);
            handleNavigate('scheduled');
          }}
        />
      )}
      {currentView === 'agent' && (
        <PostizHarness
          onScheduleAction={() => {
            handleNavigate('scheduled');
          }}
        />
      )}

      {currentView === 'scheduled' && (
        <PostList
          initialStateFilter="scheduled"
          onEditPost={(group: string) => {
            setEditingGroupId(group);
            handleNavigate('composer');
          }}
        />
      )}

      {currentView === 'calendar' && (
        <CalendarView
          onSelectPost={(group: string) => {
            setEditingGroupId(group);
            handleNavigate('composer');
          }}
        />
      )}

      {currentView === 'list' && (
        <PostList
          initialStateFilter="all"
          onEditPost={(group: string) => {
            setEditingGroupId(group);
            handleNavigate('composer');
          }}
        />
      )}

      {currentView === 'drafts' && (
        <PostList
          initialStateFilter="draft"
          onEditPost={(group: string) => {
            setEditingGroupId(group);
            handleNavigate('composer');
          }}
        />
      )}

      {currentView === 'media' && (
        <MediaView
          onUseInComposer={() => {
            handleNavigate('composer');
          }}
        />
      )}

      {currentView === 'analytics' && <AnalyticsView />}

      {currentView === 'channels' && <ChannelsView />}

      {currentView === 'plugs' && <PlugsView />}

      {currentView === 'settings' && <SettingsView />}
    </NavigationShell>
  );
}

/**
 * Root application component bootstrapping the workspace context provider, routing shell,
 * and Agentation developer agent tools.
 *
 * Serves as the top-level React tree entry point.
 */
export function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceRouter />
      <Agentation endpoint={import.meta.env.VITE_AGENTATION_ENDPOINT} />
    </WorkspaceProvider>
  );
}

export default App;
