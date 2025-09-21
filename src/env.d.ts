/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_YOUTUBE_CHANNEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
