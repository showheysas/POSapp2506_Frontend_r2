'use client'

import React, { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'

type Props = {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
}

export default function CameraInput({ code, setCode }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        // 数字だけならJANコードとみなして反映
        if (/^\d{8,13}$/.test(result.data)) {
          setCode(result.data)
          scanner.stop()
          setScanning(false)
        }
      },
      {
        highlightScanRegion: true,
        returnDetailedScanResult: true,
      }
    )

    scannerRef.current = scanner
    scanner.start().then(() => setScanning(true))

    return () => {
      scanner.stop()
      setScanning(false)
    }
  }, [])

  return (
    <div className="w-full space-y-2">
      <label htmlFor="code" className="block text-sm font-medium text-gray-700">
        バーコード（JANコード）を入力またはスキャン
      </label>
      <input
        type="text"
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="例：4901777018686"
        className="w-full border rounded px-3 py-2"
      />
      <div className="relative w-full max-w-sm aspect-video border rounded overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" />
        {!scanning && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center text-white">
            カメラを起動中…
          </div>
        )}
      </div>
    </div>
  )
}
