// Gera as imagens do site a partir de assets/ e public/media/posters/:
// foto do hero em AVIF/WebP, imagem de compartilhamento, logos em máscara monocromática
// e pôsteres dos vídeos em WebP. Escreve os manifestos em content/*.json.
// Uso: npm run imagens
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import sharp from 'sharp';

const raiz = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const p = (...partes) => join(raiz, ...partes);
const garantir = (dir) => mkdirSync(dir, { recursive: true });

async function hero() {
  const src = p('assets/images/jamerson-retrato-contraluz.jpeg');
  const out = p('public/imagens');
  garantir(out);
  for (const largura of [768, 1280, 1536]) {
    const base = sharp(src).resize({ width: largura });
    await base.clone().avif({ quality: 55, effort: 6 }).toFile(join(out, `jam-contraluz-${largura}.avif`));
    await base.clone().webp({ quality: 78 }).toFile(join(out, `jam-contraluz-${largura}.webp`));
  }
  // Compartilhamento (Open Graph): 1200x630, rosto à direita
  await sharp(src)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'right' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(out, 'og-jam-comunicacao.jpg'));
  console.log('hero ok');
}

// Logo -> máscara: alfa = "tinta" do logo. Fundo opaco é removido pela distância de cor aos cantos;
// selos chapados viram fundo a 14% com os detalhes internos em 100%.
async function logos() {
  const dir = p('assets/images/logos-clientes');
  const out = p('public/imagens/marcas');
  garantir(out);
  const manifesto = [];
  for (const arquivo of readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
    const slug = basename(arquivo, '.png');
    const { data, info } = await sharp(join(dir, arquivo))
      .ensureAlpha()
      .resize({ width: 1200, height: 600, fit: 'inside', withoutEnlargement: true })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const px = (x, y) => (y * w + x) * 4;
    const cantos = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)];
    const transparente = cantos.every((i) => data[i + 3] < 16);
    const fundo = [0, 1, 2].map((c) => cantos.reduce((s, i) => s + data[i + c], 0) / 4);
    const dist = (i, cor) => Math.hypot(data[i] - cor[0], data[i + 1] - cor[1], data[i + 2] - cor[2]);
    const lim = (v) => Math.max(0, Math.min(1, v));

    const tinta = new Float32Array(w * h);
    for (let k = 0; k < w * h; k++) {
      const i = k * 4;
      const a = data[i + 3] / 255;
      tinta[k] = transparente ? a : a * lim((dist(i, fundo) - 18) / 70);
    }
    // Selo chapado: muita área cheia dentro da caixa do logo
    let minX = w, minY = h, maxX = 0, maxY = 0, cheios = 0;
    const hist = new Map();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (tinta[k] > 0.5) {
        cheios++;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        const i = k * 4;
        const chave = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
        hist.set(chave, (hist.get(chave) ?? 0) + 1);
      }
    }
    const caixa = Math.max(1, (maxX - minX + 1) * (maxY - minY + 1));
    if (cheios / caixa > 0.55) {
      // cor do selo = faixa de cor mais frequente (a média puxaria para a cor do texto)
      const [chave] = [...hist].sort((a, b) => b[1] - a[1])[0];
      const dominante = [(chave >> 8) & 15, (chave >> 4) & 15, chave & 15].map((v) => v * 16 + 8);
      for (let k = 0; k < w * h; k++) tinta[k] *= 0.14 + 0.86 * lim((dist(k * 4, dominante) - 40) / 60);
    }
    const saida = Buffer.alloc(w * h * 4);
    for (let k = 0; k < w * h; k++) {
      saida[k * 4] = saida[k * 4 + 1] = saida[k * 4 + 2] = 255;
      saida[k * 4 + 3] = Math.round(tinta[k] * 255);
    }
    const recortado = await sharp(saida, { raw: { width: w, height: h, channels: 4 } })
      .trim({ threshold: 1 })
      .png()
      .toBuffer();
    const final = sharp(recortado).resize({ width: 440, height: 160, fit: 'inside', withoutEnlargement: true });
    const fim = await final.clone().webp({ quality: 88, alphaQuality: 90 }).toFile(join(out, `${slug}.webp`));
    manifesto.push({ slug, largura: fim.width, altura: fim.height });
  }
  writeFileSync(p('content/marcas.json'), JSON.stringify(manifesto, null, 2) + '\n');
  console.log(`logos ok (${manifesto.length})`);
}

function duracao(arquivo) {
  try {
    const s = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arquivo]).toString();
    return Math.round(parseFloat(s));
  } catch {
    return null;
  }
}

async function posteres() {
  const dir = p('public/media/posters');
  if (!existsSync(dir)) return console.log('posteres: sem public/media/posters, pulei');
  const out = p('public/imagens/posteres');
  garantir(out);
  const manifesto = {};
  for (const arquivo of readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort()) {
    const slug = basename(arquivo, '.jpg');
    const meta = await sharp(join(dir, arquivo)).metadata();
    const vertical = meta.height > meta.width;
    const info = await sharp(join(dir, arquivo))
      .resize({ width: vertical ? 540 : 960 })
      .webp({ quality: 72 })
      .toFile(join(out, `${slug}.webp`));
    const video = p('public/media/videos', `${slug}.mp4`);
    manifesto[slug] = { largura: info.width, altura: info.height, duracao: existsSync(video) ? duracao(video) : null };
  }
  writeFileSync(p('content/midias.json'), JSON.stringify(manifesto, null, 2) + '\n');
  console.log(`posteres ok (${Object.keys(manifesto).length})`);
}

const etapas = process.argv.slice(2);
const todas = etapas.length === 0;
if (todas || etapas.includes('hero')) await hero();
if (todas || etapas.includes('logos')) await logos();
if (todas || etapas.includes('posteres')) await posteres();
