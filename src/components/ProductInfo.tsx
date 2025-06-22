'use client'

import React from 'react'
import { Product } from '@/types'

type Props = {
  product: Product | null
}

export default function ProductInfo({ product }: Props) {
  if (!product) return null

  return (
    <div className="w-full space-y-2 border p-3 rounded bg-gray-50">
      <div>
        <span className="text-sm text-gray-500">商品コード：</span>
        <span className="ml-1 font-mono">{product.code}</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">商品名：</span>
        <span className="ml-1 font-semibold">{product.name}</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">価格：</span>
        <span className="ml-1">{product.price}円</span>
      </div>
    </div>
  )
}
