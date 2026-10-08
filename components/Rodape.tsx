import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { AUTOR_SITE, CNPJ, REDES, urlWhatsapp } from '@/lib/site';

// Rodapé em três camadas: quem é e onde está, para onde ir (seções e redes), e a assinatura
// com a parte legal e a volta ao topo.
export async function Rodape({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const secoes = ['sobre', 'trabalhos', 'marcas', 'contato'] as const;
  const redes = [
    { ...REDES.whatsapp, url: urlWhatsapp(t('contato.whatsappMensagem')), rel: 'noopener' },
    { ...REDES.instagram, rel: 'me noopener' },
    { ...REDES.linkedin, rel: 'me noopener' },
  ];
  return (
    <footer className="rodape">
      <div className="rodape__grade">
        <div className="rodape__intro">
          <p className="rodape__frase">{t('rodape.frase')}</p>
          <p className="rodape__local rotulo">
            <span className="rodape__ponto" aria-hidden="true" />
            {t('rodape.local')}
          </p>
        </div>

        <nav className="rodape__coluna" aria-labelledby="rodape-navegar">
          <h2 id="rodape-navegar" className="rodape__titulo rotulo">{t('rodape.navegar')}</h2>
          <ul role="list">
            {secoes.map((s) => (
              <li key={s}><a className="rodape__link" href={`#${s}`}>{t(`nav.${s}`)}</a></li>
            ))}
          </ul>
        </nav>

        <div className="rodape__coluna">
          <h2 id="rodape-redes" className="rodape__titulo rotulo">{t('rodape.redes')}</h2>
          <ul role="list" aria-labelledby="rodape-redes">
            {redes.map((r) => (
              <li key={r.url}>
                <a className="rodape__link" href={r.url} rel={r.rel} target="_blank">
                  {r.rotulo}
                  <span className="rodape__usuario rotulo">{r.usuario}</span>
                  <ArrowUpRight className="icone" aria-hidden="true" strokeWidth={1.5} />
                  <span className="so-leitor"> {t('rodape.novaAba')}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="rodape__marca" aria-hidden="true" data-efeito="parallax" data-depth="-0.18">
        <span className="rodape__marca-jam">Jam</span>{' '}
        <span className="rodape__marca-resto">Comunicação</span>
      </p>

      <div className="rodape__base">
        <p className="rodape__legal rotulo">
          <span>{t('rodape.direitos', { ano: new Date().getFullYear() })}</span>
          <span>{t('rodape.cnpj', { cnpj: CNPJ })}</span>
          <a className="rodape__autoria" href={AUTOR_SITE.url} target="_blank" rel="noopener">
            <span className="rodape__autoria-selo" aria-hidden="true">MT</span>
            <span>
              {t('rodape.autoria')} <span className="rodape__autoria-nome">{AUTOR_SITE.nome}</span>
              <span className="so-leitor"> {t('rodape.novaAba')}</span>
            </span>
          </a>
        </p>
        <a className="rodape__topo rotulo" href="#topo">
          {t('rodape.topo')}
          <span className="rodape__topo-circulo"><ArrowUp className="icone" aria-hidden="true" strokeWidth={1.5} /></span>
        </a>
      </div>
    </footer>
  );
}
