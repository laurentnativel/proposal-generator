import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import type { CreateProposalInput, ProposalContent } from '@/types'

const SYSTEM_PROMPT = `Tu es un expert en rédaction de propositions commerciales haut de gamme, au style professionnel et convaincant.
Tu génères des propositions en JSON structuré, en français, avec un ton confiant et orienté client.
Ne génère QUE le JSON, sans texte autour, sans balises markdown.

Format de sortie attendu (JSON strict) :
{
  "cover": {
    "title": "Titre de la proposition",
    "subtitle": "Sous-titre ou accroche",
    "preparedFor": "Nom du client",
    "preparedBy": "Votre nom/entreprise",
    "date": "Date actuelle"
  },
  "summary": "Résumé exécutif en 2-3 phrases percutantes",
  "context": "Paragraphe sur la compréhension du besoin client (150-200 mots)",
  "solution": "Paragraphe décrivant l'approche et la solution proposée (150-200 mots)",
  "deliverables": [
    { "item": "Livrable 1", "description": "Description détaillée", "timeline": "Semaine 1-2" }
  ],
  "pricing": {
    "lines": [
      { "description": "Prestation principale", "amount": 0 }
    ],
    "total": 0,
    "currency": "EUR",
    "notes": "Conditions de paiement ou remarques"
  },
  "whyUs": [
    { "title": "Point fort 1", "description": "Explication courte" }
  ],
  "nextSteps": [
    "Étape 1 : Validation de la proposition",
    "Étape 2 : Signature et acompte",
    "Étape 3 : Lancement du projet"
  ]
}`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input: CreateProposalInput = await request.json()
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  const userName = user.user_metadata?.full_name || user.email || 'Votre entreprise'

  const pricingLinesText = input.pricing_lines
    .map(l => `  - ${l.description} : ${l.amount.toLocaleString('fr-FR')} ${input.currency}`)
    .join('\n')

  const userPrompt = `Client : ${input.client_name}
Date : ${today}
Préparé par : ${userName}

Lignes de tarification (à utiliser TELLES QUELLES dans pricing.lines) :
${pricingLinesText}
Total : ${input.amount.toLocaleString('fr-FR')} ${input.currency}

Brief du projet :
${input.brief}

Génère une proposition commerciale complète et professionnelle basée sur ces informations.
IMPORTANT : reprends exactement les lignes de tarification fournies ci-dessus dans le champ pricing.lines, sans les modifier.
Adapte les livrables et le contenu au type de projet décrit dans le brief.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawContent = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const content: ProposalContent = JSON.parse(cleanContent)

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        title: input.title,
        client_name: input.client_name,
        client_email: input.client_email || null,
        amount: input.amount,
        currency: input.currency,
        status: 'draft',
        content,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('Generation error:', err)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}
