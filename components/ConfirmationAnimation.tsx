'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  clientName: string
  signerEmail?: string
  receiptUrl?: string
}

export default function ConfirmationAnimation({ clientName, signerEmail, receiptUrl }: Props) {
  useEffect(() => {
    // Burst initial généreux
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#1d1d1f', '#6e6e73', '#aeaeb2', '#d1d1d6', '#f5f5f7'],
      gravity: 0.9,
      scalar: 1.1,
    })
    // Second burst décalé depuis les côtés
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors: ['#1d1d1f', '#aeaeb2'] })
      confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors: ['#1d1d1f', '#aeaeb2'] })
    }, 200)
  }, [])

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f5f5f7] mb-6">
          <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
            <circle
              cx="20" cy="20" r="18"
              stroke="#1d1d1f" strokeWidth="2"
              strokeDasharray="113"
              strokeDashoffset="113"
              style={{ animation: 'drawCircle 0.5s ease-out forwards' }}
            />
            <path
              d="M12 20l5.5 5.5L28 14"
              stroke="#1d1d1f" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="22"
              strokeDashoffset="22"
              style={{ animation: 'drawCheck 0.4s ease-out 0.45s forwards' }}
            />
          </svg>
        </div>

        <style>{`
          @keyframes drawCircle {
            from { stroke-dashoffset: 113; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes drawCheck {
            from { stroke-dashoffset: 22; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div style={{ animation: 'fadeUp 0.5s ease-out 0.6s both' }}>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
            Merci, {clientName} !
          </h2>
          <p className="text-[#6e6e73] text-base leading-relaxed mb-8">
            Votre signature et votre paiement ont bien été reçus.<br />
            Nous vous contacterons très prochainement pour démarrer votre projet.
          </p>

          <div className="flex flex-col items-center gap-3">
            {/* Email confirmation */}
            <div className="inline-flex flex-col items-center gap-2 bg-[#f5f5f7] rounded-2xl px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="#1d1d1f" strokeWidth="1.2"/>
                  <path d="M1 5l6 4.5L13 5" stroke="#1d1d1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1d1d1f]">Confirmation envoyée</p>
              {signerEmail && <p className="text-xs text-[#6e6e73]">{signerEmail}</p>}
            </div>

            {/* Lien devis signé */}
            {receiptUrl && (
              <a
                href={receiptUrl}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#1d1d1f] border border-black/10 rounded-xl px-5 py-2.5 hover:bg-[#f5f5f7] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 1h8a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 5h6M4 7.5h6M4 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Voir mon devis signé
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
