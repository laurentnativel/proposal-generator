'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors flex items-center gap-1.5"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M3 4V2h7v2M2 4h9a1 1 0 011 1v4H9v2H4V9H1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      </svg>
      Imprimer / PDF
    </button>
  )
}
