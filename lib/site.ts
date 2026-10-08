// Dados fixos do site. URLs de mídia vêm do ambiente para trocar de serviço sem mexer nos componentes.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jamcomunicacao.com.br').replace(/\/$/, '');
export const VIDEO_BASE = (process.env.NEXT_PUBLIC_VIDEO_BASE ?? '/media/videos').replace(/\/$/, '');

export const CNPJ = '43.349.529/0001-28';

export const REDES = {
  whatsapp: { rotulo: 'WhatsApp', usuario: '+55 21 98815-7954', url: 'https://wa.me/5521988157954' },
  instagram: { rotulo: 'Instagram', usuario: '@jam.comunicacao', url: 'https://www.instagram.com/jam.comunicacao/' },
  linkedin: { rotulo: 'LinkedIn', usuario: 'in/jtaraujo', url: 'https://www.linkedin.com/in/jtaraujo/' },
} as const;

// Link do WhatsApp com a primeira mensagem já escrita no idioma da página
export function urlWhatsapp(mensagem: string) {
  return `${REDES.whatsapp.url}?text=${encodeURIComponent(mensagem)}`;
}

export const AUTOR_SITE = { nome: 'maicontheodoro-dev', url: 'https://maicontheodoro-dev.vercel.app' };

export function urlVideo(slug: string) {
  return `${VIDEO_BASE}/${slug}.mp4`;
}
