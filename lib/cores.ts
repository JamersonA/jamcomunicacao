import { formatHex, oklch, parse, rgb } from 'culori';

// Ponte entre os tokens de cor (CSS) e o que roda fora do CSS (WebGL, partículas, shaders).
// Culori lê o valor do token e deriva variações em OKLCH, sem cor fixa no componente.
export function corDoToken(nome: string, reserva = '#e8b85c') {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const cor = parse(valor);
  return cor ? formatHex(cor) : reserva;
}

/** Ajusta luminosidade, croma e opacidade em OKLCH e devolve hex (ou rgba quando há alpha). */
export function variar(hex: string, { l = 0, c = 1, alpha = 1 }: { l?: number; c?: number; alpha?: number } = {}) {
  const base = oklch(hex);
  if (!base) return hex;
  const nova = { ...base, l: Math.min(1, Math.max(0, base.l + l)), c: (base.c ?? 0) * c };
  if (alpha >= 1) return formatHex(nova);
  const r = rgb(nova);
  const canal = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255);
  return `rgba(${canal(r.r)}, ${canal(r.g)}, ${canal(r.b)}, ${alpha})`;
}
