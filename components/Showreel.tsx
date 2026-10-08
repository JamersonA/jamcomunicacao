import { Play } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import midias from '@/content/midias.json';
import type { Locale } from '@/i18n/routing';
import { Previa } from './Previa';

const SLUG = 'jam-portfolio-compilado-horizontal';
const duracao = (midias as Record<string, { duracao: number | null }>)[SLUG]?.duracao ?? 0;
const tempo = `${String(Math.floor(duracao / 60)).padStart(2, '0')}:${String(duracao % 60).padStart(2, '0')}`;

// Showreel: a janela de cinema abre do recorte até a tela inteira enquanto a seção fica presa
// por uma altura de tela (GSAP no MotionRoot). A prévia é muda; o botão abre o player com som.
export async function Showreel({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'showreel' });
  return (
    <section className="showreel" id="showreel" aria-labelledby="showreel-titulo" data-showreel="">
      <div className="showreel__janela" data-showreel-janela="">
        <Previa
          slug="showreel"
          src="/previas/showreel.mp4"
          poster="/previas/showreel.jpg"
          largura={1280}
          altura={720}
          className="showreel__video"
        />
        <div className="showreel__veu" aria-hidden="true" />
      </div>
      <div className="showreel__texto">
        <h2 id="showreel-titulo" className="showreel__titulo" data-efeito="reveal" data-dividir="">{t('titulo')}</h2>
        <button
          type="button"
          className="botao botao--vidro showreel__botao"
          data-cinema={SLUG}
          data-cursor={t('cursor')}
          data-efeito="vidro"
        >
          <span className="showreel__play" aria-hidden="true"><Play className="icone" strokeWidth={1.5} /></span>
          <span>{t('assistir')}</span>
          <span className="rotulo showreel__tempo">{tempo}</span>
        </button>
      </div>
    </section>
  );
}
