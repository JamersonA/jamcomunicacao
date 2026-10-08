'use client';

import { startTransition, useEffect, useRef, useState, type ComponentType } from 'react';
import { corDoToken, variar } from '@/lib/cores';
import { estaPausado, ouvirPausa } from '@/lib/pausa';
import { ouvirTom } from '@/lib/tom';
import { depoisDoPrimeiroPaint } from '@/lib/primeiro-paint';
import { numero, reduzMovimento, telaLeve } from '@/lib/tokens';

type Variante = 'grao' | 'raios' | 'malha';
type Shader = ComponentType<Record<string, unknown>>;

// Fundo vivo das seções em Paper Shaders: carregado sob demanda quando a seção se aproxima,
// parado fora da tela e com a pausa global. As cores saem dos tokens via Culori.
function parametros(variante: Variante) {
  const fundo = corDoToken('--cor-fundo', '#090807');
  const luz = corDoToken('--cor-luz', '#c4702e');
  const ouro = corDoToken('--cor-ouro', '#e8b85c');
  const nevoa = corDoToken('--cor-nevoa', '#24201b');
  switch (variante) {
    case 'grao':
      return {
        colorBack: fundo,
        colors: [variar(nevoa, { l: 0.01 }), variar(luz, { l: -0.34, c: 0.7 }), variar(ouro, { l: -0.48, c: 0.5 })],
        softness: 0.9,
        intensity: 0.22,
        noise: 0.4,
        shape: 'wave',
        scale: 1.4,
      };
    case 'raios':
      return {
        colorBack: fundo,
        colorBloom: variar(luz, { l: -0.15 }),
        colors: [variar(ouro, { l: -0.3, alpha: 0.5 }), variar(luz, { l: -0.25, alpha: 0.45 }), variar(nevoa, { alpha: 0.6 })],
        density: 0.25,
        spotty: 0.3,
        midSize: 0.2,
        midIntensity: 0.4,
        intensity: 0.5,
        bloom: 0.35,
        offsetY: -0.6,
      };
    case 'malha':
      return {
        colors: [fundo, variar(nevoa, { l: 0.01 }), variar(luz, { l: -0.3, c: 0.7 }), fundo],
        distortion: 0.8,
        swirl: 0.35,
        grainMixer: 0.2,
        grainOverlay: 0.12,
      };
  }
}

export function FundoShader({ variante, className }: { variante: Variante; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Componente, setComponente] = useState<Shader | null>(null);
  const [props, setProps] = useState<Record<string, unknown> | null>(null);
  const [ativo, setAtivo] = useState(false);
  const [leve] = useState(() => typeof window !== 'undefined' && telaLeve());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visivel = false;
    let carregado = false;
    const atualizar = () => setAtivo(visivel && !estaPausado() && !reduzMovimento());
    const carregar = () => {
      if (carregado) return;
      carregado = true;
      import('@paper-design/shaders-react').then((m) => {
        const mapa = { grao: m.GrainGradient, raios: m.GodRays, malha: m.MeshGradient } as unknown as Record<Variante, Shader>;
        startTransition(() => {
          setProps(parametros(variante));
          setComponente(() => mapa[variante]);
        });
      });
    };
    let pronto = false;
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && pronto) carregar();
      atualizar();
    }, { rootMargin: '30% 0px' });
    const cancelar = depoisDoPrimeiroPaint(() => { pronto = true; if (visivel) carregar(); });
    io.observe(el);
    const semPausa = ouvirPausa(atualizar);
    // Troca de tom: relê as cores dos tokens
    const semTom = ouvirTom(() => { if (carregado) setProps(parametros(variante)); });
    return () => { io.disconnect(); cancelar(); semPausa(); semTom(); };
  }, [variante]);

  return (
    <div ref={ref} className={`fundo-shader ${className ?? ''}`} data-efeito="shader" aria-hidden="true">
      {Componente && props && (
        <Componente
          className="fundo-shader__tela"
          {...props}
          speed={ativo ? numero('--shader-velocidade', 0.35) : 0}
          minPixelRatio={1}
          maxPixelCount={leve ? 640 * 360 : 1280 * 720}
        />
      )}
    </div>
  );
}
