'use client';

import { useEffect, useRef } from 'react';
import { depoisDoPrimeiroPaint } from '@/lib/primeiro-paint';
import { numero, ponteiroFino, reduzMovimento } from '@/lib/tokens';

// Anel que acompanha o cursor fino com atraso (GSAP quickTo) e se abre em rótulo sobre o que
// tem [data-cursor] ("Assistir"). Companhia visual: o cursor nativo continua lá.
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !ponteiroFino() || reduzMovimento()) return;
    const rotulo = el.querySelector<HTMLElement>('.cursor__rotulo');
    let limpar = () => {};
    const cancelar = depoisDoPrimeiroPaint(async () => {
      const { gsap } = await import('gsap');
      const atraso = numero('--cursor-atraso', 0.35);
      const irX = gsap.quickTo(el, 'x', { duration: atraso, ease: 'power3.out' });
      const irY = gsap.quickTo(el, 'y', { duration: atraso, ease: 'power3.out' });
      let px = -1;
      let py = -1;
      let quadro = 0;
      const marcar = (sob: Element | null) => {
        const alvo = sob?.closest<HTMLElement>('[data-cursor], a, button');
        const texto = alvo?.dataset.cursor;
        el.dataset.estado = texto ? 'rotulo' : alvo ? 'link' : '';
        if (rotulo && texto && rotulo.textContent !== texto) rotulo.textContent = texto;
      };
      const mover = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        el.dataset.visivel = '';
        px = e.clientX;
        py = e.clientY;
        irX(px);
        irY(py);
        marcar(e.target as Element | null);
      };
      const sair = () => { delete el.dataset.visivel; };
      // Fechar o player ou rolar a página troca o que está sob o mouse sem pointermove: o anel relê
      // o ponto (uma vez por quadro) em vez de ficar preso no rótulo "Assistir" do que já saiu dali.
      const reler = () => {
        if (px < 0 || quadro) return;
        quadro = requestAnimationFrame(() => { quadro = 0; marcar(document.elementFromPoint(px, py)); });
      };
      document.addEventListener('pointermove', mover, { passive: true });
      document.documentElement.addEventListener('pointerleave', sair);
      window.addEventListener('jam:rolagem', reler);
      window.addEventListener('scroll', reler, { passive: true });
      limpar = () => {
        document.removeEventListener('pointermove', mover);
        document.documentElement.removeEventListener('pointerleave', sair);
        window.removeEventListener('jam:rolagem', reler);
        window.removeEventListener('scroll', reler);
        cancelAnimationFrame(quadro);
      };
    });
    return () => { cancelar(); limpar(); };
  }, []);
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor__anel" />
      <span className="cursor__rotulo rotulo" />
    </div>
  );
}
