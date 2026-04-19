import type { ProposalContent } from '@/types'

interface Props {
  content: ProposalContent
  amount: number
  currency: string
}

const currencySymbol = (c: string) => ({ EUR: '€', USD: '$', GBP: '£' }[c] ?? c)

export default function ProposalTemplate({ content, amount, currency }: Props) {
  const sym = currencySymbol(currency)

  return (
    <div className="bg-white font-[-apple-system,BlinkMacSystemFont,'Helvetica_Neue',Arial,sans-serif] text-[#1d1d1f]">

      {/* Cover */}
      <div className="relative min-h-[420px] bg-[#1d1d1f] text-white flex flex-col justify-between px-12 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-white/70 mb-8">
            Proposition Commerciale
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight max-w-2xl">
            {content.cover.title}
          </h1>
          {content.cover.subtitle && (
            <p className="text-lg text-white/60 mt-3 max-w-xl">{content.cover.subtitle}</p>
          )}
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-12 border-t border-white/10">
          <div className="space-y-1">
            <p className="text-xs text-white/40 uppercase tracking-wider">Préparé pour</p>
            <p className="text-lg font-medium">{content.cover.preparedFor}</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="text-xs text-white/40 uppercase tracking-wider">Préparé par</p>
            <p className="text-lg font-medium">{content.cover.preparedBy}</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="text-xs text-white/40 uppercase tracking-wider">Date</p>
            <p className="text-lg font-medium">{content.cover.date}</p>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-16 py-16 max-w-4xl mx-auto space-y-20">

        {/* Summary */}
        <section>
          <SectionLabel>Résumé exécutif</SectionLabel>
          <p className="text-2xl font-light leading-relaxed text-[#1d1d1f] tracking-tight">
            {content.summary}
          </p>
        </section>

        <Divider />

        {/* Context */}
        <section>
          <SectionLabel>Compréhension du besoin</SectionLabel>
          <h2 className="text-2xl font-semibold mb-4 tracking-tight">Votre situation</h2>
          <p className="text-[#6e6e73] leading-relaxed text-base">{content.context}</p>
        </section>

        {/* Solution */}
        <section>
          <SectionLabel>Notre approche</SectionLabel>
          <h2 className="text-2xl font-semibold mb-4 tracking-tight">La solution que nous proposons</h2>
          <p className="text-[#6e6e73] leading-relaxed text-base">{content.solution}</p>
        </section>

        <Divider />

        {/* Deliverables */}
        <section>
          <SectionLabel>Livrables & Planning</SectionLabel>
          <h2 className="text-2xl font-semibold mb-8 tracking-tight">Ce que nous allons réaliser</h2>
          <div className="space-y-4">
            {content.deliverables.map((d, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-2xl bg-[#f5f5f7] group hover:bg-[#f0f0f2] transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-[#1d1d1f]">{d.item}</h3>
                    {d.timeline && (
                      <span className="text-xs text-[#6e6e73] bg-white px-2.5 py-1 rounded-full border border-black/5 shrink-0">
                        {d.timeline}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Why Us */}
        <section>
          <SectionLabel>Pourquoi nous choisir</SectionLabel>
          <h2 className="text-2xl font-semibold mb-8 tracking-tight">Nos engagements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.whyUs.map((w, i) => (
              <div key={i} className="p-6 rounded-2xl border border-black/5 bg-white hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-4">
                  <CheckIcon />
                </div>
                <h3 className="font-semibold text-[#1d1d1f] mb-2">{w.title}</h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">{w.description}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Pricing */}
        <section>
          <SectionLabel>Investissement</SectionLabel>
          <h2 className="text-2xl font-semibold mb-8 tracking-tight">Récapitulatif financier</h2>
          <div className="rounded-2xl border border-black/5 overflow-hidden">
            <div className="divide-y divide-black/5">
              {content.pricing.lines.map((line, i) => (
                <div key={i} className="flex justify-between items-center px-6 py-4">
                  <span className="text-[#1d1d1f]">{line.description}</span>
                  <span className="font-medium text-[#1d1d1f] tabular-nums">
                    {line.amount.toLocaleString('fr-FR')} {sym}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center px-6 py-5 bg-[#1d1d1f] text-white">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-2xl tabular-nums">
                {amount.toLocaleString('fr-FR')} {sym}
              </span>
            </div>
          </div>
          {content.pricing.notes && (
            <p className="text-sm text-[#6e6e73] mt-4 px-2">{content.pricing.notes}</p>
          )}
        </section>

        <Divider />

        {/* Next Steps */}
        <section>
          <SectionLabel>Prochaines étapes</SectionLabel>
          <h2 className="text-2xl font-semibold mb-8 tracking-tight">Comment procéder</h2>
          <div className="space-y-3">
            {content.nextSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-[#1d1d1f] text-[#1d1d1f] flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-[#1d1d1f] font-medium">{step}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-[#6e6e73] mb-3">
      {children}
    </p>
  )
}

function Divider() {
  return <hr className="border-t border-black/5" />
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3.75 9l3.75 3.75 6.75-7.5" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
