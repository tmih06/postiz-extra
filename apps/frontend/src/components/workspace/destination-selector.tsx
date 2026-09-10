import React from 'react';
import { useWorkspace, type ChannelStatusInfo } from '@/context/workspace.context';
import type { ChannelIntegration } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, AlertCircle, Share2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Destination channel selector toolbar for choosing target social media accounts.
 *
 * Filters connected integrations according to the currently active workspace brand profile
 * (including ungrouped channels), displays real-time connection status badges (disabled, expired token,
 * incomplete setup), and handles multi-select toggling via workspace context.
 */
export function DestinationSelector() {
  const {
    integrations,
    selectedCustomerId,
    selectedChannelIds,
    channelStatuses,
    toggleChannelSelection,
  } = useWorkspace();

  // Channels to display: if 'all', all channels; else channels matching selected profile + ungrouped
  const displayedChannels = integrations.filter((ch: ChannelIntegration) => {
    if (selectedCustomerId === 'all') return true;
    return ch.customerId === selectedCustomerId || ch.customerId === null;
  });

  const selectedCount = selectedChannelIds.length;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-foreground" />
            <h4 className="text-sm font-semibold tracking-tight text-foreground">
              Destinations
            </h4>
            <Badge variant="outline" className="font-mono text-xs">
              {selectedCount} selected
            </Badge>
          </div>
          {selectedCustomerId !== 'all' && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="size-3" /> Filtered by active profile
            </span>
          )}
        </div>

        {displayedChannels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No social channels connected for this profile.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {displayedChannels.map((channel: ChannelIntegration) => {
              const statusInfo = channelStatuses.find(
                (s: ChannelStatusInfo) => s.integration.id === channel.id
              );
              const isAvailable = statusInfo?.isAvailable ?? true;
              const isSelected = selectedChannelIds.includes(channel.id);
              const isUngrouped = channel.customerId === null;

              if (!isAvailable) {
                return (
                  <Tooltip key={channel.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground opacity-60 cursor-not-allowed select-none'
                        )}
                      >
                        <AlertCircle className="size-3.5 text-muted-foreground" />
                        <span className="font-medium">{channel.name}</span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] uppercase tracking-wider"
                        >
                          {channel.providerIdentifier}
                        </Badge>
                        {channel.disabled && (
                          <span className="text-[10px] text-destructive">
                            Disabled
                          </span>
                        )}
                        {channel.refreshNeeded && (
                          <span className="text-[10px] text-destructive">
                            Expired
                          </span>
                        )}
                        {channel.inBetweenSteps && (
                          <span className="text-[10px] text-muted-foreground">
                            Incomplete
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{statusInfo?.reason || 'Channel is unavailable'}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => toggleChannelSelection(channel.id)}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded border transition-colors',
                      isSelected
                        ? 'border-primary-foreground bg-primary-foreground text-primary'
                        : 'border-muted-foreground/40 bg-transparent'
                    )}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                  </span>
                  <span className="truncate max-w-[140px]">{channel.name}</span>
                  <Badge
                    variant={isSelected ? 'outline' : 'secondary'}
                    className={cn(
                      'font-mono text-[9px] uppercase tracking-wider',
                      isSelected && 'border-primary-foreground/30 text-primary-foreground'
                    )}
                  >
                    {channel.providerIdentifier}
                  </Badge>
                  {isUngrouped && (
                    <span
                      className={cn(
                        'text-[10px]',
                        isSelected
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      (ungrouped)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
