'use client';

import { Pause, Play } from 'lucide-react';
import { definirPausa, usePausa } from '@/lib/pausa';

// Controle único de movimento (WCAG 2.2.2): mora no cabeçalho fixo, alcança qualquer efeito em quadro.
// O ponto pulsante funciona como a luz de REC da câmera: aceso enquanto a página se move.
// O texto aparece como legenda no hover/foco (em ::before, fora da árvore de texto, porque fica
// transparente em repouso); para leitor de tela vale o aria-label.
export function ControleMovimento({ pausar, retomar }: { pausar: string; retomar: string }) {
  const pausado = usePausa();
  const rotulo = pausado ? retomar : pausar;
  return (
    <button
      type="button"
      className="controle-movimento"
      data-controle-movimento=""
      aria-pressed={pausado}
      aria-label={rotulo}
      onClick={() => definirPausa(!pausado)}
    >
      <span className="controle-movimento__rec" aria-hidden="true" />
      {pausado
        ? <Play className="icone" aria-hidden="true" strokeWidth={1.5} />
        : <Pause className="icone" aria-hidden="true" strokeWidth={1.5} />}
      <span className="controle-movimento__texto rotulo" aria-hidden="true" data-dica={rotulo} />
    </button>
  );
}
