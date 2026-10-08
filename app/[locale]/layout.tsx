import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Gloock, Schibsted_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LowKey } from '@/components/LowKey';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';
import '../tokens.css';
import '../globals.css';

// Só a fonte do título tem preload, e só no subset latin (o conteúdo PT/EN não usa latin-ext)
const gloock = Gloock({ weight: '400', subsets: ['latin'], variable: '--font-gloock', display: 'swap' });
const schibsted = Schibsted_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-schibsted', display: 'swap', preload: false });
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono', display: 'swap' });

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export const viewport: Viewport = { themeColor: '#090807', colorScheme: 'dark' };

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const caminho = locale === routing.defaultLocale ? '/' : `/${locale}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: t('titulo'),
    description: t('descricao'),
    alternates: { canonical: caminho, languages: { 'pt-BR': '/', en: '/en', 'x-default': '/' } },
    openGraph: {
      type: 'website',
      url: caminho,
      siteName: 'Jam Comunicação',
      title: t('titulo'),
      description: t('descricao'),
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
      images: [{ url: '/imagens/og-jam-comunicacao.jpg', width: 1200, height: 630, alt: t('ogAlt') }],
    },
    twitter: { card: 'summary_large_image', title: t('titulo'), description: t('descricao'), images: ['/imagens/og-jam-comunicacao.jpg'] },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const tt = await getTranslations({ locale, namespace: 'tom' });
  return (
    <html data-tom="low-key" lang={locale === 'pt' ? 'pt-BR' : 'en'} className={`${gloock.variable} ${schibsted.variable} ${geistMono.variable}`}>
      <body>
        <LowKey textos={{ rotulo: tt('rotulo'), 'low-key': tt('lowKey'), original: tt('original') }} />
        {children}
      </body>
    </html>
  );
}
