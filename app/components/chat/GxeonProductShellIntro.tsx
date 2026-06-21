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

const PROOF_LABELS = ['Builders', 'Creators', 'Agencies', 'Sellers', 'Operators'];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Comece com uma ideia',
    body: 'Descreva o produto, público, promessa, canais e ativos que você quer estruturar com IA.',
  },
  {
    step: '02',
    title: 'Transforme em produto',
    body: 'Converta a ideia em app, landing page, pack comercial, conteúdo, funil ou operação digital.',
  },
  {
    step: '03',
    title: 'Publique com controle',
    body: 'Fluxo manual-first: sem publicação automática em marketplaces, sem processamento de pagamentos e com aprovação humana.',
  },
];

const TEMPLATES = [
  { name: 'Página de venda', category: 'Modelo preview', gradient: 'from-[#172554] via-[#7c3aed] to-[#f97316]' },
  { name: 'SaaS Starter', category: 'Foundation template', gradient: 'from-[#020617] via-[#2563eb] to-[#22d3ee]' },
  { name: 'Loja de afiliado', category: 'Modelo preview', gradient: 'from-[#111827] via-[#d946ef] to-[#f59e0b]' },
  { name: 'Curso digital', category: 'Foundation template', gradient: 'from-[#1e1b4b] via-[#9333ea] to-[#f43f5e]' },
  { name: 'Kit Hotmart/Kiwify', category: 'Modelo preview', gradient: 'from-[#0f172a] via-[#b45309] to-[#facc15]' },
  {
    name: 'Dashboard comercial',
    category: 'Foundation template',
    gradient: 'from-[#020617] via-[#0f766e] to-[#38bdf8]',
  },
  { name: 'Blog de autoridade', category: 'Modelo preview', gradient: 'from-[#111827] via-[#4f46e5] to-[#c084fc]' },
  { name: 'CRM de leads', category: 'Foundation template', gradient: 'from-[#030712] via-[#be123c] to-[#fb7185]' },
];

const METRICS = [
  { value: '8', label: 'módulos planejados', note: 'fundação do Product OS' },
  { value: '10', label: 'fases de beta', note: 'roadmap de validação' },
  { value: '20+', label: 'integrações mapeadas', note: 'por fases, sem clientes reais neste preview' },
];

const FOOTER_COLUMNS = [
  { title: 'Empresa', links: ['Roadmap', 'Segurança', 'Fundadores'] },
  { title: 'Produto', links: ['Modelos', 'Product Builder', 'Marketplace Pack', 'Checkout Blueprint'] },
  { title: 'Recursos', links: ['Documentação', 'Guia', 'Product Factory Mode'] },
  { title: 'Jurídico', links: ['Política de privacidade', 'Termos', 'MIT License'] },
  { title: 'Comunidade', links: ['Código de conduta', 'GitHub', 'Founder Preview'] },
];

