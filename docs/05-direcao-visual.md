# 05 — Direção visual

## Paleta

- **Base: preto.** Jam pediu "algo puxado pro preto mesmo" e, sobre as inspirações, "poderia ser mais preto".
- O preto **não é chapado**. Ele ganha profundidade com esfumaçados e jogo de luz e sombra; preto absoluto fica com cara de "UI".
- **Destaque: dourado.** Maicon sugeriu e Jam aprovou ("comprou a ideia": minimalismo, premium, luxo).
- Quase monocromática: Jam se veste em preto, cinza e branco, e a paleta conversa com isso.
- Se entrar laranja, é **laranja de luz**, não "laranja laranja". Pouco quente.
- As cores primárias e de destaque saem da foto do hero: "tom preto com esse feixe de luz".

## Hero

- **Banner gigante** abrindo o site, com parallax, partículas e luz.
- Foto do Jam ([assets/images/jamerson-retrato-contraluz.jpeg](../assets/images/jamerson-retrato-contraluz.jpeg)) em **tela cheia**, fundida no preto.
- **Cena 3D (three.js)** com câmeras, fotos e flash, ligada ao ofício dele: comunicar e gravar.
- Funciona como "um CTA sem ser CTA": impacto imediato, com a luz como protagonista.
- **Efeitos de luz:** a luz da foto pode pulsar e variar de tom (dourado, branco, laranja de luz, vermelho), com CSS e bibliotecas de animação.
- Esfumaçados e transições suaves entre o hero e o resto da página.
- **Como foi construído:** refletor volumétrico em three.js (React Three Fiber) com poeira em suspensão e flashes de câmera em ritmo aleatório; a câmera segue o cursor com inércia e o título dourado acende onde a luz toca. Detalhes em [08-implementacao.md](08-implementacao.md).

## Mundo visual: Contraluz de estúdio

Escolhido em 07/10 entre as direções visuais propostas, depois do comparativo de tipografia.

- **Ideia:** o site é o estúdio do Jam com a luz acesa. Um feixe contraluz atravessa a névoa e revela cada seção, como o refletor revela quem está no set.
- **Materiais:** névoa volumétrica, feixes de luz (god rays em three.js), poeira dourada suspensa no feixe e flare como explosão dourada. Flash de câmera ao revelar os trabalhos.
- **Cores:** #090807 (preto de estúdio), #24201b (névoa), #c4702e (laranja de luz, só no núcleo do feixe), #e8b85c (dourado), #fff1d2 (branco quente, só no pico do flash).
- **Hero:** a foto contraluz em tela cheia. O feixe da foto continua como luz 3D que segue o cursor, com poeira dourada flutuando. A frase de abertura em serifada gigante acende onde o feixe toca.
- **Movimento:** a luz tem inércia e amortecimento, os flashes decaem até o preto e o parallax é feito em camadas de névoa.
- **Risco assumido:** é a direção mais familiar entre as opções. A diferença vem do feixe com fonte e direção, do flash de câmera e das linhas em Z, não de brilho decorativo.

## Tons

O visitante escolhe entre dois tons no seletor fixo da página. A escolha fica salva no navegador e também pode vir pela URL (`?tom=original`).

| Tom | Como é |
|---|---|
| **Low Key** (padrão) | Iluminação low key: a sombra domina e a luz só recorta o essencial. Preto um degrau mais fundo, dourado mais contido e luzes menos brilhosas |
| **Original** | O contraluz brilhoso da direção original, com as cores da paleta acima |

Os tons trocam só a base de cor e a força das luzes (`app/tokens.css`); texto, linhas, vidro, shaders e cena 3D derivam sozinhos, ao vivo, sem recarregar a página.

## Tipografia

Escolhida em 07/10, num comparativo de opções.

| Uso | Fonte | Por quê |
|---|---|---|
| Títulos | **Gloock** | Serifada de alto contraste: as hastes finas pegam a luz como recorte de contraluz. |
| Texto corrido | **Schibsted Grotesk** | Firme e jornalística, segura o peso da serifada e lê bem em PT com acentos. |
| Rótulos e navegação | **Geist Mono** | Caixa-alta espaçada, discreta. |

Todas estão no Google Fonts.

## Identidade

- Jam é **comunicador com olhar de editor**: o rosto e a voz das marcas, que também desenha e edita o que grava. O site tem que ter a cara de designer e editor e refletir a personalidade dele.

## Luz e linhas douradas

- Preto e dourado valem para luzes, sombras e linhas.
- **Explosões de luz dourada** pelo layout preto e minimalista.
- **Linhas douradas curvilíneas em forma de "Z"**, bem curvadas em cada ponta, nunca retas na horizontal ou vertical. Aparecem em fundos, fundos de cards e bordas de cards.
- Um **brilho aleatório** passa pelas linhas, como reflexo.
- **Aparência:** faixas de **ouro polido com espessura**, não fios chapados. Curvas longas, várias faixas em paralelo, com reflexo especular que corre por elas.
- **No fundo, animadas e com parallax:** cada grupo de faixas fica numa camada de profundidade e se move com a rolagem em velocidade própria.
- **A luz do estúdio acende as faixas:** o reflexo nelas vem do feixe contraluz. Onde o feixe passa (cursor no hero, rolagem no resto), o ouro brilha; longe dele, a faixa fica escura e quase some no preto.

## Movimento

- **Nenhuma superfície estática**: fundos, textos e cards respondem à rolagem e ao tempo. A página tem que prender a atenção.
- Parallax, animações, movimentos e partículas.
- **Celular:** mesma identidade em versão leve: 3D e shaders em resolução menor, câmera que deriva sozinha no lugar do cursor.
- **`prefers-reduced-motion`:** versão calma, sem parallax, brilhos correndo nem partículas.
- **Pausa:** um botão no cabeçalho pausa todo o movimento contínuo (cena 3D, shaders, partículas, esteiras e prévias).

## Linguagem

- Minimalista, elegante, sofisticado, com capricho.
- Seções e banners **grandes**, tipografia de impacto.
- Experiência de referência internacional, com movimento e reação à rolagem, não estática. O ponto de partida é a sensação que o visitante deve ter.
- As inspirações enviadas pelo Jam servem de **referência de layout e clima, não de cópia**.
