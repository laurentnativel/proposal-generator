export type ProposalStatus = 'draft' | 'sent' | 'signed' | 'paid'

export interface ProposalContent {
  cover: {
    title: string
    subtitle: string
    preparedFor: string
    preparedBy: string
    date: string
  }
  summary: string
  context: string
  solution: string
  deliverables: Array<{ item: string; description: string; timeline?: string }>
  pricing: {
    lines: Array<{ description: string; amount: number }>
    total: number
    currency: string
    notes?: string
  }
  whyUs: Array<{ title: string; description: string }>
  nextSteps: string[]
}

export interface Proposal {
  id: string
  user_id: string
  public_token: string
  title: string
  client_name: string
  client_email: string | null
  amount: number
  currency: string
  status: ProposalStatus
  content: ProposalContent | null
  signature_data: string | null
  stripe_session_id: string | null
  created_at: string
  updated_at: string
}

export interface PricingLine {
  description: string
  amount: number
}

export interface CreateProposalInput {
  title: string
  client_name: string
  client_email?: string
  amount: number
  currency: string
  brief: string
  pricing_lines: PricingLine[]
}
