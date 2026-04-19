import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const proposalId = session.metadata?.proposal_id

    if (proposalId) {
      const supabase = await createAdminClient()
      await supabase
        .from('proposals')
        .update({
          status: 'paid',
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', proposalId)
    }
  }

  return NextResponse.json({ received: true })
}
