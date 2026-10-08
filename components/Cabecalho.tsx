import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { ControleMovimento } from './ControleMovimento';

export async function Cabecalho({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tm = await getTranslations({ locale, namespace: 'movimento' });
  const outro: Locale = locale === 'pt' ? 'en' : 'pt';
  return (
    <header className="cabecalho">
      <a className="pular" href="#conteudo">{t('pular')}</a>
      <a className="cabecalho__marca rotulo" href="#topo">
        {t('marca')}
        <span className="cabecalho__local"> <span aria-hidden="true">—</span> {t('local')}</span>
      </a>
      <nav className="cabecalho__nav" aria-label={t('rotulo')}>
        <ul>
          <li><a className="rotulo" href="#sobre">{t('sobre')}</a></li>
          <li><a className="rotulo" href="#trabalhos">{t('trabalhos')}</a></li>
          <li><a className="rotulo" href="#marcas">{t('marcas')}</a></li>
          <li><a className="rotulo" href="#contato">{t('contato')}</a></li>
        </ul>
      </nav>
      <div className="cabecalho__acoes">
        <ControleMovimento pausar={tm('pausar')} retomar={tm('retomar')} />
        {/* Troca de idioma no cliente: sem recarregar a página, e na mesma altura da rolagem */}
        <Link className="cabecalho__idioma rotulo" href={getPathname({ href: '/', locale: outro })} scroll={false} hrefLang={outro === 'pt' ? 'pt-BR' : 'en'}>
          <span aria-hidden="true">{t('idiomaCurto')}</span>
          <span className="so-leitor">{t('idioma')}</span>
        </Link>
      </div>
      {/* Fio de progresso da leitura, puxado pela rolagem (GSAP no MotionRoot) */}
      <span className="cabecalho__progresso" data-progresso="" aria-hidden="true" />
    </header>
  );
}
