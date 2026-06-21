import React from 'react';

function scrollToComposer() {
  document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
  document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function GxeonProductShellIntro() {
  return (
    <section
      id="intro"
      className="relative w-full overflow-hidden rounded-[1.5rem] border border-[#d9a441]/20 bg-[#05060a] text-bolt-elements-textPrimary shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      data-gxeon-shell="founder-preview"
      aria-label="GXEON App Forge operator landing shell"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,_rgba(217,164,65,0.22),_transparent_30%),radial-gradient(circle_at_84%_8%,_rgba(124,58,237,0.28),_transparent_32%),linear-gradient(135deg,_rgba(5,6,10,0.98),_rgba(10,12,22,0.96)_52%,_rgba(22,16,8,0.94))]" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d9a441]/70 to-transparent" />
      <div className="relative z-1">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-xs sm:px-6"
          aria-label="GXEON public navigation"
        >
          <a href="#intro" className="flex items-center gap-2 text-left" translate="no">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#d9a441]/35 bg-[#d9a441] font-black text-black shadow-[0_0_24px_rgba(217,164,65,0.28)]">
              GX
            </span>
            <span>
              <span className="block font-bold text-white">GXEON App Forge</span>
              <span className="block text-[11px] text-white/48">AI Product Operating System</span>
            </span>
          </a>
          <div className="hidden items-center gap-4 text-white/58 md:flex">
            <a href="#composer" className="hover:text-[#d9a441]">
              Produto
            </a>
            <a href="#modulos" className="hover:text-[#d9a441]">
              Módulos
            </a>
            <a href="#roadmap" className="hover:text-[#d9a441]">
              Roadmap
            </a>
            <a href="#seguranca" className="hover:text-[#d9a441]">
              Segurança
            </a>
          </div>
          <span className="rounded-full border border-[#d9a441]/25 bg-[#d9a441]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f6d991]">
            Founder Preview
          </span>
        </nav>

        <div className="mx-auto grid max-w-6xl gap-5 px-4 pb-6 pt-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:pb-8 lg:pt-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/62 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span translate="no">Founder Preview • Manual-first • Integrações por fases</span>
            </div>
            <h1
              className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl"
              translate="no"
            >
              GXEON App Forge
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold text-white/82 sm:text-lg">
              Sistema Operacional de Criação e Venda de Produtos Digitais com IA.
            </p>
            <p className="mt-2 text-sm font-semibold text-[#d9a441]">Crie. Embale. Venda. Distribua. Acompanhe.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 shadow-inner shadow-[#d9a441]/5">
            <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-white/45">
              <span>Command Center</span>
              <span translate="no">Runtime OS</span>
            </div>
            <div className="space-y-2 text-sm">
              {['Composer real no topo', 'Product Factory manual-first', 'Pagamentos e marketplaces em roadmap'].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-white/70"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d9a441]" />
                    {item}
                  </div>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={scrollToComposer}
              className="mt-4 w-full rounded-xl border border-[#d9a441]/35 bg-[#d9a441]/12 px-4 py-2 text-sm font-bold text-[#f6d991] transition hover:bg-[#d9a441] hover:text-black"
            >
              Focar compositor real
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
