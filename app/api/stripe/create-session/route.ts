import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { token } = await request.json()

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single()

  if (error || !proposal) {
    return NextResponse.json({ error: 'Proposition introuvable' }, { status: 404 })
  }

  if (proposal.status === 'paid') {
    return NextResponse.json({ error: 'Déjà payée' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: proposal.currency.toLowerCase(),
          product_data: {
            name: proposal.title,
            description: `Proposition commerciale pour ${proposal.client_name}`,
          },
          unit_amount: Math.round(proposal.amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/p/${token}?success=true`,
    cancel_url: `${appUrl}/p/${token}`,
    metadata: { proposal_id: proposal.id, public_token: token },
    customer_email: proposal.client_email || undefined,
  })

  return NextResponse.json({ url: session.url })
}
