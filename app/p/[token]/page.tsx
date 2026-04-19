import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProposalPublicClient from './ProposalPublicClient'

export default async function ProposalPublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { token } = await params
  const { success } = await searchParams

  const supabase = await createClient()
  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single()

  if (error || !proposal || !proposal.content) {
    notFound()
  }

  return (
    <ProposalPublicClient
      proposal={proposal}
      token={token}
      showSuccess={success === 'true'}
    />
  )
}
