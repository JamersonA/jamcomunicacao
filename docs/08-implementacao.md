# 08 — Implementação

Como o site foi construído, como funciona em produção e como foi verificado. Os valores do sistema visual (cores, tipografia, espaçamentos, durações e curvas) vivem em `app/tokens.css`.

## Stack

| Tema | Decisão |
|---|---|
| Framework | Next.js 16 (app router), React 19, TypeScript |
| Idiomas | `next-intl` 4: PT em `/`, EN em `/en` (`localePrefix: 'as-needed'`). Textos em `messages/pt.json` e `messages/en.json` |
| Segurança | `proxy.ts` gera uma CSP com nonce por requisição. A página é dinâmica por causa do nonce |
| Fontes | `next/font/google`: Gloock (títulos, única com preload), Schibsted Grotesk (texto) e Geist Mono (rótulos e visor) |
| Coreografia | GSAP (ScrollTrigger, SplitText, CustomEase) + Lenis, em `components/MotionRoot.tsx` |
| Interface em React | Motion (inclinação 3D com mola, magnético, contador, abertura do player) e AutoAnimate (cartões que entram ao abrir o acervo inteiro) |
| 3D | three.js + React Three Fiber + Drei: o refletor volumétrico do hero (`components/HeroCena.tsx`) |
| Partículas | tsParticles slim: poeira dourada na luz (`components/Poeira.tsx`) |
| Fundos vivos | Paper Shaders nas seções (`components/FundoShader.tsx`) |
| Cor fora do CSS | Culori lê os tokens e deriva as variações em OKLCH para WebGL, shaders e partículas (`lib/cores.ts`) |
| Carrossel | Embla: destaques, acervo e o player de cinema |
| Ícones | Lucide |

Motion e GSAP nunca animam o mesmo elemento. Um só scroll suave (Lenis).

## Seções

| Seção | Como ficou |
|---|---|
| Hero | Foto do Jam com fusão no preto; refletor 3D com feixe volumétrico, poeira em suspensão e flashes de intervalo e força aleatórios; câmera com inércia atrás do cursor (deriva sozinha no toque); título dourado revelado pela posição da luz; visor de câmera (REC, timecode e ficha) com chip de véu; no celular e no tablet a ficha sai do visor e fica logo acima do título; nessas larguras o cabeçalho é uma faixa própria no topo (fixa ao rolar), a foto começa logo abaixo dele (38svh no celular) e o visor enquadra só a foto, sem cabeçalho sobre a imagem; no desktop o texto fica ancorado à esquerda (na linha do REC), e o título tem largura e corpo limitados ao espaço até o rosto, quebrando em mais linhas antes de encostar na foto |
| Letreiro | Palavras do ofício em tipo de display, correndo entre o hero e o Sobre |
| Sobre | Leitura que acende palavra a palavra na rolagem, números com contagem e texto integral atrás de "ler mais" (região `hidden`) |
| Showreel | Janela de cinema que abre do recorte até a tela inteira com pin de uma altura de tela; prévia muda e botão que abre o player com som; o título e o botão ficam sobre um véu desfocado (pseudo-elemento de `.showreel__texto`), em vez de sombra no texto, que a máscara de linhas do SplitText cortava em retângulo |
| Trabalhos | Destaques e acervo em Embla, com setas (`aria-disabled` nas pontas, para o foco não sumir), cartões com inclinação 3D e prévia muda em loop; o nome acessível de cada cartão é a própria legenda (marca e título), com "Assistir:" só para leitor de tela, para conter o texto visível (WCAG 2.5.3); a instrução de gesto segue o ponteiro (`components/Gesto.tsx`): "passe o cursor para ver, clique para ouvir" com cursor fino, "toque para ouvir" no toque; o CSS escolhe no primeiro paint e a outra frase sai com `hidden` |
| Já passaram por aqui | Duas esteiras de marcas em sentidos opostos que aceleram e inclinam com a rolagem; contador "+50" (o mesmo número aparece nos destaques do Sobre) |
| Contato | Painel de vidro sobre fundo vivo, botões magnéticos; WhatsApp do Jam (+55 21 98815-7954) como primeiro canal, com a primeira mensagem já escrita no idioma da página; o botão fixo "Vamos conversar" abre o mesmo WhatsApp, com a marca do WhatsApp na altura do texto (`components/IconeWhatsapp.tsx`), e sai de cena enquanto os botões do hero, o botão do showreel, as setas da película, o contato ou o rodapé estão em quadro, para não cobri-los nem repeti-los |
| Rodapé | WhatsApp, Instagram e LinkedIn; CNPJ 43.349.529/0001-28, crédito "Desenvolvido por maicontheodoro-dev" com selo MT (link para o portfólio, em `lib/site.ts`), assinatura em display e troca de idioma |

