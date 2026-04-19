'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8 text-center">
            {/* Icône enveloppe animée */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f5f5f7] mb-6">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <rect x="2" y="6" width="26" height="18" rx="2.5" stroke="#1d1d1f" strokeWidth="1.5"/>
                <path d="M2 10l13 8.5L28 10" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
              Un e-mail vous attend
            </h1>

            <p className="text-sm text-[#6e6e73] leading-relaxed mb-4">
              Nous avons envoyé un lien de confirmation à
            </p>

            <div className="inline-flex items-center gap-2 bg-[#f5f5f7] rounded-xl px-4 py-2.5 mb-6">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="#6e6e73" strokeWidth="1.1"/>
                <path d="M1 5l5.5 3.5L12 5" stroke="#6e6e73" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-[#1d1d1f]">{email}</span>
            </div>

            <p className="text-xs text-[#aeaeb2] leading-relaxed mb-8">
              Cliquez sur le lien dans cet e-mail pour activer votre compte.<br/>
              Vérifiez vos spams si vous ne le voyez pas.
            </p>

            <Link
              href="/login"
              className="block w-full bg-[#1d1d1f] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all text-center"
            >
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Créer un compte</h1>
          <p className="text-sm text-[#6e6e73] mt-1">Commencez à générer des propositions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Jean Dupont"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Adresse e-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 caractères"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3.5 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d1d1f] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6e6e73] mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#1d1d1f] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
