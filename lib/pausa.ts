'use client';

import { useSyncExternalStore } from 'react';

// Pausa global do movimento automático (WCAG 2.2.2): um controle só para cena 3D, shaders,
// partículas, letreiros, prévias de vídeo e animações CSS contínuas. Fica no <html> como
// data-movimento="pausado" para o CSS e avisa os efeitos em JS por assinatura.
type Ouvinte = (pausado: boolean) => void;

const CHAVE = 'jam:movimento';
const ouvintes = new Set<Ouvinte>();
let pausado = false;
let lido = false;

function ler() {
  if (lido || typeof window === 'undefined') return pausado;
  lido = true;
  try {
    pausado = localStorage.getItem(CHAVE) === 'pausado';
  } catch { /* sem armazenamento: começa em movimento */ }
  if (pausado) document.documentElement.dataset.movimento = 'pausado';
  return pausado;
}

export function estaPausado() {
  return ler();
}

export function definirPausa(valor: boolean) {
  ler();
  pausado = valor;
  if (valor) document.documentElement.dataset.movimento = 'pausado';
  else delete document.documentElement.dataset.movimento;
  try {
    if (valor) localStorage.setItem(CHAVE, 'pausado');
    else localStorage.removeItem(CHAVE);
  } catch { /* preferência só desta visita */ }
  ouvintes.forEach((f) => f(valor));
}

export function ouvirPausa(f: Ouvinte) {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

export function usePausa() {
  return useSyncExternalStore(
    (avisar) => ouvirPausa(avisar),
    estaPausado,
    () => false,
  );
}
