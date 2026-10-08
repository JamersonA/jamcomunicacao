import { headers } from 'next/headers';
import { connection } from 'next/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Cabecalho } from '@/components/Cabecalho';
import { Cinema, type ItemCinema } from '@/components/Cinema';
import { Contato } from '@/components/Contato';
import { ContatoFixo } from '@/components/ContatoFixo';
import { Cursor } from '@/components/Cursor';
import { Hero } from '@/components/Hero';
import { Letreiro } from '@/components/Letreiro';
import { Marcas } from '@/components/Marcas';
import { MotionRoot } from '@/components/MotionRoot';
import { Rodape } from '@/components/Rodape';
import { Showreel } from '@/components/Showreel';
import { Sobre } from '@/components/Sobre';
import { Trabalhos } from '@/components/Trabalhos';
import { apresentacao, destaques, outros, type Trabalho } from '@/content/trabalhos';
import midias from '@/content/midias.json';
import type { Locale } from '@/i18n/routing';
import { CNPJ, REDES, SITE_URL, urlWhatsapp } from '@/lib/site';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Renderização por requisição: o nonce da CSP muda a cada resposta.
  await connection();
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tg = await getTranslations({ locale });
  const tc = await getTranslations({ locale, namespace: 'cinema' });

  // Toda a obra numa fila só para o player: showreel, destaques, acervo e a apresentação.
  const item = (x: Trabalho): ItemCinema => ({ slug: x.slug, marca: x.marca, titulo: x.titulo?.[locale] ?? null, largura: x.largura, altura: x.altura, youtube: x.youtube ?? null });
  const reel = (midias as Record<string, { largura: number; altura: number }>)['jam-portfolio-compilado-horizontal'];
  const fila: ItemCinema[] = [
    { slug: 'jam-portfolio-compilado-horizontal', marca: 'Jam Comunicação', titulo: 'Showreel', largura: reel.largura, altura: reel.altura, youtube: null },
    ...destaques.map(item),
    ...outros.map(item),
    item(apresentacao),
  ];
  const chaves = ['rotulo', 'fechar', 'anterior', 'proximo', 'tocar', 'pausar', 'som', 'semSom', 'telaCheia', 'sairTelaCheia', 'progresso', 'contador', 'previa', 'previaCurta', 'completo', 'atalhos'] as const;
  const textosCinema = Object.fromEntries(chaves.map((k) => [k, tc.raw(k) as string])) as Record<(typeof chaves)[number], string>;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jamerson Araujo',
    alternateName: 'Jam',
    jobTitle: locale === 'pt' ? 'Comunicador institucional e apresentador' : 'Institutional communicator and presenter',
    description: t('descricao'),
    url: locale === 'pt' ? `${SITE_URL}/` : `${SITE_URL}/en`,
    image: `${SITE_URL}/imagens/og-jam-comunicacao.jpg`,
    sameAs: [REDES.instagram.url, REDES.linkedin.url],
    address: { '@type': 'PostalAddress', addressLocality: 'Rio de Janeiro', addressRegion: 'RJ', addressCountry: 'BR' },
    worksFor: { '@type': 'Organization', name: 'Jam Comunicação', taxID: CNPJ, url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      {/* Paper Shaders só injeta o próprio <style> se não houver um; este já nasce com o nonce da CSP */}
      <style data-paper-shader="" nonce={nonce} />
      <MotionRoot />
      <Cursor />
      <Cabecalho locale={locale} />
      <main id="conteudo">
        <Hero locale={locale} />
        <Letreiro locale={locale} />
        <Sobre locale={locale} />
        <Showreel locale={locale} />
        <Trabalhos locale={locale} />
        <Marcas locale={locale} />
        <Contato locale={locale} />
      </main>
      <Rodape locale={locale} />
      <ContatoFixo texto={tg('contatoFixo')} rotulo={tg('contatoFixoRotulo')} href={urlWhatsapp(tg('contato.whatsappMensagem'))} />
      <Cinema itens={fila} textos={textosCinema} />
    </>
  );
}
