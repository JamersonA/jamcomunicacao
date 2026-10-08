'use client';

import { useEffect, useRef } from 'react';
import { IconeWhatsapp } from '@/components/IconeWhatsapp';
import { liberarCanto } from '@/lib/canto-livre';

// Pílula fixa no canto: o WhatsApp do Jam sempre a um clique, com a marca pequena na altura do texto.
// Sai de cena quando a seção de contato ou o rodapé entram em quadro, onde ele só repetiria o que
// já está na tela, e quando os botões do hero, do showreel ou da película aparecem no mesmo canto,
// para não cobri-los.
export function ContatoFixo({ texto, rotulo, href }: { texto: string; rotulo: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return liberarCanto(ref.current, '.hero__acoes, #contato, .rodape, .showreel__texto, .pelicula__comandos');
  }, []);
  return (
    <a ref={ref} className="contato-fixo rotulo" href={href} target="_blank" rel="noopener" aria-label={rotulo}>
      <IconeWhatsapp className="contato-fixo__marca" />
      {texto}
    </a>
  );
}
