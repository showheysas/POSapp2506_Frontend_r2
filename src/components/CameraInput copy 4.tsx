'use client'

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'
import { Product } from '@/types'
import api from '@/lib/api'

export type CameraInputHandle = {
  startScan: () => void
  restartScan: () => void
}

type Props = {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>
  onScanComplete: () => void
}

const CameraInput = forwardRef<CameraInputHandle, Props>(
  ({ code, setCode, setProduct, onScanComplete }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
    const pauseRef = useRef(false)
    const stopFnRef = useRef<(() => void) | null>(null)

    const [startScanRequested, setStartScanRequested] = useState(false)

    // 外部から startScan/restartScan を呼び出せるようにする
    useImperativeHandle(ref, () => ({
      startScan: () => {
        setStartScanRequested(true)
      },
      restartScan: () => {
        pauseRef.current = false
      },
    }))

    // 描画後に videoRef が使えるようになってから初期化する
    useEffect(() => {
      if (startScanRequested && videoRef.current) {
        initScanner()
      }
    }, [startScanRequested, videoRef.current])

    // スキャナ初期化処理
    const initScanner = async () => {
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13])

      const codeReader = new BrowserMultiFormatReader(hints)
      codeReaderRef.current = codeReader

      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const selectedDeviceId = devices[0]?.deviceId
        if (!selectedDeviceId) return

        // getUserMedia を先に呼んでポップアップを出す
        await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId,
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        const controls = await codeReader.decodeFromConstraints(
          {
            video: {
              deviceId: selectedDeviceId,
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current!,
          async (result, err) => {
            if (result && !pauseRef.current) {
              const scanned = result.getText()
              if (/^\d{8,13}$/.test(scanned)) {
                pauseRef.current = true
                setCode(scanned)

                try {
                  const res = await api.get<{ CODE: number; NAME: string; PRICE: number }>(
                    `/items/${scanned}`
                  )
                  const raw = res.data
                  const product: Product = {
                    code: raw.CODE,
                    name: raw.NAME,
                    price: raw.PRICE,
                  }
                  setProduct(product)
                } catch {
                  setProduct(null)
                }

                onScanComplete()
              }
            }
          }
        )

        stopFnRef.current = () => controls.stop()
      } catch (e) {
        console.error('カメラ初期化失敗:', e)
      }
    }

    // コンポーネントがアンマウントされたときにカメラ停止
    useEffect(() => {
      return () => {
        stopFnRef.current?.()
      }
    }, [])

    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-2xl aspect-[3/1] overflow-hidden border rounded">
          <video ref={videoRef} className="w-full h-full object-cover object-center" />
        </div>
      </div>
    )
  }
)

export default CameraInput
