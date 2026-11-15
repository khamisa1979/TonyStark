export interface Bookmark {
  url: string;
  slug: string;
}

export const BOOKMARK_SEPARATOR = ' :: ';

/**
 * Normalise a user-entered web address to an absolute HTTP(S) URL.
 */
export function normalizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/\//, '')}`;

  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function toBookmark(value: unknown): Bookmark | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { url, slug } = value as { url?: unknown; slug?: unknown };
  const normalizedUrl = normalizeUrl(url);
  if (normalizedUrl === null || typeof slug !== 'string' || !slug.trim()) {
    return null;
  }

  return { url: normalizedUrl, slug: slug.trim() };
}

/**
 * Parse and validate the value stored under the bookmarks storage key.
 * Invalid JSON, legacy shapes, and malformed entries are treated as empty.
 */
export function loadBookmarks(raw: string | null | undefined): Bookmark[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.flatMap((value) => {
          const bookmark = toBookmark(value);
          return bookmark ? [bookmark] : [];
        })
      : [];
  } catch {
    return [];
  }
}

export const parseBookmarks = loadBookmarks;

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function toBase62(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '0';
  }

  let remainder = Math.floor(value);
  let result = '';
  do {
    result = BASE62[remainder % BASE62.length] + result;
    remainder = Math.floor(remainder / BASE62.length);
  } while (remainder > 0);

  return result;
}

export function createSlug(counter: number): string {
  return `mona-${toBase62(counter)}`;
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url}${BOOKMARK_SEPARATOR}${bookmark.slug}`;
}
