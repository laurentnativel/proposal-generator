import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { token, signature_data } = await request.json()

  if (!token || !signature_data) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('id, status')
    .eq('public_token', token)
    .single()

  if (fetchError || !proposal) {
    return NextResponse.json({ error: 'Proposition introuvable' }, { status: 404 })
  }

  if (proposal.status === 'paid') {
    return NextResponse.json({ error: 'Proposition déjà finalisée' }, { status: 400 })
  }

  const { error } = await supabase
    .from('proposals')
    .update({ signature_data, status: 'signed', updated_at: new Date().toISOString() })
    .eq('id', proposal.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
