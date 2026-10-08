import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

// Origem externa dos vídeos, quando o serviço for definido (NEXT_PUBLIC_VIDEO_BASE absoluto).
const origemVideo = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_VIDEO_BASE ?? '').origin;
  } catch {
    return '';
  }
})();

function politica(nonce: string) {
  const dev = process.env.NODE_ENV === 'development';
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // O hash é o da string vazia: na troca de idioma pelo cliente, o <style> vazio do Paper Shaders
    // chega com o nonce da nova requisição, e só um bloco sem conteúdo passa por ele
    `style-src 'self' 'nonce-${nonce}' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='`,
    `img-src 'self' data: blob:${origemVideo ? ` ${origemVideo}` : ''}`,
    `media-src 'self'${origemVideo ? ` ${origemVideo}` : ''}`,
    // Embed do YouTube (modo de privacidade) para os vídeos completos publicados lá.
    `frame-src https://www.youtube-nocookie.com`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `worker-src 'self'`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');
}

// Idioma (next-intl) e CSP com nonce por requisição: o Next lê o nonce do cabeçalho e o aplica aos próprios scripts.
export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = politica(nonce);
  request.headers.set('x-nonce', nonce);
  request.headers.set('content-security-policy', csp);
  const resposta = intl(request);
  resposta.headers.set('content-security-policy', csp);
  resposta.headers.set('x-content-type-options', 'nosniff');
  resposta.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  return resposta;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|media|imagens|.*\\..*).*)'],
};
