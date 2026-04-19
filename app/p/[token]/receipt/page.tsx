import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PrintButton from '@/components/PrintButton'

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single()

  if (error || !proposal || !proposal.content) notFound()
  if (!proposal.signature_data) notFound()

  const content = proposal.content
  const date = new Date(proposal.updated_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden">

        {/* En-tête */}
        <div className="bg-[#1d1d1f] text-white px-10 py-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Devis signé</p>
              <h1 className="text-2xl font-semibold tracking-tight">{proposal.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Statut</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                proposal.status === 'paid'
                  ? 'bg-green-400/20 text-green-300'
                  : 'bg-amber-400/20 text-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${proposal.status === 'paid' ? 'bg-green-400' : 'bg-amber-400'}`} />
                {proposal.status === 'paid' ? 'Payé' : 'Signé'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 space-y-8">

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#aeaeb2] uppercase tracking-wider mb-2">Prestataire</p>
              <p className="font-medium text-[#1d1d1f]">{content.cover.preparedBy}</p>
            </div>
            <div>
              <p className="text-xs text-[#aeaeb2] uppercase tracking-wider mb-2">Client</p>
              <p className="font-medium text-[#1d1d1f]">{proposal.client_name}</p>
              {proposal.client_email && <p className="text-sm text-[#6e6e73]">{proposal.client_email}</p>}
            </div>
          </div>

          <hr className="border-black/5" />

          {/* Lignes de tarification */}
          <div>
            <p className="text-xs text-[#aeaeb2] uppercase tracking-wider mb-4">Détail de la prestation</p>
            <div className="rounded-2xl border border-black/5 overflow-hidden">
              <div className="divide-y divide-black/5">
                {content.pricing.lines.map((line: { description: string; amount: number }, i: number) => (
                  <div key={i} className="flex justify-between items-center px-5 py-3.5">
                    <span className="text-sm text-[#1d1d1f]">{line.description}</span>
                    <span className={`text-sm font-medium tabular-nums ${line.amount < 0 ? 'text-amber-600' : 'text-[#1d1d1f]'}`}>
                      {line.amount < 0 ? '− ' : ''}{Math.abs(line.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center px-5 py-4 bg-[#1d1d1f] text-white">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl tabular-nums">
                  {proposal.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
              </div>
            </div>
          </div>

          <hr className="border-black/5" />

          {/* Signature */}
          <div>
            <p className="text-xs text-[#aeaeb2] uppercase tracking-wider mb-4">Signature électronique</p>
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <img
                src={proposal.signature_data}
                alt="Signature"
                className="max-h-20 object-contain mx-auto"
              />
              <p className="text-center text-xs text-[#aeaeb2] mt-3">
                Signé le {date}
              </p>
            </div>
          </div>

          {/* Mentions légales */}
          <div className="bg-[#f5f5f7] rounded-2xl px-5 py-4">
            <p className="text-xs text-[#6e6e73] leading-relaxed">
              Ce document constitue un accord commercial signé électroniquement entre les parties mentionnées ci-dessus.
              La signature électronique apposée a valeur légale conformément à la réglementation en vigueur.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-10 py-5 border-t border-black/5 flex items-center justify-between">
          <p className="text-xs text-[#aeaeb2]">Propulsé par ProposalCraft</p>
          <PrintButton />
        </div>
      </div>
    </div>
  )
}
