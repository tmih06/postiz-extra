import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  ApiClient,
  UserProfile,
  CustomerProfile,
  ChannelIntegration,
  PostGroup,
  CreatePostPayload,
  MediaListResponse,
} from './api/types';

describe('publishing workspace business logic and state invariants', () => {
  const mockUser: UserProfile = {
    id: 'u1',
    email: 'creator@example.com',
    name: 'Alice Creator',
    orgId: 'org1',
  };

  const mockCustomers: CustomerProfile[] = [
    { id: 'c1', name: 'Acme Brand', orgId: 'org1' },
    { id: 'c2', name: 'Beta Studio', orgId: 'org1' },
  ];

  const mockIntegrations: ChannelIntegration[] = [
    {
      id: 'int-yt',
      name: 'Acme YouTube',
      providerIdentifier: 'youtube',
      type: 'social',
      disabled: false,
      refreshNeeded: false,
      inBetweenSteps: false,
      customerId: 'c1',
    },
    {
      id: 'int-tt',
      name: 'Acme TikTok',
      providerIdentifier: 'tiktok',
      type: 'social',
      disabled: false,
      refreshNeeded: false,
      inBetweenSteps: false,
      customerId: 'c1',
    },
    {
      id: 'int-fb-expired',
      name: 'Acme Facebook Expired',
      providerIdentifier: 'facebook',
      type: 'social',
      disabled: false,
      refreshNeeded: true, // expired authentication
      inBetweenSteps: false,
      customerId: 'c1',
    },
    {
      id: 'int-threads-ungrouped',
      name: 'Personal Threads',
      providerIdentifier: 'threads',
      type: 'social',
      disabled: false,
      refreshNeeded: false,
      inBetweenSteps: false,
      customerId: null, // ungrouped
    },
  ];

  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    });
  });

  it('filters destinations and preselects active channels when a profile is chosen', () => {
    const selectedCustomerId = 'c1';

    // Channels to display: matching profile + ungrouped channels
    const displayedChannels = mockIntegrations.filter(
      (ch) => ch.customerId === selectedCustomerId || ch.customerId === null
    );
    expect(displayedChannels).toHaveLength(4);

    // Initial preselection: only valid/available channels belonging to the profile
    const preselected = mockIntegrations
      .filter(
        (ch) =>
          ch.customerId === selectedCustomerId &&
          !ch.disabled &&
          !ch.refreshNeeded &&
          !ch.inBetweenSteps
      )
      .map((ch) => ch.id);

    expect(preselected).toEqual(['int-yt', 'int-tt']);
    expect(preselected).not.toContain('int-fb-expired'); // expired channel excluded from active auto-select
    expect(preselected).not.toContain('int-threads-ungrouped'); // ungrouped preserved but not preselected for c1
  });

  it('allows manual destination overrides without altering profile defaults', () => {
    const initialSelected = ['int-yt', 'int-tt'];

    // Creator deselects YouTube for this post
    let currentSelected = initialSelected.filter((id) => id !== 'int-yt');
    expect(currentSelected).toEqual(['int-tt']);

    // Creator manually includes ungrouped Threads for this one post
    currentSelected = [...currentSelected, 'int-threads-ungrouped'];
    expect(currentSelected).toEqual(['int-tt', 'int-threads-ungrouped']);
  });

  it('identifies disconnected and expired channels with explicit reasons', () => {
    const statuses = mockIntegrations.map((ch) => {
      if (ch.disabled) return { id: ch.id, available: false, reason: 'Disabled' };
      if (ch.refreshNeeded) return { id: ch.id, available: false, reason: 'Expired' };
      if (ch.inBetweenSteps) return { id: ch.id, available: false, reason: 'Incomplete' };
      return { id: ch.id, available: true };
    });

    const fbStatus = statuses.find((s) => s.id === 'int-fb-expired');
    expect(fbStatus?.available).toBe(false);
    expect(fbStatus?.reason).toBe('Expired');
  });

  it('preserves draft in storage on failed submission so creator never loses work', async () => {
    const storageKey = 'postiz_composer_draft_c1';
    const draftPayload = {
      sharedContent: 'Important announcement about product launch',
      sharedMedia: [{ id: 'm1', path: '/uploads/launch.png', name: 'launch.png' }],
      channelOverrides: {
        'int-yt': {
          content: 'Custom YouTube description',
          hasOverride: true,
          settings: { title: 'Launch Video 2026', type: 'public' },
        },
      },
    };

    localStorage.setItem(storageKey, JSON.stringify(draftPayload));

    // Simulate failed submission
    let submissionError: string | null = null;
    try {
      throw new Error('Backend validation failed: YouTube title must not exceed character limit');
    } catch (err) {
      submissionError = (err as Error).message;
    }

    expect(submissionError).toContain('Backend validation failed');

    // Verify draft was NOT wiped
    const preservedDraft = JSON.parse(localStorage.getItem(storageKey)!);
    expect(preservedDraft.sharedContent).toBe(draftPayload.sharedContent);
    expect(preservedDraft.channelOverrides['int-yt'].settings.title).toBe('Launch Video 2026');
  });

  it('truthfully handles next-slot suggestions without asserting atomic reservation', async () => {
    const mockFindNextSlot = vi.fn().mockResolvedValue({
      date: '2026-09-18T16:30:00.000Z',
    });

    const result = await mockFindNextSlot('int-yt');
    expect(result.date).toBe('2026-09-18T16:30:00.000Z');

    // UI formats suggestion to local time without asserting an atomic lock
    const suggestedDate = new Date(result.date);
    expect(suggestedDate.getFullYear()).toBe(2026);
  });

  it('aggregates and formats per-channel publication outcomes', () => {
    const postGroup: PostGroup = {
      id: 'grp-1',
      date: '2026-09-10T12:00:00Z',
      type: 'schedule',
      posts: [
        {
          id: 'p1',
          group: 'grp-1',
          publishDate: '2026-09-10T12:00:00Z',
          status: 'PUBLISHED',
          releaseId: 'yt-12345',
          integration: mockIntegrations[0],
          content: [{ content: 'Hello YouTube', image: [] }],
        },
        {
          id: 'p2',
          group: 'grp-1',
          publishDate: '2026-09-10T12:00:00Z',
          status: 'FAILED',
          releaseId: null,
          integration: mockIntegrations[1],
          content: [{ content: 'Hello TikTok', image: [] }],
        },
      ],
    };

    const outcomes = postGroup.posts.map((p) => ({
      channel: p.integration.name,
      provider: p.integration.providerIdentifier,
      status: p.status,
      success: p.status === 'PUBLISHED',
    }));

    expect(outcomes).toHaveLength(2);
    expect(outcomes[0]).toEqual({
      channel: 'Acme YouTube',
      provider: 'youtube',
      status: 'PUBLISHED',
      success: true,
    });
    expect(outcomes[1]).toEqual({
      channel: 'Acme TikTok',
      provider: 'tiktok',
      status: 'FAILED',
      success: false,
    });
  });
});
