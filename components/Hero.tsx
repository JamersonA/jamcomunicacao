import { ArrowDown, Play } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { HeroLuz } from './HeroLuz';

const larguras = [768, 1280, 1536];
const srcset = (formato: 'avif' | 'webp') =>
  larguras.map((w) => `/imagens/jam-contraluz-${w}.${formato} ${w}w`).join(', ');

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'hero' });
  return (
    <section className="hero" id="topo" aria-labelledby="hero-titulo">
      {/* Refletor 3D: primeira camada viva da página, atrás de tudo */}
      <HeroLuz />

      <div className="hero__fundo" aria-hidden="true">
        <div className="hero__camada" data-efeito="parallax" data-depth="0.12">
          <svg className="hero__grade" data-efeito="grade" focusable="false">
            <defs>
              <pattern id="grade-hero" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" className="hero__grade-linha" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grade-hero)" />
          </svg>
        </div>
        <div className="hero__camada" data-efeito="parallax" data-depth="0.3">
          <div className="hero__glow" data-efeito="glow" />
        </div>
      </div>

      <picture className="hero__foto" data-hero-foto="">
        <source type="image/avif" srcSet={srcset('avif')} sizes="(max-width: 767px) 100vw, 62vw" />
        <source type="image/webp" srcSet={srcset('webp')} sizes="(max-width: 767px) 100vw, 62vw" />
        <img
          src="/imagens/jam-contraluz-1280.webp"
          alt={t('fotoAlt')}
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {/* Visor de câmera: cantos, luz de gravação e timecode que corre com a luz */}
      <div className="hero__visor" aria-hidden="true">
        <span className="hero__canto hero__canto--a" />
        <span className="hero__canto hero__canto--b" />
        <span className="hero__canto hero__canto--c" />
        <span className="hero__canto hero__canto--d" />
        <span className="hero__rec rotulo"><span className="hero__rec-ponto" />{t('rec')}</span>
        <span className="hero__timecode rotulo" data-timecode="">00:00:00:00</span>
      </div>

      <div className="hero__conteudo">
        {/* Ficha do visor: no celular fica no espaço livre logo acima do título; no desktop vai para o canto inferior do visor */}
        <span className="hero__ficha rotulo" aria-hidden="true">{t('ficha')}</span>
        <div className="hero__titulo">
          <h1 id="hero-titulo">{t('titulo')}</h1>
          {/* Cópia dourada revelada só onde a luz bate (máscara em --luz-lx/--luz-ly) */}
          <p className="hero__titulo-ouro" aria-hidden="true">{t('titulo')}</p>
        </div>
        <p className="hero__subtitulo">{t('subtitulo')}</p>
        <div className="hero__acoes">
          <button type="button" className="botao botao--cheio" data-cinema="jam-portfolio-compilado-horizontal" data-cursor={t('cursor')}>
            <Play className="icone" aria-hidden="true" strokeWidth={1.5} />
            {t('showreel')}
          </button>
          <a className="botao botao--linha" href="#trabalhos">
            {t('trabalhos')}
            <ArrowDown className="icone" aria-hidden="true" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
