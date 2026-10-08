'use client';

import autoAnimate from '@formkit/auto-animate';
import useEmblaCarousel from 'embla-carousel-react';
import { animate } from 'motion';
import { ArrowLeft, ArrowRight, Play, Plus, Minus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { bezier, ponteiroFino, reduzMovimento, segundos } from '@/lib/tokens';
import { Previa } from './Previa';

export type Peca = { slug: string; marca: string; titulo: string | null; largura: number; altura: number };
type Textos = {
  maisTitulo: string;
  assistir: string;
  dica: string;
  anterior: string;
  proximo: string;
  carrossel: string;
  slide: string;
  verMais: string;
  verMenos: string;
};

const dois = (n: number) => String(n).padStart(2, '0');
const INICIAIS = 8;

// Inclinação 3D com física de mola (Motion), só com cursor fino e sem movimento reduzido.
function useInclinar<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !ponteiroFino() || reduzMovimento()) return;
    const mola = { type: 'spring' as const, stiffness: 180, damping: 18, mass: 0.6 };
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--brilho-x', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--brilho-y', `${(y + 0.5) * 100}%`);
      animate(el, { rotateY: x * 10, rotateX: -y * 10, scale: 1.02 }, mola);
    };
    const sair = () => animate(el, { rotateY: 0, rotateX: 0, scale: 1 }, mola);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerleave', sair);
    return () => { el.removeEventListener('pointermove', mover); el.removeEventListener('pointerleave', sair); };
  }, []);
  return ref;
}

function Cartao({ p, n, assistir, destaque }: { p: Peca; n: number; assistir: string; destaque?: boolean }) {
  const [antes, depois = ''] = assistir.split('{titulo}');
  const ref = useInclinar<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      className={destaque ? 'cartao cartao--destaque' : 'cartao'}
      data-cinema={p.slug}
      data-cursor={assistir.replace('{titulo}', '').replace(/[:\s]+$/, '') || undefined}
    >
      <span className="cartao__quadro">
        <Previa slug={p.slug} largura={p.largura} altura={p.altura} className="cartao__video" />
        <span className="cartao__brilho" aria-hidden="true" />
        <span className="cartao__mira" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="cartao__tocar" aria-hidden="true"><Play className="icone" strokeWidth={1.5} /></span>
        <span className="cartao__numero rotulo" aria-hidden="true">{dois(n)}</span>
      </span>
      {/* O nome acessível sai da própria legenda (WCAG 2.5.3: contém o texto visível); o verbo e a
          vírgula só o leitor de tela ouve */}
      <span className="cartao__legenda">
        {antes ? <span className="so-leitor">{antes}</span> : null}
        <span className="cartao__marca">{p.marca}</span>
        {p.titulo ? <><span className="so-leitor">, </span><span className="cartao__titulo">{p.titulo}</span></> : null}
        {depois ? <span className="so-leitor">{depois}</span> : null}
      </span>
    </button>
  );
}

