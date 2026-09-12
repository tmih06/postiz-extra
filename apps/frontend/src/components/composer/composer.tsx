import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { DestinationSelector } from '@/components/workspace/destination-selector';
import type { WorkspaceView } from '@/components/layout/navigation-shell';
import { PlatformSettings } from './platform-settings';
import { MediaLibraryModal } from './media-library-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Image as ImageIcon,
  Calendar,
  Send,
  Save,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  Loader2,
} from 'lucide-react';
import type {
  ChannelIntegration,
  CreatePostPayload,
  MediaItem,
  PostSubmissionItem,
} from '@/api/types';
import { isVideoPath } from '@/lib/media';
/**
 * Per-destination overrides for post body content and platform-specific settings.
 * Enables customizing post text or configurations (e.g. YouTube titles, Instagram reel flags)
 * for an individual channel without detaching it from the multi-channel post group.
 */
interface ChannelOverride {
  content: string;
  hasOverride: boolean;
  settings: Record<string, unknown>;
}

/**
 * Multi-channel post composer supporting shared message authoring, media attachments,
 * per-destination content/settings overrides, scheduling cadence suggestions, and direct publication.
 *
 * Manages draft persistence in browser `localStorage` keyed by active brand/customer workspace ID,
 * hydration from existing post groups during editing flows, and transactional submission dispatch
 * to `api.createPost` with state preservation across network failures.
 *
 * @param props.initialGroup - Optional UUID post group identifier to fetch and edit an existing post.
 * @param props.initialDate - Optional Date or ISO string pre-populating the schedule date/time.
 * @param props.onPostSuccess - Optional callback executed after successful schedule/publish/draft mutation.
 * @param props.onNavigate - Optional callback to navigate to another workspace view with optional search options.
 */
export interface ComposerProps {
  initialGroup?: string;
  initialDate?: Date | string;
  onPostSuccess?: () => void;
  onNavigate?: (view: WorkspaceView, options?: { search?: string }) => void;
}

/**
 * Formats a Date object or ISO string into a local HTML datetime-local input string ('YYYY-MM-DDTHH:mm').
 *
 * If the input represents midnight (00:00) with no explicit time set, defaults to 10:00 AM local time
 * on that date to provide a realistic daytime scheduling default.
 *
 * @param dateOrStr - Date object or ISO timestamp string to format.
 * @returns Local datetime string in 'YYYY-MM-DDTHH:mm' format.
 */
