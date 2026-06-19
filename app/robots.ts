import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/onboarding'],
    },
    sitemap: 'https://5txxs49x.insforge.site/sitemap.xml',
  };
}
