// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { DestinationSelector } from './destination-selector';
import { WorkspaceContext, type WorkspaceContextValue } from '@/context/workspace.context';
import { ChannelsView } from '@/components/channels/channels-view';
import type { ChannelIntegration, UserProfile } from '@/api/types';
import type { ApiClient } from '@/api/client';

/**
 * Creates a mock WorkspaceContextValue for testing DestinationSelector.
 *
 * @param integrations - Channel integrations to provide in the workspace context.
 * @param selectedCustomerId - Active customer profile filter ('all' or customer UUID).
 * @returns Fully populated WorkspaceContextValue stub.
 */
function createMockWorkspaceContext(
  integrations: ChannelIntegration[] = [],
  selectedCustomerId: string = 'all'
): WorkspaceContextValue {
  const user: UserProfile = {
    id: 'u1',
    email: 'creator@example.com',
    name: 'Test Creator',
    orgId: 'org1',
  };

  return {
    api: {} as unknown as ApiClient,
    user,
    customers: [{ id: 'c1', name: 'Acme Brand', orgId: 'org1' }],
    integrations,
    selectedCustomerId,
    selectedChannelIds: integrations.filter((i) => !i.disabled).map((i) => i.id),
    channelStatuses: integrations.map((i) => ({ integration: i, isAvailable: !i.disabled })),
    isLoading: false,
    error: null,
    setSelectedCustomerId: vi.fn(),
    toggleChannelSelection: vi.fn(),
    setSelectedChannelIds: vi.fn(),
    refreshWorkspace: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
  };
}

