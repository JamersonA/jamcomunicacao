import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const idiomas = { 'pt-BR': `${SITE_URL}/`, en: `${SITE_URL}/en` };
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1, alternates: { languages: idiomas } },
    { url: `${SITE_URL}/en`, changeFrequency: 'monthly', priority: 0.8, alternates: { languages: idiomas } },
  ];
}
