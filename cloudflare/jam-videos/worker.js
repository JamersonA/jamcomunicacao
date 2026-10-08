// Serve os vídeos do site com suporte a trechos (Range, resposta 206).
// Os arquivos estáticos do Workers respondem sempre o arquivo inteiro (200); sem 206 o Safari do
// iPhone não toca o vídeo e o avanço na barra do player não funciona.

import TAMANHOS from './tamanhos.json';

const HEADERS = {
  'Accept-Ranges': 'bytes',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=31536000, immutable',
};

/** "bytes=início-fim", "bytes=início-" ou "bytes=-últimos"; null se inválido ou com vários trechos. */
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start;
  let end;
  if (m[1] === '') {
    const last = Number(m[2]);
    if (last === 0) return null;
    start = Math.max(0, size - last);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  return start <= end && start < size ? { start, end } : null;
}

/** Recorta o fluxo: pula `start` bytes, entrega `length` e encerra a leitura. */
function slice(body, start, length) {
  let skip = start;
  let left = length;
  return body.pipeThrough(
    new TransformStream({
      transform(chunk, ctl) {
        let c = chunk;
        if (skip) {
          if (c.byteLength <= skip) {
            skip -= c.byteLength;
            return;
          }
          c = c.subarray(skip);
          skip = 0;
        }
        if (c.byteLength > left) c = c.subarray(0, left);
        left -= c.byteLength;
        ctl.enqueue(c);
        if (left === 0) ctl.terminate();
      },
    }),
  );
}

/** No Workers, o FixedLengthStream mantém o Content-Length (o Safari exige) em vez de chunked. */
function fixed(body, length) {
  return typeof FixedLengthStream === 'undefined' ? body : body.pipeThrough(new FixedLengthStream(length));
}

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const asset = await env.ASSETS.fetch(new Request(request.url));
    // O binding ASSETS não informa o Content-Length; o tamanho vem da lista gerada na publicação.
    const size = TAMANHOS[decodeURIComponent(new URL(request.url).pathname).slice(1)];
    if (!asset.ok || !size) return asset;

    const headers = new Headers(asset.headers);
    for (const [k, v] of Object.entries(HEADERS)) headers.set(k, v);

    const header = request.headers.get('Range');
    headers.set('Content-Length', String(size));
    if (!header) {
      if (request.method === 'HEAD') {
        asset.body?.cancel();
        return new Response(null, { status: 200, headers });
      }
      return new Response(fixed(asset.body, size), { status: 200, headers });
    }
    const range = parseRange(header, size);
    if (!range) {
      asset.body?.cancel();
      headers.set('Content-Range', `bytes */${size}`);
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }
    const length = range.end - range.start + 1;
    headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
    headers.set('Content-Length', String(length));
    if (request.method === 'HEAD') {
      asset.body?.cancel();
      return new Response(null, { status: 206, headers });
    }
    return new Response(fixed(slice(asset.body, range.start, length), length), { status: 206, headers });
  },
};
