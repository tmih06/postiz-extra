import React, { useState, useEffect, Suspense, lazy } from 'react';
import { WorkspaceProvider, useWorkspace } from '@/context/workspace.context';
import { NavigationShell, type WorkspaceView } from '@/components/layout/navigation-shell';
import type { PostStatusFilter, PostViewMode } from '@/components/posts/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Agentation } from 'agentation';

// Lazy-loaded workspace view routes for efficient code-splitting and reduced initial JS bundle size
const PostsView = lazy(() =>
  import('@/components/posts/posts-view').then((m) => ({ default: m.PostsView }))
);
const PostizHarness = lazy(() =>
  import('@/components/harness/postiz-harness').then((m) => ({ default: m.PostizHarness }))
);
const MediaView = lazy(() =>
  import('@/components/media/media-view').then((m) => ({ default: m.MediaView }))
);
const AnalyticsView = lazy(() =>
  import('@/components/analytics/analytics-view').then((m) => ({ default: m.AnalyticsView }))
);
const ChannelsView = lazy(() =>
  import('@/components/channels/channels-view').then((m) => ({ default: m.ChannelsView }))
);
const PlugsView = lazy(() =>
  import('@/components/plugs/plugs-view').then((m) => ({ default: m.PlugsView }))
);
const SettingsView = lazy(() =>
  import('@/components/settings/settings-view').then((m) => ({ default: m.SettingsView }))
);
const LoginView = lazy(() =>
  import('@/components/auth/login-view').then((m) => ({ default: m.LoginView }))
);

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

/**
 * Resolves an arbitrary browser location pathname to a recognized WorkspaceView destination.
 *
 * Strips leading slashes, checks aliases against `PATH_MAP`, and defaults gracefully to `'posts'`.
 *
 * @param pathname - Current browser URL pathname (e.g. '/channels', '/media', '/').
 * @returns The matched WorkspaceView destination identifier.
 *
 * @example
 * ```ts
 * resolvePathToView('/channels') // returns 'channels'
 * resolvePathToView('/')         // returns 'posts'
 * ```
 */
function resolvePathToView(pathname: string): WorkspaceView {
  const clean = pathname.replace(/^\//, '');
  return PATH_MAP[clean] || 'posts';
}

/**
 * Loading fallback skeleton rendered while a lazy-loaded route chunk resolves.
 */
function ViewFallbackSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 w-full h-full min-h-0 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded-control" />
        <Skeleton className="h-8 w-32 rounded-control" />
      </div>
      <Skeleton className="h-10 w-full rounded-card" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
      </div>
    </div>
  );
}

/**
 * Internal workspace router orchestrating view switching, browser history synchronization,
 * loading states, query parameters, and unauthenticated redirects.
 */
function WorkspaceRouter() {
  const { user, isLoading } = useWorkspace();
  const [currentView, setCurrentView] = useState<WorkspaceView>(() =>
    resolvePathToView(window.location.pathname)
  );
  const [currentSearch, setCurrentSearch] = useState<string>(() => window.location.search);
  const [editingGroupId] = useState<string | undefined>(undefined);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(resolvePathToView(window.location.pathname));
      setCurrentSearch(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /**
   * Navigates to a specific workspace view and updates browser URL via `history.pushState`.
   *
   * Accepts optional query options (e.g. `{ search: '?tab=add' }` or `{ search: '?status=scheduled' }`)
   * to deep-link directly into sub-views and initial filter presets.
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

    setCurrentSearch(query);

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
    return (
      <Suspense fallback={<ViewFallbackSkeleton />}>
        <LoginView onLoginSuccess={() => handleNavigate('posts')} />
      </Suspense>
    );
  }

  const searchParams = new URLSearchParams(currentSearch);
  const statusParam = searchParams.get('status') as PostStatusFilter | null;
  const viewParam = searchParams.get('view') as PostViewMode | null;
  const cleanPath = window.location.pathname.replace(/^\//, '');
  const initialViewMode: PostViewMode =
    cleanPath === 'calendar'
      ? 'calendar'
      : cleanPath === 'composer'
      ? 'composer'
      : viewParam || 'list';
  const initialStatusFilter: PostStatusFilter =
    cleanPath === 'scheduled'
      ? 'scheduled'
      : cleanPath === 'drafts'
      ? 'draft'
      : statusParam || 'all';

  return (
    <NavigationShell currentView={currentView} onNavigate={handleNavigate}>
      <Suspense fallback={<ViewFallbackSkeleton />}>
        {currentView === 'posts' && (
          <PostsView
            initialGroupId={editingGroupId}
            initialViewMode={initialViewMode}
            initialStatusFilter={initialStatusFilter}
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
      </Suspense>
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
