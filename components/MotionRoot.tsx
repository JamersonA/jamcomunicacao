'use client';

import { useEffect } from 'react';
import { depoisDoPrimeiroPaint } from '@/lib/primeiro-paint';
import { numero, segundos, token } from '@/lib/tokens';

// Devolve a vez ao navegador (toque, rolagem, pintura) antes de seguir.
const ceder = () => new Promise<void>((pronto) => {
  const agendador = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (agendador?.yield) agendador.yield().then(pronto); else setTimeout(pronto, 0);
});

// Linguagem de motion da página inteira: Lenis no scroll, GSAP para reveals, parallax em camadas,
// a leitura que acende do Sobre e a janela do showreel (pin de uma altura de tela). Esteiras,
// cursor e cenas cuidam de si. Tudo carregado depois do primeiro paint, com durações e curvas
// dos tokens. Sem JS, o conteúdo fica visível como está.
export function MotionRoot() {
  useEffect(() => {
    let desfazer: (() => void) | undefined;
    let cancelado = false;

    // GSAP e Lenis só baixam depois do primeiro paint: não disputam rede nem CPU com o LCP
    const cancelarCarga = depoisDoPrimeiroPaint(() => (async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }, { CustomEase }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/SplitText'),
        import('gsap/CustomEase'),
        import('lenis'),
      ]);
      if (cancelado) return;
      gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

      const curva = (nome: string, id: string) => {
        const n = token(nome).match(/-?[\d.]+/g)?.map(Number);
        return n?.length === 4 ? CustomEase.create(id, `M0,0 C${n[0]},${n[1]} ${n[2]},${n[3]} 1,1`) : 'power3.out';
      };
      const saida = curva('--ease-saida', 'saida');
      const revelar = segundos('--dur-revelar', 1.2);
      const lenta = segundos('--dur-lenta', 0.9);
      const escalonar = numero('--escalonar', 0.08);
      const parallaxMax = numero('--parallax-max', 140);
      const acenderMin = numero('--acender-min', 0.5);
      const janelaMin = numero('--showreel-escala', 0.62);

      const cabecalho = document.querySelector<HTMLElement>('.cabecalho');
      const mm = gsap.matchMedia();
      const limpar: Array<() => void> = [];
      // Cada SplitText e ScrollTrigger mede o layout; em fatias, com a vez cedida entre elas, a
      // partida do motion não vira uma tarefa longa que trava toque e rolagem.
      let fatias: Promise<void> = Promise.resolve();

      // Cabeçalho ganha véu depois do hero (vale também com movimento reduzido: não é animação)
      const veu = ScrollTrigger.create({
        start: 120,
        onToggle: (st) => cabecalho?.toggleAttribute('data-rolado', st.isActive),
      });
      // Fio de progresso da leitura: segue a rolagem, não corre sozinho
      const fio = gsap.fromTo('[data-progresso]', { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: true },
      });
      limpar.push(() => { veu.kill(); fio.scrollTrigger?.kill(); fio.kill(); });

      mm.add('(prefers-reduced-motion: no-preference)', (contexto) => {
        let ativo = true;
        // Scroll suave, guiado pelo ticker do GSAP para ficar em sincronia com o ScrollTrigger
        const lenis = new Lenis({ autoRaf: false, anchors: true });
        lenis.on('scroll', ScrollTrigger.update);
        const tique = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(tique);
        gsap.ticker.lagSmoothing(0);
        document.documentElement.classList.add('lenis');
        // O player de cinema trava a página por baixo enquanto está aberto
        const aoRolar = (e: Event) => {
          if ((e as CustomEvent<{ parar: boolean }>).detail?.parar) lenis.stop(); else lenis.start();
        };
        window.addEventListener('jam:rolagem', aoRolar);

        // Visor do hero: os cantos fecham o enquadramento como um foco que se ajusta
        gsap.from('.hero__canto', { scale: 1.8, opacity: 0, duration: revelar, ease: saida, stagger: escalonar });
        gsap.from('.hero__rec, .hero__timecode, .hero__ficha', { opacity: 0, y: 12, duration: lenta, ease: saida, stagger: escalonar, delay: 0.3 });

        const tarefas: Array<() => void> = [];
        const divisoes: SplitText[] = [];
        const leituras: SplitText[] = [];

        // Títulos e frases: linhas sobem de dentro de uma máscara
        document.querySelectorAll<HTMLElement>('[data-efeito~="reveal"][data-dividir]').forEach((el) => tarefas.push(() => {
          divisoes.push(SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'linha',
            // Só linhas, texto intacto: sem aria-label no <p> (proibido pelo ARIA em elemento genérico)
            aria: 'none',
            autoSplit: true,
            onSplit: (self) => gsap.from(self.lines, {
              yPercent: 110,
              duration: revelar,
              ease: saida,
              stagger: escalonar,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }),
          }));
        }));

        // Leitura que acende: as palavras do Sobre ganham luz conforme a rolagem passa por elas
        document.querySelectorAll<HTMLElement>('[data-acender]').forEach((el) => tarefas.push(() => {
          leituras.push(SplitText.create(el, {
            type: 'words',
            wordsClass: 'palavra',
            aria: 'none',
            onSplit: (self) => gsap.fromTo(self.words, { opacity: acenderMin }, {
              opacity: 1,
              ease: 'none',
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: true },
            }),
          }));
        }));

        // Blocos: sobem e acendem (só opacidade: visibility esconderia do Tab o que ainda não entrou)
        gsap.utils.toArray<HTMLElement>('[data-efeito~="reveal"]:not([data-dividir])').forEach((el) => tarefas.push(() => {
          gsap.from(el, {
            opacity: 0,
            y: 48,
            duration: revelar,
            ease: saida,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        }));

        // Parallax em camadas: cada camada anda conforme a profundidade
        gsap.utils.toArray<HTMLElement>('[data-depth]').forEach((el) => tarefas.push(() => {
          const d = parseFloat(el.dataset.depth ?? '0.5') * parallaxMax;
          gsap.fromTo(el, { y: d * 0.5 }, {
            y: -d * 0.5,
            ease: 'none',
            scrollTrigger: { trigger: el.closest('section, footer') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }));

        // Hero sai de cena: a foto desce mais devagar que a página e o texto se afasta
        tarefas.push(() => {
          gsap.to('.hero__foto img', {
            yPercent: 12,
            scale: 1.06,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
          });
          gsap.to('.hero__conteudo', {
            y: -parallaxMax * 0.6,
            opacity: 0.2,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true },
          });
        });

        // Showreel: a janela cresce do recorte até a tela inteira, presa por uma altura de tela
        const reel = document.querySelector<HTMLElement>('[data-showreel]');
        if (reel) tarefas.push(() => {
          gsap.timeline({
            scrollTrigger: { trigger: reel, start: 'top top', end: '+=100%', pin: true, scrub: true, anticipatePin: 1 },
          })
            .fromTo('[data-showreel-janela]', { scale: janelaMin }, { scale: 1, ease: 'none' })
            .fromTo('.showreel__video', { scale: 1.3 }, { scale: 1, ease: 'none' }, 0)
            .fromTo('.showreel__texto', { y: parallaxMax * 0.5 }, { y: 0, ease: 'none' }, 0);
        });

        // Mesma ordem de criação de antes; o contexto do matchMedia guarda o que nasce em cada fatia
        fatias = (async () => {
          for (const tarefa of tarefas) {
            await ceder();
            if (!ativo) return;
            contexto.add(tarefa);
          }
        })();

        return () => {
          ativo = false;
          divisoes.forEach((s) => s.revert());
          leituras.forEach((s) => s.revert());
          window.removeEventListener('jam:rolagem', aoRolar);
          gsap.ticker.remove(tique);
          lenis.destroy();
          document.documentElement.classList.remove('lenis');
        };
      });

      await Promise.all([fatias, document.fonts.ready]);
      if (!cancelado) ScrollTrigger.refresh();

      desfazer = () => {
        limpar.forEach((f) => f());
        mm.revert();
      };
    })());

    return () => {
      cancelado = true;
      cancelarCarga();
      desfazer?.();
    };
  }, []);

  return null;
}
