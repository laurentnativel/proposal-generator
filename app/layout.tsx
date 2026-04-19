import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ProposalCraft — Propositions commerciales",
  description: "Générez des propositions commerciales de haute qualité avec l'IA",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
