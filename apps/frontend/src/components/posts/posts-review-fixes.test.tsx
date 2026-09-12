// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  toLocalDateKey,
  formatMetricNumber,
  filterAndSortPosts,
} from './posts-helpers';
import { PostsToolbar } from './posts-toolbar';
import { createApiClient } from '@/api/client';
import type { PostGroup } from '@/api/types';

afterEach(cleanup);

describe('toLocalDateKey timezone and date handling', () => {
  it('formats local midnight dates without shifting day number', () => {
    const d = new Date(2026, 8, 11, 0, 0, 0); // Sept 11, 2026 local
    expect(toLocalDateKey(d)).toBe('2026-09-11');
  });

  it('matches local date components for ISO timestamp strings', () => {
    const iso = '2026-09-11T12:00:00.000Z';
    const localDate = new Date(iso);
    const expectedYear = localDate.getFullYear();
    const expectedMonth = String(localDate.getMonth() + 1).padStart(2, '0');
    const expectedDay = String(localDate.getDate()).padStart(2, '0');
    expect(toLocalDateKey(iso)).toBe(
      `${expectedYear}-${expectedMonth}-${expectedDay}`
    );
  });

  it('returns empty string for invalid dates', () => {
    expect(toLocalDateKey('invalid-date')).toBe('');
  });
});

describe('ApiClient minified payload decoding', () => {
  it('decodes minified getPostsList response into expanded PostGroup items', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          p: [
            {
              i: 'post-1',
              c: 'Test content',
              d: '2026-09-15T10:00:00.000Z',
              s: 'QUEUE',
              g: 'grp-1',
            },
          ],
          t: 1,
          pg: 0,
          l: 20,
          hm: false,
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await client.getPostsList({ page: 0, limit: 20 });
    expect(res.posts).toHaveLength(1);
    expect(res.posts[0].id).toBe('post-1');
    const firstPost = res.posts[0] as unknown as Record<string, unknown>;
    expect(firstPost['content']).toBe('Test content');
    expect(firstPost['publishDate']).toBe('2026-09-15T10:00:00.000Z');
    expect(firstPost['state']).toBe('QUEUE');
    expect(res.total).toBe(1);

    vi.unstubAllGlobals();
  });

  it('decodes minified getPosts calendar response', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          p: [
            {
              i: 'cal-1',
              c: 'Calendar post',
              d: '2026-09-11T14:00:00.000Z',
              s: 'PUBLISHED',
              g: 'grp-cal',
            },
          ],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const posts = await client.getPosts({
      startDate: '2026-09-01T00:00:00.000Z',
      endDate: '2026-09-30T23:59:59.999Z',
    });
    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe('cal-1');
    const firstCalPost = posts[0] as unknown as Record<string, unknown>;
    expect(firstCalPost['content']).toBe('Calendar post');

    vi.unstubAllGlobals();
  });
});

describe('formatMetricNumber truthful placeholders', () => {
  it('returns em-dash for null metrics on published posts', () => {
    expect(formatMetricNumber(null, true)).toBe('—');
    expect(formatMetricNumber(undefined, true)).toBe('—');
  });

  it('returns em-dash for unpublished posts even with values', () => {
    expect(formatMetricNumber(100, false)).toBe('—');
  });

  it('formats real numbers when provided', () => {
    expect(formatMetricNumber(1500, true)).toBe('1.5K');
    expect(formatMetricNumber(2500000, true)).toBe('2.5M');
    expect(formatMetricNumber(42, true)).toBe('42');
  });
});

