import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import { DestinationSelector } from '@/components/workspace/destination-selector';
import { PlatformSettings } from './platform-settings';
import { MediaLibraryModal } from './media-library-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Image as ImageIcon,
  Calendar,
  Send,
  Save,
  Clock,
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
interface ChannelOverride {
  content: string;
  hasOverride: boolean;
  settings: Record<string, unknown>;
}

export function Composer({
  initialGroup,
  onPostSuccess,
}: {
  initialGroup?: string;
  onPostSuccess?: () => void;
}) {
  const {
    api,
    integrations,
    selectedChannelIds,
    selectedCustomerId,
    refreshWorkspace,
  } = useWorkspace();

  const [sharedContent, setSharedContent] = useState('');
  const [sharedMedia, setSharedMedia] = useState<MediaItem[]>([]);
  const [channelOverrides, setChannelOverrides] = useState<
    Record<string, ChannelOverride>
  >({});
  const [activeTab, setActiveTab] = useState<string>('shared');
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
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

  const storageKey = `postiz_composer_draft_${selectedCustomerId}`;

  // Load draft from localStorage on mount/group change
  useEffect(() => {
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
  }, [storageKey]);

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

  const handleAddMedia = (media: MediaItem) => {
    setSharedMedia((prev) => [...prev, media]);
  };

  const handleRemoveMedia = (index: number) => {
    setSharedMedia((prev) => prev.filter((_, i) => i !== index));
  };

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

  // Next slot suggestion
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

  // Submit action
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

        <DestinationSelector />
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
      <Card className="border border-border shadow-sm">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          </Tabs>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {activeTab === 'shared' ? (
            /* Shared Content View */
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
                      const isVideo =
                        m.path.endsWith('.mp4') ||
                        m.path.endsWith('.mov') ||
                        m.path.endsWith('.webm');
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
          ) : (
            /* Channel-Specific Customization View */
            (() => {
              const currentChannel = selectedChannels.find(
                (ch: ChannelIntegration) => ch.id === activeTab
              );
              if (!currentChannel) return null;
              const override = channelOverrides[currentChannel.id] || {
                content: sharedContent,
                hasOverride: false,
                settings: {},
              };

              return (
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
              );
            })()
          )}

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

      <MediaLibraryModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        onSelectMedia={handleAddMedia}
      />
    </div>
  );
}
