import React from 'react';

const PRODUCT_OS_MODULES = [
  { title: 'Product Builder', subtitle: 'Oferta, avatar e estrutura' },
  { title: 'Landing Builder', subtitle: 'Páginas de venda e captura' },
  { title: 'Marketplace Pack Generator', subtitle: 'Packs Hotmart, Kiwify, Shopee e afiliados' },
  { title: 'Checkout Blueprint', subtitle: 'Planos, preço e página de obrigado' },
  { title: 'Content Factory', subtitle: 'Posts, emails e roteiros' },
  { title: 'CRM Inbox', subtitle: 'Leads, follow-up e oportunidades' },
  { title: 'Deploy Center', subtitle: 'GitHub, Railway e Vercel' },
  { title: 'Revenue Ledger', subtitle: 'Vendas, canais e evidências' },
];

export function GxeonProductShellIntro() {
  return (
    <section id="intro" className="mx-auto w-full max-w-5xl px-4 pt-8 text-center sm:pt-10 lg:px-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-2 text-xs uppercase tracking-[0.25em] text-bolt-elements-textSecondary animate-fade-in">
        <span className="i-ph:sparkle-bold text-[#d9a441]" />
        <span translate="no">Digital Product Creation OS</span>
      </div>
      <h1 className="mb-4 mt-5 text-4xl font-bold text-bolt-elements-textPrimary animate-fade-in lg:text-6xl">
        <span translate="no">GXEON App Forge</span>
      </h1>
      <p className="mb-4 text-md text-bolt-elements-textSecondary animate-fade-in animation-delay-200 lg:text-xl">
        Sistema Operacional de Criação e Venda de Produtos Digitais com IA.
      </p>
      <p className="mb-5 text-sm font-semibold text-[#d9a441] animate-fade-in animation-delay-200 lg:text-base">
        Crie. Embale. Venda. Distribua. Acompanhe.
      </p>
      <div className="mb-5 inline-flex max-w-3xl items-center rounded-xl border border-[#d9a441]/30 bg-[#d9a441]/10 px-4 py-3 text-left text-xs text-bolt-elements-textSecondary">
        <span
          className="mr-2 shrink-0 rounded-full bg-[#d9a441] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black"
          translate="no"
        >
          Founder Preview
        </span>
        módulos comerciais em fundação manual-first. Integrações reais entram por fases, com aprovação humana.
      </div>
      <div className="mb-5 grid grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCT_OS_MODULES.map((module) => (
          <div
            key={module.title}
            className="flex h-full flex-col rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2/80 p-3 shadow-sm"
          >
            <div className="text-sm font-semibold text-bolt-elements-textPrimary" translate="no">
              {module.title}
            </div>
            <div className="mt-1 flex-1 text-xs text-bolt-elements-textSecondary">{module.subtitle}</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#d9a441]" translate="no">
              Manual-first preview
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-bolt-elements-textSecondary">
        Powered by <span translate="no">GXEON Systems AI</span>. Based on open-source technology from{' '}
        <span translate="no">bolt.diy</span>. Transformed by <span translate="no">GXEON</span> into a{' '}
        <span translate="no">Digital Product Creation OS</span>.
      </p>
    </section>
  );
}