function formatInitialScheduleDate(dateOrStr: Date | string): string {
  const d = typeof dateOrStr === 'string' ? new Date(dateOrStr) : new Date(dateOrStr.getTime());
  if (isNaN(d.getTime())) {
    const fallback = new Date(Date.now() + 1000 * 60 * 60 * 2);
    fallback.setMinutes(fallback.getMinutes() - fallback.getTimezoneOffset());
    return fallback.toISOString().slice(0, 16);
  }
  if (d.getHours() === 0 && d.getMinutes() === 0) {
    d.setHours(10, 0, 0, 0);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function Composer({
  initialGroup,
  initialDate,
  onPostSuccess,
  onNavigate,
}: ComposerProps) {
  const {
    api,
    integrations,
    selectedChannelIds,
    selectedCustomerId,
    setSelectedChannelIds,
    refreshWorkspace,
  } = useWorkspace();

  const [sharedContent, setSharedContent] = useState('');
  const [sharedMedia, setSharedMedia] = useState<MediaItem[]>([]);
  const [channelOverrides, setChannelOverrides] = useState<
    Record<string, ChannelOverride>
  >({});
  const [activeTab, setActiveTab] = useState<string>('shared');
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    if (initialDate) {
      return formatInitialScheduleDate(initialDate);
    }
    const d = new Date(Date.now() + 1000 * 60 * 60 * 2);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [isSuggestingSlot, setIsSuggestingSlot] = useState(false);
  const [slotSuggestionNotice, setSlotSuggestionNotice] = useState<string | null>(
    null
  );
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate && !initialGroup) {
      setScheduleDate(formatInitialScheduleDate(initialDate));
    }
  }, [initialDate, initialGroup]);
  const storageKey = `postiz_composer_draft_${selectedCustomerId}`;

  // Load existing post group if initialGroup is provided
  useEffect(() => {
    if (!initialGroup) {
      // Load draft from localStorage on mount/group change
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.sharedContent !== undefined) setSharedContent(parsed.sharedContent);
          if (parsed.sharedMedia) setSharedMedia(parsed.sharedMedia);
          if (parsed.channelOverrides) setChannelOverrides(parsed.channelOverrides);
        }
      } catch {
        // ignore
      }
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const postItems = await api.getPostByGroup(initialGroup);
        if (!isMounted || !postItems?.length) return;
        const first = postItems[0];
        setSharedContent(first.content?.[0]?.content || '');
        setSharedMedia(first.content?.[0]?.image || []);
        if (first.publishDate) {
          const d = new Date(first.publishDate);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          setScheduleDate(d.toISOString().slice(0, 16));
        }
        const overrides: Record<string, ChannelOverride> = {};
        const channelIds: string[] = [];
        for (const p of postItems) {
          if (p.integration?.id) {
            channelIds.push(p.integration.id);
            overrides[p.integration.id] = {
              content: p.content?.[0]?.content || '',
              hasOverride:
                (p.content?.[0]?.content || '') !==
                (first.content?.[0]?.content || ''),
              settings: p.settings || {},
            };
          }
        }
        setChannelOverrides(overrides);
        setSelectedChannelIds(channelIds);
      } catch {
        // ignore fetch error
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [initialGroup, api, setSelectedChannelIds, storageKey]);
  // Save draft to localStorage on edit
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          sharedContent,
          sharedMedia,
          channelOverrides,
        })
      );
    } catch {
      // ignore
    }
  }, [storageKey, sharedContent, sharedMedia, channelOverrides]);

  const selectedChannels = integrations.filter((ch: ChannelIntegration) =>
    selectedChannelIds.includes(ch.id)
  );

  /**
   * Appends an uploaded or library-selected media item to the shared post attachments list.
   *
   * @param media - Media descriptor containing file path, identifier, and display name.
   * Side effect: Updates `sharedMedia` React state array.
   */
  const handleAddMedia = (media: MediaItem) => {
    setSharedMedia((prev) => [...prev, media]);
  };

  /**
   * Removes a media attachment at a specified index from the shared media collection.
   *
   * @param index - 0-based array index of the media item to remove.
   * Side effect: Filters `sharedMedia` React state by index exclusion.
   */
  const handleRemoveMedia = (index: number) => {
    setSharedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Merges partial override updates (custom text, override enablement flag, or platform settings)
   * for a specific social destination channel.
   *
   * Preserves existing override fields or defaults them from current shared composer state if
   * previously unset.
   *
   * @param channelId - Unique identifier of the target channel integration.
   * @param updates - Partial override values to apply into channel override map.
   */
  const handleChannelOverrideChange = (
    channelId: string,
    updates: Partial<ChannelOverride>
  ) => {
    setChannelOverrides((prev) => ({
      ...prev,
      [channelId]: {
        content: prev[channelId]?.content ?? sharedContent,
        hasOverride: prev[channelId]?.hasOverride ?? false,
        settings: prev[channelId]?.settings ?? {},
        ...updates,
      },
    }));
  };

  /**
   * Queries the backend scheduling engine for the next optimal publication slot for the primary
   * selected channel, converting the returned UTC date to the local browser timezone.
   *
   * Non-blocking advisory action: slot suggestions update the `scheduleDate` input state and display
   * an informational notice without altering post body content or atomically reserving backend slots.
   */
  const handleSuggestNextSlot = async () => {
    setIsSuggestingSlot(true);
    setSlotSuggestionNotice(null);
    setErrorMessage(null);
    try {
      const firstChannel = selectedChannels[0];
      const slot = await api.findNextSlot(firstChannel?.id);
      if (slot.date) {
        const d = new Date(slot.date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setScheduleDate(d.toISOString().slice(0, 16));
        setSlotSuggestionNotice(
          'Suggested slot populated from posting schedule cadence (suggestion only, not an atomic reserved queue slot).'
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not determine next slot'
      );
    } finally {
      setIsSuggestingSlot(false);
    }
  };

  /**
   * Validates composer form state and constructs the multi-channel `CreatePostPayload` submission.
   *
   * Performs client-side validation (ensuring >=1 channel selected, non-empty text or media, valid date
   * format for scheduled posts), builds per-channel payload items incorporating custom overrides when enabled,
   * dispatches the API mutation, updates workspace state, and clears local draft storage on successful publication.
   *
   * Invariant: Retains all composer input and override state on error so creator work is never lost.
   *
   * @param type - Submission mode: `'draft'` (save without publishing), `'schedule'` (queue for future date),
   *               or `'now'` (dispatch immediate social network publishing).
   */
  const handleSubmit = async (type: 'draft' | 'schedule' | 'now') => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedChannels.length === 0) {
      setErrorMessage('Please select at least one destination channel.');
      return;
    }

    if (!sharedContent.trim() && sharedMedia.length === 0) {
      setErrorMessage('Post must contain text content or at least one media item.');
      return;
    }

    let dateIso = new Date().toISOString();
    if (type === 'schedule') {
      const parsedDate = new Date(scheduleDate);
      if (isNaN(parsedDate.getTime())) {
        setErrorMessage('Please provide a valid schedule date and time.');
        return;
      }
      dateIso = parsedDate.toISOString();
    }

    const postItems: PostSubmissionItem[] = selectedChannels.map((channel: ChannelIntegration) => {
      const override = channelOverrides[channel.id];
      const contentText =
        override?.hasOverride && override.content !== undefined
          ? override.content
          : sharedContent;

      return {
        integration: { id: channel.id },
        group: initialGroup,
        value: [
          {
            content: contentText,
            image: sharedMedia.map((m) => ({ id: m.id, path: m.path })),
          },
        ],
        settings: override?.settings ?? {},
      };
    });

    const payload: CreatePostPayload = {
      type,
      date: dateIso,
      shortLink: false,
      tags: [],
      posts: postItems,
    };

    setIsSubmitting(true);
    try {
      await api.createPost(payload);
      setSuccessMessage(
        type === 'draft'
          ? 'Draft saved successfully.'
          : type === 'now'
          ? 'Post published successfully.'
          : 'Post scheduled successfully.'
      );

      // Clear draft storage only on successful non-draft publishing
      if (type !== 'draft') {
        localStorage.removeItem(storageKey);
        setSharedContent('');
        setSharedMedia([]);
        setChannelOverrides({});
      }

      await refreshWorkspace();
      onPostSuccess?.();
    } catch (err) {
      // NEVER clear state on failure — keep everything for the creator to recover
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to submit post. Your draft has been preserved.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Destinations */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Publishing Composer
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Compose once, preview channel-specific variations, and schedule or publish across your accounts.
          </p>
        </div>

        <DestinationSelector onNavigate={onNavigate} />
      </div>

      {/* Error & Success Banners */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Submission Error:</span> {errorMessage}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setErrorMessage(null)}
            className="text-destructive hover:bg-destructive/20 size-7 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4 text-sm text-foreground">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="flex-1 font-medium">{successMessage}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccessMessage(null)}
            className="size-7 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Main Composer Card */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="border border-border shadow-sm">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <div className="flex items-center justify-between overflow-x-auto pb-1">
              <TabsList className="bg-muted">
                <TabsTrigger value="shared" className="text-xs font-semibold">
                  <Layers className="size-3.5 mr-1.5" />
                  Shared Content
                </TabsTrigger>

                {selectedChannels.map((ch: ChannelIntegration) => (
                  <TabsTrigger
                    key={ch.id}
                    value={ch.id}
                    className="text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{ch.name}</span>
                    {channelOverrides[ch.id]?.hasOverride && (
                      <span className="size-1.5 rounded-full bg-foreground" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex flex-col gap-4">
            <TabsContent value="shared" className="mt-0">
              {/* Shared Content View */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Textarea
                    placeholder="What do you want to publish? Share across all selected destinations..."
                    value={sharedContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSharedContent(e.target.value)}
                    className="min-h-[160px] text-base resize-y font-normal bg-background"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>
                      Targeting {selectedChannels.length} channel
                      {selectedChannels.length === 1 ? '' : 's'}
                    </span>
                    <span className="font-mono">{sharedContent.length} characters</span>
                  </div>
                </div>

                {/* Media Attachments */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      Attached Media ({sharedMedia.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaModalOpen(true)}
                      className="h-8 text-xs gap-1.5"
                    >
                      <ImageIcon className="size-3.5" />
                      Add Media
                    </Button>
                  </div>

                  {sharedMedia.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {sharedMedia.map((m, idx) => {
                        const isVideo = isVideoPath(m.path);
                        return (
                          <div
                            key={m.id + idx}
                            className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-muted"
                          >
                            {isVideo ? (
                              <video
                                src={m.path}
                                className="size-full object-cover"
                              />
                            ) : (
                              <img
                                src={m.path}
                                alt={m.name || 'media'}
                                className="size-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(idx)}
                              className="absolute top-1 right-1 size-5 rounded-full bg-background/80 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground shadow"
                            >
                              <X className="size-3" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-background/80 px-1 text-[9px] truncate text-foreground">
                              {m.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {selectedChannels.map((currentChannel: ChannelIntegration) => {
              const override = channelOverrides[currentChannel.id] || {
                content: sharedContent,
                hasOverride: false,
                settings: {},
              };

              return (
                <TabsContent
                  key={currentChannel.id}
                  value={currentChannel.id}
                  className="mt-0"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {currentChannel.name}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs uppercase">
                          {currentChannel.providerIdentifier}
                        </Badge>
                      </div>

                      <Button
                        type="button"
                        variant={override.hasOverride ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() =>
                          handleChannelOverrideChange(currentChannel.id, {
                            hasOverride: !override.hasOverride,
                            content: override.hasOverride
                              ? sharedContent
                              : override.content,
                          })
                        }
                        className="text-xs"
                      >
                        {override.hasOverride
                          ? 'Remove Custom Override'
                          : 'Customize for This Channel'}
                      </Button>
                    </div>

                    {override.hasOverride && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Custom Text for {currentChannel.name}
                        </label>
                        <Textarea
                          value={override.content}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handleChannelOverrideChange(currentChannel.id, {
                              content: e.target.value,
                            })
                          }
                          className="min-h-[120px] text-sm resize-y"
                        />
                        <span className="text-[10px] text-muted-foreground self-end font-mono">
                          {override.content.length} characters
                        </span>
                      </div>
                    )}

                    {/* Provider Specific Settings */}
                    <PlatformSettings
                      provider={currentChannel.providerIdentifier}
                      channelName={currentChannel.name}
                      settings={override.settings}
                      onChange={(newSettings) =>
                        handleChannelOverrideChange(currentChannel.id, {
                          settings: newSettings,
                        })
                      }
                    />
                  </div>
                </TabsContent>
              );
            })}

          <Separator className="my-4" />

          {/* Scheduling & Publication Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduleDate(e.target.value)}
                  className="w-full sm:w-[220px] text-xs h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestNextSlot}
                  disabled={isSuggestingSlot}
                  className="text-xs gap-1.5 shrink-0"
                  title="Query backend next slot suggestion based on connected channel cadence"
                >
                  {isSuggestingSlot ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  Suggest Slot
                </Button>
              </div>

              {slotSuggestionNotice && (
                <p className="text-[11px] text-muted-foreground max-w-sm">
                  {slotSuggestionNotice}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <Save className="size-3.5" />
                Save Draft
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSubmit('schedule')}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <Calendar className="size-3.5" />
                Schedule
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleSubmit('now')}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Publish Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </Tabs>

      <MediaLibraryModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        onSelectMedia={handleAddMedia}
      />
    </div>
  );
}
