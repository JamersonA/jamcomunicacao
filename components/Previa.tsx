'use client';

import { useEffect, useRef } from 'react';
import { observarPrevia } from '@/lib/previas';

// Prévia muda em loop de uma peça. O pôster é o estado de repouso (e o único quadro sob
// movimento reduzido); pôster e vídeo só baixam quando a peça chega perto da tela, para não
// disputarem a rede com a foto do hero (LCP).
export function Previa({ slug, largura, altura, className, src, poster }: {
  slug: string; largura: number; altura: number; className?: string; src?: string; poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // O React não serializa `muted` no HTML; sem ele o navegador recusa o autoplay.
    video.muted = true;
    return observarPrevia(video);
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      data-src={src ?? `/previas/${slug}.mp4`}
      data-poster={poster ?? `/imagens/posteres/${slug}.webp`}
      width={largura}
      height={altura}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
