// Roda `tarefa` só depois do primeiro paint com conteúdo, do `load` (a foto do hero, que é o LCP,
// já chegou), de um quadro pintado e de um momento ocioso: efeitos (GSAP, Lenis, WebGL) nunca
// disputam rede e CPU com o quadro inicial nem com o LCP.
// Os efeitos entram numa fila e cada um ganha o seu momento ocioso; o próximo só começa quando a
// carga do anterior (o `import()` que a tarefa devolve) termina, para os módulos pesados (three.js,
// GSAP, shaders) não serem avaliados todos na mesma tarefa longa.
// Devolve a função que cancela.
type Tarefa = () => void | Promise<unknown>;
const fila: { tarefa: Tarefa; cancelada: boolean }[] = [];
let drenando = false;

const quandoOcioso = (fn: () => void, ociosoMs: number) =>
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(fn, { timeout: ociosoMs })
    : setTimeout(fn, 200);

function drenar(ociosoMs: number) {
  if (drenando) return;
  const item = fila.shift();
  if (!item) return;
  if (item.cancelada) { drenar(ociosoMs); return; }
  drenando = true;
  quandoOcioso(() => {
    const seguir = () => { drenando = false; drenar(ociosoMs); };
    if (item.cancelada) { seguir(); return; }
    Promise.resolve().then(item.tarefa).catch(() => {}).finally(seguir);
  }, ociosoMs);
}

export function depoisDoPrimeiroPaint(tarefa: Tarefa, { reservaMs = 4000, ociosoMs = 1200 } = {}) {
  const item = { tarefa, cancelada: false };
  let quadro = 0;
  let iniciado = false;
  let pintou = false;
  let carregou = document.readyState === 'complete';
  let pintura: PerformanceObserver | undefined;

  const iniciar = () => {
    if (iniciado) return;
    iniciado = true;
    pintura?.disconnect();
    window.removeEventListener('load', aoCarregar);
    clearTimeout(reserva);
    quadro = requestAnimationFrame(() => { fila.push(item); drenar(ociosoMs); });
  };
  const tentar = () => { if (pintou && carregou) iniciar(); };
  function aoCarregar() { carregou = true; tentar(); }

  try {
    pintura = new PerformanceObserver((lista) => {
      if (lista.getEntriesByName('first-contentful-paint').length) { pintou = true; tentar(); }
    });
    pintura.observe({ type: 'paint', buffered: true });
  } catch { pintou = true; /* sem Paint Timing: espera só o load */ }
  if (!carregou) window.addEventListener('load', aoCarregar, { once: true });
  const reserva = setTimeout(iniciar, reservaMs);
  tentar();

  return () => {
    iniciado = true;
    pintura?.disconnect();
    window.removeEventListener('load', aoCarregar);
    clearTimeout(reserva);
    cancelAnimationFrame(quadro);
    item.cancelada = true;
  };
}
