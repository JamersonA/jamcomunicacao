# 03 — Tecnologia

| Tema | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js** (app router) | Base que permite crescer para fullstack no futuro |
| Idiomas | PT e EN com alternância na interface, via `next-intl` (PT em `/`, EN em `/en`) | Adicional contratado no pedido |
| Hospedagem do site | **Vercel** | Sem mensalidade, como proposto ao cliente em 05/10 |
| Domínio | `jamcomunicacao.com.br`, registrado pelo Jam no **Registro.br** | Domínio próprio da marca |
| Vídeos | **Worker `jam-videos` no Cloudflare** (`cloudflare/jam-videos/`) | Mantém a página leve e entrega os vídeos com suporte a trechos (resposta 206), exigido pelo Safari do iPhone e pelo avanço na barra do player |
| Apresentação do Jam | Embed do YouTube (`youtube-nocookie`) | É o mesmo vídeo do anúncio no Vintepila e no YouTube |
| Conta do site | Conta Google criada para o site, no nome do Jam | O site, o repositório e os serviços ficam com ele |

## Mídia fora do repositório

- Os originais dos vídeos (cerca de 3,7 GB, vários em 4K e `.mov`) ficam no Drive do Jam.
- As versões web ficam publicadas no Worker do Cloudflare, que é a fonte dos vídeos do site.
- No repositório vão só as prévias curtas (`public/previas/`) e os pôsteres (`public/imagens/posteres/`).

## Domínio na Vercel

Zona DNS no Registro.br (modo avançado):

| Tipo | Nome | Dados |
|---|---|---|
| A | *(vazio, domínio raiz)* | `216.198.79.1` |
| CNAME | `www` | valor indicado pela Vercel em **Settings → Domains** do projeto |

O domínio sem `www` é o principal; o `www` redireciona para ele. `NEXT_PUBLIC_SITE_URL` aponta para `https://jamcomunicacao.com.br`.

Detalhes da implementação em [08-implementacao.md](08-implementacao.md).
