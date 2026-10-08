// Leitura dos tokens de motion em JS (GSAP, Motion, R3F): a mesma linguagem de curvas e
// durações do CSS, sem valor fixo no componente.
export function token(nome: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

export function numero(nome: string, reserva = 0) {
  const v = parseFloat(token(nome));
  return Number.isFinite(v) ? v : reserva;
}

/** Duração em segundos a partir de um token em ms ou s. */
export function segundos(nome: string, reserva = 0.48) {
  const v = token(nome);
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return reserva;
  return v.endsWith('ms') ? n / 1000 : n;
}

/** Curva cubic-bezier do token como os quatro números que Motion e CustomEase aceitam. */
export function bezier(nome: string): [number, number, number, number] {
  const m = token(nome).match(/cubic-bezier\(([^)]+)\)/);
  const p = m?.[1].split(',').map(Number);
  return p && p.length === 4 && p.every(Number.isFinite) ? (p as [number, number, number, number]) : [0.16, 1, 0.3, 1];
}

export const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Tela pequena ou toque: canvas com menos pixels e menos camadas (guarda-corpo de mobile). */
export const telaLeve = () => window.matchMedia('(max-width: 47.99em), (pointer: coarse)').matches;
export const ponteiroFino = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
