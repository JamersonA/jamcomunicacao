'use client';

import { useEffect, useRef } from 'react';
import { liberarCanto } from '@/lib/canto-livre';
import { definirTom, restaurarTom, TONS, useTom, type Tom } from '@/lib/tom';

// Seletor de tom: "low-key" (padrão, mais escuro e com luzes contidas) e "original" (o contraluz
// brilhoso). Os dois ficam disponíveis ao visitante.
// Restaura a escolha antes dos efeitos, que leem as cores depois do primeiro paint; uma troca
// depois disso avisa os efeitos, que releem as cores na hora. No celular só o tom atual aparece
// e cada toque passa ao outro.
type Textos = { rotulo: string } & Record<Tom, string>;

const proximo = (t: Tom) => TONS[(TONS.indexOf(t) + 1) % TONS.length];

export function LowKey({ textos }: { textos: Textos }) {
  const tom = useTom();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { restaurarTom(); }, []);
  // Sai do canto enquanto o botão do showreel, as setas da película ou os números do Sobre estão em
  // quadro, para não cobri-los.
  useEffect(() => (ref.current ? liberarCanto(ref.current, '.showreel__texto, .pelicula__comandos, .sobre__numeros') : undefined), []);
  return (
    <div ref={ref} className="seletor-tom" role="group" aria-label={textos.rotulo}>
      {TONS.map((t) => (
        <button
          key={t}
          type="button"
          className="seletor-tom__botao rotulo"
          aria-pressed={tom === t}
          onClick={() => definirTom(t === tom && !matchMedia('(min-width: 48em)').matches ? proximo(t) : t)}
        >
          {textos[t]}
        </button>
      ))}
    </div>
  );
}
