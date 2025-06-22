'use client'

import { useRef, useState } from 'react'
import CameraInput, { CameraInputHandle } from '../components/CameraInput'
import AddButton from '../components/AddButton'
import PurchaseList from '../components/PurchaseList'
import PurchaseButton from '../components/PurchaseButton'
import { Product, CartItem } from '../types'

export default function HomePage() {
  const [code, setCode] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCamera, setShowCamera] = useState(false)

  const cameraRef = useRef<CameraInputHandle>(null)

  const boxStyle = (hasValue: boolean) =>
    `w-full text-center px-3 py-1 border rounded ${
      hasValue
        ? 'text-xl font-bold text-black bg-white'
        : 'text-sm text-gray-400 bg-gray-100'
    }`

  const handleAdd = () => {
    setCode('')
    setProduct(null)
    setShowCamera(false)
  }

  return (
    <main className="flex flex-col items-center p-4 space-y-3 max-w-md mx-auto">
      <h1 className="text-xl font-bold">モバイルPOSアプリ</h1>

      {/* スキャン開始ボタン */}
      <button
        onClick={() => setShowCamera(true)}
        className="w-full bg-green-200 border border-green-500 text-green-800 font-bold py-2 px-4 rounded"
      >
        スキャン（カメラ）
      </button>

      {/* カメラ表示 */}
      {showCamera && (
        <CameraInput
          ref={cameraRef}
          code={code}
          setCode={setCode}
          setProduct={setProduct}
          onScanComplete={() => setShowCamera(false)}
        />
      )}

      {/* コード、商品名、単価 表示 */}
      <div className={boxStyle(!!code)}>{code || 'コードを読み取ってください'}</div>
      <div className={boxStyle(!!product?.name)}>{product?.name || '商品名未取得'}</div>
      <div className={boxStyle(!!product?.price)}>
        {product?.price ? `¥${product.price}` : '単価未取得'}
      </div>

      {/* カート追加ボタン */}
      <AddButton
        code={code}
        setCode={setCode}
        product={product}
        setProduct={setProduct}
        cart={cart}
        setCart={setCart}
        restartScan={handleAdd} // 初期化とカメラ非表示
      />

      <PurchaseList cart={cart} />
      <PurchaseButton cart={cart} setCart={setCart} />
    </main>
  )
}