describe('DestinationSelector quick navigate to add channel', () => {
  const sampleChannels: ChannelIntegration[] = [
    {
      id: 'ch-x',
      name: 'X Profile',
      providerIdentifier: 'x',
      type: 'social',
      disabled: false,
      refreshNeeded: false,
      inBetweenSteps: false,
      customerId: 'c1',
    },
    {
      id: 'ch-yt',
      name: 'YouTube Channel',
      providerIdentifier: 'youtube',
      type: 'social',
      disabled: false,
      refreshNeeded: false,
      inBetweenSteps: false,
      customerId: 'c1',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the quick navigate Add Channel button in the toolbar header', () => {
    const mockContext = createMockWorkspaceContext(sampleChannels, 'c1');
    const html = renderToStaticMarkup(
      <WorkspaceContext.Provider value={mockContext}>
        <DestinationSelector />
      </WorkspaceContext.Provider>
    );

    expect(html).toContain('Destinations');
    expect(html).toContain('Add Channel');
    expect(html).toContain('Filtered by active profile');
  });

  it('renders the Connect a channel call-to-action button when no channels exist for profile', () => {
    const mockContext = createMockWorkspaceContext([], 'c1');
    const html = renderToStaticMarkup(
      <WorkspaceContext.Provider value={mockContext}>
        <DestinationSelector />
      </WorkspaceContext.Provider>
    );

    expect(html).toContain('No social channels connected for this profile.');
    expect(html).toContain('Connect a channel');
    // Header Add Channel button is also present
    expect(html).toContain('Add Channel');
  });

  it('renders connected channel pills and a trailing Add Channel button in the list', () => {
    const mockContext = createMockWorkspaceContext(sampleChannels, 'c1');
    const html = renderToStaticMarkup(
      <WorkspaceContext.Provider value={mockContext}>
        <DestinationSelector />
      </WorkspaceContext.Provider>
    );

    expect(html).toContain('X Profile');
    expect(html).toContain('YouTube Channel');
    expect(html).toContain('title="Add or connect a new social channel"');
  });

  it('invokes onNavigate with channels view and tab=add query option on button click', () => {
    const mockContext = createMockWorkspaceContext(sampleChannels, 'c1');
    const onNavigateMock = vi.fn();

    const { getAllByRole } = render(
      <WorkspaceContext.Provider value={mockContext}>
        <DestinationSelector onNavigate={onNavigateMock} />
      </WorkspaceContext.Provider>
    );

    const buttons = getAllByRole('button');
    // Find the header Add Channel button
    const headerAddButton = buttons.find((btn) => btn.textContent?.includes('Add Channel'));
    expect(headerAddButton).toBeDefined();

    if (headerAddButton) {
      fireEvent.click(headerAddButton);
      expect(onNavigateMock).toHaveBeenCalledTimes(1);
      expect(onNavigateMock).toHaveBeenCalledWith('channels', { search: '?tab=add' });
    }
  });

  it('prioritizes onAddChannel custom callback over onNavigate when provided', () => {
    const mockContext = createMockWorkspaceContext(sampleChannels, 'c1');
    const onNavigateMock = vi.fn();
    const onAddChannelMock = vi.fn();

    const { getAllByRole } = render(
      <WorkspaceContext.Provider value={mockContext}>
        <DestinationSelector
          onNavigate={onNavigateMock}
          onAddChannel={onAddChannelMock}
        />
      </WorkspaceContext.Provider>
    );

    const buttons = getAllByRole('button');
    const headerAddButton = buttons.find((btn) => btn.textContent?.includes('Add Channel'));
    expect(headerAddButton).toBeDefined();

    if (headerAddButton) {
      fireEvent.click(headerAddButton);
      expect(onAddChannelMock).toHaveBeenCalledTimes(1);
      expect(onNavigateMock).not.toHaveBeenCalled();
    }
  });

  it('falls back to window.history.pushState and popstate dispatch when rendered without callbacks', () => {
    const mockContext = createMockWorkspaceContext(sampleChannels, 'c1');
    const pushStateSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

    const { getAllByRole } = render(
      <WorkspaceContext.Provider value={mockContext}>
        <DestinationSelector />
      </WorkspaceContext.Provider>
    );

    const buttons = getAllByRole('button');
    const headerAddButton = buttons.find((btn) => btn.textContent?.includes('Add Channel'));
    expect(headerAddButton).toBeDefined();

    if (headerAddButton) {
      fireEvent.click(headerAddButton);
      expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/channels?tab=add');
      expect(dispatchSpy).toHaveBeenCalled();
    }
  });

  it('ChannelsView initializes to Add Channels tab when URL contains ?tab=add', () => {
    const mockContext = createMockWorkspaceContext(sampleChannels, 'c1');
    // Set URL search to ?tab=add via browser history pushState
    window.history.pushState(null, '', '/channels?tab=add');

    const { getAllByText } = render(
      <WorkspaceContext.Provider value={mockContext}>
        <ChannelsView />
      </WorkspaceContext.Provider>
    );

    // When activeTab is 'all', it shows OAuth platforms like 'OAuth 2.0 Direct'
    const oauthBadges = getAllByText('OAuth 2.0 Direct');
    expect(oauthBadges.length).toBeGreaterThan(0);
  });

  it('renders every available platform with its local sourced logo', () => {
    const mockContext = createMockWorkspaceContext(sampleChannels, 'c1');
    const { container } = render(
      <WorkspaceContext.Provider value={mockContext}>
        <ChannelsView initialTab="all" />
      </WorkspaceContext.Provider>
    );

    const sourcedLogoPaths = [
      '/icons/platforms/threads.svg',
      '/icons/platforms/pinterest.svg',
      '/icons/platforms/reddit.svg',
      '/icons/platforms/telegram.svg',
      '/icons/platforms/bluesky.svg',
      '/icons/platforms/mastodon.svg',
      '/icons/platforms/discord.svg',
      '/icons/platforms/medium.svg',
      '/icons/platforms/wordpress.svg',
    ];

    for (const path of sourcedLogoPaths) {
      expect(container.querySelector(`img[src="${path}"]`)).not.toBeNull();
    }

    const threadsLogo = container.querySelector(
      'img[src="/icons/platforms/threads.svg"]'
    );
    expect(threadsLogo?.className).toContain('size-5');
    expect(threadsLogo?.parentElement?.className).toContain('gap-2.5');
    expect(threadsLogo?.parentElement?.className).not.toContain('border');
    expect(threadsLogo?.parentElement?.className).not.toContain('bg-page');
  });
});
