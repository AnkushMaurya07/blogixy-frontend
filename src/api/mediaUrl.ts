/** Host for Django media/static (strip `/api` from API origin). */
const API_BASE = import.meta.env.VITE_API_ORIGIN ?? 'http://127.0.0.1:8000';

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
