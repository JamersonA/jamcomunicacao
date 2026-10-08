'use client';

import { animate } from 'motion';
import { useEffect, useRef } from 'react';
import { bezier, reduzMovimento, segundos } from '@/lib/tokens';

// Número que conta até o valor quando entra na tela (Motion). O HTML já traz o valor final,
// e o leitor de tela lê só ele; a contagem é a camada visual por cima.
export function Contador({ valor, prefixo = '', sufixo = '' }: { valor: number; prefixo?: string; sufixo?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduzMovimento()) return;
    let parar: (() => void) | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const controle = animate(0, valor, {
        duration: segundos('--dur-contagem', 1.8),
        ease: bezier('--ease-saida'),
        onUpdate: (v) => { el.textContent = `${prefixo}${Math.round(v)}${sufixo}`; },
      });
      parar = () => controle.stop();
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); parar?.(); };
  }, [valor, prefixo, sufixo]);
  return (
    <>
      <span ref={ref} className="contador" aria-hidden="true">{prefixo}{valor}{sufixo}</span>
      <span className="so-leitor">{prefixo}{valor}{sufixo}</span>
    </>
  );
}