Em toda a página: fundo em shader por seção, parallax em camadas, cursor-anel com rótulo "Assistir" (só com cursor fino; ao rolar ou fechar o player, relê o que está sob o mouse uma vez por quadro, para não ficar preso no rótulo) e um controle único de movimento (`components/ControleMovimento.tsx` + `lib/pausa.ts`, WCAG 2.2.2) que pausa cena 3D, shaders, partículas, esteiras, prévias e animações CSS contínuas. Os elementos fixos nos cantos (pílula do WhatsApp e seletor de tom) saem de cena pelo mesmo mecanismo (`lib/canto-livre.ts`, IntersectionObserver), enquanto algo que cobririam está em quadro; o seletor de tom some sobre o botão do showreel, as setas da película e os números do Sobre.

## Vídeo

- **Player de cinema** (`components/Cinema.tsx`): abre de qualquer `[data-cinema]` crescendo a partir do cartão clicado, navega por toda a obra numa fila só (setas, arrasto e teclado). Só o slide atual tem vídeo; os vizinhos mostram o pôster. Tudo abre na prévia curta em loop, inclusive os botões "Assistir" (showreel do hero, seção Showreel e apresentação no Sobre). O completo só toca quando a pessoa clica em "Assistir completo", e vale só para aquela peça: ao trocar de slide, volta para a prévia. Peça com ID do YouTube (`youtube` em `content/trabalhos.ts`, usado pela apresentação, `OdIfBlPZKqQ`) toca o completo pelo embed `youtube-nocookie`, na qualidade que o YouTube escolhe pelo tamanho do player e pela conexão, com os controles do próprio YouTube; as demais tocam o arquivo do Worker de vídeos. Se o completo falhar, volta para a prévia com o aviso.
- **Prévias** (`components/Previa.tsx` + `lib/previas.ts`): clipes mudos e curtos em `public/previas/` (gerados por `scripts/gerar-previas.sh`, cerca de 7 MB, vão no git), para o mural se mexer sem depender do Worker. Um gerente único toca só o que está em quadro (até 4 no desktop e 2 no celular), respeita a pausa e o movimento reduzido e suspende tudo quando o player abre.
- Pôster e prévia só baixam quando a peça chega perto da tela, para não disputar a rede com a foto do hero (LCP).

## Tons

- `components/LowKey.tsx` mostra o seletor com os dois tons de `lib/tom.ts`: **Low Key** (padrão) e **Original**. No celular aparece só o tom atual, e cada toque passa ao outro.
- O tom vive em `data-tom` no `<html>`, que nasce com `low-key`. A escolha fica em `localStorage` (`jam:tom`) e é restaurada antes dos efeitos carregarem; `?tom=original` na URL também seleciona.
- Cada tom redefine só os tokens de cor e de força da luz em `app/tokens.css`. Shaders, partículas e cena 3D releem as cores pelo Culori (`lib/cores.ts`), e a troca acontece ao vivo.

## Mídia

