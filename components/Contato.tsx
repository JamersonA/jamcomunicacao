import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { REDES, urlWhatsapp } from '@/lib/site';
import { FundoShader } from './FundoShader';
import { Magnetico } from './Magnetico';
import { Poeira } from './Poeira';

export async function Contato({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'contato' });
  const canais = [
    { rotulo: t('whatsapp'), usuario: REDES.whatsapp.usuario, url: urlWhatsapp(t('whatsappMensagem')) },
    { rotulo: t('instagram'), usuario: REDES.instagram.usuario, url: REDES.instagram.url },
    { rotulo: t('linkedin'), usuario: REDES.linkedin.usuario, url: REDES.linkedin.url },
  ];
  return (
    <section className="contato secao" id="contato" aria-labelledby="contato-titulo">
      <div className="contato__fundo" aria-hidden="true">
        <div className="secao__camada" data-efeito="parallax" data-depth="0.15">
          <FundoShader variante="raios" />
        </div>
        <div className="secao__camada" data-efeito="parallax" data-depth="0.35">
          <div className="contato__glow" data-efeito="glow" />
        </div>
        <Poeira className="contato__poeira" quantidade={60} />
      </div>
      {/* O vidro fica sempre em quadro sobre o fundo vivo; quem entra é o conteúdo */}
      <div className="contato__painel" data-efeito="vidro">
        <h2 id="contato-titulo" className="contato__titulo" data-efeito="reveal" data-dividir="">{t('titulo')}</h2>
        <p className="contato__texto" data-efeito="reveal">{t('texto')}</p>
        <ul className="contato__canais" role="list" data-efeito="reveal">
          {canais.map((c) => (
            <li key={c.url}>
              <a href={c.url} target="_blank" rel="me noopener">
                <span className="rotulo">{c.rotulo}</span>
                <span className="contato__usuario">{c.usuario}</span>
                <Magnetico>
                  <span className="contato__seta"><ArrowUpRight className="icone" aria-hidden="true" strokeWidth={1.5} /></span>
                </Magnetico>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
