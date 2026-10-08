# 07 — Acervo de mídias

Mídias do site, selecionadas e renomeadas. As peças exibidas, com marca e título, estão em `content/trabalhos.ts`.

## Estrutura

```
assets/
├── images/
│   ├── jamerson-retrato-contraluz.jpeg   # foto do hero
│   └── logos-clientes/                   # 47 logos (PNG)
└── videos/                               # originais baixados do Drive, só para gerar novas versões (fora do git)

public/
├── imagens/posteres/   # pôsteres .webp das peças (gerados por npm run imagens)
├── previas/            # clipes mudos e curtos para o mural (gerados por scripts/gerar-previas.sh)
└── media/              # versões web geradas a partir dos originais, fora do git, publicadas no Worker
```

## Padrão de nomes

- Tudo em minúsculas, sem acento, com hífens.
- Vídeos: `marca-descricao-orientacao[-4k].ext`, por exemplo `cpet-black-friday-fundo-preto-vertical.mp4`. O nome sem extensão é o slug usado no site.
- Logos: nome da marca em slug, por exemplo `tourex-broker.png`.

## Formatos

- A maioria dos vídeos de portfólio é **vertical (9:16)**, no formato de redes sociais, e o layout valoriza esse formato.
- As apresentações do Jam são em maioria **horizontais**. A apresentação do site é `jam-apresentacao-vintepila-2026-09-horizontal-4k`, a mesma do anúncio no Vintepila e no YouTube (`OdIfBlPZKqQ`).
- O showreel é `jam-portfolio-compilado-horizontal`.

## Origem

Drive do Jam: https://drive.google.com/drive/folders/1xtIYk5_McntVOrXWjjpaAftFJHARErny. Os originais descartados continuam lá.
