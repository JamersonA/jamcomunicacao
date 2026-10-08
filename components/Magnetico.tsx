'use client';

import { animate } from 'motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { ponteiroFino, reduzMovimento } from '@/lib/tokens';

// Atração magnética com mola (Motion): o filho segue o cursor dentro da própria área e volta
// ao lugar ao sair. Só com cursor fino; em toque e sob movimento reduzido fica parado.
export function Magnetico({ children, forca = 0.3 }: { children: ReactNode; forca?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !ponteiroFino() || reduzMovimento()) return;
    const mola = { type: 'spring' as const, stiffness: 220, damping: 16, mass: 0.5 };
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * forca;
      const y = (e.clientY - r.top - r.height / 2) * forca;
      animate(el, { x, y }, mola);
    };
    const soltar = () => animate(el, { x: 0, y: 0 }, mola);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerleave', soltar);
    return () => {
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerleave', soltar);
    };
  }, [forca]);
  return <span ref={ref} className="magnetico">{children}</span>;
}