function scrollToComposer() {
  document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
  document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function GxeonProductShellIntro() {
  return (
    <section
      id="intro"
      className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#05060f] text-bolt-elements-textPrimary shadow-2xl"
      data-gxeon-shell="founder-preview"
      aria-label="GXEON App Forge founder preview shell"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.45),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(217,164,65,0.25),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(88,28,135,0.75)_45%,_rgba(190,24,93,0.55)_72%,_rgba(249,115,22,0.45))]" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="relative z-1">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 text-sm lg:px-8"
          aria-label="GXEON public navigation"
        >
          <a href="#intro" className="flex items-center gap-3 text-left" translate="no">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#d9a441] via-[#8b5cf6] to-[#2563eb] font-black text-black shadow-lg">
              GX
            </span>
            <span>
              <span className="block font-bold text-white">GXEON App Forge</span>
              <span className="block text-xs text-white/60">Digital Product Creation OS</span>
            </span>
          </a>
          <div className="hidden items-center gap-5 text-white/70 md:flex">
            <a href="#solucoes" className="hover:text-white">
              Soluções
            </a>
            <a href="#modelos" className="hover:text-white">
              Modelos
            </a>
            <a href="#recursos" className="hover:text-white">
              Recursos
            </a>
            <a href="#seguranca" className="hover:text-white">
              Segurança
            </a>
            <a href="#roadmap" className="hover:text-white">
              Roadmap
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#footer"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-white/75 hover:text-white sm:inline-flex"
            >
              Entrar
            </a>
            <button
              onClick={scrollToComposer}
              className="rounded-full bg-white px-4 py-2 font-semibold text-black hover:bg-[#d9a441]"
            >
              Começar
            </button>
          </div>
        </nav>

        <div className="mx-auto max-w-5xl px-5 pb-10 pt-10 text-center lg:px-8 lg:pb-16 lg:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/75 backdrop-blur">
            <span className="i-ph:sparkle-bold text-[#d9a441]" />
            <span translate="no">Founder Preview • manual-first • integrações por fases</span>
          </div>
          <h1 className="mx-auto mb-5 mt-6 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
            Crie produtos digitais com a <span translate="no">GXEON</span>.
          </h1>
          <p className="mx-auto max-w-3xl text-base text-white/75 sm:text-lg lg:text-xl">
            Transforme ideias em apps, landing pages, marketplace packs, checkouts, campanhas e operações digitais com
            IA.
          </p>
          <p className="mt-5 text-sm font-semibold text-[#d9a441]">Crie. Embale. Venda. Distribua. Acompanhe.</p>
        </div>
      </div>

      <div className="relative z-1 bg-[#111312]/95 px-5 py-12 lg:px-8">
        <section id="solucoes" className="mx-auto max-w-7xl">
          <p className="mx-auto max-w-3xl text-center text-sm font-semibold text-white/70">
            Criadores, agências e operadores digitais estão construindo a próxima geração de produtos com a{' '}
            <span translate="no">GXEON</span>.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {PROOF_LABELS.map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-sm font-bold text-white/70"
                translate="no"
              >
                {label}
              </div>
            ))}
          </div>
        </section>

        <section
          id="recursos"
          className="mx-auto mt-20 grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
            <div className="relative mx-auto grid h-72 max-w-md place-items-center rounded-[1.5rem] bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.35),_transparent_45%),linear-gradient(145deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))]">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 via-fuchsia-500 to-orange-400 shadow-[0_0_90px_rgba(217,70,239,0.55)]" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d9a441]">
              Conheça o <span translate="no">GXEON App Forge</span>
            </p>
            <h2 className="mt-3 text-3xl font-black text-white lg:text-5xl">
              Da ideia ao sistema comercial, com controle humano.
            </h2>
            <div className="mt-8 space-y-5">
              {HOW_IT_WORKS.map((item) => (
                <article key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-xs font-bold text-[#d9a441]">{item.step}</div>
                  <h3 className="mt-1 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="modelos" className="mx-auto mt-24 max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white lg:text-5xl">
                Descubra os modelos <span translate="no">GXEON</span>.
              </h2>
              <p className="mt-3 text-white/65">Comece seu próximo produto com um modelo.</p>
            </div>
            <a
              href="#composer"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 hover:text-white"
            >
              Ver tudo
            </a>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((template) => (
              <article
                key={template.name}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                <div className={`h-36 bg-gradient-to-br ${template.gradient} p-4`}>
                  <div className="h-full rounded-xl border border-white/20 bg-black/20 backdrop-blur-sm" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white">{template.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#d9a441]">{template.category}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="mx-auto mt-24 max-w-7xl">
          <h2 className="text-3xl font-black text-white lg:text-5xl">
            <span translate="no">GXEON</span> em números
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/60">
            Números da fundação e roadmap, não métricas públicas de usuários ainda.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {METRICS.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-7">
                <div className="text-5xl font-black text-white">{metric.value}</div>
                <div className="mt-4 font-bold text-white">{metric.label}</div>
                <div className="mt-2 text-sm text-white/55">{metric.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="seguranca"
          className="mx-auto mt-24 max-w-7xl rounded-[2rem] border border-[#d9a441]/25 bg-gradient-to-br from-[#111827] via-[#312e81] to-[#7f1d1d] p-8 text-center lg:p-12"
        >
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d9a441]">
            Criador de produtos digitais com IA
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black text-white lg:text-5xl">
            Pronto para criar seu próximo produto digital?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Descreva o produto digital que você quer criar hoje no compositor principal. Nenhuma publicação automática
            ou pagamento real será iniciado.
          </p>
          <button
            onClick={scrollToComposer}
            className="mt-7 rounded-full bg-white px-6 py-3 font-bold text-black hover:bg-[#d9a441]"
          >
            Começar agora
          </button>
        </section>

        <section
          className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Product Factory Mode modules"
        >
          {PRODUCT_OS_MODULES.map((module) => (
            <div
              key={module.title}
              className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="text-sm font-semibold text-white" translate="no">
                {module.title}
              </div>
              <div className="mt-1 flex-1 text-xs text-white/60">{module.subtitle}</div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[#d9a441]" translate="no">
                Manual-first preview
              </div>
            </div>
          ))}
        </section>

        <footer
          id="footer"
          className="mx-auto mt-20 max-w-7xl rounded-[2rem] border border-white/10 bg-black/45 p-8 lg:p-10"
        >
          <div className="grid gap-8 md:grid-cols-[1.2fr_repeat(5,1fr)]">
            <div>
              <div
                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#d9a441] via-[#8b5cf6] to-[#2563eb] font-black text-black"
                translate="no"
              >
                GX
              </div>
              <p className="mt-4 text-sm text-white/60">
                Based on open-source technology from <span translate="no">bolt.diy</span>. MIT-licensed foundation
                preserved. Foundation build: <span translate="no">APPFORGE-001.8</span>.
              </p>
            </div>
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="font-bold text-white">{column.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-white/55">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#intro"
                        className="hover:text-white"
                        translate={link.includes('GXEON') || link.includes('MIT') ? 'no' : undefined}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
}
