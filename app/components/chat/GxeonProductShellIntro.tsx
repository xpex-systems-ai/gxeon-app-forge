import React from 'react';

const STATUS_CHIPS = ['Composer real ativo', 'Manual-first', 'Integrações por fases'];

export function GxeonProductShellIntro() {
  return (
    <section
      id="intro"
      className="relative w-full overflow-hidden rounded-[1.25rem] border border-[#d9a441]/20 bg-[#05060a] text-bolt-elements-textPrimary shadow-[0_18px_56px_rgba(0,0,0,0.38)]"
      data-gxeon-shell="founder-preview"
      aria-label="GXEON App Forge operator landing shell"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,_rgba(217,164,65,0.18),_transparent_28%),radial-gradient(circle_at_86%_0%,_rgba(124,58,237,0.22),_transparent_30%),linear-gradient(135deg,_rgba(5,6,10,0.98),_rgba(9,11,20,0.96)_58%,_rgba(19,14,8,0.94))]" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d9a441]/70 to-transparent" />
      <div className="relative z-1">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-5"
          aria-label="GXEON public navigation"
        >
          <a href="#intro" className="flex items-center gap-2 text-left" translate="no">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#d9a441]/35 bg-[#d9a441] font-black text-black shadow-[0_0_18px_rgba(217,164,65,0.24)]">
              GX
            </span>
            <span>
              <span className="block font-bold text-white">GXEON App Forge</span>
              <span className="block text-[10px] text-white/45">AI Product Operating System</span>
            </span>
          </a>
          <div className="hidden items-center gap-3 text-[11px] text-white/55 md:flex">
            <a href="#composer" className="hover:text-[#d9a441]">
              Composer
            </a>
            <a href="#produto" className="hover:text-[#d9a441]" translate="no">
              Product Factory
            </a>
            <a href="#modulos" className="hover:text-[#d9a441]">
              Módulos
            </a>
            <a href="#seguranca" className="hover:text-[#d9a441]">
              Segurança
            </a>
          </div>
          <span className="rounded-full border border-[#d9a441]/25 bg-[#d9a441]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f6d991]">
            Founder Preview
          </span>
        </nav>

        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-4 pt-3 sm:px-5 lg:pb-5 lg:pt-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span translate="no">Founder Preview • Manual-first • Sem auto-publicação</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1
                className="text-3xl font-black leading-none tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl"
                translate="no"
              >
                GXEON App Forge
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-white/80 sm:text-base">
                Sistema Operacional de Criação e Venda de Produtos Digitais com IA.
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
                Crie. Embale. Venda. Distribua. Acompanhe.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end" aria-label="Operator status chips">
              {STATUS_CHIPS.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-semibold text-white/66"
                >
                  <span className="mr-1 text-[#d9a441]">●</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
