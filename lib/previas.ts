'use client';

import { estaPausado, ouvirPausa } from './pausa';
import { reduzMovimento } from './tokens';

// Gerente único das prévias em vídeo (mudas, em loop): carrega o arquivo só quando a peça chega
// perto da tela, toca só o que está em quadro e limita quantas tocam juntas, para o celular não
// decodificar dez vídeos ao mesmo tempo. Respeita a pausa global e o movimento reduzido.
const visiveis = new Map<HTMLVideoElement, number>();
const tocando = new Set<HTMLVideoElement>();
let observador: IntersectionObserver | null = null;
let vizinhanca: IntersectionObserver | null = null;
let cartazes: IntersectionObserver | null = null;

const limite = () => (window.matchMedia('(min-width: 60em)').matches ? 4 : 2);
const podeTocar = () => !estaPausado() && !reduzMovimento();

function carregar(video: HTMLVideoElement) {
  const src = video.dataset.src;
  if (src && !video.src) {
    video.src = src;
    video.preload = 'auto';
  }
}

function parar(video: HTMLVideoElement) {
  video.pause();
  tocando.delete(video);
}

function distribuir() {
  if (!podeTocar()) {
    tocando.forEach(parar);
    return;
  }
  // Os mais em quadro primeiro; os demais esperam vaga.
  const ordem = [...visiveis.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
  const escolhidos = new Set(ordem.slice(0, limite()));
  tocando.forEach((v) => { if (!escolhidos.has(v)) parar(v); });
  escolhidos.forEach((v) => {
    if (tocando.has(v)) return;
    carregar(v);
    tocando.add(v);
    v.play().catch(() => tocando.delete(v));
  });
}

function iniciar() {
  observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting && e.intersectionRatio >= 0.35) visiveis.set(v, e.intersectionRatio);
      else visiveis.delete(v);
    });
    distribuir();
  }, { threshold: [0, 0.35, 0.6, 0.9] });
  // Pré-carrega o metadado um pouco antes de entrar, para a prévia já surgir em movimento.
  vizinhanca = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting && podeTocar()) carregar(e.target as HTMLVideoElement); });
  }, { rootMargin: '0px 50% 50% 50%' });
  // O pôster (repouso, e único quadro sob movimento reduzido) chega uma tela antes.
  cartazes = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      const v = e.target as HTMLVideoElement;
      if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
      cartazes?.unobserve(v);
    });
  }, { rootMargin: '100% 50% 100% 50%' });
  ouvirPausa(distribuir);
}

export function observarPrevia(video: HTMLVideoElement) {
  if (!observador) iniciar();
  observador!.observe(video);
  vizinhanca!.observe(video);
  cartazes!.observe(video);
  return () => {
    cartazes?.unobserve(video);
    observador?.unobserve(video);
    vizinhanca?.unobserve(video);
    visiveis.delete(video);
    parar(video);
  };
}

/** Pausa todas as prévias (o player em tela cheia assume o som e a decodificação). */
export function suspenderPrevias(suspender: boolean) {
  if (suspender) tocando.forEach(parar);
  else distribuir();
}

