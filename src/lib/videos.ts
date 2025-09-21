import { YOUTUBE_CHANNEL_ID, YOUTUBE_HANDLE } from '../consts';

export interface Video {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  thumbnailUrl: string;
  description?: string;
  publishedAt?: Date;
}

export interface SerializableVideo extends Omit<Video, 'publishedAt'> {
  publishedAt?: string;
}

const DEFAULT_MAX_DESCRIPTION_LENGTH = 220;
const HTML_ENTITY_PATTERN = /&(#x?[0-9a-fA-F]+|\w+);/g;
const ENTRY_PATTERN = /<entry[\s\S]*?<\/entry>/gi;
const BASE_WATCH_URL = 'https://www.youtube.com/watch?v=';
const BASE_EMBED_URL = 'https://www.youtube.com/embed/';
const BASE_THUMBNAIL_URL = 'https://i.ytimg.com/vi/';

const htmlEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: '\u00A0',
};

const youtubeUsername = YOUTUBE_HANDLE.startsWith('@')
  ? YOUTUBE_HANDLE.slice(1)
  : YOUTUBE_HANDLE;
const feedCandidates = [
  YOUTUBE_CHANNEL_ID
    ? `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`
    : undefined,
  youtubeUsername
    ? `https://www.youtube.com/feeds/videos.xml?user=${youtubeUsername}`
    : undefined,
].filter((value): value is string => Boolean(value));

const publishedFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

function decodeHtml(value: string): string {
  return value.replace(HTML_ENTITY_PATTERN, (_, entity) => {
    if (!entity) return '';
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
    }

    if (entity.startsWith('#')) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
    }

    return htmlEntities[entity] ?? `&${entity};`;
  });
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, maxLength = DEFAULT_MAX_DESCRIPTION_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function extractTagValue(source: string, tag: string): string | undefined {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  const match = source.match(pattern);
  return match ? match[1].trim() : undefined;
}

function buildVideo(id: string, title: string, options: {
  description?: string;
  publishedAt?: string;
} = {}): Video {
  const publishedAt = options.publishedAt ? new Date(options.publishedAt) : undefined;
  const isValidDate = publishedAt && !Number.isNaN(publishedAt.getTime());

  return {
    id,
    title,
    description: options.description,
    publishedAt: isValidDate ? publishedAt : undefined,
    url: `${BASE_WATCH_URL}${id}`,
    embedUrl: `${BASE_EMBED_URL}${id}`,
    thumbnailUrl: `${BASE_THUMBNAIL_URL}${id}/hqdefault.jpg`,
  };
}

export function parseYoutubeFeed(xml: string): Video[] {
  if (!xml) return [];

  const entries = xml.match(ENTRY_PATTERN) ?? [];

  return entries
    .map((entry) => {
      const id = extractTagValue(entry, 'yt:videoId');
      if (!id) return undefined;

      const rawTitle = extractTagValue(entry, 'title') ?? '';
      const title = normalizeWhitespace(decodeHtml(rawTitle)) || 'Untitled video';

      const rawDescription = extractTagValue(entry, 'media:description');
      const description = rawDescription
        ? truncate(normalizeWhitespace(decodeHtml(rawDescription)))
        : undefined;

      const publishedAt = extractTagValue(entry, 'published');

      return buildVideo(id, title, {
        description,
        publishedAt,
      });
    })
    .filter((video): video is Video => Boolean(video));
}

export async function getYoutubeVideos(
  fetcher: typeof globalThis.fetch = globalThis.fetch,
  limit?: number
): Promise<Video[]> {
  if (!fetcher) {
    return [];
  }

  for (const url of feedCandidates) {
    try {
      const response = await fetcher(url);
      if (!response.ok) {
        continue;
      }
      const xml = await response.text();
      const videos = parseYoutubeFeed(xml);
      if (videos.length > 0) {
        return typeof limit === 'number' ? videos.slice(0, limit) : videos;
      }
    } catch (error) {
      console.warn(`[videos] Failed to load YouTube feed from ${url}:`, error);
    }
  }

  return [];
}

export function serializeVideosForClient(videos: Video[]): SerializableVideo[] {
  return videos.map((video) => ({
    ...video,
    publishedAt: video.publishedAt ? video.publishedAt.toISOString() : undefined,
  }));
}

export function formatVideoPublishedDate(date?: Date): string | undefined {
  if (!date) return undefined;
  try {
    return publishedFormatter.format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}
