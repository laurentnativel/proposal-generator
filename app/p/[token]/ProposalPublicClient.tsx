'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ProposalTemplate from '@/components/ProposalTemplate'
import ConfirmationAnimation from '@/components/ConfirmationAnimation'
import type { Proposal } from '@/types'

const SignatureCanvas = dynamic(() => import('@/components/SignatureCanvas'), { ssr: false })

interface Props {
  proposal: Proposal
  token: string
  showSuccess: boolean
}

type Stage = 'viewing' | 'identify' | 'signing' | 'done' | 'already_signed'

export default function ProposalPublicClient({ proposal, token, showSuccess }: Props) {
  const getInitialStage = (): Stage => {
    if (showSuccess || proposal.status === 'paid') return 'done'
    if (proposal.status === 'signed') return 'already_signed'
    return 'viewing'
  }

  const [stage, setStage] = useState<Stage>(getInitialStage)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (showSuccess || proposal.status === 'paid') setStage('done')
    else if (proposal.status === 'signed') setStage('already_signed')
  }, [proposal.status, showSuccess])

  const handleProceedToIdentify = () => setStage('identify')

  const handleIdentifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStage('signing')
  }

  const handleSignAndPay = async () => {
    if (!signatureData) { setError('Veuillez signer avant de continuer.'); return }

    setLoading(true)
    setError('')

    const signRes = await fetch('/api/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, signature_data: signatureData, signer_name: signerName, signer_email: signerEmail }),
    })

    if (!signRes.ok) {
      setError('Erreur lors de la sauvegarde de la signature.')
      setLoading(false)
      return
    }

    const stripeRes = await fetch('/api/stripe/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!stripeRes.ok) {
      setError('Erreur lors de la création de la session de paiement.')
      setLoading(false)
      return
    }

    const { url } = await stripeRes.json()
    window.location.href = url
  }

  return (
    <>
      {stage === 'done' && (
        <ConfirmationAnimation
          clientName={signerName || proposal.client_name}
          signerEmail={signerEmail || undefined}
          receiptUrl={`/p/${token}/receipt`}
        />
      )}

      <div className="min-h-screen bg-[#f5f5f7]">
        <div className="max-w-4xl mx-auto shadow-xl shadow-black/5 bg-white my-0 md:my-8 md:rounded-3xl overflow-hidden">
          <ProposalTemplate
            content={proposal.content!}
            amount={proposal.amount}
            currency={proposal.currency}
          />

          {stage !== 'done' && (
            <div className="border-t border-black/5 px-8 md:px-16 py-12 bg-[#f9f9f9]">
              <div className="max-w-xl mx-auto">

                {/* Déjà signé */}
                {stage === 'already_signed' && (
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border border-amber-100">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M3 15l4-4 2 2 6-7" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
                      Proposition déjà signée
                    </h3>
                    <p className="text-sm text-[#6e6e73]">
                      Cette proposition a été signée. Vous pouvez consulter le devis signé ci-dessous.
                    </p>
                    <a
                      href={`/p/${token}/receipt`}
                      className="inline-flex items-center gap-2 bg-[#1d1d1f] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 1h10a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="white" strokeWidth="1.2"/>
                        <path d="M3.5 5h7M3.5 7.5h7M3.5 10h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Voir le devis signé
                    </a>
                  </div>
                )}

                {/* CTA initial */}
                {stage === 'viewing' && (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                      Prêt à valider cette proposition ?
                    </h3>
                    <p className="text-sm text-[#6e6e73] mb-6">
                      Signez électroniquement et procédez au paiement sécurisé.
                    </p>
                    <button
                      onClick={handleProceedToIdentify}
                      className="inline-flex items-center gap-2 bg-[#1d1d1f] text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 11l3-3 2 2 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Signer et payer
                    </button>
                  </div>
                )}

                {/* Identification */}
                {stage === 'identify' && (
                  <form onSubmit={handleIdentifySubmit} className="space-y-5">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight mb-1">
                        Vos coordonnées
                      </h3>
                      <p className="text-sm text-[#6e6e73]">
                        Ces informations seront associées à votre signature électronique.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                        Nom complet <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={signerName}
                        onChange={e => setSignerName(e.target.value)}
                        required
                        placeholder="Sophie Martin"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                        Adresse e-mail <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={signerEmail}
                        onChange={e => setSignerEmail(e.target.value)}
                        required
                        placeholder="sophie@exemple.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1d1d1f] text-white py-3 rounded-xl text-sm font-medium hover:bg-black/80 transition-all"
                    >
                      Continuer vers la signature →
                    </button>
                  </form>
                )}

                {/* Signature */}
                {stage === 'signing' && (
                  <div className="space-y-6">
                    {signerName && (
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-black/5 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-xs font-semibold text-[#1d1d1f]">
                          {signerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f]">{signerName}</p>
                          {signerEmail && <p className="text-xs text-[#6e6e73]">{signerEmail}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setStage('identify')}
                          className="ml-auto text-xs text-[#6e6e73] hover:text-[#1d1d1f] underline underline-offset-2 transition-colors"
                        >
                          Modifier
                        </button>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight mb-1">
                        Signature électronique
                      </h3>
                      <p className="text-sm text-[#6e6e73] mb-4">
                        En signant, vous acceptez les termes de cette proposition commerciale.
                      </p>
                      <SignatureCanvas onSign={setSignatureData} />
                    </div>

                    <div className="bg-white rounded-2xl border border-black/5 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#6e6e73]">Montant à régler</span>
                        <span className="text-xl font-semibold text-[#1d1d1f] tabular-nums">
                          {proposal.amount.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                    )}

                    <button
                      onClick={handleSignAndPay}
                      disabled={loading || !signatureData}
                      className="w-full bg-[#1d1d1f] text-white py-3.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Redirection vers le paiement…
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="3.5" width="12" height="8.5" rx="1.5" stroke="white" strokeWidth="1.2"/>
                            <path d="M1 6.5h12" stroke="white" strokeWidth="1.2"/>
                          </svg>
                          Payer {proposal.amount.toLocaleString('fr-FR')} € →
                        </>
                      )}
                    </button>

                    <p className="text-xs text-center text-[#aeaeb2]">
                      Paiement sécurisé par Stripe · SSL chiffré
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        <footer className="text-center py-8 pb-12">
          <p className="text-xs text-[#aeaeb2]">Propulsé par ProposalCraft</p>
        </footer>
      </div>
    </>
  )
}
