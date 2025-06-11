'use client'

import { useState } from 'react'
import CameraInput from '../components/CameraInput'
import ProductInfo from '../components/ProductInfo'
import AddButton from '../components/AddButton'
import PurchaseList from '../components/PurchaseList'
import PurchaseButton from '../components/PurchaseButton'
import { Product, CartItem } from '../types'

export default function HomePage() {
  const [code, setCode] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  return (
    <main className="flex flex-col items-center p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">モバイルPOSアプリ</h1>

      <CameraInput code={code} setCode={setCode} />
      <ProductInfo product={product} />
      <AddButton code={code} setCode={setCode} product={product} setProduct={setProduct} cart={cart} setCart={setCart} />
      <PurchaseList cart={cart} />
      <PurchaseButton cart={cart} setCart={setCart} />
    </main>
  )
}
