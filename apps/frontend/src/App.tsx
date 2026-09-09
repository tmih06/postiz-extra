import React, { useState, useEffect } from 'react';
import { WorkspaceProvider, useWorkspace } from '@/context/workspace.context';
import { NavigationShell, type WorkspaceView } from '@/components/layout/navigation-shell';
import { Composer } from '@/components/composer/composer';
import { PostList } from '@/components/publications/post-list';
import { CalendarView } from '@/components/publications/calendar-view';
import { LoginView } from '@/components/auth/login-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

function WorkspaceRouter() {
  const { user, isLoading } = useWorkspace();
  const [currentView, setCurrentView] = useState<WorkspaceView>(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'calendar') return 'calendar';
    if (path === 'scheduled') return 'scheduled';
    if (path === 'list') return 'list';
    if (path === 'drafts') return 'drafts';
    if (path === 'media') return 'media';
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
      else setCurrentView('composer');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Media Library
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload and manage assets for reuse across social posts. Open the Composer to attach assets directly.
            </p>
          </div>
          <Composer />
        </div>
      )}
    </NavigationShell>
  );
}

export function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceRouter />
    </WorkspaceProvider>
  );
}

export default App;
