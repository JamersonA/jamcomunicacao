'use client';

import { useEffect, useState } from 'react';

const TOQUE = '(hover: none), (pointer: coarse)';

// Instrução de gesto conforme o ponteiro: no primeiro paint o CSS (.so-ponteiro/.so-toque) escolhe
// a frase; depois a outra sai da árvore com `hidden`, para leitor de tela e checagens de texto
// verem só a que vale neste aparelho.
export function Gesto({ ponteiro, toque }: { ponteiro: string; toque: string }) {
  const [ehToque, setEhToque] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = matchMedia(TOQUE);
    const ler = () => setEhToque(mq.matches);
    ler();
    mq.addEventListener('change', ler);
    return () => mq.removeEventListener('change', ler);
  }, []);
  return (
    <>
      <span className="so-ponteiro" hidden={ehToque === true}>{ponteiro}</span>
      <span className="so-toque" hidden={ehToque === false}>{toque}</span>
    </>
  );
}
