// src/components/__tests__/AddButton.test.tsx

// --- ① モックは import より前に ---
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddButton from '@/components/AddButton'
import api from '@/lib/api'
import type { CartItem, Product } from '@/types'

const mockedApi = api as jest.Mocked<typeof api>

describe('AddButton コンポーネント', () => {
  const raw = { CODE: 4901480151908, NAME: 'テスト商品', PRICE: 460 }
  const product: Product = {
    code: raw.CODE,
    name: raw.NAME,
    price: raw.PRICE,
  }

  let setCode: jest.Mock
  let setProduct: jest.Mock
  let setCart: jest.Mock
  let restartScan: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    setCode = jest.fn()
    setProduct = jest.fn()
    setCart = jest.fn()
    restartScan = jest.fn()
    // alert の未実装エラーを回避
    window.alert = jest.fn()
    // console.error は抑制しておく
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('空コードならエラーダイアログが出て何も呼ばれない', () => {
    render(
      <AddButton
        code=""
        setCode={setCode}
        product={null}
        setProduct={setProduct}
        cart={[]}
        setCart={setCart}
        restartScan={restartScan}
      />
    )
    fireEvent.click(screen.getByText('購入リストに追加'))
    expect(window.alert).toHaveBeenCalledWith('商品コードを入力してください')
    expect(mockedApi.get).not.toHaveBeenCalled()
    expect(setCart).not.toHaveBeenCalled()
    expect(setProduct).not.toHaveBeenCalled()
    expect(setCode).not.toHaveBeenCalled()
    expect(restartScan).not.toHaveBeenCalled()
  })

  it('新規商品なら setCart で quantity:1 の配列を渡し、state クリア系も呼ばれる', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: raw } as any)

    render(
      <AddButton
        code="4901480151908"
        setCode={setCode}
        product={null}
        setProduct={setProduct}
        cart={[]}
        setCart={setCart}
        restartScan={restartScan}
      />
    )
    fireEvent.click(screen.getByText('購入リストに追加'))

    await waitFor(() => {
      // API呼び出し
      expect(mockedApi.get).toHaveBeenCalledWith('/items/4901480151908')
    })
    // 内部で setProduct と setCart が呼ばれる
    expect(setProduct).toHaveBeenCalledWith(product)
    expect(setCart).toHaveBeenCalledWith([{ ...product, quantity: 1 }])
    // 最後にクリアと再開
    expect(setCode).toHaveBeenCalledWith('')
    expect(restartScan).toHaveBeenCalled()
  })

  it('既存商品なら quantity がインクリメントされる', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: raw } as any)

    const existing: CartItem = { ...product, quantity: 2 }
    render(
      <AddButton
        code="4901480151908"
        setCode={setCode}
        product={null}
        setProduct={setProduct}
        cart={[existing]}
        setCart={setCart}
        restartScan={restartScan}
      />
    )
    fireEvent.click(screen.getByText('購入リストに追加'))

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled())
    expect(setCart).toHaveBeenCalledWith([{ ...product, quantity: 3 }])
  })

  it('API で商品情報に name がなければ「見つかりません」アラート', async () => {
    // NAME empty triggers not-found branch
    mockedApi.get.mockResolvedValueOnce({ data: { CODE: raw.CODE, NAME: '', PRICE: raw.PRICE } } as any)

    render(
      <AddButton
        code="4901480151908"
        setCode={setCode}
        product={null}
        setProduct={setProduct}
        cart={[]}
        setCart={setCart}
        restartScan={restartScan}
      />
    )
    fireEvent.click(screen.getByText('購入リストに追加'))

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('商品が見つかりませんでした')
    )
    expect(setProduct).toHaveBeenCalledWith(null)
    expect(setCart).not.toHaveBeenCalled()
    expect(setCode).toHaveBeenCalledWith('')
    expect(restartScan).toHaveBeenCalled()
  })

  it('API エラーなら「取得時エラー」アラート', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('fail'))

    render(
      <AddButton
        code="4901480151908"
        setCode={setCode}
        product={null}
        setProduct={setProduct}
        cart={[]}
        setCart={setCart}
        restartScan={restartScan}
      />
    )
    fireEvent.click(screen.getByText('購入リストに追加'))

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('商品取得時にエラーが発生しました')
    )
    expect(setCart).not.toHaveBeenCalled()
    expect(setCode).toHaveBeenCalledWith('')
    expect(restartScan).toHaveBeenCalled()
  })
})
