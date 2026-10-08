# Jam Comunicação

[![Site](https://img.shields.io/badge/site-jamcomunicacao.com.br-c9a25b?style=flat-square)](https://jamcomunicacao.com.br)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![next-intl](https://img.shields.io/badge/idiomas-PT%20%7C%20EN-555555?style=flat-square)](https://next-intl.dev)
[![Vercel](https://img.shields.io/badge/hospedagem-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Cloudflare Workers](https://img.shields.io/badge/vídeos-Cloudflare%20Workers-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

Site-portfólio de Jamerson Araujo (Jam), comunicador institucional e apresentador. Reúne showreel, trabalhos, marcas atendidas e contato, em português (`/`) e inglês (`/en`).

## Por onde começar

| Quero… | Onde |
|---|---|
| Saber onde fica cada conta (GitHub, Vercel, domínio, vídeos) | [contas.md](contas.md) |
| Entender o projeto e o cliente | [docs/01-visao-geral.md](docs/01-visao-geral.md) |
| Ver o tom de voz e os textos | [docs/02-conteudo-e-narrativa.md](docs/02-conteudo-e-narrativa.md) |
| Conhecer a stack, a hospedagem e o domínio | [docs/03-tecnologia.md](docs/03-tecnologia.md) |
| Acompanhar o histórico | [docs/04-cronograma.md](docs/04-cronograma.md) |
| Ver paleta, tons, tipografia e movimento | [docs/05-direcao-visual.md](docs/05-direcao-visual.md) |
| Conhecer as seções do site | [docs/06-estrutura-do-site.md](docs/06-estrutura-do-site.md) |
| Organizar ou trocar mídias | [docs/07-acervo-de-midias.md](docs/07-acervo-de-midias.md) |
| Saber como foi construído, publicar e verificar | [docs/08-implementacao.md](docs/08-implementacao.md) |

O índice completo da documentação está em [docs/README.md](docs/README.md).

## Rodar localmente

Requer Node.js 20.9 ou superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em `http://localhost:3000` |
| `npm run build` | Build de produção |
| `npm run imagens` | Gera a foto do hero, a imagem de compartilhamento, os logos e os pôsteres a partir de `assets/` |
| `npm run videos` | Gera as versões web dos vídeos a partir dos originais |
| `npm run videos:publicar` | Publica os vídeos no Worker do Cloudflare |

## Publicação

Cada push na `main` publica uma nova versão na Vercel. Os vídeos são publicados à parte, no Worker `jam-videos` do Cloudflare. O passo a passo está em [docs/08-implementacao.md](docs/08-implementacao.md).

## Estrutura

```
.
├── app/          # rotas, layout, tokens e estilos globais
├── components/   # seções e efeitos
├── content/      # trabalhos, marcas e manifesto de mídias
├── lib/          # utilitários (tom, pausa, cores, prévias)
├── messages/     # textos em PT e EN
├── public/       # pôsteres, prévias e imagens
├── scripts/      # geração de vídeos web, prévias e pôsteres
├── cloudflare/   # Worker que serve os vídeos
└── docs/         # documentação do projeto
```

---

Desenvolvido por [maicontheodoro-dev](https://maicontheodoro-dev.vercel.app).
