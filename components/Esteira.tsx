'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { estaPausado, ouvirPausa } from '@/lib/pausa';
import { depoisDoPrimeiroPaint } from '@/lib/primeiro-paint';
import { numero, reduzMovimento } from '@/lib/tokens';

// Esteira infinita em GSAP: corre sozinha e acelera e inclina com a velocidade da rolagem,
// voltando ao ritmo de base com inércia. A segunda cópia, só visual, fecha o laço.
// Parada fora da tela, com a pausa global e sob movimento reduzido.
export function Esteira({
  children,
  sentido = 1,
  className,
  decorativa = false,
}: {
  children: ReactNode;
  sentido?: 1 | -1;
  className?: string;
  decorativa?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduzMovimento()) return;
    type Tween = { play(): void; pause(): void; kill(): void; timeScale(v?: number): number };
    let laco: Tween | undefined;
    let gatilho: { kill(): void } | undefined;
    let visivel = false;
    let destruido = false;

    const sincronizar = () => {
      if (!laco) return;
      if (visivel && !estaPausado()) laco.play(); else laco.pause();
    };

    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; sincronizar(); });
    io.observe(el);
    const semPausa = ouvirPausa(sincronizar);

    const cancelar = depoisDoPrimeiroPaint(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (destruido) return;
      gsap.registerPlugin(ScrollTrigger);
      const trilho = el.querySelector<HTMLElement>('.esteira__trilho');
      if (!trilho) return;
      const duracao = numero('--esteira-duracao', 38);
      const ganho = numero('--esteira-ganho', 3.5);
      const inclinacao = numero('--esteira-inclinacao', 5);
      laco = gsap.fromTo(
        trilho,
        { xPercent: sentido > 0 ? 0 : -50 },
        { xPercent: sentido > 0 ? -50 : 0, duration: duracao, ease: 'none', repeat: -1 },
      ) as unknown as Tween;
      const inclinar = gsap.quickTo(trilho, 'skewX', { duration: 0.5, ease: 'power3.out' });
      gatilho = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (s) => {
          if (!laco || estaPausado()) return;
          const v = s.getVelocity();
          const forca = Math.min(1, Math.abs(v) / 2500);
          gsap.to(laco, { timeScale: 1 + forca * ganho, duration: 0.15, overwrite: true, onComplete: () => {
            gsap.to(laco!, { timeScale: 1, duration: 1.1, ease: 'power2.out' });
          } });
          inclinar(-Math.sign(v) * sentido * forca * inclinacao);
        },
        onLeave: () => inclinar(0),
        onLeaveBack: () => inclinar(0),
      });
      sincronizar();
    });

    return () => {
      destruido = true;
      cancelar();
      io.disconnect();
      semPausa();
      laco?.kill();
      gatilho?.kill();
    };
  }, [sentido]);

  return (
    <div ref={ref} className={`esteira ${className ?? ''}`} aria-hidden={decorativa || undefined}>
      <div className="esteira__trilho">
        <div className="esteira__grupo">{children}</div>
        <div className="esteira__grupo" aria-hidden="true" inert>{children}</div>
      </div>
    </div>
  );
}
