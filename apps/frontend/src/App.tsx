import React, { useState, useEffect } from 'react';
import { WorkspaceProvider, useWorkspace } from '@/context/workspace.context';
import { NavigationShell, type WorkspaceView } from '@/components/layout/navigation-shell';
import { PostsView } from '@/components/posts/posts-view';
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
const PATH_MAP: Record<string, WorkspaceView> = {
  media: 'media',
  agent: 'agent',
  harness: 'agent',
  analytics: 'analytics',
  channels: 'channels',
  integrations: 'channels',
  plugs: 'plugs',
  'third-party': 'plugs',
  settings: 'settings',
};
function resolvePathToView(pathname: string): WorkspaceView {
  const clean = pathname.replace(/^\//, '');
  return PATH_MAP[clean] || 'posts';
}
/**
 * Internal workspace router orchestrating view switching, browser history synchronization,
 * loading states, and unauthenticated redirects.
 */
function WorkspaceRouter() {
  const { user, isLoading } = useWorkspace();
  const [currentView, setCurrentView] = useState<WorkspaceView>(() =>
    resolvePathToView(window.location.pathname)
  );
  const [editingGroupId] = useState<string | undefined>(undefined);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(resolvePathToView(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /**
   * Navigates to a specific workspace view and updates browser URL via `history.pushState`.
   *
   * Accepts optional query options (e.g. `{ search: '?tab=add' }`) to deep-link directly into
   * sub-views such as the add-channel platform directory.
   *
   * @param view - Target workspace view identifier.
   * @param options - Optional navigation configuration containing search query string.
   */
  const handleNavigate = (view: WorkspaceView, options?: { search?: string }) => {
    setCurrentView(view);
    const query = options?.search
      ? options.search.startsWith('?')
        ? options.search
        : `?${options.search}`
      : '';

    const newPath = (view === 'posts' ? '/' : `/${view}`) + query;
    if (window.location.pathname + window.location.search !== newPath) {
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
    return <LoginView onLoginSuccess={() => handleNavigate('posts')} />;
  }

  return (
    <NavigationShell currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'posts' && (
        <PostsView
          initialGroupId={editingGroupId}
          onNavigate={handleNavigate}
        />
      )}
      {currentView === 'agent' && (
        <PostizHarness
          onScheduleAction={() => {
            handleNavigate('posts', { search: '?status=scheduled' });
          }}
        />
      )}

      {currentView === 'media' && (
        <MediaView
          onUseInComposer={() => {
            handleNavigate('posts');
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
      <Agentation endpoint={(import.meta.env.VITE_AGENTATION_ENDPOINT as string | undefined) || ''} />
    </WorkspaceProvider>
  );
}

export default App;
