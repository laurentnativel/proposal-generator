'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { PricingLine } from '@/types'

type Step = 'form' | 'generating'
type GenStep = { label: string; done: boolean }

const LOADING_STEPS = [
  'Analyse du brief…',
  'Rédaction du contenu…',
  'Structuration des livrables…',
  'Mise en forme finale…',
]

export default function CreateProposalPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [genStepIdx, setGenStepIdx] = useState(0)
  const [error, setError] = useState('')
  const [showDiscount, setShowDiscount] = useState(false)

  const [form, setForm] = useState({
    title: '',
    client_name: '',
    client_email: '',
    brief: '',
  })

  const [lines, setLines] = useState<PricingLine[]>([{ description: '', amount: 0 }])
  const [discount, setDiscount] = useState({ description: 'Remise', amount: 0 })

  const subtotal = lines.reduce((s, l) => s + (l.amount || 0), 0)
  const total = Math.max(0, subtotal - (showDiscount ? discount.amount || 0 : 0))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const updateLine = (i: number, field: keyof PricingLine, value: string) => {
    setLines(prev => prev.map((l, idx) =>
      idx === i ? { ...l, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : l
    ))
  }

  const addLine = () => setLines(prev => [...prev, { description: '', amount: 0 }])
  const removeLine = (i: number) => { if (lines.length > 1) setLines(prev => prev.filter((_, idx) => idx !== i)) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (total <= 0) { setError('Le total doit être supérieur à 0.'); return }
    if (lines.some(l => !l.description.trim())) { setError('Veuillez renseigner la description de chaque ligne.'); return }

    setStep('generating')
    setError('')

    // Avance les étapes de génération toutes les ~4s
    let idx = 0
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, LOADING_STEPS.length - 1)
      setGenStepIdx(idx)
    }, 4000)

    const pricingLines: PricingLine[] = [...lines]
    if (showDiscount && discount.amount > 0) {
      pricingLines.push({ description: discount.description || 'Remise', amount: -discount.amount })
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: total, currency: 'EUR', pricing_lines: pricingLines }),
    })

    clearInterval(interval)

    if (!res.ok) {
      const { error: err } = await res.json()
      setError(err || 'Erreur lors de la génération')
      setStep('form')
      setGenStepIdx(0)
      return
    }

    router.push('/dashboard')
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="text-center max-w-xs w-full">
          {/* Anneau animé */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-8">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e5ea" strokeWidth="4"/>
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke="#1d1d1f" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="175"
                strokeDashoffset="175"
                style={{ animation: 'fillRing 16s linear forwards' }}
              />
            </svg>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="relative">
              <path d="M11 2.5l1.8 5.4L18.5 9l-5.7 1.1L11 16l-1.8-5.9L3.5 9l5.7-1.1L11 2.5z" stroke="#1d1d1f" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </div>

          <style>{`
            @keyframes fillRing {
              0%   { stroke-dashoffset: 175; }
              100% { stroke-dashoffset: 0; }
            }
          `}</style>

          <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
            Génération en cours…
          </h2>
          <p className="text-sm text-[#6e6e73] mb-8">
            Claude rédige votre proposition.<br />Cela prend environ 15 à 20 secondes.
          </p>

          {/* Étapes */}
          <div className="text-left space-y-3 bg-white rounded-2xl border border-black/5 p-5">
            {LOADING_STEPS.map((label, i) => {
              const done = i < genStepIdx
              const active = i === genStepIdx
              return (
                <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${i > genStepIdx ? 'opacity-30' : 'opacity-100'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-[#1d1d1f]' : active ? 'border-2 border-[#1d1d1f]' : 'border-2 border-black/10'}`}>
                    {done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f] animate-pulse" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-[#1d1d1f] font-medium' : active ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="font-semibold text-[#1d1d1f] text-sm">Nouvelle proposition</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Créer une proposition</h2>
          <p className="text-sm text-[#6e6e73] mt-1">Décrivez votre projet et laissez l'IA générer une proposition professionnelle.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
            <h3 className="font-semibold text-[#1d1d1f] text-sm">Informations client</h3>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">
                Titre de la proposition <span className="text-red-400">*</span>
              </label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="ex : Refonte du site web de TechCorp"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Nom du client <span className="text-red-400">*</span></label>
                <input name="client_name" value={form.client_name} onChange={handleChange} required placeholder="ex : Sophie Martin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Email du client</label>
                <input name="client_email" type="email" value={form.client_email} onChange={handleChange} placeholder="client@exemple.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"/>
              </div>
            </div>
          </div>

          {/* Tarification */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
            <h3 className="font-semibold text-[#1d1d1f] text-sm">Tarification</h3>

            <div className="grid grid-cols-[1fr_140px_36px] gap-2 px-1">
              <span className="text-xs text-[#aeaeb2] font-medium">Description</span>
              <span className="text-xs text-[#aeaeb2] font-medium text-right">Montant (€)</span>
              <span />
            </div>

            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_140px_36px] gap-2 items-center">
                  <input value={line.description} onChange={e => updateLine(i, 'description', e.target.value)}
                    placeholder={`Prestation ${i + 1}`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"/>
                  <input type="number" value={line.amount || ''} onChange={e => updateLine(i, 'amount', e.target.value)}
                    min="0" step="0.01" placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all text-right tabular-nums"/>
                  <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-[#aeaeb2] hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addLine}
              className="flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors group">
              <span className="w-7 h-7 rounded-lg border border-black/10 group-hover:border-black/20 flex items-center justify-center transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </span>
              Ajouter une ligne
            </button>

            {/* Remise */}
            {showDiscount ? (
              <div className="pt-2 border-t border-black/5 space-y-2">
                <div className="grid grid-cols-[1fr_140px_36px] gap-2 items-center">
                  <input value={discount.description} onChange={e => setDiscount(d => ({ ...d, description: e.target.value }))}
                    placeholder="Remise commerciale"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-transparent transition-all"/>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#aeaeb2]">−</span>
                    <input type="number" value={discount.amount || ''} onChange={e => setDiscount(d => ({ ...d, amount: parseFloat(e.target.value) || 0 }))}
                      min="0" step="0.01" placeholder="0"
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-transparent transition-all text-right tabular-nums"/>
                  </div>
                  <button type="button" onClick={() => { setShowDiscount(false); setDiscount({ description: 'Remise', amount: 0 }) }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-amber-400 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowDiscount(true)}
                className="text-xs text-[#aeaeb2] hover:text-[#6e6e73] transition-colors underline underline-offset-2">
                + Ajouter une remise
              </button>
            )}

            {/* Totaux */}
            <div className="pt-4 border-t border-black/5 space-y-2">
              {showDiscount && discount.amount > 0 && (
                <div className="flex justify-between text-sm text-[#6e6e73]">
                  <span>Sous-total</span>
                  <span className="tabular-nums">{subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
              )}
              {showDiscount && discount.amount > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>{discount.description || 'Remise'}</span>
                  <span className="tabular-nums">− {discount.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1d1d1f]">Total</span>
                <span className="text-xl font-bold text-[#1d1d1f] tabular-nums">
                  {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
              </div>
            </div>
          </div>

          {/* Brief */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-[#1d1d1f] text-sm mb-1">Brief du projet</h3>
              <p className="text-xs text-[#6e6e73]">Décrivez le projet en 1 à 3 paragraphes. Plus votre description est précise, meilleure sera la proposition générée.</p>
            </div>
            <textarea name="brief" value={form.brief} onChange={handleChange} required rows={8}
              placeholder="ex : Notre client souhaite refondre son site web pour améliorer son taux de conversion..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all resize-none leading-relaxed"/>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

          <button type="submit"
            className="w-full bg-[#1d1d1f] text-white py-3.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            Générer la proposition avec l'IA
          </button>
        </form>
      </main>
    </div>
  )
}
