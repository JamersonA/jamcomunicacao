'use client';

import { startTransition, useEffect, useRef, useState, type ComponentType } from 'react';
import { corDoToken } from '@/lib/cores';
import { estaPausado, ouvirPausa } from '@/lib/pausa';
import { ouvirTom } from '@/lib/tom';
import { depoisDoPrimeiroPaint } from '@/lib/primeiro-paint';
import { numero, ponteiroFino, reduzMovimento } from '@/lib/tokens';
import type { CoresCena } from './HeroCena';

type Cena = ComponentType<{
  alvo: { current: { x: number; y: number } };
  ativo: boolean;
  cores: CoresCena;
  poeira: number;
  aoFlash: (v: number) => void;
}>;

const doisDigitos = (n: number) => String(Math.floor(n)).padStart(2, '0');

// Liga a luz do hero: o refletor 3D (React Three Fiber) segue o cursor com inércia, ou deriva sozinho
// em toque; a mesma posição revela o título dourado. Também corre o timecode do visor e repassa os
// flashes da cena ao CSS (--flash). A pausa vem do controle global de movimento.
export function HeroLuz() {
  const camada = useRef<HTMLDivElement>(null);
  const alvo = useRef({ x: 0.68, y: 0.45 });
  const [Componente, setComponente] = useState<Cena | null>(null);
  const [cores, setCores] = useState<CoresCena | null>(null);
  const [ativo, setAtivo] = useState(false);
  const [poeira, setPoeira] = useState(0);

  useEffect(() => {
    const el = camada.current;
    const hero = el?.closest<HTMLElement>('.hero');
    if (!el || !hero) return;

    const reduzido = reduzMovimento();
    const cursorFino = ponteiroFino();
    const inercia = numero('--inercia-luz', 0.06);
    const ouro = hero.querySelector<HTMLElement>('.hero__titulo-ouro');
    const relogio = hero.querySelector<HTMLElement>('[data-timecode]');
    const caixa = { w: 1, h: 1, x: 0, y: 0 };
    const medir = () => {
      const h = hero.getBoundingClientRect();
      const o = ouro?.getBoundingClientRect();
      caixa.w = h.width; caixa.h = h.height;
      caixa.x = o ? o.left - h.left : 0;
      caixa.y = o ? o.top - h.top : 0;
    };
    medir();

    let quadro = 0;
    let visivel = true;
    let destruido = false;
    let decorrido = 0;
    let ultimo = performance.now();
    const atual = alvo.current;
    const destino = { ...atual };

    const aplicar = () => {
      hero.style.setProperty('--luz-x', `${(atual.x * 100).toFixed(2)}%`);
      hero.style.setProperty('--luz-y', `${(atual.y * 100).toFixed(2)}%`);
      ouro?.style.setProperty('--luz-lx', `${(atual.x * caixa.w - caixa.x).toFixed(1)}px`);
      ouro?.style.setProperty('--luz-ly', `${(atual.y * caixa.h - caixa.y).toFixed(1)}px`);
    };
    // Timecode do visor em 24 quadros por segundo, contado só com a luz ligada
    const marcar = () => {
      if (!relogio) return;
      const s = decorrido;
      relogio.textContent = `${doisDigitos(s / 3600)}:${doisDigitos((s / 60) % 60)}:${doisDigitos(s % 60)}:${doisDigitos((s % 1) * 24)}`;
    };

    const passo = (agora: number) => {
      quadro = 0;
      decorrido += Math.min(0.1, (agora - ultimo) / 1000);
      ultimo = agora;
      if (!cursorFino) {
        // Sem cursor: a luz passeia devagar por uma lemniscata
        destino.x = 0.6 + 0.18 * Math.sin(decorrido * 0.23);
        destino.y = 0.48 + 0.16 * Math.sin(decorrido * 0.46);
      }
      atual.x += (destino.x - atual.x) * inercia;
      atual.y += (destino.y - atual.y) * inercia;
      aplicar();
      marcar();
      agendar();
    };
    const ligado = () => !destruido && visivel && !estaPausado() && !reduzido;
    const agendar = () => {
      if (!quadro && ligado()) { ultimo = performance.now(); quadro = requestAnimationFrame(passo); }
    };
    const parar = () => { cancelAnimationFrame(quadro); quadro = 0; };
    const sincronizar = () => {
      setAtivo(ligado());
      if (ligado()) agendar(); else parar();
    };

    const mover = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      destino.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      destino.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    };
    if (cursorFino && !reduzido) hero.addEventListener('pointermove', mover, { passive: true });

    const observador = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; sincronizar(); });
    observador.observe(hero);
    const semPausa = ouvirPausa(sincronizar);
    const lerCores = () => ({
      luz: corDoToken('--cor-luz', '#c4702e'),
      ouro: corDoToken('--cor-ouro', '#e8b85c'),
      pico: corDoToken('--cor-pico', '#fff1d2'),
    });
    // Troca de tom: a cena refaz feixe e fonte com as cores novas
    const semTom = ouvirTom(() => setCores((atuais) => (atuais ? lerCores() : atuais)));
    const aoRedimensionar = () => { medir(); aplicar(); };
    window.addEventListener('resize', aoRedimensionar, { passive: true });
    aplicar();
    marcar();

    // A cena chega depois do primeiro paint: título e foto já estão na tela (LCP)
    const cancelarCarga = depoisDoPrimeiroPaint(async () => {
      const m = await import('./HeroCena');
      if (destruido) return;
      // Transição: o React monta a cena em fatias e não trava a thread principal num bloco só
      startTransition(() => {
        setCores(lerCores());
        setPoeira(reduzido ? 0 : matchMedia('(min-width: 48em)').matches ? 140 : 70);
        setComponente(() => m.default as Cena);
      });
      el.dataset.pronto = '';
      sincronizar();
    });

    return () => {
      destruido = true;
      parar();
      observador.disconnect();
      semPausa();
      semTom();
      hero.removeEventListener('pointermove', mover);
      window.removeEventListener('resize', aoRedimensionar);
      cancelarCarga();
    };
  }, []);

  const aoFlash = (v: number) => {
    camada.current?.closest<HTMLElement>('.hero')?.style.setProperty('--flash', v.toFixed(3));
  };

  return (
    <div ref={camada} className="hero__cena" data-efeito="3d shader" aria-hidden="true">
      {Componente && cores && <Componente alvo={alvo} ativo={ativo} cores={cores} poeira={poeira} aoFlash={aoFlash} />}
    </div>
  );
}
