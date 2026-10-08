import { getTranslations } from 'next-intl/server';
import { marcas, type Marca } from '@/content/marcas';
import type { Locale } from '@/i18n/routing';
import { Contador } from './Contador';
import { Esteira } from './Esteira';
import { FundoShader } from './FundoShader';

const logo = (m: Marca) => (
  <img src={`/imagens/marcas/${m.slug}.webp`} alt={m.nome} width={m.largura} height={m.altura} loading="lazy" decoding="async" />
);

// Duas esteiras em sentidos opostos que aceleram com a rolagem. A primeira é a lista acessível
// com todas as marcas; a segunda repete a outra metade, só como visual.
export async function Marcas({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'marcas' });
  const meio = Math.ceil(marcas.length / 2);
  const segunda = [...marcas.slice(meio), ...marcas.slice(0, meio)];
  return (
    <section className="marcas secao" id="marcas" aria-labelledby="marcas-titulo">
      <div className="secao__fundo" aria-hidden="true">
        <div className="secao__camada" data-efeito="parallax" data-depth="0.2">
          <FundoShader variante="grao" />
        </div>
      </div>
      <div className="marcas__topo">
        <h2 id="marcas-titulo" className="titulo-secao" data-efeito="reveal" data-dividir="">{t('titulo')}</h2>
        <p className="marcas__linha" data-efeito="reveal">{t('linha')}</p>
        <p className="marcas__total" data-efeito="parallax" data-depth="-0.25" aria-hidden="true">
          <Contador valor={50} prefixo="+" />
        </p>
      </div>
      <div className="marcas__mural">
        <Esteira className="marcas__esteira">
          <ul className="marcas__lista" role="list">
            {marcas.map((m) => <li key={m.slug}>{logo(m)}</li>)}
          </ul>
        </Esteira>
        <Esteira className="marcas__esteira" sentido={-1} decorativa>
          <ul className="marcas__lista" role="list">
            {segunda.map((m) => <li key={m.slug}>{logo(m)}</li>)}
          </ul>
        </Esteira>
      </div>
    </section>
  );
}
