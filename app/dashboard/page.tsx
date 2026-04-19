'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProposalCard from '@/components/ProposalCard'
import type { Proposal } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata?.full_name || user.email || '')
    })

    fetch('/api/proposals')
      .then(r => r.json())
      .then(data => { setProposals(Array.isArray(data) ? data : []); setLoading(false) })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDelete = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id))
  }

  const stats = {
    total: proposals.length,
    paid: proposals.filter(p => p.status === 'paid').length,
    revenue: proposals.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7l2.5 2.5L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-[#1d1d1f] text-sm">ProposalCraft</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6e6e73] hidden sm:block">{userName}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Mes propositions</h1>
            <p className="text-sm text-[#6e6e73] mt-0.5">Gérez et suivez vos propositions commerciales</p>
          </div>
          <Link
            href="/proposals/create"
            className="inline-flex items-center gap-2 bg-[#1d1d1f] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nouvelle proposition
          </Link>
        </div>

        {/* Stats */}
        {proposals.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total" value={String(stats.total)} />
            <StatCard label="Payées" value={String(stats.paid)} />
            <StatCard
              label="Chiffre d'affaires"
              value={`${stats.revenue.toLocaleString('fr-FR')} €`}
            />
          </div>
        )}

        {/* Proposals grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-black/5 mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M7 4h14a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#aeaeb2" strokeWidth="1.5"/>
                <path d="M10 10h8M10 14h5" stroke="#aeaeb2" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">Aucune proposition</h3>
            <p className="text-sm text-[#6e6e73] mb-6">Créez votre première proposition commerciale avec l'IA.</p>
            <Link
              href="/proposals/create"
              className="inline-flex items-center gap-2 bg-[#1d1d1f] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black/80 transition-all"
            >
              Créer ma première proposition
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map(p => (
              <ProposalCard key={p.id} proposal={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5">
      <p className="text-xs text-[#6e6e73] mb-1">{label}</p>
      <p className="text-xl font-semibold text-[#1d1d1f] tabular-nums">{value}</p>
    </div>
  )
}
