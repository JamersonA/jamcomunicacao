// Gera tamanhos.json (nome do vídeo → bytes) para o Worker responder trechos (Range).
// Rodar antes de cada publicação: npm run videos:publicar
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pasta = new URL('../../public/media/videos/', import.meta.url);
const tamanhos = Object.fromEntries(
  readdirSync(pasta)
    .filter((f) => f.endsWith('.mp4'))
    .sort()
    .map((f) => [f, statSync(join(pasta.pathname.replace(/^\/(\w:)/, '$1'), f)).size]),
);
writeFileSync(new URL('tamanhos.json', import.meta.url), JSON.stringify(tamanhos, null, 2) + '\n');
console.log(`${Object.keys(tamanhos).length} vídeos em tamanhos.json`);
