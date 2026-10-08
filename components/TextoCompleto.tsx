'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';

// Texto integral do Jam atrás de um botão. Região com `hidden` (não <details>): fechada, ela
// sai da árvore de acessibilidade e da contagem de texto visível.
export function TextoCompleto({ rotulo, paragrafos }: { rotulo: string; paragrafos: string[] }) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  return (
    <div className="completo">
      <button
        type="button"
        className="completo__botao rotulo"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((a) => !a)}
      >
        <Plus className="icone" aria-hidden="true" strokeWidth={1.5} />
        {rotulo}
      </button>
      <div id={id} className="completo__texto" hidden={!aberto}>
        {paragrafos.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}
