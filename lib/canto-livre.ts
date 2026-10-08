// Elemento fixo num canto da tela que sai de cena (data-oculto) enquanto algum dos alvos está em
// quadro, para não cobrir o que já está ali. Devolve a função que desliga a observação.
export function liberarCanto(el: HTMLElement, seletores: string): () => void {
  const alvos = [...document.querySelectorAll(seletores)];
  if (!alvos.length) return () => {};
  const visiveis = new Set<Element>();
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
    el.toggleAttribute('data-oculto', visiveis.size > 0);
  }, { threshold: 0.15 });
  alvos.forEach((a) => obs.observe(a));
  return () => obs.disconnect();
}
