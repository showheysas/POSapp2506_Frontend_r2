'use client'
import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'
import { Product } from '@/types'
import api from '@/lib/api'

export type CameraInputHandle = {
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
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [permissionError, setPermissionError] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
      restartScan: () => {
        pauseRef.current = false
      }
    }))

    // カメラ権限を明示的に要求する関数
    const requestCameraPermission = async () => {
      try {
        // まず権限を明示的に要求
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        })
        
        // 一旦ストリームを停止（ZXingが改めて取得するため）
        stream.getTracks().forEach(track => track.stop())
        
        setPermissionGranted(true)
        setPermissionError(null)
        return true
      } catch (error) {
        console.error('カメラアクセス許可エラー:', error)
        setPermissionError('カメラアクセスが拒否されました')
        setPermissionGranted(false)
        return false
      }
    }

    useEffect(() => {
      const initScanner = async () => {
        // 権限が取得されていない場合は要求
        if (!permissionGranted) {
          const granted = await requestCameraPermission()
          if (!granted) return
        }

        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13])
        const codeReader = new BrowserMultiFormatReader(hints)
        codeReaderRef.current = codeReader

        try {
          const devices = await BrowserMultiFormatReader.listVideoInputDevices()
          const selectedDeviceId = devices[0]?.deviceId
          if (!selectedDeviceId) return

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
          setPermissionError('カメラ初期化に失敗しました')
        }
      }

      initScanner()

      return () => {
        stopFnRef.current?.()
      }
    }, [permissionGranted])

    // 権限再要求ボタンのハンドラ
    const handleRetryPermission = () => {
      setPermissionError(null)
      requestCameraPermission()
    }

    if (permissionError) {
      return (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl aspect-[3/1] border rounded flex items-center justify-center bg-gray-100">
            <div className="text-center space-y-4">
              <p className="text-red-600">{permissionError}</p>
              <button
                onClick={handleRetryPermission}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                カメラアクセスを再試行
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (!permissionGranted) {
      return (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl aspect-[3/1] border rounded flex items-center justify-center bg-gray-100">
            <p className="text-gray-600">カメラアクセス許可を確認中...</p>
          </div>
        </div>
      )
    }

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