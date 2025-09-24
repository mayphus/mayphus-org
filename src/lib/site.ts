import rawSiteConfigs from '../../sites.config.json';

type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

type SiteConfigMap = Record<string, SiteConfigInput>;

export interface SiteLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface SiteHomeSectionCTA {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  itemFallbackDescription?: string;
}

export interface SiteConnectConfig {
  heading: string;
  lead: string;
  links: SiteLink[];
}

export interface SiteHomeConfig {
  heroIntro: string[];
  projects: SiteHomeSectionCTA;
  writing: SiteHomeSectionCTA;
  connect: SiteConnectConfig;
}

export interface SiteConfigInput {
  site: string;
  title: string;
  description: string;
  contentDir: string;
  contactEmail: string;
  analyticsId?: string;
  navigation?: SiteLink[];
  footerLinks?: SiteLink[];
  socialProfiles?: string[];
  home?: SiteHomeConfig;
}

export interface ResolvedSiteConfig {
  site: string;
  title: string;
  description: string;
  contentDir: string;
  contactEmail: string;
  analyticsId?: string;
  navigation: SiteLink[];
  footerLinks: SiteLink[];
  socialProfiles: string[];
  home: SiteHomeConfig;
}

const SITE_CONFIGS = rawSiteConfigs as SiteConfigMap;

function resolveSiteKey(): string {
  const processEnv = (globalThis as any)?.process?.env ?? {};
  if (typeof processEnv.SITE_KEY === 'string' && processEnv.SITE_KEY.length > 0) {
    return processEnv.SITE_KEY;
  }
  if (typeof processEnv.PUBLIC_SITE_KEY === 'string' && processEnv.PUBLIC_SITE_KEY.length > 0) {
    return processEnv.PUBLIC_SITE_KEY;
  }

  try {
    const publicSiteKey = import.meta.env.PUBLIC_SITE_KEY;
    if (typeof publicSiteKey === 'string' && publicSiteKey.length > 0) {
      return publicSiteKey;
    }
  } catch {
    // ignore - import.meta.env unavailable in this runtime
  }

  return 'mayphus';
}

export const SITE_KEY = resolveSiteKey();

const activeConfig = SITE_CONFIGS[SITE_KEY];
if (!activeConfig) {
  throw new Error(`Site configuration for "${SITE_KEY}" was not found. Set SITE_KEY to one of: ${Object.keys(SITE_CONFIGS).join(', ')}`);
}

const DEFAULT_LINKS: SiteLink[] = [
  { href: '/', label: 'Home' },
  { href: '/content/', label: 'Content' },
];

const defaultHome: SiteHomeConfig = {
  heroIntro: [],
  projects: {
    title: 'Projects',
    ctaHref: '/content/',
    ctaLabel: 'Browse highlights',
    itemFallbackDescription: 'Newest projects and build logs from the studio.',
  },
  writing: {
    title: 'Writing',
    ctaHref: '/content/',
    ctaLabel: 'Read more',
    itemFallbackDescription: 'Fresh notes, essays, and ongoing reflections.',
  },
  connect: {
    heading: 'Connect',
    lead: 'Reach out any time.',
    links: [],
  },
};

const freeze = <T>(value: T): DeepReadonly<T> => Object.freeze(value) as DeepReadonly<T>;

const resolvedFooterLinks = activeConfig.footerLinks ?? [
  { href: `mailto:${activeConfig.contactEmail}`, label: 'Email', external: true },
];

const resolvedConnectLinks = activeConfig.home?.connect?.links
  ?? (defaultHome.connect.links.length > 0 ? defaultHome.connect.links : resolvedFooterLinks);

const resolvedConfig: ResolvedSiteConfig = {
  site: activeConfig.site,
  title: activeConfig.title,
  description: activeConfig.description,
  contentDir: activeConfig.contentDir,
  contactEmail: activeConfig.contactEmail,
  analyticsId: activeConfig.analyticsId,
  navigation: activeConfig.navigation ?? DEFAULT_LINKS,
  footerLinks: resolvedFooterLinks,
  socialProfiles: activeConfig.socialProfiles ?? [],
  home: {
    ...defaultHome,
    ...(activeConfig.home ?? {}),
    heroIntro: activeConfig.home?.heroIntro ?? defaultHome.heroIntro,
    projects: {
      ...defaultHome.projects,
      ...(activeConfig.home?.projects ?? {}),
    },
    writing: {
      ...defaultHome.writing,
      ...(activeConfig.home?.writing ?? {}),
    },
    connect: {
      ...defaultHome.connect,
      ...(activeConfig.home?.connect ?? {}),
      links: resolvedConnectLinks,
    },
  },
};

export const SITE_CONFIG: DeepReadonly<ResolvedSiteConfig> = freeze(resolvedConfig);

export const SITE_NAVIGATION = SITE_CONFIG.navigation;
export const SITE_FOOTER_LINKS = SITE_CONFIG.footerLinks;
export const SITE_SOCIAL_PROFILES = SITE_CONFIG.socialProfiles;
export const SITE_HOME = SITE_CONFIG.home;

interface FormatOptions {
  html?: boolean;
}

export function formatWithEmail(
  template: string | undefined,
  options?: FormatOptions,
): string | undefined {
  if (!template) {
    return template;
  }

  const useHtml = options?.html !== false;
  const email = SITE_CONFIG.contactEmail;
  const emailValue = useHtml
    ? `<a href="mailto:${email}" class="org-link">${email}</a>`
    : email;

  return template.replace('{email}', emailValue);
}
