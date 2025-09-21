import { describe, expect, it } from 'vitest';
import {
  formatVideoPublishedDate,
  getYoutubeVideos,
  parseYoutubeFeed,
  serializeVideosForClient,
  type Video,
} from './videos';

const sampleFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <entry>
    <id>yt:video:abc123</id>
    <yt:videoId>abc123</yt:videoId>
    <yt:channelId>channel-1</yt:channelId>
    <title>Workshop Build &amp; Beyond</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=abc123"/>
    <published>2024-01-15T12:34:56+00:00</published>
    <updated>2024-01-15T13:00:00+00:00</updated>
    <media:group>
      <media:title>Workshop Build &amp; Beyond</media:title>
      <media:description>A behind-the-scenes look at prototypes &amp; plans for what&#39;s next.</media:description>
    </media:group>
  </entry>
  <entry>
    <id>yt:video:def456</id>
    <yt:videoId>def456</yt:videoId>
    <yt:channelId>channel-1</yt:channelId>
    <title>Laser Cutting Jigs</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=def456"/>
    <published>2023-12-01T08:00:00+00:00</published>
    <updated>2023-12-01T08:10:00+00:00</updated>
    <media:group>
      <media:title>Laser Cutting Jigs</media:title>
    </media:group>
  </entry>
</feed>`;

describe('parseYoutubeFeed', () => {
  it('parses video entries from the feed', () => {
    const videos = parseYoutubeFeed(sampleFeed);
    expect(videos).toHaveLength(2);

    const [first, second] = videos;

    expect(first.id).toBe('abc123');
    expect(first.title).toBe('Workshop Build & Beyond');
    expect(first.url).toBe('https://www.youtube.com/watch?v=abc123');
    expect(first.embedUrl).toBe('https://www.youtube.com/embed/abc123');
    expect(first.thumbnailUrl).toBe('https://i.ytimg.com/vi/abc123/hqdefault.jpg');
    expect(first.description).toContain('behind-the-scenes look');
    expect(first.publishedAt?.toISOString()).toBe('2024-01-15T12:34:56.000Z');

    expect(second.id).toBe('def456');
    expect(second.description).toBeUndefined();
  });

  it('returns an empty array for missing content', () => {
    expect(parseYoutubeFeed('')).toEqual([]);
  });
});

describe('getYoutubeVideos', () => {
  it('returns parsed videos when the fetch succeeds', async () => {
    const fetchMock: typeof globalThis.fetch = async () =>
      new globalThis.Response(sampleFeed, {
        status: 200,
        headers: { 'Content-Type': 'application/atom+xml' },
      });

    const videos = await getYoutubeVideos(fetchMock, 1);
    expect(videos).toHaveLength(1);
    expect(videos[0]?.id).toBe('abc123');
  });

  it('handles network failures gracefully', async () => {
    const fetchMock: typeof globalThis.fetch = async () => {
      throw new Error('network error');
    };

    const videos = await getYoutubeVideos(fetchMock);
    expect(videos).toEqual([]);
  });
});

describe('serializeVideosForClient', () => {
  it('converts Date fields to ISO strings', () => {
    const videos: Video[] = parseYoutubeFeed(sampleFeed);
    const serialized = serializeVideosForClient(videos);

    expect(serialized[0]?.publishedAt).toBe('2024-01-15T12:34:56.000Z');
    expect(serialized[0]?.id).toBe('abc123');
  });
});

describe('formatVideoPublishedDate', () => {
  it('formats dates using the configured locale', () => {
    const formatted = formatVideoPublishedDate(new Date('2024-01-15T12:34:56Z'));
    expect(formatted).toBe('Jan 15, 2024');
  });

  it('returns undefined for missing dates', () => {
    expect(formatVideoPublishedDate(undefined)).toBeUndefined();
  });
});
