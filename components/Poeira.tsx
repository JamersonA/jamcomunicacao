'use client';

import { useEffect, useRef } from 'react';
import { corDoToken, variar } from '@/lib/cores';
import { estaPausado, ouvirPausa } from '@/lib/pausa';
import { depoisDoPrimeiroPaint } from '@/lib/primeiro-paint';
import { ouvirTom } from '@/lib/tom';
import { reduzMovimento } from '@/lib/tokens';

// Poeira dourada na luz (tsParticles, pacote slim): sobe devagar, reage ao cursor fino e some sob
// movimento reduzido. Montada perto da tela, parada fora dela e com a pausa global.
export function Poeira({ className, quantidade = 70 }: { className?: string; quantidade?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduzMovimento()) return;
    type Recipiente = { pause(): void; play(): void; destroy(): void };
    let recipiente: Recipiente | undefined;
    let visivel = false;
    let encerrado = false;
    let pronto = false;

    const sincronizar = () => {
      if (!recipiente) return;
      if (visivel && !estaPausado()) recipiente.play(); else recipiente.pause();
    };

    const montar = async () => {
      if (recipiente || encerrado) return;
      const [{ tsParticles }, { loadSlim }] = await Promise.all([import('@tsparticles/engine'), import('@tsparticles/slim')]);
      await loadSlim(tsParticles);
      if (encerrado) return;
      const ouro = corDoToken('--cor-ouro', '#e8b85c');
      const pico = corDoToken('--cor-pico', '#fff1d2');
      const celular = !window.matchMedia('(min-width: 48em)').matches;
      recipiente = (await tsParticles.load({
        element: el,
        options: {
          fullScreen: { enable: false },
          detectRetina: true,
          fpsLimit: 60,
          background: { color: { value: 'transparent' } },
          particles: {
            number: { value: celular ? Math.round(quantidade / 2) : quantidade },
            paint: { fill: { enable: true, color: { value: [ouro, pico, variar(ouro, { l: -0.15 })] } } },
            shape: { type: 'circle' },
            size: { value: { min: 0.6, max: 2.4 } },
            opacity: { value: { min: 0.15, max: 0.85 }, animation: { enable: true, speed: 0.8, sync: false } },
            move: { enable: true, speed: { min: 0.15, max: 0.6 }, direction: 'top', random: true, straight: false, outModes: { default: 'out' } },
            wobble: { enable: true, distance: 6, speed: 4 },
          },
          interactivity: {
            events: { onHover: { enable: !celular, mode: 'repulse' } },
            modes: { repulse: { distance: 90, speed: 0.4 } },
          },
        } as never,
      })) as unknown as Recipiente;
      sincronizar();
    };

    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && pronto) montar();
      sincronizar();
    }, { rootMargin: '20% 0px' });
    const cancelar = depoisDoPrimeiroPaint(() => { pronto = true; if (visivel) montar(); });
    io.observe(el);
    const semPausa = ouvirPausa(sincronizar);
    // Troca de tom: remonta as partículas com as cores novas
    const semTom = ouvirTom(() => {
      if (!recipiente) return;
      recipiente.destroy();
      recipiente = undefined;
      montar();
    });
    return () => {
      encerrado = true;
      io.disconnect();
      cancelar();
      semPausa();
      semTom();
      recipiente?.destroy();
    };
  }, [quantidade]);

  return <div ref={ref} className={`poeira ${className ?? ''}`} data-efeito="particulas" aria-hidden="true" />;
}
