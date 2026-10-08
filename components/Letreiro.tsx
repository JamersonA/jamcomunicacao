import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Esteira } from './Esteira';

// Letreiro de transição entre o hero e o texto: as palavras do ofício do Jam correndo em
// tipo de display, com o asterisco de luz entre elas. Puramente visual.
export async function Letreiro({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'letreiro' });
  const palavras = t.raw('palavras') as string[];
  return (
    <div className="letreiro" data-efeito="parallax" data-depth="0.08" aria-hidden="true">
      <Esteira decorativa>
        {palavras.map((p, i) => (
          <span key={i} className={`letreiro__palavra ${i % 2 ? 'letreiro__palavra--vazada' : ''}`}>
            {p}
            <svg className="letreiro__estrela" viewBox="0 0 24 24" focusable="false">
              <path d="M12 0 L13.6 10.4 L24 12 L13.6 13.6 L12 24 L10.4 13.6 L0 12 L10.4 10.4 Z" />
            </svg>
          </span>
        ))}
      </Esteira>
    </div>
  );
}
