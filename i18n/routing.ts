import { defineRouting } from 'next-intl/routing';

// Português na raiz, inglês em /en. Sem detecção automática: a troca é explícita no cabeçalho.
export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
  localeDetection: false,
  // Os hreflang já saem no <head> pelo generateMetadata; o cabeçalho HTTP do middleware usaria o host da requisição
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
