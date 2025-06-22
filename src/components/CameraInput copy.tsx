'use client'

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import {
  BrowserMultiFormatReader
} from '@zxing/browser'
import {
  DecodeHintType,
  BarcodeFormat
} from '@zxing/library'

type Props = {
  setCode: React.Dispatch<React.SetStateAction<string>>
}

// 親から restartScan() を呼べるよう forwardRef 使用
const CameraInput = forwardRef(({ setCode }: Props, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pauseRef = useRef(false)

  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('読み取り中です… バーコードを正面にかざしてください')

  // 外部から再開指示できる関数
  useImperativeHandle(ref, () => ({
    restartScan: () => {
      pauseRef.current = false
      setMessage('読み取り中です… 次の商品をかざしてください')
    },
  }))

  useEffect(() => {
    const initScanner = async () => {
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13])
      const codeReader = new BrowserMultiFormatReader(hints)
      codeReaderRef.current = codeReader

      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const selectedDeviceId = devices[0]?.deviceId
        if (!selectedDeviceId) {
          setMessage('カメラが見つかりませんでした')
          return
        }

        setScanning(true)
        setMessage('読み取り中です…')

        await codeReader.decodeFromConstraints(
          {
            video: {
              deviceId: selectedDeviceId,
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          },
          videoRef.current!,
          (result, err) => {
            if (result && !pauseRef.current) {
              const scanned = result.getText()
              if (/^\d{8,13}$/.test(scanned)) {
                pauseRef.current = true
                setCode(scanned)
                setMessage(`読み取り成功：${scanned}`)

                timeoutRef.current && clearTimeout(timeoutRef.current)
              }
            } else if (err && err.name !== 'NotFoundException') {
              console.error('スキャンエラー:', err)
            }
          }
        )

        timeoutRef.current = setTimeout(() => {
          setMessage('うまく読み取れません。距離や光を調整してみてください')
        }, 8000)
      } catch (err) {
        console.error('スキャナ初期化失敗:', err)
        setMessage('カメラの初期化に失敗しました')
      }
    }

    initScanner()

    return () => {
      (codeReaderRef.current as any)?.reset?.()
      setScanning(false)
      timeoutRef.current && clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full max-w-sm aspect-video border rounded overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" />
        {!scanning && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center text-white">
            カメラを起動中…
          </div>
        )}
      </div>
      {scanning && (
        <div className="mt-2 text-center text-sm text-yellow-700 animate-pulse">
          {message}
        </div>
      )}
    </div>
  )
})

export default CameraInput
