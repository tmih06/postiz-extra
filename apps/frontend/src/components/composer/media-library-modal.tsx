import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/context/workspace.context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Image as ImageIcon, Search, Check, Trash2, Loader2 } from 'lucide-react';
import type { UploadedMedia, MediaItem } from '@/api/types';
import { cn } from '@/lib/utils';

interface MediaLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: (media: MediaItem) => void;
}

export function MediaLibraryModal({
  open,
  onOpenChange,
  onSelectMedia,
}: MediaLibraryModalProps) {
  const { api } = useWorkspace();
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchMedia = useCallback(async (query = '') => {
    setIsLoading(true);
    try {
      const res = await api.getMedia(0, query || undefined);
      setMediaList(res.media ?? []);
    } catch {
      setMediaList([]);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (open) {
      fetchMedia(search);
    }
  }, [open, fetchMedia, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await api.uploadMedia(file);
      onSelectMedia({ id: uploaded.id, path: uploaded.path, name: uploaded.name });
      onOpenChange(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSelect = (item: UploadedMedia) => {
    onSelectMedia({ id: item.id, path: item.path, name: item.name });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" /> Media Library & Upload
          </DialogTitle>
          <DialogDescription>
            Upload new assets or reuse existing media across your connected platforms.
          </DialogDescription>
        </DialogHeader>

        {uploadError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
            {uploadError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search uploaded files..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : (
                  <Upload className="size-4 mr-1.5" />
                )}
                Upload Asset
              </span>
            </Button>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px] border border-border rounded-lg p-3">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <Empty className="h-full py-12">
              <EmptyIcon>
                <ImageIcon className="size-6" />
              </EmptyIcon>
              <EmptyTitle>No media found</EmptyTitle>
              <EmptyDescription>
                Upload an image or video to use in your posts.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {mediaList.map((item) => {
                const isVideo = item.path.endsWith('.mp4') || item.path.endsWith('.mov') || item.path.endsWith('.webm');
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted cursor-pointer hover:border-foreground transition-colors"
                  >
                    {isVideo ? (
                      <video
                        src={item.path}
                        className="size-full object-cover pointer-events-none"
                      />
                    ) : (
                      <img
                        src={item.path}
                        alt={item.name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="text-xs font-medium flex items-center gap-1 bg-background/80 text-foreground px-2 py-1 rounded shadow">
                        <Check className="size-3" /> Select
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-background/90 px-1.5 py-0.5 text-[10px] truncate text-foreground border-t border-border">
                      {item.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
