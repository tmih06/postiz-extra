import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import type { ChannelIntegration } from '@/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/atoms/status-pill';
import {
  Share2,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Lock,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Metadata definition for a supported external social or publishing platform.
 */
interface PlatformMeta {
  /** Unique platform slug identifier (e.g., 'x', 'linkedin', 'instagram'). */
  id: string;
  /** Human-readable display label of the platform. */
  name: string;
  /** Broad category classification of the publishing destination. */
  category: 'social' | 'video' | 'blog' | 'community';
  /** Brief description of supported post formats and features on this platform. */
  description: string;
  /** Optional flag indicating whether the platform is currently linked. */
  connected?: boolean;
}

/**
 * Catalog of all third-party social media, video sharing, blogging, and community platforms supported by Postiz.
 */

const SUPPORTED_PLATFORMS: PlatformMeta[] = [
  { id: 'x', name: 'Twitter / X', category: 'social', description: 'Threads, polls, media, and scheduled posts' },
  { id: 'linkedin', name: 'LinkedIn', category: 'social', description: 'Personal profiles & organizational company pages' },
  { id: 'instagram', name: 'Instagram', category: 'social', description: 'Feed posts, Reels, and Carousel carousels' },
  { id: 'facebook', name: 'Facebook', category: 'social', description: 'Facebook Pages and community groups' },
  { id: 'youtube', name: 'YouTube', category: 'video', description: 'Long-form videos and YouTube Shorts' },
  { id: 'tiktok', name: 'TikTok', category: 'video', description: 'Short-form videos with custom sound and caption settings' },
  { id: 'threads', name: 'Threads', category: 'social', description: 'Text threads, single photos, and link posts' },
  { id: 'pinterest', name: 'Pinterest', category: 'social', description: 'Pins with custom destination boards and links' },
  { id: 'reddit', name: 'Reddit', category: 'community', description: 'Text and link submissions to targeted subreddits' },
  { id: 'telegram', name: 'Telegram', category: 'community', description: 'Broadcast channels and supergroups' },
  { id: 'bluesky', name: 'Bluesky', category: 'social', description: 'Decentralized AT Protocol microblogging' },
  { id: 'mastodon', name: 'Mastodon', category: 'social', description: 'Fediverse instances and server syndication' },
  { id: 'discord', name: 'Discord', category: 'community', description: 'Server webhook channels and announcements' },
  { id: 'medium', name: 'Medium', category: 'blog', description: 'Long-form essays, canonical links, and tags' },
  { id: 'wordpress', name: 'WordPress', category: 'blog', description: 'Self-hosted or WordPress.com posts and pages' },
];

/**
 * Channels and integrations management view for social publishing destinations.
 *
 * Displays active social account integrations grouped and badged with their connection status,
 * provides re-authentication and disconnection actions, and presents a directory of available
 * third-party platforms with direct OAuth 2.0 connection triggers.
 *
 * @returns The rendered channels management page with connected and available platform tabs.
 */
export function ChannelsView() {
  const { integrations, selectedCustomer } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'connected' | 'all'>('connected');
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const connectedList = integrations;

  /**
   * Initiates the OAuth 2.0 authorization redirect flow for a selected social provider.
   *
   * Sets the connecting platform state and redirects the browser `window.location`
   * to the backend OAuth initialization endpoint for the given platform.
   *
   * @param platformId - Unique slug identifier of the target provider (e.g. 'x', 'linkedin').
   */
  const handleConnect = (platformId: string) => {
    setConnectingPlatform(platformId);
    // Trigger OAuth redirect arrangement
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    window.location.href = `${backendUrl}/integrations/social/${platformId}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Social Channels & Integrations
            </h1>
            <span className="font-mono text-[12px] font-semibold text-ink-3 rounded bg-line px-2 py-0.5">
              {connectedList.length} connected
            </span>
          </div>
          <p className="text-sm text-ink-2 mt-1">
            Connect and manage social networks for {selectedCustomer ? selectedCustomer.name : 'all workspace profiles'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-line/60 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('connected')}
              className={cn(
                'rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
                activeTab === 'connected' ? 'bg-surface text-ink shadow-hairline' : 'text-ink-3 hover:text-ink-2'
              )}
            >
              Connected ({connectedList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
                activeTab === 'all' ? 'bg-surface text-ink shadow-hairline' : 'text-ink-3 hover:text-ink-2'
              )}
            >
              Add Channels ({SUPPORTED_PLATFORMS.length})
            </button>
          </div>
        </div>
      </div>

      {/* Connected Channels List */}
      {activeTab === 'connected' ? (
        connectedList.length === 0 ? (
          <Card className="border border-line bg-surface shadow-card">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-line mb-4 text-ink-2">
                <Share2 className="size-6" />
              </div>
              <h3 className="text-base font-bold text-ink">No channels connected yet</h3>
              <p className="text-sm text-ink-2 mt-1 max-w-sm">
                Connect your social accounts to start publishing, scheduling, and tracking performance across platforms.
              </p>
              <Button
                onClick={() => setActiveTab('all')}
                className="rounded-control bg-foreground text-background font-semibold shadow-btn mt-4"
              >
                <Plus className="size-4 mr-1.5" />
                Browse Available Channels
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedList.map((channel) => {
              const isDisconnected = channel.disabled;

              return (
                <div
                  key={channel.id}
                  className="flex flex-col justify-between rounded-card border border-line bg-surface p-4 shadow-card hover:border-line-strong transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-control bg-foreground text-background font-bold text-xs uppercase shadow-hairline">
                          {channel.providerIdentifier.slice(0, 2)}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-ink text-[13.5px] truncate capitalize">
                            {channel.providerIdentifier}
                          </span>
                          <span className="text-[11.5px] text-ink-3 truncate font-mono">
                            {channel.name}
                          </span>
                        </div>
                      </div>

                      <StatusPill tone={isDisconnected ? 'red' : 'green'} dot={true}>
                        {isDisconnected ? 'Re-auth needed' : 'Active'}
                      </StatusPill>
                    </div>

                    <div className="space-y-1 text-[12px] text-ink-2 font-mono bg-page/50 rounded-control p-2 border border-line/60">
                      <div className="flex justify-between">
                        <span className="text-ink-3">Profile ID</span>
                        <span className="truncate max-w-[140px]">{channel.id.slice(0, 12)}…</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-3">Status</span>
                        <span>{isDisconnected ? 'Disconnected' : 'Ready to publish'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-line-soft pt-3 mt-4">
                    <button
                      type="button"
                      onClick={() => handleConnect(channel.providerIdentifier)}
                      className="flex items-center gap-1 text-[12px] text-accent hover:underline font-medium"
                    >
                      <RefreshCw className="size-3" />
                      <span>Re-authenticate</span>
                    </button>

                    <button
                      type="button"
                      className="text-ink-3 hover:text-red transition-colors p-1"
                      title="Disconnect channel"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* All Available Channels Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_PLATFORMS.map((platform) => {
            const isAlreadyConnected = connectedList.some(
              (c) => c.providerIdentifier.toLowerCase() === platform.id.toLowerCase()
            );

            return (
              <div
                key={platform.id}
                className="flex flex-col justify-between rounded-card border border-line bg-surface p-4 shadow-card hover:border-line-strong transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-control bg-line font-bold text-ink text-xs uppercase">
                        {platform.id.slice(0, 2)}
                      </div>
                      <span className="font-semibold text-ink text-[14px]">
                        {platform.name}
                      </span>
                    </div>

                    <span className="rounded-full bg-line/60 px-2 py-0.5 text-[10px] font-mono text-ink-3 uppercase">
                      {platform.category}
                    </span>
                  </div>

                  <p className="text-[12.5px] text-ink-2 leading-relaxed mt-2">
                    {platform.description}
                  </p>
                </div>

                <div className="border-t border-line-soft pt-3 mt-4 flex items-center justify-between">
                  {isAlreadyConnected ? (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-green">
                      <CheckCircle2 className="size-3.5" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="text-[11.5px] text-ink-3 font-mono">OAuth 2.0 Direct</span>
                  )}

                  <Button
                    size="sm"
                    variant={isAlreadyConnected ? 'outline' : 'default'}
                    onClick={() => handleConnect(platform.id)}
                    className={cn(
                      'rounded-control text-xs font-semibold h-7 px-3',
                      isAlreadyConnected
                        ? 'border-line text-ink-2'
                        : 'bg-foreground text-background shadow-btn hover:opacity-90'
                    )}
                  >
                    {isAlreadyConnected ? 'Add Another' : 'Connect'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ChannelsView;
