import midias from './midias.json';
import type { Locale } from '@/i18n/routing';

type Texto = Record<Locale, string>;
// youtube: ID do vídeo no YouTube; quando existe, o completo toca pelo embed, na qualidade original.
export type Trabalho = { slug: string; marca: string; titulo?: Texto; largura: number; altura: number; youtube?: string };

const m = midias as Record<string, { largura: number; altura: number; duracao: number | null }>;

function t(slug: string, marca: string, titulo?: Texto, youtube?: string): Trabalho {
  const dim = m[slug] ?? { largura: 540, altura: 960 };
  return { slug, marca, titulo, largura: dim.largura, altura: dim.altura, youtube };
}

// Película do hero ao rodapé: os 10 destaques escolhidos com o Jam, em ordem de exibição.
export const destaques: Trabalho[] = [
  t('cpet-black-friday-fundo-preto-vertical', 'CPET', { pt: 'Black Friday', en: 'Black Friday' }),
  t('tourex-broker-2-vertical', 'Tourex Broker', { pt: 'Corretora internacional', en: 'International broker' }),
  t('nuvemsign-contrato-em-tres-minutos-vertical', 'NuvemSign', { pt: 'Contrato em três minutos', en: 'A contract in three minutes' }),
  t('articulated-formato-eu-fui-disso-para-isso-vertical', 'Articulated', { pt: 'Eu fui disso para isso', en: 'From this to that' }),
  t('cpet-tempo-de-sonhar-vertical', 'CPET', { pt: 'Tempo de sonhar', en: 'Time to dream' }),
  t('new-york-donuts-vertical', 'New York Donuts'),
  t('headzapp-vertical-4k', 'HeadZapp'),
  t('dona-beth-ia-vertical', 'Dona Beth IA'),
  t('eclipse-viagens-vertical', 'Eclipse Viagens'),
  t('sendtalk-whatsapp-oficial-vertical', 'SendTalk', { pt: 'WhatsApp oficial', en: 'Official WhatsApp' }),
];

// Demais peças, sem as versões horizontais de uma peça que já existe na vertical.
export const outros: Trabalho[] = [
  t('tourex-broker-3-vertical', 'Tourex Broker'),
  t('articulated-formato-dia-x100-vertical', 'Articulated', { pt: 'Dia x100', en: 'Day x100' }),
  t('articulated-formato-demonstracao-app-vertical', 'Articulated', { pt: 'Demonstração do app', en: 'App demo' }),
  t('cpet-estabilidade-por-do-sol-vertical', 'CPET', { pt: 'Estabilidade', en: 'Stability' }),
  t('cpet-preparou-escritorio-vertical', 'CPET', { pt: 'Preparou o escritório', en: 'Office ready' }),
  t('cpet-0917-vertical', 'CPET'),
  t('chat-inteligente-vertical', 'Chat Inteligente'),
  t('airfryer-express-vertical', 'Airfryer Express'),
  t('benlev-vertical', 'Benlev'),
  t('boreal-sistema-video-novo-vertical', 'Boreal Sistema'),
  t('contai-vertical', 'Contai'),
  t('desafio-do-penoni-vertical', 'Desafio do Penoni'),
  t('desvvofit-vertical', 'DesvvoFit'),
  t('fio-refrigeracao-vertical', 'Fio Refrigeração'),
  t('flug-vertical', 'Flug'),
  t('fullstren-vertical', 'Fullstren'),
  t('geguton-presentes-e-decoracao-vertical', 'Geguton', { pt: 'Presentes e decoração', en: 'Gifts and decor' }),
  t('infocameras-seguranca-vertical', 'Infocameras', { pt: 'Segurança', en: 'Security' }),
  t('nw-negocios-e-franquias-vertical', 'NW', { pt: 'Negócios e franquias', en: 'Business and franchises' }),
  t('performa-biz-vertical', 'Performa Biz'),
  t('reclame-seguro-vertical', 'Reclame Seguro'),
  t('redirect-zap-vertical', 'Redirect Zap'),
  t('cpet-futuro-e-mudanca-horizontal', 'CPET', { pt: 'Futuro e mudança', en: 'Future and change' }),
  t('afiliscale-horizontal', 'Afiliscale'),
];

export const apresentacao = t('jam-apresentacao-vintepila-2026-09-horizontal-4k', 'Jam Comunicação', undefined, 'OdIfBlPZKqQ');
