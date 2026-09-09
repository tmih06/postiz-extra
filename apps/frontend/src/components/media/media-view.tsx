import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import type { UploadedMedia } from '@/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Empty } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/atoms/status-pill';
import { SegmentedControl } from '@/components/atoms/segmented-control';
import {
  Image as ImageIcon,
  Video,
  UploadCloud,
  Search,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Filter,
  PenSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaViewProps {
  onUseInComposer?: (media: UploadedMedia) => void;
}

export function MediaView({ onUseInComposer }: MediaViewProps) {
  const { api } = useWorkspace();
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<UploadedMedia | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async (pageIdx = 0, query = '') => {
    setIsLoading(true);
    try {
      const res = await api.getMedia(pageIdx, query);
      setMediaList(res.media);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(page, search);
  }, [page, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await api.uploadMedia(files[i]);
      }
      await fetchMedia(0, search);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteMedia(id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedMedia?.id === id) setSelectedMedia(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCopyUrl = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filterType === 'image') return !m.path.match(/\.(mp4|mov|webm|mkv)$/i);
    if (filterType === 'video') return m.path.match(/\.(mp4|mov|webm|mkv)$/i);
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Media Library
            </h1>
            <span className="font-mono text-[12px] font-semibold text-ink-3 rounded bg-line px-2 py-0.5">
              {total} assets
            </span>
          </div>
          <p className="text-sm text-ink-2 mt-1">
            Central repository of images, videos, and graphics for social publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-control bg-foreground text-background font-semibold shadow-btn hover:opacity-90 active:scale-[0.98]"
          >
            <UploadCloud className="size-4 mr-2" />
            <span>{isUploading ? 'Uploading…' : 'Upload Assets'}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-card border border-line bg-surface p-3 shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-3 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by filename…"
            className="h-9 w-full rounded-control border-line bg-page pl-9 pr-3 text-sm placeholder:text-ink-3"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <SegmentedControl
            options={['all', 'image', 'video'] as const}
            value={filterType}
            onChange={(v) => setFilterType(v)}
            className="w-48"
          />
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-control" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card className="border border-line bg-surface shadow-card">
          <CardContent className="p-12 text-center">
            <Empty
              icon={ImageIcon}
              title="No media assets found"
              description="Upload images or videos to organize and attach them across your social posts."
              action={
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="rounded-control border-line text-sm mt-3"
                >
                  <Plus className="size-4 mr-1.5" />
                  Upload First Asset
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isVideo = !!item.path.match(/\.(mp4|mov|webm|mkv)$/i);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="group relative flex flex-col rounded-control border border-line bg-surface overflow-hidden shadow-card hover:border-line-strong hover:shadow-raised transition-all cursor-pointer"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-square w-full bg-inset flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <div className="flex flex-col items-center justify-center text-ink-3">
                      <Video className="size-10 stroke-[1.5]" />
                      <span className="text-[11px] font-mono mt-1">VIDEO</span>
                    </div>
                  ) : (
                    <img
                      src={item.path}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Hover Overlay with Action Buttons */}
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={(e) => handleCopyUrl(item.path, item.id, e)}
                      className="flex size-8 items-center justify-center rounded-control bg-surface text-ink shadow-btn hover:scale-105 active:scale-95 transition-all"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="size-4 text-green" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>

                    {onUseInComposer && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUseInComposer(item);
                        }}
                        className="flex size-8 items-center justify-center rounded-control bg-surface text-ink shadow-btn hover:scale-105 active:scale-95 transition-all"
                        title="Use in Composer"
                      >
                        <PenSquare className="size-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="flex size-8 items-center justify-center rounded-control bg-surface text-red shadow-btn hover:bg-red-tint hover:scale-105 active:scale-95 transition-all"
                      title="Delete asset"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-2.5 flex flex-col">
                  <span className="text-[12.5px] font-medium text-ink truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-ink-3 mt-1 font-mono">
                    <span>{isVideo ? 'Video' : 'Image'}</span>
                    <span>{(item.totalSize / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal Viewer */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="w-full max-w-2xl rounded-window border border-line bg-surface p-6 shadow-overlay flex flex-col gap-4"
            style={{ animation: 'pop-in 180ms cubic-bezier(0.23,1,0.32,1) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink truncate max-w-md">
                {selectedMedia.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="text-ink-3 hover:text-ink text-sm font-medium"
              >
                Close
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-card border border-line bg-inset flex items-center justify-center">
              {selectedMedia.path.match(/\.(mp4|mov|webm|mkv)$/i) ? (
                <video src={selectedMedia.path} controls className="max-h-[55vh] w-full" />
              ) : (
                <img
                  src={selectedMedia.path}
                  alt={selectedMedia.name}
                  className="max-h-[55vh] w-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-line-soft">
              <div className="flex items-center gap-3 text-xs text-ink-3 font-mono">
                <span>{(selectedMedia.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                <span>•</span>
                <a
                  href={selectedMedia.path}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline flex items-center gap-1"
                >
                  Open Original <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                {onUseInComposer && (
                  <Button
                    onClick={() => {
                      onUseInComposer(selectedMedia);
                      setSelectedMedia(null);
                    }}
                    className="rounded-control bg-foreground text-background text-xs font-semibold shadow-btn"
                  >
                    <PenSquare className="size-3.5 mr-1.5" />
                    Insert in Composer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaView;
