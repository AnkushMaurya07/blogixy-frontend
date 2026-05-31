import type { BlogMediaItem } from './types';

/** Host for Django media/static (strip `/api` from API origin). */
const API_BASE = import.meta.env.VITE_API_ORIGIN ?? 'http://127.0.0.1:8000';

/** Resolve avatar URL: uploaded file wins, else a stable random portrait per user (Picsum). */
export function userAvatarUrl(
  user: { id: number; username: string; avatar?: string | null },
  pixelSize = 200,
): string {
  const uploaded = absoluteMediaUrl(user.avatar);
  if (uploaded) {
    return uploaded;
  }
  const seed = `blogixy-avatar-${user.id}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${pixelSize}/${pixelSize}`;
}

export function absoluteMediaUrl(relative?: string | null): string | undefined {
  if (!relative) {
    return undefined;
  }
  if (relative.startsWith('http://') || relative.startsWith('https://')) {
    return relative;
  }
  const raw = relative.startsWith('/') ? relative : `/${relative}`;
  try {
    return new URL(raw, `${API_BASE}`).href;
  } catch {
    return `${API_BASE.replace(/\/$/, '')}${raw}`;
  }
}

/** First image attachment on the blog, if any. */
function firstImageFile(items: BlogMediaItem[] | undefined): string | undefined {
  return items?.find((m) => m.media_type === 'image')?.file;
}

/** First video attachment URL, if any. */
export function firstBlogVideoUrl(items: BlogMediaItem[] | undefined): string | undefined {
  return absoluteMediaUrl(items?.find((m) => m.media_type === 'video')?.file);
}

/** First image attachment URL, if any. */
export function firstBlogImageUrl(items: BlogMediaItem[] | undefined): string | undefined {
  return absoluteMediaUrl(firstImageFile(items));
}
