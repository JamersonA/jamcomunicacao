'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { animate } from 'motion';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { suspenderPrevias } from '@/lib/previas';
import { bezier, reduzMovimento, segundos, token } from '@/lib/tokens';
import { urlVideo } from '@/lib/site';

export type ItemCinema = { slug: string; marca: string; titulo: string | null; largura: number; altura: number; youtube: string | null };

export type TextosCinema = {
  rotulo: string;
  fechar: string;
  anterior: string;
  proximo: string;
  tocar: string;
  pausar: string;
  som: string;
  semSom: string;
  telaCheia: string;
  sairTelaCheia: string;
  progresso: string;
  contador: string;
  previa: string;
  previaCurta: string;
  completo: string;
  atalhos: string;
};

const tempo = (s: number) => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

// Player de cinema: abre de qualquer [data-cinema] (cartões, showreel, apresentação) crescendo a
// partir do cartão clicado e navega por toda a obra (setas, arrasto, teclado). Cada peça abre na
// prévia curta em loop, e o completo só toca quando a pessoa clica em "Assistir completo", valendo
// só para aquela peça: trocou de slide, volta à prévia. Peça com YouTube toca o completo pelo embed
// (qualidade original, controles do próprio YouTube); sem ele, o arquivo do serviço de vídeo. Se o
// completo falha, volta à prévia com o aviso. Só o slide atual tem vídeo; os vizinhos mostram o pôster.
export function Cinema({ itens, textos }: { itens: ItemCinema[]; textos: TextosCinema }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const ambiente = useRef<HTMLCanvasElement>(null);
  const origem = useRef<DOMRect | null>(null);
  const [aberto, setAberto] = useState(false);
  const [atual, setAtual] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [cheia, setCheia] = useState(false);
  const [progresso, setProgresso] = useState({ t: 0, d: 0 });
  // Slug da peça em que a pessoa pediu o completo; qualquer outra fica na prévia.
  const [completo, setCompleto] = useState<string | null>(null);
  const [falhas, setFalhas] = useState<ReadonlySet<string>>(() => new Set());
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, skipSnaps: false, duration: 28 });

  const item = itens[atual];
  const falhou = item ? falhas.has(item.slug) : false;
  const emPrevia = !item || completo !== item.slug || falhou;
  const noYoutube = !emPrevia && Boolean(item?.youtube);

  // Abertura: clique delegado em qualquer gatilho da página.
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      const gatilho = (e.target as Element | null)?.closest<HTMLElement>('[data-cinema]');
      if (!gatilho) return;
      const i = itens.findIndex((it) => it.slug === gatilho.dataset.cinema);
      if (i < 0) return;
      e.preventDefault();
      origem.current = gatilho.getBoundingClientRect();
      setAtual(i);
      setCompleto(null);
      setAberto(true);
    };
    document.addEventListener('click', aoClicar);
    return () => document.removeEventListener('click', aoClicar);
  }, [itens]);

  // Mostra o diálogo modal e anima o recorte do cartão até a tela inteira.
  useEffect(() => {
    const d = dialogo.current;
    if (!aberto || !d) return;
    if (!d.open) d.showModal();
    document.documentElement.dataset.cinema = 'aberto';
    window.dispatchEvent(new CustomEvent('jam:rolagem', { detail: { parar: true } }));
    suspenderPrevias(true);
    const r = origem.current;
    if (palco.current && r && !reduzMovimento()) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const de = `inset(${r.top}px ${w - r.right}px ${h - r.bottom}px ${r.left}px round ${token('--raio-3')})`;
      animate(palco.current, { clipPath: [de, 'inset(0px 0px 0px 0px round 0px)'] }, { duration: segundos('--dur-lenta'), ease: bezier('--ease-saida') });
    }
  }, [aberto]);

  const fechar = useCallback(async () => {
    const d = dialogo.current;
    if (!d) return;
    video.current?.pause();
    const r = origem.current;
    if (palco.current && r && !reduzMovimento()) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      await animate(
        palco.current,
        { clipPath: `inset(${r.top}px ${w - r.right}px ${h - r.bottom}px ${r.left}px round ${token('--raio-3')})`, opacity: [1, 0] },
        { duration: segundos('--dur-media'), ease: bezier('--ease-entrada-saida') },
      ).finished;
    }
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    d.close();
  }, []);

  // Fechamento nativo (Esc) passa pela mesma animação.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    const aoCancelar = (e: Event) => { e.preventDefault(); fechar(); };
    const aoFechar = () => {
      setAberto(false);
      setTocando(false);
      delete document.documentElement.dataset.cinema;
      window.dispatchEvent(new CustomEvent('jam:rolagem', { detail: { parar: false } }));
      suspenderPrevias(false);
    };
    d.addEventListener('cancel', aoCancelar);
    d.addEventListener('close', aoFechar);
    return () => { d.removeEventListener('cancel', aoCancelar); d.removeEventListener('close', aoFechar); };
  }, [fechar]);

  // Embla e índice atual andam juntos (arrasto, setas, teclado).
  useEffect(() => {
    if (!embla || !aberto) return;
    embla.reInit();
    embla.scrollTo(atual, true);
    const aoSelecionar = () => setAtual(embla.selectedScrollSnap());
    embla.on('select', aoSelecionar);
    return () => { embla.off('select', aoSelecionar); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embla, aberto]);

  // Novo slide ou troca de prévia para completo: toca desde o começo.
  useEffect(() => {
    const v = video.current;
    if (!aberto || !v) return;
    v.muted = mudo;
    v.currentTime = 0;
    setProgresso({ t: 0, d: 0 });
    v.play().then(() => setTocando(true)).catch(() => setTocando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atual, aberto, emPrevia]);

  // Luz ambiente: o quadro atual, reduzido e desfocado, tinge o fundo em volta do vídeo.
  useEffect(() => {
    const v = video.current;
    const c = ambiente.current;
    if (!aberto || !tocando || !v || !c || reduzMovimento()) return;
    const ctx = c.getContext('2d', { alpha: false });
    if (!ctx) return;
    const id = window.setInterval(() => {
      if (v.readyState >= 2) ctx.drawImage(v, 0, 0, c.width, c.height);
    }, 120);
    return () => window.clearInterval(id);
  }, [aberto, tocando, atual]);

  useEffect(() => {
    const aoMudar = () => setCheia(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  const alternar = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setTocando(true)).catch(() => {});
    else { v.pause(); setTocando(false); }
  };
  const alternarSom = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
  };
  const alternarTelaCheia = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else palco.current?.requestFullscreen().catch(() => {});
  };
  const buscar = (s: number) => {
    const v = video.current;
    if (v && Number.isFinite(v.duration)) v.currentTime = Math.min(Math.max(0, s), v.duration);
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    const alvo = e.target as HTMLElement;
    const naBarra = alvo.matches('input[type="range"]');
    const emBotao = alvo.matches('button');
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        if (emBotao && e.key === ' ') return;
        e.preventDefault();
        alternar();
        break;
      case 'ArrowRight':
        if (naBarra) return;
        e.preventDefault();
        embla?.scrollNext();
        break;
      case 'ArrowLeft':
        if (naBarra) return;
        e.preventDefault();
        embla?.scrollPrev();
        break;
      case 'm':
      case 'M':
        alternarSom();
        break;
      case 'f':
      case 'F':
        alternarTelaCheia();
        break;
    }
  };

  const total = itens.length;
  const nome = item ? [item.marca, item.titulo].filter(Boolean).join(' · ') : '';

  return (
    <dialog ref={dialogo} className="cinema" aria-label={textos.rotulo} onKeyDown={aoTeclar}>
      {aberto && item && (
        <div ref={palco} className="cinema__palco">
          <canvas ref={ambiente} className="cinema__ambiente" width={32} height={18} aria-hidden="true" />

          <header className="cinema__topo">
            <p className="cinema__nome">
              <span className="rotulo">{textos.contador.replace('{n}', String(atual + 1)).replace('{total}', String(total))}</span>
              <span className="cinema__titulo" aria-live="polite">{nome}</span>
            </p>
            <button type="button" className="cinema__botao" onClick={fechar} aria-label={textos.fechar} autoFocus>
              <X className="icone" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </header>

          <div className="cinema__viewport" ref={emblaRef}>
            <ol className="cinema__trilho" role="list">
              {itens.map((it, i) => {
                const perto = Math.abs(i - atual) <= 2;
                const vertical = it.altura > it.largura;
                return (
                  <li key={it.slug} className="cinema__slide" data-vertical={vertical || undefined} aria-hidden={i !== atual}>
                    <div className="cinema__quadro" style={{ aspectRatio: `${it.largura} / ${it.altura}` }}>
                      {i === atual && noYoutube ? (
                        <iframe
                          className="cinema__video cinema__youtube"
                          src={`https://www.youtube-nocookie.com/embed/${it.youtube}?autoplay=1&rel=0&playsinline=1`}
                          title={nome}
                          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : i === atual ? (
                        <video
                          key={`${it.slug}-${emPrevia}`}
                          ref={video}
                          className="cinema__video"
                          src={emPrevia ? `/previas/${it.slug}.mp4` : urlVideo(it.slug)}
                          poster={`/imagens/posteres/${it.slug}.webp`}
                          width={it.largura}
                          height={it.altura}
                          playsInline
                          preload="auto"
                          onClick={alternar}
                          onPlay={() => setTocando(true)}
                          onPause={() => setTocando(false)}
                          onTimeUpdate={(e) => setProgresso({ t: e.currentTarget.currentTime, d: e.currentTarget.duration })}
                          onLoadedMetadata={(e) => setProgresso({ t: 0, d: e.currentTarget.duration })}
                          loop={emPrevia}
                          onEnded={() => (embla?.canScrollNext() ? embla.scrollNext() : setTocando(false))}
                          onError={() => { if (!emPrevia) setFalhas((f) => new Set(f).add(it.slug)); }}
                        />
                      ) : perto ? (
                        <img src={`/imagens/posteres/${it.slug}.webp`} alt="" width={it.largura} height={it.altura} decoding="async" />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {falhou ? (
            <p className="cinema__aviso rotulo" role="status">{textos.previa}</p>
          ) : emPrevia ? (
            <div className="cinema__aviso">
              <span className="rotulo">{textos.previaCurta}</span>
              <button type="button" className="botao botao--cheio cinema__completo" onClick={() => setCompleto(item.slug)}>
                <Play className="icone" aria-hidden="true" strokeWidth={1.5} />
                {textos.completo}
              </button>
            </div>
          ) : null}

          <div className="cinema__controles">
            <button type="button" className="cinema__botao" onClick={() => atual > 0 && embla?.scrollPrev()} aria-label={textos.anterior} aria-disabled={atual === 0}>
              <ChevronLeft className="icone" aria-hidden="true" strokeWidth={1.5} />
            </button>
            {/* No YouTube, tocar, barra, som e tela cheia ficam com os controles do próprio embed */}
            {!noYoutube && (
              <button type="button" className="cinema__botao cinema__botao--tocar" onClick={alternar} aria-label={tocando ? textos.pausar : textos.tocar}>
                {tocando ? <Pause className="icone" aria-hidden="true" strokeWidth={1.5} /> : <Play className="icone" aria-hidden="true" strokeWidth={1.5} />}
              </button>
            )}
            <button type="button" className="cinema__botao" onClick={() => atual < total - 1 && embla?.scrollNext()} aria-label={textos.proximo} aria-disabled={atual === total - 1}>
              <ChevronRight className="icone" aria-hidden="true" strokeWidth={1.5} />
            </button>

            {!noYoutube && (
                <>
                  <span className="cinema__tempo rotulo" aria-hidden="true">{tempo(progresso.t)}</span>
                  <input
                    type="range"
                    className="cinema__barra"
                    min={0}
                    max={progresso.d || 0}
                    step={0.1}
                    value={progresso.t}
                    aria-label={textos.progresso}
                    aria-valuetext={`${tempo(progresso.t)} / ${tempo(progresso.d)}`}
                    onChange={(e) => buscar(Number(e.currentTarget.value))}
                    style={{ '--avanco': progresso.d ? progresso.t / progresso.d : 0 } as React.CSSProperties}
                  />
                  <span className="cinema__tempo rotulo" aria-hidden="true">{tempo(progresso.d)}</span>

                  <button type="button" className="cinema__botao" onClick={alternarSom} aria-label={mudo ? textos.som : textos.semSom} aria-pressed={mudo}>
                    {mudo ? <VolumeX className="icone" aria-hidden="true" strokeWidth={1.5} /> : <Volume2 className="icone" aria-hidden="true" strokeWidth={1.5} />}
                  </button>
                  <button type="button" className="cinema__botao" onClick={alternarTelaCheia} aria-label={cheia ? textos.sairTelaCheia : textos.telaCheia}>
                    {cheia ? <Minimize className="icone" aria-hidden="true" strokeWidth={1.5} /> : <Maximize className="icone" aria-hidden="true" strokeWidth={1.5} />}
                  </button>
                </>
            )}
          </div>
          {!noYoutube && <p className="cinema__atalhos rotulo">{textos.atalhos}</p>}
        </div>
      )}
    </dialog>
  );
}
