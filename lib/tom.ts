'use client';

import { useSyncExternalStore } from 'react';

// Tom de cor do site (Low Key). Fica no <html> como data-tom; o CSS troca os tokens e os efeitos
// em JS (shaders, cena 3D, partículas) releem as cores por assinatura. A escolha vem de ?tom=,
// senão da última escolhida nesta máquina, senão do padrão que o servidor pôs no <html>.
export const TONS = ['low-key', 'original'] as const;
export type Tom = (typeof TONS)[number];

type Ouvinte = (tom: Tom) => void;

const CHAVE = 'jam:tom';
const PADRAO: Tom = 'low-key';
const ouvintes = new Set<Ouvinte>();

const valido = (v: string | null | undefined): v is Tom => !!v && (TONS as readonly string[]).includes(v);

function aplicar(tom: Tom) {
  if (tom === 'original') delete document.documentElement.dataset.tom;
  else document.documentElement.dataset.tom = tom;
}

export function tomAtual(): Tom {
  if (typeof document === 'undefined') return PADRAO;
  return document.documentElement.dataset.tom as Tom | undefined ?? 'original';
}

/** Aplica o tom pedido na URL ou guardado; roda uma vez, antes dos efeitos lerem as cores. */
export function restaurarTom() {
  let tom: string | null = new URLSearchParams(window.location.search).get('tom');
  if (!valido(tom)) {
    try { tom = localStorage.getItem(CHAVE); } catch { tom = null; }
  }
  if (valido(tom) && tom !== tomAtual()) definirTom(tom);
}

export function definirTom(tom: Tom) {
  aplicar(tom);
  try { localStorage.setItem(CHAVE, tom); } catch { /* escolha só desta visita */ }
  ouvintes.forEach((f) => f(tom));
}

export function ouvirTom(f: Ouvinte) {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

export function useTom() {
  return useSyncExternalStore((avisar) => ouvirTom(avisar), tomAtual, () => PADRAO);
}