- `scripts/comprimir-videos.sh` gera as versões web em `public/media/` (H.264, lado maior até 1920 px, faststart) e os pôsteres intermediários, com teto de 24 MiB por arquivo, o limite de arquivo estático do Cloudflare (o que passa é refeito em duas passadas). Os vídeos completos (cerca de 740 MB) não vão para o git.
- `npm run imagens` (`scripts/gerar-imagens.mjs`) converte os pôsteres em `.webp` para `public/imagens/posteres/` e atualiza o manifesto `content/midias.json` (dimensões e cor de fundo de cada peça).
- O player busca cada vídeo em `${NEXT_PUBLIC_VIDEO_BASE}/<slug>.mp4`. Sem a variável, usa `/media/videos` (só funciona localmente). A origem externa entra sozinha na CSP, que também libera o iframe de `https://www.youtube-nocookie.com`. Modelo das variáveis: [.env.example](../.env.example).

## Worker de vídeos

- Os vídeos ficam no Worker `jam-videos` do Cloudflare (`https://jam-videos.comunicacaosite-jam.workers.dev`), com o código em `cloudflare/jam-videos/`.
- Os arquivos estáticos do Workers respondem sempre o arquivo inteiro. O `worker.js` atende pedidos de trecho (`Range`, resposta 206) usando o tamanho de cada arquivo em `tamanhos.json`; sem isso o Safari do iPhone não toca o vídeo e o avanço na barra não funciona. As respostas levam cache de um ano e CORS aberto.
- O deploy do Worker publica a pasta `public/media/videos/` inteira. Para publicar vídeos novos ou alterados: baixar os originais do Drive para `assets/videos/` (`portfolio/`, `apresentacoes/`), gerar as versões web (`npm run videos`) e rodar `npm run videos:publicar`, que recalcula `tamanhos.json` e faz o deploy com o Wrangler. Sem a pasta, o comando para antes do deploy.

## Publicação

- O site roda na Vercel a partir do repositório no GitHub; cada push na `main` publica uma nova versão.
- Variáveis de ambiente do projeto na Vercel: `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_VIDEO_BASE` (valores em [.env.example](../.env.example)).
- Domínio e DNS: [03-tecnologia.md](03-tecnologia.md).

## Performance

- Todos os efeitos (GSAP, Lenis, three.js, shaders, partículas) carregam por `import()` depois do primeiro paint **e** do `load`, numa fila em que cada efeito ganha o seu momento ocioso e o próximo espera a carga do anterior (`lib/primeiro-paint.ts`), e os `setState` que montam as cenas pesadas entram em `startTransition`.
- O setup do GSAP (`components/MotionRoot.tsx`) roda em fatias, cedendo a thread entre elas, para não virar uma tarefa longa.
- `inlineCss` do Next fica desligado: ele exige `'unsafe-inline'` em `style-src`, incompatível com a CSP por nonce. A foto do hero fica com `decoding="async"` (o `sync` piorou LCP e TBT no teste).
- Troca de idioma: o `hreflang` sai dos metadados de cada página (`alternates.languages`), com `alternateLinks: false` no next-intl para não duplicar o cabeçalho `Link`. O botão do cabeçalho usa o `Link` do Next: troca o idioma sem recarregar a página e mantém a altura da rolagem e o tom escolhido.
- Canvas e shaders param fora da tela. DPR do 3D em até 1,5 (1 no celular e no toque); shader das seções limitado a 1280×720 pixels (640×360 no celular).

## Qualidade

Verificado com o kit `qualidade/` contra o build de produção, com a CSP ativa, em 375, 768 e 1440 px:

- axe, teclado, contraste sobre os efeitos, movimento reduzido, pausa do movimento, SEO e efeitos presentes: passam.
- O kit roda com `--workers=2` (como no CI): com mais workers, vários Chromium renderizando WebGL por software ao mesmo tempo estouram o tempo dos testes de efeito.
- Correções feitas na implementação, sem mexer nos efeitos: véu e sombra neutra sob texto pequeno, scrim na metade de baixo do hero no celular, chip de véu no visor e `aria-disabled` nos botões de carrossel.
