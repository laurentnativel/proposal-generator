'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.code === 'email_not_confirmed' || error.message?.toLowerCase().includes('email not confirmed')) {
        setInfo('Votre adresse e-mail n\'a pas encore été confirmée. Consultez votre boîte mail et cliquez sur le lien de confirmation.')
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.')
      }
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
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
          <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Connexion</h1>
          <p className="text-sm text-[#6e6e73] mt-1">Accédez à vos propositions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-[#1d1d1f] placeholder-[#aeaeb2] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
              />
            </div>

            {/* Email non confirmé — message doux, fond bleu */}
            {info && (
              <div className="flex gap-3 bg-blue-50 rounded-xl px-3.5 py-3">
                <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#3b82f6" strokeWidth="1.2"/>
                  <path d="M8 7v4M8 5.5v.5" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <p className="text-sm text-blue-700 leading-relaxed">{info}</p>
              </div>
            )}

            {/* Identifiants incorrects — rouge */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3.5 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d1d1f] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6e6e73] mt-6">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-[#1d1d1f] font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
