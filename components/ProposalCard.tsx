'use client'

import { useState } from 'react'
import type { Proposal } from '@/types'

const STATUS_CONFIG = {
  draft:  { label: 'Brouillon', color: 'bg-[#f5f5f7] text-[#6e6e73]' },
  sent:   { label: 'Envoyée',   color: 'bg-blue-50 text-blue-600' },
  signed: { label: 'Signée',    color: 'bg-amber-50 text-amber-600' },
  paid:   { label: 'Payée',     color: 'bg-green-50 text-green-600' },
}

interface Props {
  proposal: Proposal
  onDelete: (id: string) => void
}

export default function ProposalCard({ proposal, onDelete }: Props) {
  const [copying, setCopying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const config = STATUS_CONFIG[proposal.status]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const publicUrl = `${appUrl}/p/${proposal.public_token}`
  const receiptUrl = `${appUrl}/p/${proposal.public_token}/receipt`

  const isSigned = proposal.status === 'signed' || proposal.status === 'paid'

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${proposal.title}" ?`)) return
    setDeleting(true)
    await fetch('/api/proposals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: proposal.id }),
    })
    onDelete(proposal.id)
  }

  const date = new Date(proposal.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-[#1d1d1f] truncate mb-1">{proposal.title}</h3>
          <p className="text-sm text-[#6e6e73]">{proposal.client_name}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-semibold text-[#1d1d1f] tabular-nums">
          {proposal.amount.toLocaleString('fr-FR')} €
        </p>
        <p className="text-xs text-[#aeaeb2]">{date}</p>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-black/5">
        {/* Copier lien — visible seulement si pas encore signé */}
        {!isSigned && (
          <button
            onClick={handleCopyUrl}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ebebed] rounded-xl py-2 transition-colors"
          >
            {copying ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copié !
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 2H3a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <rect x="4" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Copier le lien
              </>
            )}
          </button>
        )}

        {/* Devis signé — affiché si signé ou payé */}
        {isSigned && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ebebed] rounded-xl py-2 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 1h8a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3 4h6M3 6h6M3 8h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Devis signé
          </a>
        )}

        {/* Voir la proposition */}
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ebebed] rounded-xl py-2 px-3 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M8 1h3m0 0v3m0-3L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voir
        </a>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center text-xs font-medium text-[#6e6e73] hover:text-red-500 bg-[#f5f5f7] hover:bg-red-50 rounded-xl py-2 px-3 transition-colors disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1.5 3h9m-7.5 0V2a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v1m1 0l-.5 7a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5L3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