describe('filterAndSortPosts truthful filtering and sorting', () => {
  it('filters posts by supported lifecycle states without synthetic logic', () => {
    const posts: PostGroup[] = [
      {
        id: '1',
        date: '2026-09-10T10:00:00Z',
        type: 'now',
        status: 'published',
        posts: [],
      },
      {
        id: '2',
        date: '2026-09-12T10:00:00Z',
        type: 'schedule',
        status: 'scheduled',
        posts: [],
      },
      {
        id: '3',
        date: '2026-09-13T10:00:00Z',
        type: 'draft',
        status: 'draft',
        posts: [],
      },
    ];

    const scheduled = filterAndSortPosts(posts, {
      statusFilter: 'scheduled',
      platformFilter: [],
      profileFilter: 'all',
      searchQuery: '',
      dateFilter: 'all',
      sortKey: 'date-desc',
    });
    expect(scheduled.map((p) => p.id)).toEqual(['2']);

    const published = filterAndSortPosts(posts, {
      statusFilter: 'published',
      platformFilter: [],
      profileFilter: 'all',
      searchQuery: '',
      dateFilter: 'all',
      sortKey: 'date-desc',
    });
    expect(published.map((p) => p.id)).toEqual(['1']);
  });

  it('filters posts when any selected platform matches a post group', () => {
    const posts: PostGroup[] = [
      {
        id: 'instagram-and-x',
        date: '2026-09-10T10:00:00Z',
        type: 'now',
        status: 'published',
        posts: [
          {
            integration: { providerIdentifier: 'x' },
          } as PostGroup['posts'][number],
          {
            integration: { providerIdentifier: 'instagram' },
          } as PostGroup['posts'][number],
        ],
      },
      {
        id: 'linkedin-only',
        date: '2026-09-11T10:00:00Z',
        type: 'now',
        status: 'published',
        posts: [
          {
            integration: { providerIdentifier: 'linkedin' },
          } as PostGroup['posts'][number],
        ],
      },
      {
        id: 'facebook-only',
        date: '2026-09-12T10:00:00Z',
        type: 'now',
        status: 'published',
        posts: [
          {
            integration: { providerIdentifier: 'facebook' },
          } as PostGroup['posts'][number],
        ],
      },
    ];

    const filtered = filterAndSortPosts(posts, {
      statusFilter: 'all',
      platformFilter: ['instagram', 'linkedin'],
      profileFilter: 'all',
      searchQuery: '',
      dateFilter: 'all',
      sortKey: 'date-desc',
    });

    expect(filtered.map((post) => post.id)).toEqual([
      'linkedin-only',
      'instagram-and-x',
    ]);
  });

  it('summarizes multiple selected platforms in the toolbar trigger', () => {
    const html = renderToStaticMarkup(
      <PostsToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        viewMode="list"
        onViewModeChange={vi.fn()}
        columns={4}
        onColumnsChange={vi.fn()}
        statusFilter="all"
        onStatusChange={vi.fn()}
        platformFilter={['x', 'instagram']}
        onPlatformChange={vi.fn()}
        profileFilter="all"
        onProfileChange={vi.fn()}
        dateFilter="all"
        onDateChange={vi.fn()}
        sortKey="date-desc"
        onSortChange={vi.fn()}
        customers={[]}
      />
    );

    expect(html).toContain('2 platforms</span>');
  });

  it('sorts posts by date ascending and descending', () => {
    const posts: PostGroup[] = [
      {
        id: '1',
        date: '2026-09-10T10:00:00Z',
        type: 'now',
        status: 'published',
        posts: [],
      },
      {
        id: '2',
        date: '2026-09-15T10:00:00Z',
        type: 'now',
        status: 'published',
        posts: [],
      },
    ];

    const desc = filterAndSortPosts(posts, {
      statusFilter: 'all',
      platformFilter: [],
      profileFilter: 'all',
      searchQuery: '',
      dateFilter: 'all',
      sortKey: 'date-desc',
    });
    expect(desc.map((p) => p.id)).toEqual(['2', '1']);

    const asc = filterAndSortPosts(posts, {
      statusFilter: 'all',
      platformFilter: [],
      profileFilter: 'all',
      searchQuery: '',
      dateFilter: 'all',
      sortKey: 'date-asc',
    });
    expect(asc.map((p) => p.id)).toEqual(['1', '2']);
  });
});
describe('PostsToolbar morphing and interactive elements', () => {
  it('renders active view mode layout indicators and view mode buttons', () => {
    const html = renderToStaticMarkup(
      <PostsToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        viewMode="calendar"
        onViewModeChange={vi.fn()}
        columns={3}
        onColumnsChange={vi.fn()}
        statusFilter="all"
        onStatusChange={vi.fn()}
        platformFilter={[]}
        onPlatformChange={vi.fn()}
        profileFilter="all"
        onProfileChange={vi.fn()}
        dateFilter="all"
        onDateChange={vi.fn()}
        sortKey="date-desc"
        onSortChange={vi.fn()}
        customers={[]}
      />
    );

    expect(html).toContain('Calendar</span>');
    expect(html).toContain('List</span>');
    expect(html).toContain('Grid</span>');
    // The slot stays mounted for a continuous collapse; it is hidden from assistive technology outside Grid view.
    expect(html).toContain('aria-hidden="true"');
  });

  it('renders density stepper controls when viewMode is grid', () => {
    const html = renderToStaticMarkup(
      <PostsToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        viewMode="grid"
        onViewModeChange={vi.fn()}
        columns={4}
        onColumnsChange={vi.fn()}
        statusFilter="all"
        onStatusChange={vi.fn()}
        platformFilter={[]}
        onPlatformChange={vi.fn()}
        profileFilter="all"
        onProfileChange={vi.fn()}
        dateFilter="all"
        onDateChange={vi.fn()}
        sortKey="date-desc"
        onSortChange={vi.fn()}
        customers={[]}
      />
    );

    expect(html).toContain('4</span>');
    expect(html).toContain('−');
    expect(html).toContain('+');
  });

  it('renders reset filter button when active filters are selected', () => {
    const html = renderToStaticMarkup(
      <PostsToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        viewMode="list"
        onViewModeChange={vi.fn()}
        columns={3}
        onColumnsChange={vi.fn()}
        statusFilter="scheduled"
        onStatusChange={vi.fn()}
        platformFilter={[]}
        onPlatformChange={vi.fn()}
        profileFilter="all"
        onProfileChange={vi.fn()}
        dateFilter="all"
        onDateChange={vi.fn()}
        sortKey="date-desc"
        onSortChange={vi.fn()}
        customers={[]}
      />
    );

    expect(html).toContain('Reset</span>');
  });
  it('keeps the platform menu open for multiple selections', () => {
    const onPlatformChange = vi.fn();
    const { getByRole } = render(
      <PostsToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        viewMode="list"
        onViewModeChange={vi.fn()}
        columns={4}
        onColumnsChange={vi.fn()}
        statusFilter="all"
        onStatusChange={vi.fn()}
        platformFilter={['instagram']}
        onPlatformChange={onPlatformChange}
        profileFilter="all"
        onProfileChange={vi.fn()}
        dateFilter="all"
        onDateChange={vi.fn()}
        sortKey="date-desc"
        onSortChange={vi.fn()}
        customers={[]}
      />
    );

    fireEvent.keyDown(getByRole('button', { name: 'Instagram' }), {
      key: 'Enter',
    });
    expect(
      getByRole('menuitemcheckbox', { name: 'Instagram' }).getAttribute(
        'aria-checked'
      )
    ).toBe('true');
    fireEvent.click(getByRole('menuitemcheckbox', { name: 'LinkedIn' }));

    expect(onPlatformChange).toHaveBeenCalledWith(['instagram', 'linkedin']);
    expect(getByRole('menuitemcheckbox', { name: 'TikTok' })).toBeTruthy();
  });
});