export function Acervo({ destaques, outros, textos }: { destaques: Peca[]; outros: Peca[]; textos: Textos }) {
  const [emblaRef, embla] = useEmblaCarousel({ align: 'start', dragFree: true, containScroll: 'trimSnaps' });
  const barra = useRef<HTMLSpanElement>(null);
  const [atual, setAtual] = useState(0);
  const [limites, setLimites] = useState({ antes: false, depois: true });
  const [todos, setTodos] = useState(false);
  const grade = useRef<HTMLUListElement>(null);

  // Cartões que entram e saem da grade (AutoAnimate), na curva e duração dos tokens.
  useEffect(() => {
    if (!grade.current) return;
    const controle = autoAnimate(grade.current, {
      duration: segundos('--dur-media') * 1000,
      easing: `cubic-bezier(${bezier('--ease-saida').join(', ')})`,
      disrespectUserMotionPreference: false,
    });
    return () => controle.disable();
  }, []);

  // Progresso da película e parallax interno: cada prévia corre um pouco mais devagar que o cartão.
  useEffect(() => {
    if (!embla) return;
    const parallax = !reduzMovimento();
    const aoRolar = () => {
      const progresso = Math.max(0, Math.min(1, embla.scrollProgress()));
      barra.current?.style.setProperty('--progresso', String(progresso));
      if (!parallax) return;
      const snaps = embla.scrollSnapList();
      const nos = embla.slideNodes();
      embla.slidesInView().forEach((i) => {
        const alvo = snaps[Math.min(i, snaps.length - 1)] ?? 0;
        const desvio = (alvo - embla.scrollProgress()) * -14;
        nos[i]?.querySelector<HTMLElement>('.cartao__video')?.style.setProperty('--desvio', `${desvio}%`);
      });
    };
    const aoSelecionar = () => {
      setAtual(embla.selectedScrollSnap());
      setLimites({ antes: embla.canScrollPrev(), depois: embla.canScrollNext() });
    };
    aoRolar();
    aoSelecionar();
    embla.on('scroll', aoRolar).on('reInit', aoRolar).on('select', aoSelecionar).on('reInit', aoSelecionar);
    return () => { embla.off('scroll', aoRolar).off('reInit', aoRolar).off('select', aoSelecionar).off('reInit', aoSelecionar); };
  }, [embla]);

  // Foco por teclado num cartão fora de quadro traz a película até ele.
  const aoFocar = (e: React.FocusEvent<HTMLOListElement>) => {
    const li = (e.target as HTMLElement).closest('li');
    const i = li ? [...e.currentTarget.children].indexOf(li) : -1;
    if (embla && i >= 0 && !embla.slidesInView().includes(i)) embla.scrollTo(i);
  };

  // "Ver mais": os novos cartões entram em cascata (AutoAnimate) e o botão desliza junto.
  const alternarTodos = () => {
    setTodos((v) => !v);
    if (!reduzMovimento()) {
      const alvo = document.querySelector<HTMLElement>('.acervo__mais');
      if (alvo) animate(alvo, { opacity: [0.6, 1] }, { duration: segundos('--dur-media'), ease: bezier('--ease-saida') });
    }
  };

  const lista = todos ? outros : outros.slice(0, INICIAIS);
  const total = destaques.length;

  return (
    <div className="acervo">
      <div className="pelicula" role="region" aria-roledescription="carousel" aria-label={textos.carrossel}>
        <div className="pelicula__viewport" ref={emblaRef}>
          <ol className="pelicula__trilho" role="list" onFocus={aoFocar}>
            {destaques.map((p, i) => (
              <li key={p.slug} className="pelicula__slide" aria-roledescription="slide" aria-label={textos.slide.replace('{n}', String(i + 1)).replace('{total}', String(total))}>
                <Cartao p={p} n={i + 1} assistir={textos.assistir} destaque />
              </li>
            ))}
          </ol>
        </div>

        <div className="pelicula__comandos">
          <span className="pelicula__contador rotulo" aria-hidden="true">
            <span className="pelicula__atual">{dois(atual + 1)}</span> / {dois(total)}
          </span>
          <span className="pelicula__progresso" aria-hidden="true"><span ref={barra} /></span>
          <p className="pelicula__dica rotulo">{textos.dica}</p>
          <button type="button" className="botao-redondo" onClick={() => limites.antes && embla?.scrollPrev()} aria-disabled={!limites.antes} aria-label={textos.anterior}>
            <ArrowLeft className="icone" aria-hidden="true" strokeWidth={1.5} />
          </button>
          <button type="button" className="botao-redondo" onClick={() => limites.depois && embla?.scrollNext()} aria-disabled={!limites.depois} aria-label={textos.proximo}>
            <ArrowRight className="icone" aria-hidden="true" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="acervo__outros">
        <h3 className="acervo__titulo" data-efeito="reveal">{textos.maisTitulo}</h3>
        <ul className="acervo__grade" role="list" ref={grade}>
          {lista.map((p, i) => (
            <li key={p.slug}>
              <Cartao p={p} n={total + i + 1} assistir={textos.assistir} />
            </li>
          ))}
        </ul>
        {outros.length > INICIAIS && (
          <button type="button" className="acervo__mais botao-linha" onClick={alternarTodos} aria-expanded={todos}>
            {todos ? <Minus className="icone" aria-hidden="true" strokeWidth={1.5} /> : <Plus className="icone" aria-hidden="true" strokeWidth={1.5} />}
            <span>{(todos ? textos.verMenos : textos.verMais).replace('{n}', String(outros.length - INICIAIS))}</span>
          </button>
        )}
      </div>
    </div>
  );
}
