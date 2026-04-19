'use client'

import { useRef, useState } from 'react'
import ReactSignatureCanvas from 'react-signature-canvas'

interface Props {
  onSign: (dataUrl: string) => void
}

export default function SignatureCanvas({ onSign }: Props) {
  const sigRef = useRef<ReactSignatureCanvas>(null)
  const [signed, setSigned] = useState(false)

  const handleClear = () => {
    sigRef.current?.clear()
    setSigned(false)
  }

  const handleEnd = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      setSigned(true)
      onSign(sigRef.current.toDataURL('image/png'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl border-2 border-dashed border-black/10 bg-[#f5f5f7] overflow-hidden transition-colors hover:border-black/20">
        <ReactSignatureCanvas
          ref={sigRef}
          penColor="#1d1d1f"
          canvasProps={{
            className: 'w-full',
            style: { height: 160, touchAction: 'none' },
          }}
          onEnd={handleEnd}
        />
        {!signed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-[#aeaeb2]">Signez ici avec votre souris ou votre doigt</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6e6e73]">
          {signed ? '✓ Signature enregistrée' : 'Zone de signature'}
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors underline underline-offset-2"
        >
          Effacer
        </button>
      </div>
    </div>
  )
}
