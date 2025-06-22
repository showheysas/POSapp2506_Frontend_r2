// src/components/__tests__/CameraInput.test.tsx

// --- モックは import より前に ---
jest.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: class {
    static listVideoInputDevices = jest
      .fn()
      .mockResolvedValue([{ deviceId: 'camera1' }])
    decodeFromConstraints = jest.fn((
      constraints: any,
      videoElem: HTMLVideoElement,
      callback: (result: any, err: any) => void
    ) => {
      callback({ getText: () => '4901480155111' }, null)
      return Promise.resolve({ stop: jest.fn() })
    })
  },
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import CameraInput, { CameraInputHandle } from '@/components/CameraInput'
import api from '@/lib/api'
import type { Product } from '@/types'

const mockedApi = api as jest.Mocked<typeof api>

describe('CameraInput コンポーネント', () => {
  let setCode: jest.Mock
  let setProduct: jest.Mock
  let onScanComplete: jest.Mock
  // **型注釈なし** で createRef の推論を使う
  let ref = React.createRef<CameraInputHandle>()

  beforeEach(() => {
    jest.clearAllMocks()
    setCode = jest.fn()
    setProduct = jest.fn()
    onScanComplete = jest.fn()
    // 毎回新しい ref を生成
    ref = React.createRef<CameraInputHandle>()

    mockedApi.get.mockResolvedValue({
      data: { CODE: 4901480155111, NAME: 'カメラ商品', PRICE: 800 },
    } as any)

    window.alert = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('バーコード読み取り→API取得→setCode,setProduct,onScanComplete が呼ばれる', async () => {
    render(
      <CameraInput
        ref={ref}
        code=""
        setCode={setCode}
        setProduct={setProduct}
        onScanComplete={onScanComplete}
      />
    )

    await waitFor(() => {
      expect(
        (require('@zxing/browser').BrowserMultiFormatReader
          .listVideoInputDevices as jest.Mock)
      ).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(setCode).toHaveBeenCalledWith('4901480155111')
    })

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        '/items/4901480155111'
      )
      expect(setProduct).toHaveBeenCalledWith({
        code: 4901480155111,
        name: 'カメラ商品',
        price: 800,
      } as Product)
    })

    expect(onScanComplete).toHaveBeenCalled()
  })

  it('restartScan ハンドルが有効になる', () => {
    render(
      <CameraInput
        ref={ref}
        code=""
        setCode={setCode}
        setProduct={setProduct}
        onScanComplete={onScanComplete}
      />
    )
    expect(typeof ref.current?.restartScan).toBe('function')
  })
})
