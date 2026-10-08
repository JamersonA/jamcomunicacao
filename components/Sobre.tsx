import { Play } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { apresentacao } from '@/content/trabalhos';
import type { Locale } from '@/i18n/routing';
import { Contador } from './Contador';
import { FundoShader } from './FundoShader';
import { Previa } from './Previa';
import { TextoCompleto } from './TextoCompleto';

export async function Sobre({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'sobre' });
  const linhas = t.raw('linhas') as string[];
  const completo = t.raw('completo') as string[];
  return (
    <section className="sobre secao" id="sobre" aria-labelledby="sobre-titulo">
      <div className="secao__fundo" aria-hidden="true">
        <div className="secao__camada" data-efeito="parallax" data-depth="0.18">
          <FundoShader variante="grao" />
        </div>
      </div>

      <div className="sobre__texto">
        <h2 id="sobre-titulo" className="titulo-secao" data-efeito="reveal" data-dividir="">{t('titulo')}</h2>
        <ol className="sobre__linhas">
          {linhas.map((linha, i) => (
            <li key={i}>
              <span className="sobre__numero rotulo" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {/* Lida com a rolagem: as palavras acendem uma a uma (SplitText + scrub) */}
              <p data-acender="">{linha}</p>
            </li>
          ))}
        </ol>
        <p className="sobre__fecho" data-efeito="reveal">{t('fecho')}</p>
        <TextoCompleto rotulo={t('lerMais')} paragrafos={completo} />
      </div>

      <div className="sobre__lado">
        <figure className="sobre__video" data-efeito="reveal">
          <button
            type="button"
            className="sobre__moldura"
            data-cinema={apresentacao.slug}
            data-cursor={t('cursor')}
            aria-label={t('videoTocar')}
          >
            <Previa
              slug={apresentacao.slug}
              largura={apresentacao.largura}
              altura={apresentacao.altura}
              className="sobre__previa"
            />
            <span className="sobre__tocar" aria-hidden="true"><Play className="icone" strokeWidth={1.5} /></span>
          </button>
          <figcaption className="rotulo">{t('videoRotulo')}</figcaption>
        </figure>

        <dl className="sobre__numeros" data-efeito="reveal">
          <div>
            <dt className="rotulo">{t('numeros.trabalhos')}</dt>
            <dd><Contador valor={500} sufixo="+" /></dd>
          </div>
          <div>
            <dt className="rotulo">{t('numeros.marcas')}</dt>
            <dd><Contador valor={50} prefixo="+" /></dd>
          </div>
          <div>
            <dt className="rotulo">{t('numeros.estudio')}</dt>
            <dd className="sobre__estudio">{t('numeros.estudioValor')}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
