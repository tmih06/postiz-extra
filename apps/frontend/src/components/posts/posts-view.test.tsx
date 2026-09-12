// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PostsView, getPostAnalytics } from './posts-view';
import { WorkspaceContext, type WorkspaceContextValue } from '@/context/workspace.context';
import type { PostGroup, UserProfile } from '@/api/types';
import type { ApiClient } from '@/api/client';

/**
 * Creates a mock WorkspaceContextValue for testing PostsView.
 */
function createMockWorkspaceContext(overrides: Partial<WorkspaceContextValue> = {}): WorkspaceContextValue {
  const user: UserProfile = {
    id: 'u1',
    email: 'creator@example.com',
    name: 'Thanh Creator',
    orgId: 'org1',
  };

  return {
    api: {
      getPostsList: vi.fn().mockResolvedValue({ posts: [] }),
      deletePost: vi.fn().mockResolvedValue(undefined),
    } as unknown as ApiClient,
    user,
    customers: [
      { id: 'c1', name: 'Valorant Brand', orgId: 'org1' },
      { id: 'c2', name: 'Beta Studio', orgId: 'org1' },
    ],
    integrations: [],
    selectedCustomerId: 'all',
    selectedChannelIds: [],
    channelStatuses: [],
    isLoading: false,
    error: null,
    setSelectedCustomerId: vi.fn(),
    toggleChannelSelection: vi.fn(),
    setSelectedChannelIds: vi.fn(),
    refreshWorkspace: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('PostsView analytics computation', () => {
  it('returns truthful null analytics for post groups when metrics are unavailable', () => {
    const postGroup: PostGroup = {
      id: 'grp-1',
      date: '2026-09-20T04:00:00Z',
      type: 'draft',
      status: 'draft',
      posts: [],
    };

    const analytics = getPostAnalytics(postGroup);

    expect(analytics).toEqual({
      likes: null,
      comments: null,
      shares: null,
      saves: null,
      clicks: null,
      views: null,
      impressions: null,
      reach: null,
    });
  });
});

describe('PostsView component rendering', () => {
  it('renders list view with all 8 analytics columns and filter controls', () => {
    const ctx = createMockWorkspaceContext();
    const html = renderToStaticMarkup(
      <WorkspaceContext.Provider value={ctx}>
        <PostsView initialViewMode="list" />
      </WorkspaceContext.Provider>
    );

    // Header & Actions
    expect(html).toContain('Posts</h1>');
    expect(html).toContain('Manage your drafts, scheduled queues, publications, and analytics');
    expect(html).toContain('Create post');
    // View mode switchers
    expect(html).toContain('List</span>');
    expect(html).toContain('Calendar</span>');
    expect(html).toContain('Grid</span>');

    // Filter toolbar & search
    expect(html).toContain('Search posts...');
    expect(html).toContain('All statuses</span>');
    expect(html).toContain('All platforms</span>');
    expect(html).toContain('All profiles</span>');
    expect(html).toContain('All dates</span>');

    // Table headers in List mode (all required columns)
    expect(html).toContain('Post &amp; Preview');
    expect(html).toContain('Profile');
    expect(html).toContain('Platforms');
    expect(html).toContain('Date');
    expect(html).toContain('Status');
    expect(html).toContain('>Likes</th>');
    expect(html).toContain('>Cmts</th>');
    expect(html).toContain('>Shrs</th>');
    expect(html).toContain('>Saves</th>');
    expect(html).toContain('>Clicks</th>');
    expect(html).toContain('>Views</th>');
    expect(html).toContain('>Impr.</th>');
    expect(html).toContain('>Reach</th>');
  });

  it('renders grid view with density controls and truthful empty state', () => {
    const ctx = createMockWorkspaceContext();
    const html = renderToStaticMarkup(
      <WorkspaceContext.Provider value={ctx}>
        <PostsView initialViewMode="grid" />
      </WorkspaceContext.Provider>
    );

    expect(html).toContain('Posts</h1>');
    // Column density stepper
    expect(html).toContain('−');
    expect(html).toContain('+');
    // Empty state rendered when no posts exist
    expect(html).toContain('No posts match filters');
    expect(html).toContain('Create post');
  });

  it('renders calendar view with month navigation and 7-day grid', () => {
    const ctx = createMockWorkspaceContext();
    const html = renderToStaticMarkup(
      <WorkspaceContext.Provider value={ctx}>
        <PostsView initialViewMode="calendar" />
      </WorkspaceContext.Provider>
    );

    expect(html).toContain('Posts</h1>');
    expect(html).toContain('Today</button>');
    expect(html).toContain('<span>Sun</span>');
    expect(html).toContain('<span>Mon</span>');
    expect(html).toContain('<span>Tue</span>');
    expect(html).toContain('<span>Wed</span>');
    expect(html).toContain('<span>Thu</span>');
    expect(html).toContain('<span>Fri</span>');
    expect(html).toContain('<span>Sat</span>');
  });
});
