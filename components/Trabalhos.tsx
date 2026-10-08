import { getTranslations } from 'next-intl/server';
import { destaques, outros, type Trabalho } from '@/content/trabalhos';
import type { Locale } from '@/i18n/routing';
import { FundoShader } from './FundoShader';
import { Gesto } from './Gesto';
import { Acervo, type Peca } from './Acervo';

function peca(item: Trabalho, locale: Locale): Peca {
  return {
    slug: item.slug,
    marca: item.marca,
    titulo: item.titulo?.[locale] ?? null,
    largura: item.largura,
    altura: item.altura,
  };
}

export async function Trabalhos({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'trabalhos' });
  return (
    <section className="trabalhos secao" id="trabalhos" aria-labelledby="trabalhos-titulo">
      <div className="secao__fundo" aria-hidden="true">
        <div className="secao__camada" data-efeito="parallax" data-depth="0.22">
          <FundoShader variante="malha" />
        </div>
      </div>
      <div className="trabalhos__topo">
        <h2 id="trabalhos-titulo" className="titulo-secao" data-efeito="reveal" data-dividir="">{t('titulo')}</h2>
        {/* O gesto muda com o aparelho: cursor fino passa por cima, toque só toca */}
        <p className="trabalhos__intro" data-efeito="reveal">
          {t('intro')} <Gesto ponteiro={t('gestoPonteiro')} toque={t('gestoToque')} />
        </p>
      </div>
      <Acervo
        destaques={destaques.map((d) => peca(d, locale))}
        outros={outros.map((o) => peca(o, locale))}
        textos={{
          maisTitulo: t('maisTitulo'),
          assistir: t.raw('assistir') as string,
          dica: t('dica'),
          anterior: t('anterior'),
          proximo: t('proximo'),
          carrossel: t('carrossel'),
          slide: t.raw('slide') as string,
          verMais: t.raw('verMais') as string,
          verMenos: t('verMenos'),
        }}
      />
    </section>
  );
}
