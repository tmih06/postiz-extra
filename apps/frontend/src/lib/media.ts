export function isVideoPath(path: string): boolean {
  if (!path) return false;
  const lower = path.toLowerCase();
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.m4v')
  );
}
