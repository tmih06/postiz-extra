import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type {
  YoutubeSettings,
  TikTokSettings,
  FacebookSettings,
  InstagramSettings,
} from '@/api/types';

interface PlatformSettingsProps {
  provider: string;
  channelName: string;
  settings: Record<string, unknown>;
  onChange: (newSettings: Record<string, unknown>) => void;
}

const FACEBOOK_PRESETS = [
  { id: '', name: 'Standard Text (No Background)' },
  { id: '106018623298955', name: 'Solid Purple' },
  { id: '365653833956649', name: 'Pink Tropical Plants' },
  { id: '2193627793985415', name: '3D Heart-Eyes Emojis' },
  { id: '200521337465306', name: '3D Flame Emojis' },
  { id: '248623902401250', name: '3D Smiling Emoji' },
  { id: '1868855943417360', name: '3D Crying-Laughter Emoji' },
  { id: '204187940028597', name: 'Solid Red' },
  { id: '301029513638534', name: 'Solid Teal' },
  { id: '1881421442117417', name: 'Solid Black' },
];

export function PlatformSettings({
  provider,
  channelName,
  settings,
  onChange,
}: PlatformSettingsProps) {
  const normalizedProvider = provider.toLowerCase();

  const updateSetting = (key: string, value: unknown) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  if (normalizedProvider === 'youtube') {
    const yt = settings as Partial<YoutubeSettings>;
    const tagsString = (yt.tags ?? []).map((t: { label: string }) => t.label).join(', ');

    const handleTagsChange = (val: string) => {
      const parsed = val
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((tag: string) => ({ value: tag, label: tag }));
      updateSetting('tags', parsed);
    };

    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              YouTube
            </Badge>
            {channelName} Configuration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Video Title (required, 2-100 characters)
            </label>
            <Input
              placeholder="Enter YouTube title..."
              value={yt.title ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('title', e.target.value)}
              maxLength={100}
            />
            <span className="text-[10px] text-muted-foreground self-end">
              {(yt.title ?? '').length}/100
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Privacy Visibility
            </label>
            <Select
              value={yt.type ?? 'public'}
              onValueChange={(val: string) => updateSetting('type', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Made for Kids
            </label>
            <Select
              value={yt.selfDeclaredMadeForKids ?? 'no'}
              onValueChange={(val: string) => updateSetting('selfDeclaredMadeForKids', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Made for kids?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No, not made for kids</SelectItem>
                <SelectItem value="yes">Yes, made for kids</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Tags (comma separated, max 500 chars combined)
            </label>
            <Input
              placeholder="tech, tutorial, social media"
              value={tagsString}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTagsChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (normalizedProvider === 'tiktok' || normalizedProvider === 'tiktok-business') {
    const tt = settings as Partial<TikTokSettings>;

    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              TikTok
            </Badge>
            {channelName} Configuration
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Post Title (optional, max 90 characters)
          </label>
          <Input
            placeholder="TikTok post title..."
            value={tt.title ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('title', e.target.value)}
            maxLength={90}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Privacy Level
          </label>
          <Select
            value={tt.privacy_level ?? 'PUBLIC_TO_EVERYONE'}
            onValueChange={(val: string) => updateSetting('privacy_level', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC_TO_EVERYONE">Public to Everyone</SelectItem>
              <SelectItem value="MUTUAL_FOLLOW_FRIENDS">Friends Only</SelectItem>
              <SelectItem value="FOLLOWER_OF_CREATOR">Followers</SelectItem>
              <SelectItem value="SELF_ONLY">Private (Self Only)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center justify-between border border-border rounded-lg p-2.5">
            <span className="text-xs font-medium text-foreground">Duet</span>
            <Switch
              checked={tt.duet ?? true}
              onCheckedChange={(val: boolean) => updateSetting('duet', val)}
            />
          </div>

          <div className="flex items-center justify-between border border-border rounded-lg p-2.5">
            <span className="text-xs font-medium text-foreground">Stitch</span>
            <Switch
              checked={tt.stitch ?? true}
              onCheckedChange={(val: boolean) => updateSetting('stitch', val)}
            />
          </div>

          <div className="flex items-center justify-between border border-border rounded-lg p-2.5">
            <span className="text-xs font-medium text-foreground">Comments</span>
            <Switch
              checked={tt.comment ?? true}
              onCheckedChange={(val: boolean) => updateSetting('comment', val)}
            />
          </div>

          <div className="flex items-center justify-between border border-border rounded-lg p-2.5">
            <span className="text-xs font-medium text-foreground">Auto Music</span>
            <Switch
              checked={tt.autoAddMusic === 'yes'}
              onCheckedChange={(val: boolean) => updateSetting('autoAddMusic', val ? 'yes' : 'no')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (normalizedProvider === 'facebook') {
    const fb = settings as Partial<FacebookSettings>;

    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              Facebook
            </Badge>
            {channelName} Configuration
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Text Background Preset (text-only posts, max 130 chars)
          </label>
          <Select
            value={fb.preset ?? ''}
            onValueChange={(val: string) => updateSetting('preset', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose background style..." />
            </SelectTrigger>
            <SelectContent>
              {FACEBOOK_PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (normalizedProvider === 'instagram' || normalizedProvider === 'instagram-standalone') {
    const ig = settings as Partial<InstagramSettings>;

    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              Instagram
            </Badge>
            {channelName} Configuration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Post Type
            </label>
            <Select
              value={ig.post_type ?? 'post'}
              onValueChange={(val: string) => updateSetting('post_type', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Feed Post / Reel</SelectItem>
                <SelectItem value="story">Story</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border border-border rounded-lg p-3">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Trial Reel</span>
              <span className="text-[10px] text-muted-foreground">
                Test reel with non-followers first
              </span>
            </div>
            <Switch
              checked={ig.is_trial_reel ?? false}
              onCheckedChange={(val: boolean) => updateSetting('is_trial_reel', val)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (normalizedProvider === 'threads') {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            Threads
          </Badge>
          <span>Uses standard text and attached media.</span>
        </div>
      </div>
    );
  }

  return null;
}
