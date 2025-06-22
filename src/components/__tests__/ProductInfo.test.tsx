import { render, screen } from '@testing-library/react'
import ProductInfo from '@/components/ProductInfo'
import { Product } from '@/types'

describe('ProductInfo コンポーネント', () => {
  it('product が null のとき何も描画しない', () => {
    const { container } = render(<ProductInfo product={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('product があるとき、コード・名前・価格を表示する', () => {
    const product: Product = {
      code: 1234567890123,
      name: 'テスト商品',
      price: 500,
    }
    render(<ProductInfo product={product} />)

    // ラベル＋値がすべて表示される
    expect(screen.getByText('商品コード：')).toBeInTheDocument()
    expect(screen.getByText(String(product.code))).toBeInTheDocument()

    expect(screen.getByText('商品名：')).toBeInTheDocument()
    expect(screen.getByText(product.name)).toBeInTheDocument()

    expect(screen.getByText('価格：')).toBeInTheDocument()
    expect(screen.getByText(`${product.price}円`)).toBeInTheDocument()
  })
})
